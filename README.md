<div align="center">

# 🔒 BAXY SSL

**Free SSL/TLS certificates, right in your browser — your private key never leaves your device.**

[**▶ Open the app**](https://baxy-it.github.io/certownia/) · Powered by [Let's Encrypt](https://letsencrypt.org) · Open source · by [BAXY IT](https://baxy.it)

</div>

---

## Contents

**📖 Full guide in your language** — click a language to expand it:

[🇬🇧 English](#english) · [🇵🇱 Polski](#polski) · [🇩🇪 Deutsch](#deutsch) · [🇪🇸 Español](#español) · [🇫🇷 Français](#français) · [🇮🇹 Italiano](#italiano) · [🇵🇹 Português](#português)

**🛠 Reference:** [Architecture](#architecture) · [Tech stack](#tech-stack) · [The future](#a-note-on-the-future) · [License](#license)

---

## English

<details>
<summary>🇬🇧 <b>Click to expand the full guide</b></summary>

### What it is

BAXY SSL is a free, open-source tool that issues trusted [Let's Encrypt](https://letsencrypt.org) SSL/TLS certificates for your domain — no account, nothing to install, in minutes. All cryptography (the private key, the CSR, the signatures) runs **in your browser**; no server is required and none ever sees your private key.

Live app: **https://baxy-it.github.io/certownia/**

### How it works

1. Your browser generates the keys with **WebCrypto**.
2. It speaks the **ACME** protocol **directly** to Let's Encrypt (which serves CORS), proving you control the domain via a DNS record or an HTTP file.
3. You download the signed certificate and install it on your server.

### Using it — step by step

1. **Enter your domain(s).** One or several, separated by a space or comma. Wildcards (`*.example.com`) are supported but require DNS validation.
2. **Pick the environment.** Start with **Testing (staging)** — the certificate is not browser-trusted but does not use up Let's Encrypt rate limits, so it's ideal to confirm the flow works. Switch to **Production** for a real, trusted certificate.
3. **Choose the key type.** ECDSA P-256 (recommended — modern and fast), RSA 2048 (the classic, widest reach), or RSA 4096 (the largest RSA key). Not sure? Keep ECDSA P-256. The `i` tooltip next to the field explains the difference.
4. **Choose the verification method.** **DNS (TXT record)** works everywhere and is required for wildcards; **File on server (HTTP)** is simpler if you control the domain's web server.
5. **Add the record or file.** BAXY SSL shows the exact value, recognises your DNS provider (OVH, cyberFolks, home.pl, Cloudflare, nazwa.pl) with step-by-step instructions, and checks propagation for you so you don't verify blindly. The **Verify** button unlocks once the record/file is visible.
6. **Verify.** Let's Encrypt validates your domain and issues the certificate.
7. **Download and install.** You receive plain text `.pem` files:
   - `privkey.pem` — your **private key** (secret; keep it safe and never share it).
   - `cert.pem` — the certificate for your domain.
   - `chain.pem` — the intermediate / Root CA chain.
   - `fullchain.pem` — the certificate and chain together in one file.

   In a hosting panel, paste `privkey.pem` into the **"Private key"** field, `cert.pem` into **"Certificate"**, and `chain.pem` into the **"Root CA" / "CA" / "chain"** field. If the panel has a single certificate field or asks for a "fullchain", use `fullchain.pem` instead of `cert.pem` + `chain.pem`. On a VPS: Nginx — `ssl_certificate` = `fullchain.pem`, `ssl_certificate_key` = `privkey.pem`; Apache — `SSLCertificateFile` / `SSLCertificateKeyFile`.

Certificates are valid for **90 days**. You can close the tab and come back later — BAXY SSL remembers the pending verification (the same record), so you don't start from scratch.

### Prefer the terminal?

The app also generates a ready-to-run **certbot** / **acme.sh** command, and shows how to set up **automatic renewal** (the `webroot` method, or a DNS-provider plugin with `--deploy-hook`). For anything in production, automate renewal on your own server.

### Security & privacy

- The certificate private key is generated in your browser and is **never sent anywhere or persisted**.
- No backend, no accounts, no cookies, no tracking.
- The ACME **account** key is kept as a **non-extractable** key in IndexedDB (it can sign requests but its raw material can't be read out), only so you can resume a pending verification; it's cleared once the certificate is issued.
- A strict Content-Security-Policy limits network traffic to Let's Encrypt and the DNS/relay checks. Details: [SECURITY.md](SECURITY.md) · [Privacy Policy](https://baxy-it.github.io/certownia/privacy.en.html) · [Terms of Use](https://baxy-it.github.io/certownia/terms.en.html).

### Run it yourself — installation & development

Prerequisite: **Node.js 20+**.

```bash
git clone https://github.com/BAXY-IT/certownia.git
cd certownia
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # unit tests (base64url, RFC 7638 thumbprint, CSR, dns-01, i18n)
npm run typecheck  # tsc --noEmit
npm run build      # production build → dist/ (static files)
```

**Deploy** the `dist/` folder anywhere:

- **GitHub Pages** — the included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`. Enable it under Settings → Pages → Source: "GitHub Actions". It sets the Vite base to `/<repo>/` automatically; for a custom domain, set `VITE_BASE=/`.
- **Cloudflare Pages / Netlify / Vercel** — build command `npm run build`, output directory `dist`, base path `/`. On Cloudflare Pages you can also serve real security headers via a `public/_headers` file and run the optional proxy in `functions/`.
- **Self-host** — serve `dist/` behind any web server. To route ACME through your own origin, build with `VITE_ACME_PROXY=https://your-proxy/` (see `.env.example`); the proxy is **off by default** and is SSRF-allow-listed to the Let's Encrypt hosts.

</details>

---

## Polski

<details>
<summary>🇵🇱 <b>Kliknij, aby rozwinąć pełny przewodnik</b></summary>

### Co to jest

BAXY SSL to darmowe narzędzie open source, które wystawia zaufane certyfikaty SSL/TLS [Let's Encrypt](https://letsencrypt.org) dla Twojej domeny — bez konta, bez instalacji, w kilka minut. Cała kryptografia (klucz prywatny, CSR, podpisy) działa **w Twojej przeglądarce**; nie jest potrzebny żaden serwer i żaden nigdy nie widzi Twojego klucza prywatnego.

Aplikacja na żywo: **https://baxy-it.github.io/certownia/**

### Jak to działa

1. Twoja przeglądarka generuje klucze za pomocą **WebCrypto**.
2. Komunikuje się protokołem **ACME** **bezpośrednio** z Let's Encrypt (które udostępnia CORS), potwierdzając, że kontrolujesz domenę, przez rekord DNS lub plik HTTP.
3. Pobierasz podpisany certyfikat i instalujesz go na swoim serwerze.

### Jak z tego korzystać — krok po kroku

1. **Wpisz swoją domenę (lub domeny).** Jedną lub kilka, oddzielonych spacją albo przecinkiem. Wildcardy (`*.example.com`) są obsługiwane, ale wymagają walidacji DNS.
2. **Wybierz środowisko.** Zacznij od **Testowego (staging)** — certyfikat nie jest zaufany przez przeglądarki, ale nie zużywa limitów Let's Encrypt, więc świetnie nadaje się do sprawdzenia, czy cały proces działa. Przełącz się na **Produkcję**, aby uzyskać prawdziwy, zaufany certyfikat.
3. **Wybierz typ klucza.** ECDSA P-256 (zalecany — nowoczesny i szybki), RSA 2048 (klasyk o najszerszej kompatybilności) lub RSA 4096 (największy klucz RSA). Nie masz pewności? Zostaw ECDSA P-256. Dymek `i` obok pola wyjaśnia różnicę.
4. **Wybierz metodę weryfikacji.** **DNS (rekord TXT)** działa wszędzie i jest wymagany dla wildcardów; **Plik na serwerze (HTTP)** jest prostszy, jeśli kontrolujesz serwer WWW domeny.
5. **Dodaj rekord lub plik.** BAXY SSL pokazuje dokładną wartość, rozpoznaje Twojego dostawcę DNS (OVH, cyberFolks, home.pl, Cloudflare, nazwa.pl) i podaje instrukcje krok po kroku, a także sprawdza za Ciebie propagację, żebyś nie weryfikował w ciemno. Przycisk **Weryfikuj** odblokowuje się, gdy rekord/plik stanie się widoczny.
6. **Zweryfikuj.** Let's Encrypt sprawdza Twoją domenę i wystawia certyfikat.
7. **Pobierz i zainstaluj.** Otrzymujesz zwykłe tekstowe pliki `.pem`:
   - `privkey.pem` — Twój **klucz prywatny** (tajny; trzymaj go bezpiecznie i nigdy nikomu nie udostępniaj).
   - `cert.pem` — certyfikat dla Twojej domeny.
   - `chain.pem` — łańcuch pośredni / Root CA.
   - `fullchain.pem` — certyfikat i łańcuch razem w jednym pliku.

   W panelu hostingowym wklej `privkey.pem` do pola **"Private key"**, `cert.pem` do **"Certificate"**, a `chain.pem` do pola **"Root CA" / "CA" / "chain"**. Jeśli panel ma jedno pole na certyfikat albo prosi o "fullchain", użyj `fullchain.pem` zamiast `cert.pem` + `chain.pem`. Na VPS: Nginx — `ssl_certificate` = `fullchain.pem`, `ssl_certificate_key` = `privkey.pem`; Apache — `SSLCertificateFile` / `SSLCertificateKeyFile`.

Certyfikaty są ważne przez **90 dni**. Możesz zamknąć kartę i wrócić później — BAXY SSL zapamiętuje oczekującą weryfikację (ten sam rekord), więc nie zaczynasz od zera.

### Wolisz terminal?

Aplikacja generuje też gotowe do uruchomienia polecenie **certbot** / **acme.sh** i pokazuje, jak skonfigurować **automatyczne odnawianie** (metodą `webroot` albo za pomocą wtyczki dostawcy DNS z `--deploy-hook`). W przypadku wszystkiego, co produkcyjne, zautomatyzuj odnawianie na własnym serwerze.

### Bezpieczeństwo i prywatność

- Klucz prywatny certyfikatu jest generowany w Twojej przeglądarce i **nigdy nie jest nigdzie wysyłany ani zapisywany**.
- Bez backendu, bez kont, bez ciasteczek, bez śledzenia.
- Klucz **konta** ACME jest przechowywany jako klucz **nieeksportowalny** w IndexedDB (może podpisywać żądania, ale jego surowego materiału nie da się odczytać), wyłącznie po to, byś mógł wznowić oczekującą weryfikację; jest usuwany po wystawieniu certyfikatu.
- Restrykcyjna Content-Security-Policy ogranicza ruch sieciowy do Let's Encrypt oraz kontroli DNS/relay. Szczegóły: [SECURITY.md](SECURITY.md) · [Polityka prywatności](https://baxy-it.github.io/certownia/privacy.pl.html) · [Regulamin](https://baxy-it.github.io/certownia/terms.pl.html).

### Uruchom u siebie — instalacja i rozwój

Wymaganie wstępne: **Node.js 20+**.

```bash
git clone https://github.com/BAXY-IT/certownia.git
cd certownia
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # unit tests (base64url, RFC 7638 thumbprint, CSR, dns-01, i18n)
npm run typecheck  # tsc --noEmit
npm run build      # production build → dist/ (static files)
```

**Wdróż** folder `dist/` w dowolnym miejscu:

- **GitHub Pages** — dołączony workflow (`.github/workflows/deploy.yml`) buduje i wdraża aplikację przy każdym pushu do gałęzi `main`. Włącz go w Settings → Pages → Source: "GitHub Actions". Ustawia bazę Vite na `/<repo>/` automatycznie; dla własnej domeny ustaw `VITE_BASE=/`.
- **Cloudflare Pages / Netlify / Vercel** — polecenie budowania `npm run build`, katalog wyjściowy `dist`, ścieżka bazowa `/`. Na Cloudflare Pages możesz też serwować prawdziwe nagłówki bezpieczeństwa przez plik `public/_headers` i uruchomić opcjonalne proxy w `functions/`.
- **Self-hosting** — serwuj `dist/` za dowolnym serwerem WWW. Aby przekierować ACME przez własny origin, zbuduj z `VITE_ACME_PROXY=https://your-proxy/` (zobacz `.env.example`); proxy jest **domyślnie wyłączone** i ma listę dozwolonych (SSRF-allow-list) ograniczoną do hostów Let's Encrypt.

</details>

---

## Deutsch

<details>
<summary>🇩🇪 <b>Zum Ausklappen der vollständigen Anleitung klicken</b></summary>

### Was es ist

BAXY SSL ist ein kostenloses Open-Source-Tool, das vertrauenswürdige [Let's Encrypt](https://letsencrypt.org) SSL/TLS-Zertifikate für Ihre Domain ausstellt — ohne Konto, ohne Installation, in wenigen Minuten. Die gesamte Kryptografie (der private Schlüssel, der CSR, die Signaturen) läuft **in Ihrem Browser**; es wird kein Server benötigt und keiner bekommt jemals Ihren privaten Schlüssel zu sehen.

Live-App: **https://baxy-it.github.io/certownia/**

### Wie es funktioniert

1. Ihr Browser erzeugt die Schlüssel mit **WebCrypto**.
2. Er spricht das **ACME**-Protokoll **direkt** mit Let's Encrypt (das CORS bereitstellt) und weist so nach, dass Sie die Domain kontrollieren — über einen DNS-Eintrag oder eine HTTP-Datei.
3. Sie laden das signierte Zertifikat herunter und installieren es auf Ihrem Server.

### Schritt für Schritt

1. **Geben Sie Ihre Domain(s) ein.** Eine oder mehrere, getrennt durch ein Leerzeichen oder Komma. Wildcards (`*.example.com`) werden unterstützt, erfordern aber DNS-Validierung.
2. **Wählen Sie die Umgebung.** Beginnen Sie mit **Testing (staging)** — das Zertifikat ist nicht browser-vertrauenswürdig, verbraucht aber keine Rate-Limits von Let's Encrypt und eignet sich daher ideal, um zu bestätigen, dass der Ablauf funktioniert. Wechseln Sie zu **Production** für ein echtes, vertrauenswürdiges Zertifikat.
3. **Wählen Sie den Schlüsseltyp.** ECDSA P-256 (empfohlen — modern und schnell), RSA 2048 (der Klassiker mit der größten Reichweite) oder RSA 4096 (der größte RSA-Schlüssel). Nicht sicher? Bleiben Sie bei ECDSA P-256. Der `i`-Tooltip neben dem Feld erklärt den Unterschied.
4. **Wählen Sie die Verifizierungsmethode.** **DNS (TXT-Eintrag)** funktioniert überall und ist für Wildcards erforderlich; **Datei auf dem Server (HTTP)** ist einfacher, wenn Sie den Webserver der Domain kontrollieren.
5. **Fügen Sie den Eintrag oder die Datei hinzu.** BAXY SSL zeigt Ihnen den genauen Wert an, erkennt Ihren DNS-Anbieter (OVH, cyberFolks, home.pl, Cloudflare, nazwa.pl) mit Schritt-für-Schritt-Anleitungen und prüft die Verbreitung für Sie, damit Sie nicht blind verifizieren. Die Schaltfläche **Verify** wird freigeschaltet, sobald der Eintrag bzw. die Datei sichtbar ist.
6. **Verifizieren.** Let's Encrypt validiert Ihre Domain und stellt das Zertifikat aus.
7. **Herunterladen und installieren.** Sie erhalten `.pem`-Dateien im Klartext:
   - `privkey.pem` — Ihr **privater Schlüssel** (geheim; bewahren Sie ihn sicher auf und teilen Sie ihn niemals).
   - `cert.pem` — das Zertifikat für Ihre Domain.
   - `chain.pem` — die Zwischenzertifikat- / Root-CA-Kette.
   - `fullchain.pem` — Zertifikat und Kette zusammen in einer Datei.

   In einem Hosting-Panel fügen Sie `privkey.pem` in das Feld **"Private key"** ein, `cert.pem` in **"Certificate"** und `chain.pem` in das Feld **"Root CA" / "CA" / "chain"**. Hat das Panel nur ein einziges Zertifikatsfeld oder verlangt es eine "fullchain", verwenden Sie `fullchain.pem` anstelle von `cert.pem` + `chain.pem`. Auf einem VPS: Nginx — `ssl_certificate` = `fullchain.pem`, `ssl_certificate_key` = `privkey.pem`; Apache — `SSLCertificateFile` / `SSLCertificateKeyFile`.

Zertifikate sind **90 Tage** gültig. Sie können den Tab schließen und später zurückkehren — BAXY SSL merkt sich die ausstehende Verifizierung (denselben Eintrag), sodass Sie nicht von vorne beginnen müssen.

### Lieber im Terminal?

Die App erzeugt außerdem einen sofort ausführbaren **certbot**- / **acme.sh**-Befehl und zeigt, wie Sie die **automatische Erneuerung** einrichten (die `webroot`-Methode oder ein Plugin für Ihren DNS-Anbieter mit `--deploy-hook`). Für alles im Produktivbetrieb sollten Sie die Erneuerung auf Ihrem eigenen Server automatisieren.

### Sicherheit & Datenschutz

- Der private Schlüssel des Zertifikats wird in Ihrem Browser erzeugt und **niemals irgendwohin gesendet oder gespeichert**.
- Kein Backend, keine Konten, keine Cookies, kein Tracking.
- Der ACME-**Kontoschlüssel** wird als **nicht extrahierbarer** Schlüssel in IndexedDB gehalten (er kann Anfragen signieren, aber sein Rohmaterial lässt sich nicht auslesen), nur damit Sie eine ausstehende Verifizierung fortsetzen können; er wird gelöscht, sobald das Zertifikat ausgestellt ist.
- Eine strikte Content-Security-Policy beschränkt den Netzwerkverkehr auf Let's Encrypt und die DNS-/Relay-Prüfungen. Details: [SECURITY.md](SECURITY.md) · [Datenschutzerklärung](https://baxy-it.github.io/certownia/privacy.de.html) · [Nutzungsbedingungen](https://baxy-it.github.io/certownia/terms.de.html).

### Selbst betreiben — Installation & Entwicklung

Voraussetzung: **Node.js 20+**.

```bash
git clone https://github.com/BAXY-IT/certownia.git
cd certownia
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # unit tests (base64url, RFC 7638 thumbprint, CSR, dns-01, i18n)
npm run typecheck  # tsc --noEmit
npm run build      # production build → dist/ (static files)
```

**Deployen** Sie den Ordner `dist/` an einem beliebigen Ort:

- **GitHub Pages** — der mitgelieferte Workflow (`.github/workflows/deploy.yml`) baut und deployt bei jedem Push auf `main`. Aktivieren Sie ihn unter Settings → Pages → Source: "GitHub Actions". Er setzt die Vite-Base automatisch auf `/<repo>/`; für eine eigene Domain setzen Sie `VITE_BASE=/`.
- **Cloudflare Pages / Netlify / Vercel** — Build-Befehl `npm run build`, Ausgabeverzeichnis `dist`, Basispfad `/`. Auf Cloudflare Pages können Sie zudem echte Security-Header über eine Datei `public/_headers` ausliefern und den optionalen Proxy in `functions/` betreiben.
- **Self-Hosting** — liefern Sie `dist/` hinter einem beliebigen Webserver aus. Um ACME über Ihren eigenen Origin zu leiten, bauen Sie mit `VITE_ACME_PROXY=https://your-proxy/` (siehe `.env.example`); der Proxy ist **standardmäßig deaktiviert** und per SSRF-Allowlist auf die Let's-Encrypt-Hosts beschränkt.

</details>

---

## Español

<details>
<summary>🇪🇸 <b>Haz clic para ver la guía completa</b></summary>

### Qué es

BAXY SSL es una herramienta gratuita y de código abierto que emite certificados SSL/TLS de confianza de [Let's Encrypt](https://letsencrypt.org) para tu dominio, sin cuenta, sin nada que instalar y en cuestión de minutos. Toda la criptografía (la clave privada, la CSR, las firmas) se ejecuta **en tu navegador**; no se necesita ningún servidor y ninguno llega a ver tu clave privada.

Aplicación en vivo: **https://baxy-it.github.io/certownia/**

### Cómo funciona

1. Tu navegador genera las claves con **WebCrypto**.
2. Habla el protocolo **ACME** **directamente** con Let's Encrypt (que sirve CORS), demostrando que controlas el dominio mediante un registro DNS o un archivo HTTP.
3. Descargas el certificado firmado y lo instalas en tu servidor.

### Cómo usarlo, paso a paso

1. **Introduce tu(s) dominio(s).** Uno o varios, separados por un espacio o una coma. Se admiten comodines (`*.example.com`), pero requieren validación DNS.
2. **Elige el entorno.** Empieza con **Pruebas (staging)**: el certificado no es de confianza para los navegadores, pero no consume los límites de uso de Let's Encrypt, así que es ideal para confirmar que el flujo funciona. Cambia a **Producción** para obtener un certificado real y de confianza.
3. **Elige el tipo de clave.** ECDSA P-256 (recomendada, moderna y rápida), RSA 2048 (la clásica, con el mayor alcance) o RSA 4096 (la clave RSA más grande). ¿No estás seguro? Deja ECDSA P-256. La ayuda `i` junto al campo explica la diferencia.
4. **Elige el método de verificación.** **DNS (registro TXT)** funciona en todas partes y es obligatorio para los comodines; **Archivo en el servidor (HTTP)** es más sencillo si controlas el servidor web del dominio.
5. **Añade el registro o el archivo.** BAXY SSL muestra el valor exacto, reconoce tu proveedor de DNS (OVH, cyberFolks, home.pl, Cloudflare, nazwa.pl) con instrucciones paso a paso y comprueba la propagación por ti para que no verifiques a ciegas. El botón **Verificar** se desbloquea en cuanto el registro o el archivo es visible.
6. **Verifica.** Let's Encrypt valida tu dominio y emite el certificado.
7. **Descarga e instala.** Recibes archivos `.pem` en texto plano:
   - `privkey.pem` — tu **clave privada** (secreta; guárdala a buen recaudo y no la compartas nunca).
   - `cert.pem` — el certificado de tu dominio.
   - `chain.pem` — la cadena intermedia / Root CA.
   - `fullchain.pem` — el certificado y la cadena juntos en un solo archivo.

   En un panel de hosting, pega `privkey.pem` en el campo **"Private key"**, `cert.pem` en **"Certificate"** y `chain.pem` en el campo **"Root CA" / "CA" / "chain"**. Si el panel tiene un único campo de certificado o pide un "fullchain", usa `fullchain.pem` en lugar de `cert.pem` + `chain.pem`. En un VPS: Nginx — `ssl_certificate` = `fullchain.pem`, `ssl_certificate_key` = `privkey.pem`; Apache — `SSLCertificateFile` / `SSLCertificateKeyFile`.

Los certificados son válidos durante **90 días**. Puedes cerrar la pestaña y volver más tarde: BAXY SSL recuerda la verificación pendiente (el mismo registro), así que no empiezas desde cero.

### ¿Prefieres el terminal?

La aplicación también genera un comando **certbot** / **acme.sh** listo para ejecutar, y muestra cómo configurar la **renovación automática** (el método `webroot` o un plugin del proveedor de DNS con `--deploy-hook`). Para cualquier entorno de producción, automatiza la renovación en tu propio servidor.

### Seguridad y privacidad

- La clave privada del certificado se genera en tu navegador y **nunca se envía a ningún sitio ni se guarda**.
- Sin backend, sin cuentas, sin cookies, sin seguimiento.
- La clave de la **cuenta** ACME se guarda como clave **no extraíble** en IndexedDB (puede firmar solicitudes, pero su material en bruto no se puede leer), únicamente para que puedas reanudar una verificación pendiente; se borra en cuanto se emite el certificado.
- Una Content-Security-Policy estricta limita el tráfico de red a Let's Encrypt y a las comprobaciones de DNS/relay. Detalles: [SECURITY.md](SECURITY.md) · [Política de privacidad](https://baxy-it.github.io/certownia/privacy.es.html) · [Términos de uso](https://baxy-it.github.io/certownia/terms.es.html).

### Ejecútalo tú mismo — instalación y desarrollo

Requisito previo: **Node.js 20+**.

```bash
git clone https://github.com/BAXY-IT/certownia.git
cd certownia
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # unit tests (base64url, RFC 7638 thumbprint, CSR, dns-01, i18n)
npm run typecheck  # tsc --noEmit
npm run build      # production build → dist/ (static files)
```

**Despliega** la carpeta `dist/` en cualquier sitio:

- **GitHub Pages** — el workflow incluido (`.github/workflows/deploy.yml`) compila y despliega en cada push a `main`. Actívalo en Settings → Pages → Source: "GitHub Actions". Establece la base de Vite en `/<repo>/` automáticamente; para un dominio personalizado, usa `VITE_BASE=/`.
- **Cloudflare Pages / Netlify / Vercel** — comando de compilación `npm run build`, directorio de salida `dist`, ruta base `/`. En Cloudflare Pages también puedes servir cabeceras de seguridad reales mediante un archivo `public/_headers` y ejecutar el proxy opcional de `functions/`.
- **Autoalojamiento** — sirve `dist/` detrás de cualquier servidor web. Para enrutar ACME a través de tu propio origen, compila con `VITE_ACME_PROXY=https://your-proxy/` (consulta `.env.example`); el proxy está **desactivado por defecto** y tiene una lista de permitidos contra SSRF limitada a los hosts de Let's Encrypt.

</details>

---

## Français

<details>
<summary>🇫🇷 <b>Cliquez pour afficher le guide complet</b></summary>

### Ce que c'est

BAXY SSL est un outil gratuit et open source qui délivre des certificats SSL/TLS [Let's Encrypt](https://letsencrypt.org) de confiance pour votre domaine — sans compte, sans rien à installer, en quelques minutes. Toute la cryptographie (la clé privée, la CSR, les signatures) s'exécute **dans votre navigateur** ; aucun serveur n'est nécessaire et aucun ne voit jamais votre clé privée.

Application en ligne : **https://baxy-it.github.io/certownia/**

### Comment ça marche

1. Votre navigateur génère les clés avec **WebCrypto**.
2. Il dialogue en **ACME** **directement** avec Let's Encrypt (qui gère le CORS), prouvant que vous contrôlez le domaine via un enregistrement DNS ou un fichier HTTP.
3. Vous téléchargez le certificat signé et l'installez sur votre serveur.

### L'utiliser — étape par étape

1. **Saisissez votre ou vos domaines.** Un seul ou plusieurs, séparés par une espace ou une virgule. Les caractères génériques (`*.example.com`) sont pris en charge mais nécessitent une validation DNS.
2. **Choisissez l'environnement.** Commencez par **Test (staging)** — le certificat n'est pas reconnu par les navigateurs mais ne consomme pas les limites de débit de Let's Encrypt, ce qui est idéal pour confirmer que le processus fonctionne. Passez en **Production** pour obtenir un vrai certificat de confiance.
3. **Choisissez le type de clé.** ECDSA P-256 (recommandé — moderne et rapide), RSA 2048 (le classique, la compatibilité la plus large) ou RSA 4096 (la plus grande clé RSA). Vous hésitez ? Restez sur ECDSA P-256. L'infobulle `i` à côté du champ explique la différence.
4. **Choisissez la méthode de vérification.** **DNS (enregistrement TXT)** fonctionne partout et est obligatoire pour les caractères génériques ; **Fichier sur le serveur (HTTP)** est plus simple si vous contrôlez le serveur web du domaine.
5. **Ajoutez l'enregistrement ou le fichier.** BAXY SSL affiche la valeur exacte, reconnaît votre fournisseur DNS (OVH, cyberFolks, home.pl, Cloudflare, nazwa.pl) avec des instructions détaillées, et vérifie la propagation à votre place pour que vous ne validiez pas à l'aveugle. Le bouton **Vérifier** se débloque dès que l'enregistrement/fichier est visible.
6. **Vérifiez.** Let's Encrypt valide votre domaine et délivre le certificat.
7. **Téléchargez et installez.** Vous recevez des fichiers `.pem` en texte brut :
   - `privkey.pem` — votre **clé privée** (secrète ; gardez-la en lieu sûr et ne la partagez jamais).
   - `cert.pem` — le certificat de votre domaine.
   - `chain.pem` — la chaîne intermédiaire / Root CA.
   - `fullchain.pem` — le certificat et la chaîne réunis dans un seul fichier.

   Dans un panneau d'hébergement, collez `privkey.pem` dans le champ **"Private key"**, `cert.pem` dans **"Certificate"**, et `chain.pem` dans le champ **"Root CA" / "CA" / "chain"**. Si le panneau ne comporte qu'un seul champ de certificat ou demande un "fullchain", utilisez `fullchain.pem` à la place de `cert.pem` + `chain.pem`. Sur un VPS : Nginx — `ssl_certificate` = `fullchain.pem`, `ssl_certificate_key` = `privkey.pem` ; Apache — `SSLCertificateFile` / `SSLCertificateKeyFile`.

Les certificats sont valides **90 jours**. Vous pouvez fermer l'onglet et revenir plus tard — BAXY SSL mémorise la vérification en attente (le même enregistrement), pour que vous ne repartiez pas de zéro.

### Vous préférez le terminal ?

L'application génère aussi une commande **certbot** / **acme.sh** prête à l'emploi, et montre comment mettre en place le **renouvellement automatique** (la méthode `webroot`, ou un plugin de fournisseur DNS avec `--deploy-hook`). Pour tout ce qui est en production, automatisez le renouvellement sur votre propre serveur.

### Sécurité et confidentialité

- La clé privée du certificat est générée dans votre navigateur et n'est **jamais envoyée où que ce soit ni conservée**.
- Aucun backend, aucun compte, aucun cookie, aucun tracking.
- La clé du **compte** ACME est conservée sous forme de clé **non extractible** dans IndexedDB (elle peut signer des requêtes mais son contenu brut ne peut pas être lu), uniquement pour vous permettre de reprendre une vérification en attente ; elle est effacée une fois le certificat délivré.
- Une Content-Security-Policy stricte limite le trafic réseau à Let's Encrypt et aux vérifications DNS/relais. Détails : [SECURITY.md](SECURITY.md) · [Politique de confidentialité](https://baxy-it.github.io/certownia/privacy.fr.html) · [Conditions d'utilisation](https://baxy-it.github.io/certownia/terms.fr.html).

### L'exécuter vous-même — installation et développement

Prérequis : **Node.js 20+**.

```bash
git clone https://github.com/BAXY-IT/certownia.git
cd certownia
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # unit tests (base64url, RFC 7638 thumbprint, CSR, dns-01, i18n)
npm run typecheck  # tsc --noEmit
npm run build      # production build → dist/ (static files)
```

**Déployez** le dossier `dist/` n'importe où :

- **GitHub Pages** — le workflow inclus (`.github/workflows/deploy.yml`) compile et déploie à chaque push sur `main`. Activez-le dans Settings → Pages → Source : "GitHub Actions". Il définit automatiquement la base Vite sur `/<repo>/` ; pour un domaine personnalisé, définissez `VITE_BASE=/`.
- **Cloudflare Pages / Netlify / Vercel** — commande de build `npm run build`, répertoire de sortie `dist`, chemin de base `/`. Sur Cloudflare Pages, vous pouvez aussi servir de vrais en-têtes de sécurité via un fichier `public/_headers` et exécuter le proxy optionnel dans `functions/`.
- **Auto-hébergement** — servez `dist/` derrière n'importe quel serveur web. Pour router ACME via votre propre origine, compilez avec `VITE_ACME_PROXY=https://your-proxy/` (voir `.env.example`) ; le proxy est **désactivé par défaut** et sa liste d'autorisation SSRF est limitée aux hôtes de Let's Encrypt.

</details>

---

## Italiano

<details>
<summary>🇮🇹 <b>Fai clic per aprire la guida completa</b></summary>

### Che cos'è

BAXY SSL è uno strumento gratuito e open-source che rilascia certificati SSL/TLS attendibili di [Let's Encrypt](https://letsencrypt.org) per il tuo dominio — senza account, senza installare nulla, in pochi minuti. Tutta la crittografia (la chiave privata, la CSR, le firme) viene eseguita **nel tuo browser**; non serve alcun server e nessuno vede mai la tua chiave privata.

App online: **https://baxy-it.github.io/certownia/**

### Come funziona

1. Il tuo browser genera le chiavi con **WebCrypto**.
2. Comunica il protocollo **ACME** **direttamente** con Let's Encrypt (che fornisce CORS), dimostrando che controlli il dominio tramite un record DNS o un file HTTP.
3. Scarichi il certificato firmato e lo installi sul tuo server.

### Come usarlo — passo dopo passo

1. **Inserisci il tuo dominio (o domini).** Uno o più, separati da uno spazio o da una virgola. I wildcard (`*.example.com`) sono supportati ma richiedono la validazione DNS.
2. **Scegli l'ambiente.** Inizia con **Test (staging)** — il certificato non è attendibile per il browser ma non consuma i limiti di frequenza di Let's Encrypt, quindi è ideale per verificare che il flusso funzioni. Passa a **Produzione** per un certificato reale e attendibile.
3. **Scegli il tipo di chiave.** ECDSA P-256 (consigliata — moderna e veloce), RSA 2048 (la classica, con la massima compatibilità) o RSA 4096 (la chiave RSA più grande). Non sei sicuro? Mantieni ECDSA P-256. Il tooltip `i` accanto al campo spiega la differenza.
4. **Scegli il metodo di verifica.** **DNS (record TXT)** funziona ovunque ed è obbligatorio per i wildcard; **File sul server (HTTP)** è più semplice se controlli il web server del dominio.
5. **Aggiungi il record o il file.** BAXY SSL mostra il valore esatto, riconosce il tuo provider DNS (OVH, cyberFolks, home.pl, Cloudflare, nazwa.pl) con istruzioni passo dopo passo, e controlla per te la propagazione così non verifichi alla cieca. Il pulsante **Verifica** si sblocca quando il record/file è visibile.
6. **Verifica.** Let's Encrypt valida il tuo dominio e rilascia il certificato.
7. **Scarica e installa.** Ricevi dei file `.pem` in testo semplice:
   - `privkey.pem` — la tua **chiave privata** (segreta; conservala al sicuro e non condividerla mai).
   - `cert.pem` — il certificato per il tuo dominio.
   - `chain.pem` — la catena intermedia / Root CA.
   - `fullchain.pem` — il certificato e la catena insieme in un unico file.

   In un pannello di hosting, incolla `privkey.pem` nel campo **"Private key"**, `cert.pem` in **"Certificate"** e `chain.pem` nel campo **"Root CA" / "CA" / "chain"**. Se il pannello ha un unico campo per il certificato o chiede una "fullchain", usa `fullchain.pem` al posto di `cert.pem` + `chain.pem`. Su un VPS: Nginx — `ssl_certificate` = `fullchain.pem`, `ssl_certificate_key` = `privkey.pem`; Apache — `SSLCertificateFile` / `SSLCertificateKeyFile`.

I certificati sono validi per **90 giorni**. Puoi chiudere la scheda e tornare più tardi — BAXY SSL ricorda la verifica in sospeso (lo stesso record), così non ricominci da zero.

### Preferisci il terminale?

L'app genera anche un comando **certbot** / **acme.sh** pronto all'uso, e mostra come configurare il **rinnovo automatico** (il metodo `webroot`, oppure un plugin del provider DNS con `--deploy-hook`). Per qualsiasi cosa in produzione, automatizza il rinnovo sul tuo server.

### Sicurezza e privacy

- La chiave privata del certificato viene generata nel tuo browser e **non viene mai inviata da nessuna parte né conservata**.
- Nessun backend, nessun account, nessun cookie, nessun tracciamento.
- La chiave dell'**account** ACME è conservata come chiave **non estraibile** in IndexedDB (può firmare le richieste ma il suo materiale grezzo non può essere letto), solo per permetterti di riprendere una verifica in sospeso; viene cancellata una volta rilasciato il certificato.
- Una rigorosa Content-Security-Policy limita il traffico di rete a Let's Encrypt e ai controlli DNS/relay. Dettagli: [SECURITY.md](SECURITY.md) · [Informativa sulla privacy](https://baxy-it.github.io/certownia/privacy.it.html) · [Condizioni d'uso](https://baxy-it.github.io/certownia/terms.it.html).

### Eseguilo tu stesso — installazione e sviluppo

Prerequisito: **Node.js 20+**.

```bash
git clone https://github.com/BAXY-IT/certownia.git
cd certownia
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # unit tests (base64url, RFC 7638 thumbprint, CSR, dns-01, i18n)
npm run typecheck  # tsc --noEmit
npm run build      # production build → dist/ (static files)
```

**Distribuisci** la cartella `dist/` ovunque:

- **GitHub Pages** — il workflow incluso (`.github/workflows/deploy.yml`) compila e distribuisce a ogni push su `main`. Abilitalo in Settings → Pages → Source: "GitHub Actions". Imposta automaticamente la base di Vite su `/<repo>/`; per un dominio personalizzato, imposta `VITE_BASE=/`.
- **Cloudflare Pages / Netlify / Vercel** — comando di build `npm run build`, cartella di output `dist`, percorso base `/`. Su Cloudflare Pages puoi anche fornire header di sicurezza reali tramite un file `public/_headers` ed eseguire il proxy opzionale in `functions/`.
- **Self-host** — servi `dist/` dietro qualsiasi web server. Per instradare ACME attraverso la tua origine, compila con `VITE_ACME_PROXY=https://your-proxy/` (vedi `.env.example`); il proxy è **disattivato per impostazione predefinita** ed è limitato tramite allow-list SSRF agli host di Let's Encrypt.

</details>

---

## Português

<details>
<summary>🇵🇹 <b>Clique para abrir o guia completo</b></summary>

### O que é

O BAXY SSL é uma ferramenta gratuita e de código aberto que emite certificados SSL/TLS fidedignos da [Let's Encrypt](https://letsencrypt.org) para o seu domínio — sem conta, sem nada para instalar, em minutos. Toda a criptografia (a chave privada, o CSR, as assinaturas) é executada **no seu navegador**; não é necessário qualquer servidor e nenhum vê alguma vez a sua chave privada.

Aplicação online: **https://baxy-it.github.io/certownia/**

### Como funciona

1. O seu navegador gera as chaves com o **WebCrypto**.
2. Comunica pelo protocolo **ACME** **diretamente** com a Let's Encrypt (que fornece CORS), provando que controla o domínio através de um registo DNS ou de um ficheiro HTTP.
3. Descarrega o certificado assinado e instala-o no seu servidor.

### Como utilizar — passo a passo

1. **Introduza o(s) seu(s) domínio(s).** Um ou vários, separados por espaço ou vírgula. Os wildcards (`*.example.com`) são suportados, mas exigem validação por DNS.
2. **Escolha o ambiente.** Comece com **Teste (staging)** — o certificado não é reconhecido pelos navegadores, mas não consome os limites de taxa da Let's Encrypt, pelo que é ideal para confirmar que o fluxo funciona. Passe para **Produção** para obter um certificado real e fidedigno.
3. **Escolha o tipo de chave.** ECDSA P-256 (recomendado — moderno e rápido), RSA 2048 (o clássico, com maior alcance) ou RSA 4096 (a maior chave RSA). Sem certezas? Mantenha ECDSA P-256. A dica `i` ao lado do campo explica a diferença.
4. **Escolha o método de verificação.** **DNS (registo TXT)** funciona em todo o lado e é obrigatório para wildcards; **Ficheiro no servidor (HTTP)** é mais simples se controlar o servidor web do domínio.
5. **Adicione o registo ou o ficheiro.** O BAXY SSL mostra o valor exato, reconhece o seu fornecedor de DNS (OVH, cyberFolks, home.pl, Cloudflare, nazwa.pl) com instruções passo a passo e verifica a propagação por si, para que não valide às cegas. O botão **Verificar** é desbloqueado assim que o registo/ficheiro fica visível.
6. **Verifique.** A Let's Encrypt valida o seu domínio e emite o certificado.
7. **Descarregue e instale.** Recebe ficheiros `.pem` em texto simples:
   - `privkey.pem` — a sua **chave privada** (secreta; guarde-a em segurança e nunca a partilhe).
   - `cert.pem` — o certificado do seu domínio.
   - `chain.pem` — a cadeia intermédia / Root CA.
   - `fullchain.pem` — o certificado e a cadeia juntos num único ficheiro.

   Num painel de alojamento, cole `privkey.pem` no campo **"Private key"**, `cert.pem` em **"Certificate"** e `chain.pem` no campo **"Root CA" / "CA" / "chain"**. Se o painel tiver um único campo de certificado ou pedir uma "fullchain", utilize `fullchain.pem` em vez de `cert.pem` + `chain.pem`. Num VPS: Nginx — `ssl_certificate` = `fullchain.pem`, `ssl_certificate_key` = `privkey.pem`; Apache — `SSLCertificateFile` / `SSLCertificateKeyFile`.

Os certificados são válidos durante **90 dias**. Pode fechar o separador e voltar mais tarde — o BAXY SSL recorda a verificação pendente (o mesmo registo), para que não comece do zero.

### Prefere o terminal?

A aplicação também gera um comando **certbot** / **acme.sh** pronto a executar e mostra como configurar a **renovação automática** (o método `webroot` ou um plugin do fornecedor de DNS com `--deploy-hook`). Para qualquer coisa em produção, automatize a renovação no seu próprio servidor.

### Segurança e privacidade

- A chave privada do certificado é gerada no seu navegador e **nunca é enviada para lado nenhum nem guardada**.
- Sem backend, sem contas, sem cookies, sem rastreio.
- A chave da **conta** ACME é mantida como uma chave **não extraível** no IndexedDB (pode assinar pedidos, mas o seu material bruto não pode ser lido), apenas para que possa retomar uma verificação pendente; é apagada assim que o certificado é emitido.
- Uma Content-Security-Policy rigorosa limita o tráfego de rede à Let's Encrypt e às verificações de DNS/relay. Detalhes: [SECURITY.md](SECURITY.md) · [Política de Privacidade](https://baxy-it.github.io/certownia/privacy.pt.html) · [Termos de Utilização](https://baxy-it.github.io/certownia/terms.pt.html).

### Execute-o você mesmo — instalação e desenvolvimento

Pré-requisito: **Node.js 20+**.

```bash
git clone https://github.com/BAXY-IT/certownia.git
cd certownia
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # unit tests (base64url, RFC 7638 thumbprint, CSR, dns-01, i18n)
npm run typecheck  # tsc --noEmit
npm run build      # production build → dist/ (static files)
```

**Publique** a pasta `dist/` em qualquer lugar:

- **GitHub Pages** — o workflow incluído (`.github/workflows/deploy.yml`) compila e publica a cada push para `main`. Ative-o em Settings → Pages → Source: "GitHub Actions". Define automaticamente a base do Vite para `/<repo>/`; para um domínio personalizado, defina `VITE_BASE=/`.
- **Cloudflare Pages / Netlify / Vercel** — comando de build `npm run build`, diretório de saída `dist`, caminho base `/`. No Cloudflare Pages pode também servir cabeçalhos de segurança reais através de um ficheiro `public/_headers` e executar o proxy opcional em `functions/`.
- **Alojamento próprio** — sirva `dist/` por trás de qualquer servidor web. Para encaminhar o ACME através da sua própria origem, compile com `VITE_ACME_PROXY=https://your-proxy/` (consulte `.env.example`); o proxy está **desativado por predefinição** e tem uma lista de permissões SSRF restrita aos hosts da Let's Encrypt.

</details>

---

## Architecture

BAXY SSL is a static single-page app. The interesting part is that it speaks the
full **ACME v2 protocol** ([RFC 8555](https://datatracker.ietf.org/doc/html/rfc8555))
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
- **`src/lib/idb.ts`** — the non-extractable ACME account key kept in IndexedDB.
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
Inter, Geist Mono). Available in 7 languages.

## A note on the future

Certificate lifetimes are getting shorter (Let's Encrypt is moving toward
~45-day certificates), which means renewal should be **automated** on your
server (certbot, Caddy, Traefik, acme.sh). A click-through tool like BAXY SSL is
great for a one-off certificate, a quick test, or learning how ACME works — for
production, automate renewal.

## License

[MIT](LICENSE) © BAXY IT ([BAXY IT Sp. z o.o.](https://baxy.it)). Not affiliated
with, sponsored, or endorsed by Let's Encrypt or ISRG. “Let's Encrypt” is a
trademark of the Internet Security Research Group.
