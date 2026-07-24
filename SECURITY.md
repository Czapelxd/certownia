# Security

Certownia handles cryptographic key material, so security is the whole point.

## Design guarantees

- **Private keys never leave the browser.** Both the ACME account key and the
  certificate key pair are generated with the WebCrypto API (`crypto.subtle`)
  inside the visitor's browser. The certificate private key is exported only to
  be offered as a download to the same user. No key material is ever sent to any
  server — not to the host of this site, and not to any proxy.
- **No backend by default.** The browser speaks the ACME protocol directly to
  Let's Encrypt, which serves CORS headers. There is no server in the middle
  that could observe requests. The optional proxy (`functions/`, `proxy/`) is
  off by default and, when enabled, only relays already-signed ACME requests —
  it still never sees a private key.
- **No tracking, no accounts, no server-side storage.** There is no backend that
  stores anything about you; the app runs entirely in your browser and sets no
  cookies and no analytics.
- **What the browser stores locally.** The **certificate** private key is never
  persisted — it exists only in memory and is offered to you as a download. To
  let you resume a pending verification after a reload, the app keeps the current
  session for up to 7 days (cleared on success or a fresh start): the domain(s),
  the optional email, and the pending order/challenges go in `localStorage`
  (key `certownia.session.v1`), while the ACME **account** key is stored
  separately in **IndexedDB** as a **non-extractable** WebCrypto key — it can
  sign requests but its raw key material can never be read back out, so even an
  injected script cannot exfiltrate it from storage. The account key is not the
  certificate key, never signs your certificate, and is never transmitted. UI
  preferences (language, theme) are stored separately. Clearing your browser's
  site data removes everything; avoid leaving a pending session on a shared or
  public computer.
- **Self-hosted fonts.** No third-party requests for assets (no CDN, no Google
  Fonts call), so loading the tool does not leak the visitor's IP to third parties.
- **DNS propagation checks use public DoH resolvers.** To tell you whether your
  TXT record is live and to guess your DNS provider, the app queries Cloudflare
  and Google DNS-over-HTTPS with the domain name only — never any key material.
- **The optional proxy is not an open relay.** It allow-lists the Let's Encrypt
  ACME hosts, so it cannot be abused to reach arbitrary URLs (SSRF).

## Reporting a vulnerability

Please report security issues privately to **security@baxy.it** rather than
opening a public issue. We aim to respond within a few business days.
