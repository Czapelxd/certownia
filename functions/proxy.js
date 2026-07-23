// OPTIONAL Cloudflare Pages Function — an ACME CORS proxy.
//
// You normally DO NOT need this: Let's Encrypt serves CORS headers, so the
// browser talks to it directly (ACME_PROXY empty). Deploy this only if you must
// route through your own origin or target a CA that lacks CORS. To enable it,
// build the site with VITE_ACME_PROXY=/proxy.
//
// The target host is allow-listed to prevent this from becoming an open relay.

const ALLOWED_HOSTS = new Set([
  "acme-v02.api.letsencrypt.org",
  "acme-staging-v02.api.letsencrypt.org",
]);

const EXPOSE = "Replay-Nonce, Location, Link, Retry-After";

function cors(headers = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Expose-Headers": EXPOSE,
    "Access-Control-Max-Age": "86400",
    ...headers,
  };
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }

  const target = new URL(request.url).searchParams.get("target");
  if (!target) return new Response("missing ?target", { status: 400, headers: cors() });

  let url;
  try {
    url = new URL(target);
  } catch {
    return new Response("bad target", { status: 400, headers: cors() });
  }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    return new Response("target host not allowed", { status: 403, headers: cors() });
  }

  const init = {
    method: request.method,
    headers: request.headers.get("content-type")
      ? { "content-type": request.headers.get("content-type") }
      : undefined,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    // Do not follow redirects: a 3xx to another origin would bypass the allowlist.
    redirect: "manual",
  };

  const upstream = await fetch(url.toString(), init);
  const headers = cors({ "Content-Type": upstream.headers.get("content-type") ?? "application/json" });
  for (const h of ["replay-nonce", "location", "link", "retry-after"]) {
    const v = upstream.headers.get(h);
    if (v) headers[h] = v;
  }
  return new Response(await upstream.text(), { status: upstream.status, headers });
}
