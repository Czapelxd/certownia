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
  "chal.verify": "Zweryfikuj domenę",
  "chal.verifying": "Weryfikuję…",
  "chal.verifyLocked":
    "Przycisk „Zweryfikuj” odblokuje się, gdy wykryjemy rekord w DNS. Dodaj rekord i kliknij „Sprawdź, czy rekord jest już widoczny”.",
  "chal.recordChanged":
    "Po nieudanej próbie wygenerowaliśmy świeży rekord. Nazwa jest taka sama, ale WARTOŚĆ się zmieniła — podmień ją w DNS, sprawdź propagację i dopiero wtedy weryfikuj.",
  "chal.verifyAnyway": "Na pewno dodane, a mimo to nie wykrywamy? Zweryfikuj mimo to.",

  "doh.check": "Sprawdź, czy rekord jest już widoczny",
  "doh.checking": "Sprawdzam DNS…",
  "doh.ok": "Rekord widoczny w DNS — możesz weryfikować",
  "doh.pending": "Jeszcze nie widać — poczekaj chwilę i sprawdź ponownie",
  "doh.error": "Nie udało się sprawdzić DNS — spróbuj ponownie",
  "doh.hint":
    "Najpierw sprawdź propagację, żeby nie klikać „Zweryfikuj” na ślepo (nieudana próba wymaga wygenerowania nowego rekordu).",
  "doh.privacy":
    "Sprawdzanie propagacji korzysta z publicznych serwerów DNS Cloudflare i Google — wysyłamy im tylko nazwę Twojej domeny.",

  "provider.detected": "Wykryty dostawca DNS: {0}",
  "provider.open": "Otwórz panel {0}",
  "provider.generic": "Dodaj rekord w panelu DNS u swojego dostawcy domeny.",

  "http.where.title": "Gdzie wgrać plik",
  "http.where.body":
    "Umieść plik na serwerze WWW domeny tak, aby był dostępny dokładnie pod adresem powyżej — czyli w folderze .well-known/acme-challenge w głównym katalogu strony. Musi działać po HTTP (port 80).",
  "httpcheck.checking": "Sprawdzam plik…",
  "httpcheck.ok": "Plik widoczny — możesz weryfikować",
  "httpcheck.pending": "Nie widać pliku (albo zła treść) — sprawdź i spróbuj ponownie",
  "httpcheck.error": "Nie udało się sprawdzić automatycznie — otwórz plik ręcznie",
  "http.check": "Sprawdź, czy plik jest dostępny",
  "http.open": "Otwórz plik",
  "http.checkNote":
    "Sprawdzanie automatyczne jest orientacyjne — plik pobiera zewnętrzny serwis (allorigins.win), bo przeglądarka sama go nie odczyta. Jeśli nie zadziała, kliknij „Otwórz plik”, sprawdź na oczy, że widać treść pliku, a potem kliknij „Zweryfikuj mimo to”.",
  "chal.verifyLockedHttp":
    "Przycisk „Zweryfikuj” odblokuje się, gdy wykryjemy plik. Kliknij „Sprawdź, czy plik jest dostępny” albo „Otwórz plik”.",

  "resume.text": "Masz niedokończoną weryfikację dla {0}.",
  "resume.hint": "Możesz do niej wrócić — dane (rekord) są te same, nic nie trzeba dodawać od nowa.",
  "resume.continue": "Wróć do weryfikacji",
  "resume.discard": "Zacznij od nowa",
  "resume.restoring": "Wczytuję zapisaną weryfikację…",

  "done.title": "Gotowe! Masz swój certyfikat SSL",
  "done.subtitle":
    "Poniżej krok po kroku: co pobrać i gdzie dokładnie to wkleić. Nie musisz znać się na kryptografii — wystarczy dopasować pliki do pól w panelu.",
  "done.staging.warning":
    "To jest certyfikat TESTOWY (staging) — przeglądarki go nie zaufają. Gdy wszystko działa, wróć i wygeneruj certyfikat produkcyjny.",

  "done.step1": "Krok 1 · Pobierz pliki",
  "done.step1.body":
    "To zwykłe pliki tekstowe (.pem). Nie zawsze potrzebujesz wszystkich — którego użyć, podpowiadamy w kroku 2.",
  "done.dl.key": "Klucz prywatny",
  "done.dl.key.h": "Tajny — trzymaj u siebie, nikomu nie wysyłaj.",
  "done.dl.cert": "Sam certyfikat",
  "done.dl.cert.h": "Certyfikat Twojej domeny.",
  "done.dl.chain": "Łańcuch / Root CA",
  "done.dl.chain.h": "Certyfikaty pośrednie urzędu.",
  "done.dl.fullchain": "Certyfikat + łańcuch razem",
  "done.dl.fullchain.h": "Jeden plik: certyfikat i łańcuch. Częsty w Nginx i gdy panel prosi o „fullchain”.",

  "done.step2": "Krok 2 · Wgraj pliki w panelu hostingu",
  "done.step2.body":
    "Wejdź w panel swojego hostingu → sekcja „SSL” lub „Certyfikaty”. Zobaczysz pola do wklejenia. Dopasuj pliki do pól po nazwie:",
  "done.map.key": "Pole „Klucz prywatny” (Private Key)",
  "done.map.cert": "Pole „Certyfikat” (Certificate)",
  "done.map.chain": "Pole „Certyfikat Root CA”, „CA” albo „łańcuch”",
  "done.map.fullchain":
    "Panel ma tylko jedno pole na certyfikat albo prosi o „fullchain”? Wtedy zamiast cert.pem i chain.pem użyj samego fullchain.pem.",
  "done.step2.how":
    "Każdy plik otwórz w Notatniku, zaznacz i skopiuj CAŁĄ zawartość — razem z liniami „-----BEGIN…” i „-----END…” — i wklej w odpowiednie pole. Na końcu zapisz. Certyfikat zwykle zaczyna działać od razu (czasem trzeba chwilę poczekać).",
  "done.secret":
    "Klucz prywatny (privkey.pem) jest tajny — trzymaj go u siebie i nigdy nikomu nie wysyłaj ani nie wklejaj w obce miejsca.",

  "done.expiry":
    "Certyfikat jest ważny 90 dni — potem trzeba go odnowić. Ustaw sobie przypomnienie, albo (jeśli masz własny serwer) zautomatyzuj to jak niżej.",
  "done.whatnow": "Masz własny serwer (VPS)?",
  "done.whatnow.body":
    "W konfiguracji wskaż: certyfikat = fullchain.pem, klucz prywatny = privkey.pem. W Nginx to ssl_certificate i ssl_certificate_key, w Apache SSLCertificateFile i SSLCertificateKeyFile.",
  "alt.title": "Wolisz terminal? Zrób to na serwerze",
  "alt.body":
    "To samo, ale komendą na Twoim serwerze: certbot (albo acme.sh) poprosi Cię o dodanie rekordu TXT — dokładnie tak samo jak w kreatorze wyżej — i wyda certyfikat. Podmień tylko example.com na swoją domenę.",
  "alt.note":
    "To komenda jednorazowa. Jak sprawić, żeby certyfikat odnawiał się sam, opisujemy na ekranie końcowym — po jego wygenerowaniu.",

  "renew.title": "Jak sprawić, żeby certyfikat odnawiał się sam",
  "renew.body":
    "Certyfikat jest ważny 90 dni. Zamiast robić to ręcznie co 3 miesiące, wybierz swoją sytuację:",
  "renew.shared.title": "Hosting współdzielony (cyberFolks, OVH, nazwa.pl…)",
  "renew.shared.body":
    "Najprościej: w panelu hostingu jest zwykle darmowy, samoodnawiający się certyfikat SSL (Let's Encrypt / AutoSSL). Włączasz go raz i masz spokój — szukaj sekcji „SSL” albo „Certyfikaty”. Wtedy nie potrzebujesz ani certbota, ani Certowni.",
  "renew.vps.title": "Masz własny serwer (VPS) i chcesz pełny automat?",
  "renew.vps.body":
    "Użyj certbota — sam odnawia certyfikat co jakiś czas. Wybierz metodę. W komendach jest już „--deploy-hook”, żeby serwer przeładował nowy certyfikat po odnowieniu — zamień „nginx” na „apache2”, jeśli używasz Apache:",
  "renew.webroot.label":
    "1) Strona działa po HTTP — metoda „webroot” (podmień /var/www/html na katalog swojej strony):",
  "renew.dns.label":
    "2) Wildcard albo brak dostępu po HTTP — przez API dostawcy DNS (przykład dla Cloudflare):",
  "renew.dns.steps":
    "Zainstaluj wtyczkę dostawcy (np. python3-certbot-dns-cloudflare), zapisz token API w pliku ~/.secrets/cloudflare.ini i uruchom. Inny dostawca = inna wtyczka (dns-ovh, dns-google itd.).",
  "done.again": "Wygeneruj kolejny",

  "err.title": "Coś poszło nie tak",
  "err.retry": "Spróbuj ponownie",
  "err.startOver": "Zacznij od nowa (inna domena)",
  "err.verifyFailed":
    "Nie udało się potwierdzić domeny. Najczęściej rekord nie zdążył się jeszcze rozpropagować albo jego wartość się nie zgadza. Kliknij „Spróbuj ponownie” — wygenerujemy świeży rekord: nazwa zostaje taka sama, zmienia się tylko wartość. Zaktualizuj wartość w DNS, sprawdź propagację i dopiero wtedy weryfikuj. Twoja domena i ustawienia są zapamiętane — nie musisz zaczynać od zera.",
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
  "chal.verify": "Verify domain",
  "chal.verifying": "Verifying…",
  "chal.verifyLocked":
    "The “Verify” button unlocks once we detect the record in DNS. Add the record, then click “Check whether the record is visible yet”.",
  "chal.recordChanged":
    "After the failed attempt we generated a fresh record. The name is the same, but the VALUE changed — replace it in DNS, check propagation, then verify.",
  "chal.verifyAnyway": "Sure it's added but we still don't detect it? Verify anyway.",

  "doh.check": "Check whether the record is visible yet",
  "doh.checking": "Checking DNS…",
  "doh.ok": "Record visible in DNS — you can verify now",
  "doh.pending": "Not visible yet — wait a moment and check again",
  "doh.error": "Could not check DNS — try again",
  "doh.hint":
    "Check propagation first so you don't click “Verify” blindly (a failed attempt requires generating a new record).",
  "doh.privacy":
    "The propagation check uses Cloudflare and Google public DNS — only your domain name is sent to them.",

  "provider.detected": "Detected DNS provider: {0}",
  "provider.open": "Open the {0} panel",
  "provider.generic": "Add the record in your domain provider's DNS panel.",

  "http.where.title": "Where to put the file",
  "http.where.body":
    "Place the file on the domain's web server so it is reachable at exactly the URL above — i.e. the .well-known/acme-challenge folder in your site root. It must work over HTTP (port 80).",
  "httpcheck.checking": "Checking the file…",
  "httpcheck.ok": "File visible — you can verify now",
  "httpcheck.pending": "File not found (or wrong content) — check and retry",
  "httpcheck.error": "Couldn't check automatically — open the file manually",
  "http.check": "Check whether the file is reachable",
  "http.open": "Open the file",
  "http.checkNote":
    "The automatic check is approximate — the file is fetched by a third-party relay (allorigins.win), since the browser can't read it directly. If it doesn't work, click “Open the file”, confirm you can see the file's content, then click “Verify anyway”.",
  "chal.verifyLockedHttp":
    "The “Verify” button unlocks once we detect the file. Click “Check whether the file is reachable” or “Open the file”.",

  "resume.text": "You have an unfinished verification for {0}.",
  "resume.hint": "You can return to it — the data (record) is the same, nothing to re-add.",
  "resume.continue": "Resume verification",
  "resume.discard": "Start over",
  "resume.restoring": "Restoring saved verification…",

  "done.title": "Done! Your SSL certificate is ready",
  "done.subtitle":
    "Step by step below: what to download and exactly where to paste it. You don't need to understand cryptography — just match the files to the fields in your panel.",
  "done.staging.warning":
    "This is a TEST (staging) certificate — browsers will not trust it. Once everything works, come back and issue a production certificate.",

  "done.step1": "Step 1 · Download the files",
  "done.step1.body":
    "These are plain text files (.pem). You don't always need all of them — step 2 tells you which to use.",
  "done.dl.key": "Private key",
  "done.dl.key.h": "Secret — keep it to yourself, never send it to anyone.",
  "done.dl.cert": "Certificate only",
  "done.dl.cert.h": "Your domain's certificate.",
  "done.dl.chain": "Chain / Root CA",
  "done.dl.chain.h": "The authority's intermediate certificates.",
  "done.dl.fullchain": "Certificate + chain together",
  "done.dl.fullchain.h": "One file: certificate and chain. Common in Nginx and when a panel asks for “fullchain”.",

  "done.step2": "Step 2 · Add the files in your hosting panel",
  "done.step2.body":
    "Open your hosting panel → the “SSL” or “Certificates” section. You'll see fields to paste into. Match the files to the fields by name:",
  "done.map.key": "“Private key” field",
  "done.map.cert": "“Certificate” field",
  "done.map.chain": "“Root CA”, “CA” or “chain” field",
  "done.map.fullchain":
    "Panel has only one certificate field or asks for “fullchain”? Then use fullchain.pem instead of cert.pem and chain.pem.",
  "done.step2.how":
    "Open each file in a text editor, select and copy the WHOLE contents — including the “-----BEGIN…” and “-----END…” lines — and paste it into the right field. Then save. The certificate usually works right away (sometimes after a short wait).",
  "done.secret":
    "The private key (privkey.pem) is secret — keep it to yourself and never send it or paste it anywhere untrusted.",

  "done.expiry":
    "The certificate is valid for 90 days — then it must be renewed. Set a reminder, or (if you run your own server) automate it as below.",
  "done.whatnow": "Running your own server (VPS)?",
  "done.whatnow.body":
    "In the config point: certificate = fullchain.pem, private key = privkey.pem. In Nginx that's ssl_certificate and ssl_certificate_key; in Apache SSLCertificateFile and SSLCertificateKeyFile.",
  "alt.title": "Prefer the terminal? Do it on your server",
  "alt.body":
    "The same thing, but as a command on your server: certbot (or acme.sh) will ask you to add a TXT record — exactly like the wizard above — and issue the certificate. Just swap example.com for your domain.",
  "alt.note":
    "This is a one-off command. How to make the certificate renew itself is covered on the final screen, after you generate it.",

  "renew.title": "How to make the certificate renew itself",
  "renew.body":
    "The certificate is valid for 90 days. Instead of doing this by hand every 3 months, pick your situation:",
  "renew.shared.title": "Shared hosting (cyberFolks, OVH, nazwa.pl…)",
  "renew.shared.body":
    "Easiest: your hosting panel usually has a free, self-renewing SSL certificate (Let's Encrypt / AutoSSL). Enable it once and you're done — look for an “SSL” or “Certificates” section. Then you need neither certbot nor Certownia.",
  "renew.vps.title": "Have your own server (VPS) and want full automation?",
  "renew.vps.body":
    "Use certbot — it renews the certificate on its own. Pick a method. The commands already include “--deploy-hook” so the server reloads the new certificate after renewal — change “nginx” to “apache2” if you use Apache:",
  "renew.webroot.label":
    "1) Site served over HTTP — the “webroot” method (replace /var/www/html with your site's directory):",
  "renew.dns.label":
    "2) Wildcard or no HTTP access — via your DNS provider's API (Cloudflare example):",
  "renew.dns.steps":
    "Install your provider's plugin (e.g. python3-certbot-dns-cloudflare), save an API token in ~/.secrets/cloudflare.ini, then run. A different provider = a different plugin (dns-ovh, dns-google, etc.).",
  "done.again": "Generate another",

  "err.title": "Something went wrong",
  "err.retry": "Try again",
  "err.startOver": "Start over (different domain)",
  "err.verifyFailed":
    "We couldn't verify the domain. Usually the record hasn't propagated yet, or its value doesn't match. Click “Try again” — we'll generate a fresh record: the name stays the same, only the value changes. Update the value in DNS, check propagation, then verify. Your domain and settings are kept — no need to start over.",
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
