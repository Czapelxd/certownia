// Known DNS providers, matched against a zone's NS hostnames, with concrete
// step-by-step instructions (PL/EN) for adding a TXT record in their panel.
// Steps are provider-specific content, kept here rather than in the shared i18n.

import type { Lang } from "./i18n.js";

export interface ProviderInfo {
  id: string;
  name: string;
  url: string;
  match: RegExp;
  // Provider steps exist for pl/en; other languages fall back to en at the
  // call site. Partial so we don't have to translate every provider panel.
  steps: Partial<Record<Lang, string[]>>;
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    url: "https://dash.cloudflare.com",
    match: /(^|\.)cloudflare\.com$/,
    steps: {
      pl: [
        "Zaloguj się do Cloudflare i wybierz swoją domenę.",
        "Wejdź w zakładkę „DNS” → „Add record”.",
        "Typ: TXT. W polu „Name” wklej nazwę z tabeli, w „Content” — wartość.",
        "Ważne: „Proxy status” ustaw na „DNS only” (szara chmurka).",
        "Kliknij „Save”.",
      ],
      en: [
        "Log in to Cloudflare and pick your domain.",
        "Open the “DNS” tab → “Add record”.",
        "Type: TXT. Put the name from the table in “Name”, the value in “Content”.",
        "Important: set “Proxy status” to “DNS only” (grey cloud).",
        "Click “Save”.",
      ],
    },
  },
  {
    id: "ovh",
    name: "OVHcloud",
    url: "https://www.ovh.com/manager/",
    match: /(^|\.)ovh\.(net|com|cloud)$/,
    steps: {
      pl: [
        "Zaloguj się do panelu OVHcloud → sekcja „Domeny”.",
        "Wybierz domenę → zakładka „Strefa DNS”.",
        "Kliknij „Dodaj wpis” → wybierz typ TXT.",
        "„Subdomena”: część nazwy przed Twoją domeną; „Wartość”: wartość z tabeli.",
        "Zapisz i poczekaj kilka minut.",
      ],
      en: [
        "Log in to the OVHcloud panel → “Domains”.",
        "Pick your domain → the “DNS zone” tab.",
        "Click “Add an entry” → choose type TXT.",
        "“Sub-domain”: the part before your domain; “Value”: the value from the table.",
        "Save and wait a few minutes.",
      ],
    },
  },
  {
    id: "homepl",
    name: "home.pl",
    url: "https://panel.home.pl",
    match: /(^|\.)home\.pl$/,
    steps: {
      pl: [
        "Zaloguj się do Panelu home.pl → „Usługi” → Twoja domena.",
        "Wejdź w „Strefa DNS” (konfiguracja DNS/WWW).",
        "Dodaj nowy rekord TXT: nazwa i wartość z tabeli.",
        "Zapisz zmiany i poczekaj na propagację.",
      ],
      en: [
        "Log in to the home.pl panel → “Services” → your domain.",
        "Open “DNS zone” (DNS/WWW configuration).",
        "Add a new TXT record: name and value from the table.",
        "Save and wait for propagation.",
      ],
    },
  },
  {
    id: "cyberfolks",
    name: "cyberFolks",
    url: "https://panel.cyberfolks.pl",
    match: /(^|\.)cyber-?folks\.pl$/,
    steps: {
      pl: [
        "Zaloguj się do panelu cyberFolks → „Domeny”.",
        "Przy swojej domenie wybierz „Strefa DNS” / „Edytuj DNS”.",
        "Dodaj rekord TXT: „Host/Nazwa” i „Wartość” z tabeli.",
        "Zapisz.",
      ],
      en: [
        "Log in to the cyberFolks panel → “Domains”.",
        "Next to your domain choose “DNS zone” / “Edit DNS”.",
        "Add a TXT record: “Host/Name” and “Value” from the table.",
        "Save.",
      ],
    },
  },
  {
    id: "nazwapl",
    name: "nazwa.pl",
    url: "https://www.nazwa.pl/panel/",
    match: /(^|\.)(nazwa\.pl|nazwadns\.pl)$/,
    steps: {
      pl: [
        "Zaloguj się do panelu nazwa.pl → „Domeny”.",
        "Wybierz domenę → „Konfiguracja DNS/WWW” → „Rekordy DNS”.",
        "Dodaj rekord TXT: nazwa i wartość z tabeli.",
        "Zapisz.",
      ],
      en: [
        "Log in to the nazwa.pl panel → “Domains”.",
        "Pick your domain → “DNS/WWW configuration” → “DNS records”.",
        "Add a TXT record: name and value from the table.",
        "Save.",
      ],
    },
  },
];

export function detectProvider(nsHosts: string[]): ProviderInfo | null {
  for (const p of PROVIDERS) {
    if (nsHosts.some((h) => p.match.test(h))) return p;
  }
  return null;
}

// Popular hosting / DNS panels for the "open your hosting panel" dropdown, so a
// user can jump to their own host even when auto-detection missed it. URLs are
// login/panel pages verified to resolve.
export const HOSTING_PANELS: { name: string; url: string }[] = [
  { name: "cyberFolks", url: "https://panel.cyberfolks.pl" },
  { name: "home.pl", url: "https://panel.home.pl" },
  { name: "nazwa.pl", url: "https://www.nazwa.pl/panel/" },
  { name: "OVHcloud", url: "https://www.ovh.com/manager/" },
  { name: "LH.pl", url: "https://panel.lh.pl" },
  { name: "zenbox", url: "https://panel.zenbox.pl" },
  { name: "hekko", url: "https://panel.hekko.pl" },
  { name: "Kylos", url: "https://panel.kylos.pl" },
  { name: "seohost", url: "https://panel.seohost.pl" },
  { name: "AZ.pl", url: "https://panel.az.pl" },
  { name: "webio", url: "https://panel.webio.pl" },
  { name: "Hostinger", url: "https://hpanel.hostinger.com" },
  { name: "Cloudflare (DNS)", url: "https://dash.cloudflare.com" },
];
