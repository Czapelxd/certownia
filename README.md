<div align="center">

# 🔒 BAXY SSL

**Darmowy certyfikat SSL prosto w przeglądarce — Twój klucz prywatny nigdy nie opuszcza Twojego komputera.**

*A free SSL certificate right in your browser — your private key never leaves your machine.*

Napędzane przez [Let's Encrypt](https://letsencrypt.org) · Powered by Let's Encrypt
· open source · [BAXY IT](https://baxy.it)

</div>

---

## 🇵🇱 Po polsku

**BAXY SSL** to darmowe narzędzie online, które wystawia zaufane certyfikaty
SSL/TLS dla Twojej domeny — bez zakładania konta, bez instalowania czegokolwiek,
w kilka minut. Cała kryptografia (klucz prywatny, CSR, podpisy) dzieje się w
**Twojej przeglądarce**. Serwer nie jest potrzebny i nigdy nie widzi Twojego
klucza prywatnego.

### Jak to działa

1. **Podaj domenę** — jedną lub kilka (obsługa wielu domen i wildcard `*.`).
2. **Potwierdź własność** — dodajesz rekord TXT w DNS albo plik na serwerze WWW;
   BAXY SSL pokazuje dokładnie jaki.
3. **Pobierz certyfikat** — klucz prywatny (`privkey.pem`) i certyfikat
   (`fullchain.pem`, `cert.pem`, `chain.pem`) lądują na Twoim dysku.

Certyfikat jest ważny 90 dni. Zainstaluj `fullchain.pem` + `privkey.pem` na
serwerze (Nginx: `ssl_certificate` / `ssl_certificate_key`; Apache:
`SSLCertificateFile` / `SSLCertificateKeyFile`).

> **Zacznij od środowiska testowego (staging).** Certyfikat testowy nie jest
> zaufany przez przeglądarki, ale nie zużywa limitów Let's Encrypt — idealny,
> żeby sprawdzić, że wszystko działa, zanim wystawisz certyfikat produkcyjny.

### Wygoda

- **Rozpoznaje Twój panel DNS** (OVH, cyberFolks, home.pl, Cloudflare, nazwa.pl)
  i pokazuje instrukcję krok po kroku.
- **Sprawdza propagację** rekordu TXT przez DNS-over-HTTPS, żebyś nie klikał
  „Zweryfikuj” na ślepo.
- **Zapamiętuje domenę** w przeglądarce — możesz zamknąć kartę i wrócić do tej
  samej weryfikacji (ten sam rekord), bez zaczynania od nowa.
- **Generator komendy certbot / acme.sh** — na ekranie końcowym pokazuje gotową
  komendę do uruchomienia na serwerze, żeby certyfikat odnawiał się automatycznie.

### Dlaczego to bezpieczne

- Klucz prywatny certyfikatu generowany w przeglądarce (WebCrypto) i **nigdzie
  nie wysyłany**, ani nie zapisywany.
- Brak backendu — przeglądarka rozmawia z Let's Encrypt bezpośrednio.
- Brak kont, brak śledzenia. Zapisujemy lokalnie tylko dane bieżącej weryfikacji
  (domena + klucz konta ACME), żeby dało się do niej wrócić; znika po wydaniu
  certyfikatu.
- Sprawdzanie DNS pyta publiczne resolvery (Cloudflare/Google) wyłącznie o nazwę
  Twojej domeny.
- Fonty hostowane lokalnie — zero zapytań do zewnętrznych serwerów po zasoby.

Szczegóły w [SECURITY.md](SECURITY.md).

---

## 🇬🇧 In English

**BAXY SSL** is a free online tool that issues trusted SSL/TLS certificates for
your domain — no account, nothing to install, in minutes. All cryptography (the
private key, the CSR, the signatures) happens **in your browser**. No server is
required and none ever sees your private key.

### How it works

1. **Enter your domain(s)** — one or many, wildcard `*.` supported.
2. **Prove ownership** — add a DNS TXT record or a file on your web server;
   BAXY SSL shows the exact one.
3. **Download the certificate** — the private key (`privkey.pem`) and certificate
   (`fullchain.pem`, `cert.pem`, `chain.pem`) land on your disk.

Certificates are valid for 90 days. Install `fullchain.pem` + `privkey.pem` on
your server (Nginx: `ssl_certificate` / `ssl_certificate_key`; Apache:
`SSLCertificateFile` / `SSLCertificateKeyFile`).

> **Start with the staging environment.** Staging certificates are not trusted by
> browsers but do not consume Let's Encrypt rate limits — perfect to confirm the
> flow works before issuing a production certificate.

### Convenience

- **Recognises your DNS panel** (OVH, cyberFolks, home.pl, Cloudflare, nazwa.pl)
  and shows step-by-step instructions.
- **Checks propagation** of the TXT record over DNS-over-HTTPS so you don't click
  “Verify” blindly.
- **Remembers your domain** in the browser — close the tab and return to the same
  verification (same record) without starting over.
- **certbot / acme.sh command generator** — the final screen shows a ready command
  to run on your server so the certificate renews automatically.

### Why it's secure

- The certificate private key is generated in the browser (WebCrypto) and **never
  sent anywhere**, nor stored.
- No backend — the browser talks to Let's Encrypt directly.
- No accounts, no tracking. We store only the current verification (domain + ACME
  account key) locally so you can resume it; it's cleared once the certificate is
  issued.
- DNS checks query public resolvers (Cloudflare/Google) for your domain name only.
- Fonts are self-hosted — no third-party requests for assets.

---

## Architecture

BAXY SSL is a static single-page app. The interesting part is that it speaks
the full **ACME v2 protocol** ([RFC 8555](https://datatracker.ietf.org/doc/html/rfc8555))
straight from the browser:

```
Browser (all crypto here)                         Let's Encrypt ACME
┌────────────────────────────┐   HTTPS + CORS    ┌──────────────────┐
│ WebCrypto  → keys, JWS      │ ───────────────▶ │  directory        │
│ PKI.js     → PKCS#10 CSR    │                  │  new-nonce/acct   │
│ ACME client → order/verify  │ ◀─────────────── │  new-order        │
│ private key → download only │                  │  finalize / cert  │
└────────────────────────────┘                   └──────────────────┘
        no server in between — Let's Encrypt serves CORS headers
```

- **`src/lib/crypto.ts`** — WebCrypto key generation (ECDSA P-256 / RSA), RFC 7638
  JWK thumbprint, key-authorization and dns-01 derivations.
- **`src/lib/jws.ts`** — JWS signing (ES256), the ACME request envelope.
- **`src/lib/csr.ts`** — PKCS#10 CSR with SAN via PKI.js.
- **`src/lib/acme.ts`** — the ACME v2 client (directory, nonce, account, order,
  challenges, finalize, certificate download).
- **`src/lib/doh.ts`** — DNS-over-HTTPS (Cloudflare/Google): TXT propagation check
  and NS lookup for provider detection.
- **`src/lib/providers.ts`** — DNS provider knowledge base + matching by NS.
- **`src/lib/session.ts`** — persist/resume a pending verification in localStorage.
- **`src/lib/commands.ts`** — generate certbot / acme.sh commands for auto-renewal.
- **`src/main.ts`** — the multilingual, themeable UI wizard.
- **`src/lib/i18n.ts`** + **`src/lib/locales/*.ts`** — one flat dictionary per
  language (en, pl, de, es, fr, it, pt); English is the default and fallback.

Key material never touches a server. There is an **optional** CORS proxy
(`functions/proxy.js` for Cloudflare Pages, `proxy/node-server.mjs` for
self-hosting) — off by default — for the rare case where you must route through
your own origin or target a CA that doesn't send CORS headers. Even then it only
relays already-signed requests and is host-allow-listed against SSRF.

## Tech stack

Vite · TypeScript · WebCrypto · [PKI.js](https://pkijs.org) · DNS-over-HTTPS ·
zero UI framework. BAXY IT brand system, self-hosted fonts (Bricolage Grotesque,
Inter, Geist Mono).

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (base64url, RFC 7638 thumbprint, CSR, dns-01)
npm run typecheck
npm run build      # → dist/
```

## Deployment

BAXY SSL builds to a folder of static files — host it anywhere.

**Cloudflare Pages / Netlify / Vercel (recommended):** build command `npm run
build`, output directory `dist`. Base path is `/`, no extra config.

**GitHub Pages:** the included workflow (`.github/workflows/deploy.yml`) builds
and deploys on every push to `main`. Enable Pages → Source: “GitHub Actions”. It
sets the Vite base to `/<repo>/` automatically. For a custom domain, set
`VITE_BASE=/`.

**Self-host:** serve `dist/` behind any web server. If you also run the optional
proxy, build with `VITE_ACME_PROXY=https://your-proxy/` (see `.env.example`).

## A note on the future

Certificate lifetimes are getting shorter (Let's Encrypt is moving toward
~45-day certificates), which means renewal should be **automated** on your
server (certbot, Caddy, Traefik, acme.sh). A click-through tool like BAXY SSL is
great for a one-off certificate, a quick test, or learning how ACME works — for
production, automate renewal.

## License

[MIT](LICENSE) © BAXY IT. Not affiliated with Let's Encrypt or ISRG.
“Let's Encrypt” is a trademark of the Internet Security Research Group.
