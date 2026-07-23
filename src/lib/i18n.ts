// Minimal, dependency-free i18n. Two languages, one flat dictionary per language.
// Keys are shared; `t(key)` resolves against the active language with a PL fallback.

export type Lang = "pl" | "en";

type Dict = Record<string, string>;

const pl: Dict = {
  "app.name": "Certownia",
  "app.tagline": "Darmowy certyfikat SSL prosto w przeglądarce",
  "app.poweredBy": "Napędzane przez Let's Encrypt",

  "hero.title": "Darmowy certyfikat SSL w kilka minut",
  "hero.subtitle":
    "Wygeneruj zaufany certyfikat HTTPS dla swojej domeny. Za darmo, bez rejestracji, bez instalowania niczego.",
  "hero.trust.title": "Twój klucz prywatny nigdy nie opuszcza tego komputera",
  "hero.trust.body":
    "Cała kryptografia dzieje się w Twojej przeglądarce, która łączy się z Let's Encrypt bezpośrednio. Żaden serwer nie pośredniczy i nikt nie widzi Twojego klucza prywatnego. Kod jest otwarty — możesz to sprawdzić.",
  "hero.start": "Zaczynamy",
  "hero.step1": "Podaj domenę",
  "hero.step1.desc": "Wpisz adres, dla którego chcesz certyfikat.",
  "hero.step2": "Potwierdź własność",
  "hero.step2.desc": "Dodaj rekord DNS lub plik na serwerze — pokażemy dokładnie jaki.",
  "hero.step3": "Pobierz certyfikat",
  "hero.step3.desc": "Klucz prywatny i certyfikat lądują na Twoim dysku.",

  "cfg.title": "Konfiguracja certyfikatu",
  "cfg.domains.label": "Domeny",
  "cfg.domains.hint":
    "Jedna lub kilka domen (oddziel spacją lub przecinkiem). Wildcard * jest możliwy tylko z weryfikacją DNS.",
  "cfg.domains.placeholder": "example.com www.example.com",
  "cfg.email.label": "E-mail (opcjonalnie)",
  "cfg.email.hint":
    "Let's Encrypt użyje go tylko do powiadomień o wygasaniu certyfikatu. Możesz zostawić puste.",
  "cfg.email.placeholder": "ty@example.com",
  "cfg.env.label": "Środowisko",
  "cfg.env.staging": "Testowe (staging)",
  "cfg.env.staging.hint":
    "Zalecane na start. Certyfikat NIE jest zaufany przez przeglądarki, ale nie zużywasz limitów. Idealne do sprawdzenia, czy wszystko działa.",
  "cfg.env.production": "Produkcyjne (prawdziwy certyfikat)",
  "cfg.env.production.hint":
    "Wystawia certyfikat zaufany przez przeglądarki. Obowiązują limity Let's Encrypt — używaj, gdy test przeszedł.",
  "cfg.keytype.label": "Typ klucza",
  "cfg.keytype.ecdsa": "ECDSA P-256 (zalecane, szybsze)",
  "cfg.keytype.rsa2048": "RSA 2048",
  "cfg.keytype.rsa4096": "RSA 4096 (najszersza zgodność)",
  "cfg.keytype.ecdsa.short": "zalecane, szybsze",
  "cfg.keytype.rsa4096.short": "najszersza zgodność",
  "cfg.challenge.label": "Sposób weryfikacji",
  "cfg.challenge.dns": "DNS (rekord TXT)",
  "cfg.challenge.dns.hint":
    "Działa wszędzie, wymagany dla certyfikatów wildcard. Musisz mieć dostęp do ustawień DNS domeny.",
  "cfg.challenge.http": "Plik na serwerze (HTTP)",
  "cfg.challenge.http.hint":
    "Prostsze, jeśli masz dostęp do serwera WWW domeny. Nie działa dla wildcard.",
  "cfg.tos.pre": "Akceptuję ",
  "cfg.tos.link": "Warunki subskrybenta Let's Encrypt",
  "cfg.tos.post": ".",
  "cfg.submit": "Dalej",
  "cfg.back": "Wróć",

  "cfg.err.domains": "Podaj przynajmniej jedną poprawną domenę.",
  "cfg.err.domainInvalid": "Niepoprawna domena: {0}",
  "cfg.err.wildcardHttp":
    "Domena wildcard ({0}) wymaga weryfikacji DNS — przełącz sposób weryfikacji.",
  "cfg.err.email": "Niepoprawny adres e-mail.",
  "cfg.err.tos": "Musisz zaakceptować warunki, aby kontynuować.",

  "work.preparing": "Przygotowuję…",
  "work.genAccountKey": "Generuję klucz konta ACME w przeglądarce…",
  "work.genCertKey": "Generuję klucz prywatny certyfikatu w przeglądarce…",
  "work.register": "Rejestruję konto w Let's Encrypt…",
  "work.newOrder": "Tworzę zamówienie certyfikatu…",
  "work.fetchChallenges": "Pobieram zadania weryfikacyjne…",
  "work.validating": "Sprawdzam weryfikację domeny…",
  "work.finalizing": "Wysyłam żądanie podpisania (CSR)…",
  "work.downloading": "Pobieram gotowy certyfikat…",

  "chal.title": "Potwierdź, że domena należy do Ciebie",
  "chal.dns.intro":
    "Dodaj poniższe rekordy TXT w panelu DNS swojej domeny. Po zapisaniu i propagacji kliknij „Sprawdź”.",
  "chal.http.intro":
    "Umieść poniższe pliki na swoim serwerze WWW (dokładnie pod wskazanym adresem), a potem kliknij „Sprawdź”.",
  "chal.dns.name": "Nazwa / host",
  "chal.dns.type": "Typ",
  "chal.dns.value": "Wartość",
  "chal.http.path": "Adres pliku (URL)",
  "chal.http.content": "Zawartość pliku",
  "chal.http.download": "Pobierz plik",
  "chal.copy": "Kopiuj",
  "chal.copied": "Skopiowano!",
  "chal.dns.propagation":
    "Uwaga: zmiany DNS mogą propagować od kilku minut do godziny. Jeśli sprawdzenie się nie powiedzie, poczekaj i spróbuj ponownie.",
  "chal.verify": "Sprawdź",
  "chal.verifying": "Sprawdzam…",

  "done.title": "Gotowe! Twój certyfikat jest gotowy",
  "done.subtitle":
    "Pobierz pliki poniżej. Zainstaluj je na serwerze zgodnie z instrukcją swojego hostingu.",
  "done.staging.warning":
    "To jest certyfikat TESTOWY (staging) — przeglądarki go nie zaufają. Gdy wszystko działa, wróć i wygeneruj certyfikat produkcyjny.",
  "done.dl.key": "Klucz prywatny (privkey.pem)",
  "done.dl.cert": "Certyfikat (cert.pem)",
  "done.dl.chain": "Łańcuch pośredni (chain.pem)",
  "done.dl.fullchain": "Pełny łańcuch (fullchain.pem)",
  "done.expiry":
    "Certyfikat jest ważny 90 dni. Zapisz przypomnienie o odnowieniu — a najlepiej zautomatyzuj odnawianie na serwerze.",
  "done.whatnow": "Co dalej?",
  "done.whatnow.body":
    "Na serwerze użyj fullchain.pem jako certyfikatu i privkey.pem jako klucza prywatnego. W Apache to SSLCertificateFile i SSLCertificateKeyFile, w Nginx ssl_certificate i ssl_certificate_key.",
  "done.again": "Wygeneruj kolejny",

  "err.title": "Coś poszło nie tak",
  "err.retry": "Spróbuj ponownie",
  "err.startOver": "Zacznij od nowa",
  "err.network":
    "Nie udało się połączyć z serwerem pośredniczącym. Sprawdź, czy proxy ACME działa (patrz README), i spróbuj ponownie.",
  "err.challengeFailed":
    "Let's Encrypt nie potwierdził weryfikacji dla {0}. Sprawdź, czy rekord/plik jest dokładnie taki jak podano i czy zdążył się rozpropagować.",
  "err.rateLimited":
    "Osiągnięto limit Let's Encrypt. Użyj środowiska testowego (staging) do prób lub poczekaj. Szczegóły w konsoli.",

  "step.config": "Konfiguracja",
  "step.verify": "Weryfikacja",
  "step.download": "Pobierz",

  "lang.toggle": "EN",
  "footer.madeBy": "Projekt open-source od",
  "footer.source": "Kod źródłowy",
  "footer.privacy": "Prywatność",
  "footer.notAffiliated":
    "Certownia nie jest powiązana z Let's Encrypt ani ISRG. „Let's Encrypt” jest znakiem towarowym ISRG.",
};

const en: Dict = {
  "app.name": "Certownia",
  "app.tagline": "Free SSL certificate, right in your browser",
  "app.poweredBy": "Powered by Let's Encrypt",

  "hero.title": "A free SSL certificate in minutes",
  "hero.subtitle":
    "Generate a trusted HTTPS certificate for your domain. Free, no sign-up, nothing to install.",
  "hero.trust.title": "Your private key never leaves this computer",
  "hero.trust.body":
    "All cryptography happens in your browser, which talks to Let's Encrypt directly. No server sits in the middle, and nobody sees your private key. The code is open source — you can verify it yourself.",
  "hero.start": "Get started",
  "hero.step1": "Enter your domain",
  "hero.step1.desc": "Type the address you want a certificate for.",
  "hero.step2": "Prove ownership",
  "hero.step2.desc": "Add a DNS record or a file on your server — we show the exact one.",
  "hero.step3": "Download the certificate",
  "hero.step3.desc": "Private key and certificate land on your disk.",

  "cfg.title": "Certificate configuration",
  "cfg.domains.label": "Domains",
  "cfg.domains.hint":
    "One or more domains (separate with space or comma). Wildcard * is only possible with DNS validation.",
  "cfg.domains.placeholder": "example.com www.example.com",
  "cfg.email.label": "Email (optional)",
  "cfg.email.hint":
    "Let's Encrypt uses it only for expiry notifications. You may leave it blank.",
  "cfg.email.placeholder": "you@example.com",
  "cfg.env.label": "Environment",
  "cfg.env.staging": "Testing (staging)",
  "cfg.env.staging.hint":
    "Recommended first. The certificate is NOT trusted by browsers, but it does not consume rate limits. Ideal to confirm everything works.",
  "cfg.env.production": "Production (real certificate)",
  "cfg.env.production.hint":
    "Issues a browser-trusted certificate. Let's Encrypt rate limits apply — use once your test passed.",
  "cfg.keytype.label": "Key type",
  "cfg.keytype.ecdsa": "ECDSA P-256 (recommended, faster)",
  "cfg.keytype.rsa2048": "RSA 2048",
  "cfg.keytype.rsa4096": "RSA 4096 (widest compatibility)",
  "cfg.keytype.ecdsa.short": "recommended, faster",
  "cfg.keytype.rsa4096.short": "widest compatibility",
  "cfg.challenge.label": "Verification method",
  "cfg.challenge.dns": "DNS (TXT record)",
  "cfg.challenge.dns.hint":
    "Works everywhere, required for wildcard certificates. You need access to the domain's DNS settings.",
  "cfg.challenge.http": "File on server (HTTP)",
  "cfg.challenge.http.hint":
    "Simpler if you have access to the domain's web server. Does not work for wildcard.",
  "cfg.tos.pre": "I accept the ",
  "cfg.tos.link": "Let's Encrypt Subscriber Agreement",
  "cfg.tos.post": ".",
  "cfg.submit": "Continue",
  "cfg.back": "Back",

  "cfg.err.domains": "Enter at least one valid domain.",
  "cfg.err.domainInvalid": "Invalid domain: {0}",
  "cfg.err.wildcardHttp":
    "Wildcard domain ({0}) requires DNS validation — switch the verification method.",
  "cfg.err.email": "Invalid email address.",
  "cfg.err.tos": "You must accept the terms to continue.",

  "work.preparing": "Preparing…",
  "work.genAccountKey": "Generating ACME account key in your browser…",
  "work.genCertKey": "Generating certificate private key in your browser…",
  "work.register": "Registering account with Let's Encrypt…",
  "work.newOrder": "Creating the certificate order…",
  "work.fetchChallenges": "Fetching verification challenges…",
  "work.validating": "Checking domain verification…",
  "work.finalizing": "Sending the signing request (CSR)…",
  "work.downloading": "Downloading the finished certificate…",

  "chal.title": "Prove the domain is yours",
  "chal.dns.intro":
    "Add the TXT records below in your domain's DNS panel. After saving and propagation, click “Verify”.",
  "chal.http.intro":
    "Place the files below on your web server (at the exact URL shown), then click “Verify”.",
  "chal.dns.name": "Name / host",
  "chal.dns.type": "Type",
  "chal.dns.value": "Value",
  "chal.http.path": "File URL",
  "chal.http.content": "File content",
  "chal.http.download": "Download file",
  "chal.copy": "Copy",
  "chal.copied": "Copied!",
  "chal.dns.propagation":
    "Note: DNS changes can take a few minutes to an hour to propagate. If verification fails, wait and retry.",
  "chal.verify": "Verify",
  "chal.verifying": "Verifying…",

  "done.title": "Done! Your certificate is ready",
  "done.subtitle":
    "Download the files below. Install them on your server following your host's instructions.",
  "done.staging.warning":
    "This is a TEST (staging) certificate — browsers will not trust it. Once everything works, come back and issue a production certificate.",
  "done.dl.key": "Private key (privkey.pem)",
  "done.dl.cert": "Certificate (cert.pem)",
  "done.dl.chain": "Intermediate chain (chain.pem)",
  "done.dl.fullchain": "Full chain (fullchain.pem)",
  "done.expiry":
    "The certificate is valid for 90 days. Set a renewal reminder — or better, automate renewal on your server.",
  "done.whatnow": "What now?",
  "done.whatnow.body":
    "On your server use fullchain.pem as the certificate and privkey.pem as the private key. In Apache that's SSLCertificateFile and SSLCertificateKeyFile; in Nginx ssl_certificate and ssl_certificate_key.",
  "done.again": "Generate another",

  "err.title": "Something went wrong",
  "err.retry": "Try again",
  "err.startOver": "Start over",
  "err.network":
    "Could not reach the proxy server. Check that the ACME proxy is running (see README) and try again.",
  "err.challengeFailed":
    "Let's Encrypt could not verify {0}. Check the record/file matches exactly and had time to propagate.",
  "err.rateLimited":
    "Let's Encrypt rate limit reached. Use the staging environment for tests, or wait. Details in the console.",

  "step.config": "Configuration",
  "step.verify": "Verification",
  "step.download": "Download",

  "lang.toggle": "PL",
  "footer.madeBy": "An open-source project by",
  "footer.source": "Source code",
  "footer.privacy": "Privacy",
  "footer.notAffiliated":
    "Certownia is not affiliated with Let's Encrypt or ISRG. “Let's Encrypt” is a trademark of ISRG.",
};

const DICTS: Record<Lang, Dict> = { pl, en };

let current: Lang = detectInitialLang();

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem("certownia.lang");
    if (saved === "pl" || saved === "en") return saved;
  } catch {
    /* localStorage may be unavailable */
  }
  const nav = typeof navigator !== "undefined" ? navigator.language : "en";
  return nav.toLowerCase().startsWith("pl") ? "pl" : "en";
}

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  current = lang;
  try {
    localStorage.setItem("certownia.lang", lang);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lang;
}

/** Translate a key, with optional positional {0},{1}… substitutions. */
export function t(key: string, ...args: (string | number)[]): string {
  const dict = DICTS[current];
  let s = dict[key] ?? pl[key] ?? key;
  args.forEach((a, i) => {
    s = s.replace(`{${i}}`, String(a));
  });
  return s;
}
