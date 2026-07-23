// OPTIONAL standalone ACME CORS proxy for self-hosting (e.g. behind nginx).
//
// You normally DO NOT need this — Let's Encrypt serves CORS and the browser
// talks to it directly. Run this only if you must proxy through your own server:
//   node proxy/node-server.mjs           # listens on :8788
// then build the site with VITE_ACME_PROXY=https://your-host/  (this server's URL).
//
// The target host is allow-listed so this cannot be abused as an open relay.

import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 8788);
const ALLOWED_HOSTS = new Set([
  "acme-v02.api.letsencrypt.org",
  "acme-staging-v02.api.letsencrypt.org",
]);
const EXPOSE = "Replay-Nonce, Location, Link, Retry-After";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Expose-Headers": EXPOSE,
  "Access-Control-Max-Age": "86400",
};

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  const target = reqUrl.searchParams.get("target");
  const send = (status, body, extra = {}) => {
    res.writeHead(status, { ...corsHeaders, ...extra });
    res.end(body);
  };

  if (!target) return send(400, "missing ?target");

  let url;
  try {
    url = new URL(target);
  } catch {
    return send(400, "bad target");
  }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    return send(403, "target host not allowed");
  }

  try {
    const method = req.method ?? "GET";
    const body = method === "GET" || method === "HEAD" ? undefined : await readBody(req);
    const init = { method, body };
    if (req.headers["content-type"]) init.headers = { "content-type": req.headers["content-type"] };

    const upstream = await fetch(url.toString(), init);
    const extra = { "Content-Type": upstream.headers.get("content-type") ?? "application/json" };
    for (const h of ["replay-nonce", "location", "link", "retry-after"]) {
      const v = upstream.headers.get(h);
      if (v) extra[h] = v;
    }
    send(upstream.status, Buffer.from(await upstream.arrayBuffer()), extra);
  } catch (e) {
    send(502, `proxy error: ${e instanceof Error ? e.message : String(e)}`);
  }
});

server.listen(PORT, () => console.log(`ACME proxy listening on http://localhost:${PORT}`));
