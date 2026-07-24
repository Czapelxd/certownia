import "./styles.css";
import { getLang, setLang, t } from "./lib/i18n.js";
import {
  AcmeClient,
  AcmeError,
  LE_REPOSITORY_URL,
  type AcmeEnv,
  type AcmeOrder,
  type CertificateBundle,
  type ChallengeInstruction,
  type ChallengeType,
} from "./lib/acme.js";
import {
  exportAccountKeyJwk,
  exportPrivateKeyPem,
  generateAccountKey,
  generateCertKey,
  importAccountKey,
  type CertKeyType,
} from "./lib/crypto.js";
import { csrToAcmeBase64url } from "./lib/csr.js";
import { copyToClipboard, downloadText } from "./lib/download.js";
import { clearSession, loadSession, saveSession, type PersistedSession } from "./lib/session.js";
import { checkTxt, lookupNs } from "./lib/doh.js";
import { detectProvider, type ProviderInfo } from "./lib/providers.js";

const SOURCE_URL = "https://github.com/BAXY-IT/certownia";
const BAXY_URL = "https://baxy.it";

// Optional ACME proxy. Empty by default — the browser talks to Let's Encrypt
// directly (it serves CORS). Set VITE_ACME_PROXY at build time only if you must
// route through your own proxy (see proxy/) or target a CA without CORS.
const ACME_PROXY = String(import.meta.env.VITE_ACME_PROXY ?? "");

// ---------------------------------------------------------------- icons
const ICON = {
  brand: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="40" height="40"><path d="M11 14v-2.5a5 5 0 0 1 10 0V14" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round"/><rect x="8.5" y="14" width="15" height="11" rx="2.6" fill="var(--accent)"/><circle cx="16" cy="18.6" r="1.7" fill="var(--paper)"/><rect x="15.2" y="19.4" width="1.6" height="3.4" rx="0.8" fill="var(--paper)"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l4-4m-4 4l-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>`,
  arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m0 0l-6-6m6 6l-6 6"/></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>`,
};

// ---------------------------------------------------------------- state
type Step = "hero" | "config" | "work" | "challenge" | "done" | "error";

interface Config {
  domains: string[];
  email: string;
  env: AcmeEnv;
  keyType: CertKeyType;
  challenge: ChallengeType;
}

interface AppState {
  step: Step;
  theme: "dark" | "light";
  config: Config | null;
  client: AcmeClient | null;
  accountKey: CryptoKeyPair | null;
  certKey: CryptoKeyPair | null;
  order: AcmeOrder | null;
  challenges: ChallengeInstruction[];
  bundle: CertificateBundle | null;
  privateKeyPem: string;
  error: string;
  workLines: string[];
}

const state: AppState = {
  step: "hero",
  theme: initTheme(),
  config: null,
  client: null,
  accountKey: null,
  certKey: null,
  order: null,
  challenges: [],
  bundle: null,
  privateKeyPem: "",
  error: "",
  workLines: [],
};

// A pending, resumable verification found in localStorage on load (or after a
// setup run). Drives the resume banner on the hero.
let pendingSession: PersistedSession | null = null;

type DohStatus = "checking" | "ok" | "pending" | "error";

// Challenge-enrichment cache (DoH propagation status + detected provider), keyed
// by statusKey. Re-renders (theme/language toggle) repaint from this cache
// instead of re-querying third-party DNS; enrichedKey gates the one-time
// auto-check per challenge set.
let enrichedKey: string | null = null;
const dohStatus = new Map<string, DohStatus>();
const providerCache = new Map<string, ProviderInfo | null>();

function resetEnrichment(): void {
  enrichedKey = null;
  dohStatus.clear();
  providerCache.clear();
}

function initTheme(): "dark" | "light" {
  try {
    const saved = localStorage.getItem("certownia.theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "light"; // matches baxy.it (light/paper)
}

// ---------------------------------------------------------------- dom helpers
type Props = Record<string, unknown>;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = String(v);
    else if (k === "for") (node as HTMLLabelElement).htmlFor = String(v);
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    } else if (v === true) node.setAttribute(k, "");
    else node.setAttribute(k, String(v));
  }
  for (const c of children) node.append(typeof c === "string" ? document.createTextNode(c) : c);
  return node;
}

// Parse a trusted, static SVG string into a real SVG node (no innerHTML).
function icon(markup: string, cls?: string): HTMLElement {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  const wrap = el("span", cls ? { class: cls } : {});
  wrap.append(document.importNode(doc.documentElement, true));
  return wrap;
}

function spinner(): HTMLElement {
  return el("span", { class: "spinner" });
}

// ---------------------------------------------------------------- shell
const root = document.getElementById("root")!;

function render(): void {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.documentElement.lang = getLang();
  root.replaceChildren(renderHeader(), renderStage(), renderFooter());
}

function renderHeader(): HTMLElement {
  return el("header", { class: "site-header" }, [
    el("div", { class: "brand" }, [
      icon(ICON.brand, "brand-mark"),
      el("div", { class: "brand-text" }, [
        el("span", { class: "brand-name" }, ["Certownia"]),
        el("span", { class: "brand-tag" }, ["by BAXY", el("span", { class: "dot" }, ["."]), "it"]),
      ]),
    ]),
    el("div", { class: "header-actions" }, [
      el(
        "button",
        { class: "icon-btn", type: "button", "aria-label": "Theme", onclick: toggleTheme },
        [icon(ICON.sun)],
      ),
      el("button", { class: "icon-btn", type: "button", onclick: toggleLang }, [t("lang.toggle")]),
    ]),
  ]);
}

function renderStage(): HTMLElement {
  const views: Record<Step, () => HTMLElement> = {
    hero: renderHero,
    config: renderConfig,
    work: renderWork,
    challenge: renderChallenge,
    done: renderDone,
    error: renderError,
  };
  return el("main", { class: "stage" }, [views[state.step]()]);
}

function renderFooter(): HTMLElement {
  return el("footer", { class: "site-footer" }, [
    el("div", {}, [
      `${t("footer.madeBy")} `,
      el("a", { href: BAXY_URL, target: "_blank", rel: "noopener" }, [
        "BAXY",
        el("span", { class: "dot" }, ["."]),
        "it",
      ]),
    ]),
    el("div", { class: "foot-links" }, [
      el("a", { href: SOURCE_URL, target: "_blank", rel: "noopener" }, [t("footer.source")]),
      el("span", { class: "brand-tag" }, [t("app.poweredBy")]),
    ]),
    el("div", { class: "foot-note" }, [t("footer.notAffiliated")]),
  ]);
}

function stepper(active: number): HTMLElement {
  const labels = [t("step.config"), t("step.verify"), t("step.download")];
  const dots: (Node | string)[] = [];
  labels.forEach((label, i) => {
    if (i > 0) dots.push(el("span", { class: "sep" }));
    const cls = i === active ? "dot active" : i < active ? "dot done" : "dot";
    dots.push(el("span", { class: cls }, [`${i + 1} · ${label}`]));
  });
  return el("div", { class: "stepper" }, dots);
}

// ---------------------------------------------------------------- hero
function renderHero(): HTMLElement {
  const how = [
    ["1", t("hero.step1"), t("hero.step1.desc")],
    ["2", t("hero.step2"), t("hero.step2.desc")],
    ["3", t("hero.step3"), t("hero.step3.desc")],
  ].map(([n, title, desc]) =>
    el("div", { class: "how-step" }, [
      el("div", { class: "num" }, [n]),
      el("h3", {}, [title]),
      el("p", {}, [desc]),
    ]),
  );

  const section = el("section", { class: "view hero" }, [
    el("span", { class: "eyebrow" }, ["●  ", t("app.poweredBy")]),
    el("h1", {}, [t("hero.title")]),
    el("p", { class: "lede" }, [t("hero.subtitle")]),
    el("div", { class: "hero-cta" }, [
      el(
        "button",
        { class: "btn btn-primary btn-lg", type: "button", onclick: () => goto("config") },
        [t("hero.start"), icon(ICON.arrow)],
      ),
    ]),
    el("div", { class: "trust" }, [
      icon(ICON.shield, "shield"),
      el("div", {}, [el("h3", {}, [t("hero.trust.title")]), el("p", {}, [t("hero.trust.body")])]),
    ]),
    el("div", { class: "how" }, how),
  ]);
  if (pendingSession) section.prepend(renderResumeBanner());
  return section;
}

function renderResumeBanner(): HTMLElement {
  const s = pendingSession!;
  const extra = s.config.domains.length > 1 ? ` +${s.config.domains.length - 1}` : "";
  return el("div", { class: "resume" }, [
    el("div", { class: "resume-text" }, [
      el("div", {}, [t("resume.text", s.config.domains[0] + extra)]),
      el("div", { style: "margin-top:4px; color: var(--muted); font-size: 0.84rem" }, [
        t("resume.hint"),
      ]),
    ]),
    el("div", { class: "resume-actions" }, [
      el("button", { class: "btn btn-primary", type: "button", onclick: () => void resumeSession() }, [
        t("resume.continue"),
      ]),
      el("button", { class: "btn btn-ghost", type: "button", onclick: discardSession }, [
        t("resume.discard"),
      ]),
    ]),
  ]);
}

// ---------------------------------------------------------------- config
function optionTile(
  name: string,
  value: string,
  checked: boolean,
  title: string,
  hint: string,
  warn = false,
): HTMLElement {
  const children: (Node | string)[] = [
    el("input", { type: "radio", name, value, checked }),
    el("span", { class: "opt-title" }, [title]),
  ];
  if (hint) children.push(el("span", { class: "opt-hint" }, [hint]));
  return el("label", { class: warn ? "opt warn" : "opt" }, children);
}

function renderConfig(): HTMLElement {
  const errBox = el("div", { class: "form-error", style: "display:none", role: "alert" });

  const cfg0 = state.config ?? pendingSession?.config ?? null;
  const domains = el("input", {
    type: "text",
    id: "f-domains",
    placeholder: t("cfg.domains.placeholder"),
    autocomplete: "off",
    spellcheck: "false",
    value: cfg0?.domains.join(" ") ?? "",
  });
  const email = el("input", {
    type: "email",
    id: "f-email",
    placeholder: t("cfg.email.placeholder"),
    autocomplete: "off",
    value: cfg0?.email ?? "",
  });

  const env = cfg0?.env ?? "staging";
  const key = cfg0?.keyType ?? "ecdsa";
  const chal = cfg0?.challenge ?? "dns-01";

  const form = el("form", { novalidate: true }, [
    errBox,
    el("div", { class: "field" }, [
      el("label", { for: "f-domains" }, [t("cfg.domains.label")]),
      domains,
      el("div", { class: "hint" }, [t("cfg.domains.hint")]),
    ]),
    el("div", { class: "field" }, [
      el("label", { for: "f-email" }, [t("cfg.email.label")]),
      email,
      el("div", { class: "hint" }, [t("cfg.email.hint")]),
    ]),
    el("div", { class: "field" }, [
      el("label", {}, [t("cfg.env.label")]),
      el("div", { class: "options cols-2" }, [
        optionTile("env", "staging", env === "staging", t("cfg.env.staging"), t("cfg.env.staging.hint")),
        optionTile("env", "production", env === "production", t("cfg.env.production"), t("cfg.env.production.hint"), true),
      ]),
    ]),
    el("div", { class: "field" }, [
      el("label", {}, [t("cfg.challenge.label")]),
      el("div", { class: "options cols-2" }, [
        optionTile("chal", "dns-01", chal === "dns-01", t("cfg.challenge.dns"), t("cfg.challenge.dns.hint")),
        optionTile("chal", "http-01", chal === "http-01", t("cfg.challenge.http"), t("cfg.challenge.http.hint")),
      ]),
    ]),
    el("div", { class: "field" }, [
      el("label", {}, [t("cfg.keytype.label")]),
      el("div", { class: "options cols-3" }, [
        optionTile("key", "ecdsa", key === "ecdsa", "ECDSA P-256", t("cfg.keytype.ecdsa.short")),
        optionTile("key", "rsa2048", key === "rsa2048", "RSA 2048", ""),
        optionTile("key", "rsa4096", key === "rsa4096", "RSA 4096", t("cfg.keytype.rsa4096.short")),
      ]),
    ]),
    el("div", { class: "field" }, [
      el("label", { class: "check" }, [
        el("input", { type: "checkbox", id: "f-tos" }),
        el("span", {}, [
          t("cfg.tos.pre"),
          el("a", { href: LE_REPOSITORY_URL, target: "_blank", rel: "noopener" }, [t("cfg.tos.link")]),
          t("cfg.tos.post"),
        ]),
      ]),
    ]),
    el("div", { class: "form-actions" }, [
      el("button", { class: "btn btn-ghost", type: "button", onclick: () => goto("hero") }, [t("cfg.back")]),
      el("button", { class: "btn btn-primary btn-block", type: "submit" }, [t("cfg.submit"), icon(ICON.arrow)]),
    ]),
  ]) as HTMLFormElement;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cfg = readConfig(form);
    if (typeof cfg === "string") {
      errBox.textContent = cfg;
      errBox.style.display = "block";
      errBox.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    state.config = cfg;
    void runSetup();
  });

  return el("section", { class: "view" }, [
    stepper(0),
    el("div", { class: "panel" }, [el("h2", {}, [t("cfg.title")]), form]),
  ]);
}

const DOMAIN_RE = /^(\*\.)?([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Convert an internationalized domain (Unicode U-labels) to its ASCII A-label
// (punycode) form, which is what ACME requires. Pure-ASCII input is returned
// unchanged so junk still fails the strict regex below.
function toAscii(domain: string): string {
  const isAscii = [...domain].every((ch) => ch.charCodeAt(0) <= 127);
  if (isAscii) return domain; // pure ASCII - leave as-is
  const wild = domain.startsWith("*.");
  const base = wild ? domain.slice(2) : domain;
  try {
    const host = new URL(`https://${base}`).hostname; // URL punycodes the host
    return wild ? `*.${host}` : host;
  } catch {
    return domain;
  }
}

function readConfig(form: HTMLFormElement): Config | string {
  const raw = (form.querySelector("#f-domains") as HTMLInputElement).value;
  const domains = [
    ...new Set(
      raw
        .split(/[\s,]+/)
        .map((d) => toAscii(d.trim()).toLowerCase())
        .filter(Boolean),
    ),
  ];
  if (domains.length === 0) return t("cfg.err.domains");
  for (const d of domains) {
    if (!DOMAIN_RE.test(d)) return t("cfg.err.domainInvalid", d);
  }
  const email = (form.querySelector("#f-email") as HTMLInputElement).value.trim();
  if (email && !EMAIL_RE.test(email)) return t("cfg.err.email");

  const env = (form.querySelector('input[name="env"]:checked') as HTMLInputElement).value as AcmeEnv;
  const keyType = (form.querySelector('input[name="key"]:checked') as HTMLInputElement)
    .value as CertKeyType;
  const challenge = (form.querySelector('input[name="chal"]:checked') as HTMLInputElement)
    .value as ChallengeType;

  const wildcard = domains.find((d) => d.startsWith("*."));
  if (wildcard && challenge === "http-01") return t("cfg.err.wildcardHttp", wildcard);

  const tos = (form.querySelector("#f-tos") as HTMLInputElement).checked;
  if (!tos) return t("cfg.err.tos");

  return { domains, email, env, keyType, challenge };
}

// ---------------------------------------------------------------- work view
function renderWork(): HTMLElement {
  const lines = state.workLines.map((key) =>
    el("div", { class: "line", "data-log": key }, [el("span", { class: "mark" }, ["○"]), el("span", {}, [t(key)])]),
  );
  return el("section", { class: "view" }, [
    stepper(state.workLines.includes("work.finalizing") ? 2 : 1),
    el("div", { class: "panel" }, [el("h2", {}, [t("work.preparing")]), el("div", { class: "worklog" }, lines)]),
  ]);
}

function setLog(key: string, status: "active" | "done"): void {
  const line = root.querySelector(`.worklog [data-log="${key}"]`);
  if (!line) return;
  line.className = `line ${status}`;
  const mark = line.querySelector(".mark")!;
  if (status === "active") mark.replaceChildren(spinner());
  else mark.textContent = "✓";
}

// ---------------------------------------------------------------- challenge view
function copyField(text: string): HTMLElement {
  const btn = el("button", { type: "button" }, [t("chal.copy")]);
  btn.addEventListener("click", async () => {
    if (await copyToClipboard(text)) {
      btn.textContent = t("chal.copied");
      btn.classList.add("ok");
      setTimeout(() => {
        btn.textContent = t("chal.copy");
        btn.classList.remove("ok");
      }, 1600);
    }
  });
  return el("div", { class: "copyfield" }, [el("code", {}, [text]), btn]);
}

function renderChallenge(): HTMLElement {
  const isDns = state.config!.challenge === "dns-01";
  const records = state.challenges.map((c) => {
    const key = statusKey(c);
    const head = el("div", { class: "record-head" }, [
      el("span", { class: "domain" }, [c.wildcard ? `*.${c.domain}` : c.domain]),
      c.wildcard ? el("span", { class: "badge wild" }, ["wildcard"]) : "",
    ]);
    const rows: (Node | string)[] = [];
    if (isDns) {
      rows.push(
        el("span", { class: "k" }, [t("chal.dns.name")]),
        el("div", {}, [copyField(c.dnsRecordName!)]),
        el("span", { class: "k" }, [t("chal.dns.type")]),
        el("div", {}, [copyField("TXT")]),
        el("span", { class: "k" }, [t("chal.dns.value")]),
        el("div", {}, [copyField(c.dnsRecordValue!)]),
      );
    } else {
      rows.push(
        el("span", { class: "k" }, [t("chal.http.path")]),
        el("div", {}, [copyField(c.httpUrl!)]),
        el("span", { class: "k" }, [t("chal.http.content")]),
        el("div", {}, [copyField(c.httpContent!)]),
      );
    }
    const children: (Node | string)[] = [head, el("div", { class: "kv" }, rows)];
    if (!isDns) {
      const dlBtn = el("button", { type: "button", class: "btn btn-ghost", style: "margin-top:12px" }, [
        icon(ICON.download),
        t("chal.http.download"),
      ]);
      dlBtn.addEventListener("click", () => downloadText(c.httpFilename!, c.httpContent!, "text/plain"));
      children.push(dlBtn);
    }
    if (isDns) {
      const dohNode = el("div", { class: "doh-status", "data-doh": key });
      const cachedDoh = dohStatus.get(key);
      if (cachedDoh) fillDohNode(dohNode, cachedDoh);
      children.push(dohNode);

      const provNode = el("div", { class: "provider", "data-provider": key, style: "display:none" });
      if (providerCache.has(key)) fillProviderNode(provNode, providerCache.get(key) ?? null);
      children.push(provNode);
    }
    children.push(el("div", { class: "record-status", "data-status": key }, [el("span", {}, ["·"])]));
    return el("div", { class: "record" }, children);
  });

  const panelChildren: (Node | string)[] = [
    el("h2", {}, [t("chal.title")]),
    el("div", { class: "chal-intro" }, [isDns ? t("chal.dns.intro") : t("chal.http.intro")]),
    ...records,
  ];
  if (!isDns) {
    panelChildren.push(
      el("div", { class: "callout info", style: "margin-top:8px" }, [
        el("h4", {}, [t("http.where.title")]),
        el("p", { style: "margin:0" }, [t("http.where.body")]),
      ]),
    );
  }
  if (isDns) {
    panelChildren.push(el("p", { class: "note" }, [t("chal.dns.propagation")]));
    panelChildren.push(el("p", { class: "note", style: "margin-top:-14px" }, [t("doh.hint")]));
    panelChildren.push(el("p", { class: "note", style: "margin-top:-14px" }, [t("doh.privacy")]));
  }

  const actions: (Node | string)[] = [];
  if (isDns) {
    const checkBtn = el("button", { class: "btn btn-ghost btn-block", type: "button" }, [t("doh.check")]);
    checkBtn.addEventListener("click", () => void checkAllPropagation(checkBtn));
    actions.push(checkBtn);
  }
  const verifyBtn = el("button", { class: "btn btn-primary btn-block", type: "button" }, [
    t("chal.verify"),
    icon(ICON.arrow),
  ]);
  verifyBtn.addEventListener("click", () => void runVerify(verifyBtn));
  actions.push(verifyBtn);
  panelChildren.push(
    el("div", { style: "display:flex; flex-direction:column; gap:12px; margin-top:26px" }, actions),
  );

  return el("section", { class: "view" }, [stepper(1), el("div", { class: "panel" }, panelChildren)]);
}

// ---- challenge enrichment: DNS propagation check + provider detection ----
function showChallenge(): void {
  goto("challenge");
  enrichChallenge();
}

// Runs once per challenge set (guarded by enrichedKey): detect the DNS provider
// and check TXT propagation. Results are cached so later re-renders repaint
// without re-querying third-party DNS.
function enrichChallenge(): void {
  if (state.config?.challenge !== "dns-01") return;
  const sig = state.challenges.map((c) => c.token).join("|");
  if (enrichedKey === sig) return;
  enrichedKey = sig;
  dohStatus.clear();
  providerCache.clear();
  for (const c of state.challenges) {
    const key = statusKey(c);
    void lookupNs(c.domain)
      .then((ns) => renderProviderInto(key, detectProvider(ns)))
      .catch(() => {
        /* provider detection is best-effort */
      });
  }
  void checkAllPropagation();
}

function fillDohNode(node: Element, status: DohStatus): void {
  const labels: Record<DohStatus, string> = {
    checking: t("doh.checking"),
    ok: t("doh.ok"),
    pending: t("doh.pending"),
    error: t("doh.error"),
  };
  node.className = `doh-status ${status === "ok" ? "ok" : status === "pending" ? "pending" : ""}`;
  node.replaceChildren();
  if (status === "checking") {
    node.append(spinner(), document.createTextNode(" " + labels.checking));
  } else {
    node.append(document.createTextNode((status === "ok" ? "✓ " : "") + labels[status]));
  }
}

function setDoh(key: string, status: DohStatus): void {
  dohStatus.set(key, status);
  const node = root.querySelector(`[data-doh="${key}"]`);
  if (node) fillDohNode(node, status);
}

async function checkAllPropagation(btn?: HTMLButtonElement): Promise<void> {
  if (btn) {
    btn.disabled = true;
    btn.replaceChildren(spinner(), document.createTextNode(t("doh.checking")));
  }
  try {
    await Promise.all(
      state.challenges.map(async (c) => {
        const key = statusKey(c);
        setDoh(key, "checking");
        try {
          setDoh(key, (await checkTxt(c.dnsRecordName!, c.dnsRecordValue!)) ? "ok" : "pending");
        } catch {
          setDoh(key, "error");
        }
      }),
    );
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.replaceChildren(document.createTextNode(t("doh.check")));
    }
  }
}

function fillProviderNode(node: HTMLElement, info: ProviderInfo | null): void {
  node.style.display = "block";
  node.replaceChildren();
  if (!info) {
    node.append(el("div", { style: "font-size:.86rem; color: var(--muted)" }, [t("provider.generic")]));
    return;
  }
  node.append(
    el("h4", {}, [el("span", { class: "pill" }, ["DNS"]), t("provider.detected", info.name)]),
    el(
      "ol",
      {},
      info.steps[getLang()].map((s) => el("li", {}, [s])),
    ),
    el("a", { href: info.url, target: "_blank", rel: "noopener" }, [t("provider.open", info.name)]),
  );
}

function renderProviderInto(key: string, info: ProviderInfo | null): void {
  providerCache.set(key, info);
  const node = root.querySelector(`[data-provider="${key}"]`) as HTMLElement | null;
  if (node) fillProviderNode(node, info);
}

// Unique per authorization: apex and its wildcard share identifier.value, so
// key on the wildcard-qualified name to avoid two rows colliding on one node.
function statusKey(c: ChallengeInstruction): string {
  return c.wildcard ? `*.${c.domain}` : c.domain;
}

function setRecordStatus(key: string, status: string): void {
  const node = root.querySelector(`[data-status="${key}"]`);
  if (!node) return;
  const valid = status === "valid";
  const invalid = status === "invalid";
  node.className = `record-status${valid ? " valid" : invalid ? " invalid" : ""}`;
  node.textContent = valid ? "✓ valid" : invalid ? "✕ invalid" : `… ${status}`;
}

// ---------------------------------------------------------------- done view
function downloadTile(cls: string, title: string, file: string, content: string): HTMLElement {
  const btn = el("button", { class: cls, type: "button" }, [
    icon(ICON.download, "dl-ic"),
    el("span", {}, [
      el("span", { class: "dl-title", style: "display:block" }, [title]),
      el("span", { class: "dl-file" }, [file]),
    ]),
  ]);
  btn.addEventListener("click", () => downloadText(file, content, "application/x-pem-file"));
  return btn;
}

function renderDone(): HTMLElement {
  const b = state.bundle!;
  const staging = state.config!.env === "staging";
  const panelChildren: (Node | string)[] = [
    icon(ICON.check, "success-mark"),
    el("h2", {}, [t("done.title")]),
    el("p", { class: "sub" }, [t("done.subtitle")]),
  ];
  if (staging) {
    panelChildren.push(el("div", { class: "callout warn", style: "margin-bottom:18px" }, [t("done.staging.warning")]));
  }
  panelChildren.push(
    el("div", { class: "downloads" }, [
      downloadTile("dl primary", t("done.dl.fullchain"), "fullchain.pem", b.fullchain),
      downloadTile("dl", t("done.dl.key"), "privkey.pem", state.privateKeyPem),
      downloadTile("dl", t("done.dl.cert"), "cert.pem", b.cert),
      downloadTile("dl", t("done.dl.chain"), "chain.pem", b.chain),
    ]),
    el("div", { class: "callout" }, [
      el("h4", {}, [t("done.whatnow")]),
      el("p", { style: "margin:0" }, [t("done.whatnow.body")]),
    ]),
    el("p", { class: "note", style: "margin-top:18px" }, [t("done.expiry")]),
    el("div", { class: "form-actions" }, [
      el("button", { class: "btn btn-ghost", type: "button", onclick: resetFlow }, [t("done.again")]),
    ]),
  );
  return el("section", { class: "view" }, [stepper(2), el("div", { class: "panel" }, panelChildren)]);
}

// ---------------------------------------------------------------- error view
function renderError(): HTMLElement {
  return el("section", { class: "view" }, [
    el("div", { class: "panel" }, [
      el("h2", {}, [t("err.title")]),
      el("div", { class: "form-error", style: "display:block; white-space:pre-wrap" }, [state.error]),
      el("div", { class: "form-actions" }, [
        el("button", { class: "btn btn-primary", type: "button", onclick: resetFlow }, [
          t("err.startOver"),
        ]),
      ]),
    ]),
  ]);
}

// ---------------------------------------------------------------- flow
function goto(step: Step): void {
  state.step = step;
  render();
}

function toggleTheme(): void {
  state.theme = state.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("certownia.theme", state.theme);
  } catch {
    /* ignore */
  }
  render();
}

function toggleLang(): void {
  setLang(getLang() === "pl" ? "en" : "pl");
  render();
}

function resetFlow(): void {
  clearSession();
  pendingSession = null;
  resetEnrichment();
  state.certKey = null;
  state.order = null;
  state.challenges = [];
  state.bundle = null;
  state.privateKeyPem = "";
  state.client = null;
  goto("config");
}

function discardSession(): void {
  clearSession();
  pendingSession = null;
  render();
}

// Rebuild the client from a persisted session and jump back to the SAME
// challenge (same DNS/HTTP value). The account key restores the account
// idempotently; the certificate key is regenerated later at finalize.
async function resumeSession(): Promise<void> {
  const s = pendingSession;
  if (!s) return;
  resetEnrichment();
  state.workLines = ["resume.restoring"];
  goto("work");
  setLog("resume.restoring", "active");
  try {
    const accountKey = await importAccountKey(s.accountKeyJwk);
    const client = new AcmeClient(s.config.env, accountKey, ACME_PROXY);
    await client.init();
    await client.createAccount(s.config.email || undefined);
    client.restoreOrder(s.orderUrl);

    state.config = { ...s.config };
    state.accountKey = accountKey;
    state.client = client;
    state.order = s.order;
    state.challenges = s.challenges;
    state.certKey = null;
    showChallenge();
  } catch (e) {
    clearSession();
    pendingSession = null;
    fail(e);
  }
}

function describeError(e: unknown): string {
  if (e instanceof AcmeError) {
    if (e.isRateLimit) return `${t("err.rateLimited")}\n\n${e.detail}`;
    return e.detail;
  }
  // Browser fetch network failures surface as TypeError ("Failed to fetch" /
  // "NetworkError…" / "Load failed"). Match those, not every TypeError.
  if (e instanceof TypeError && /fetch|network|load failed/i.test(e.message)) return t("err.network");
  return e instanceof Error ? e.message : String(e);
}

function fail(e: unknown): void {
  console.error("[certownia]", e);
  state.error = describeError(e);
  goto("error");
}

async function runSetup(): Promise<void> {
  const cfg = state.config!;
  resetEnrichment();
  state.workLines = [
    "work.genAccountKey",
    "work.genCertKey",
    "work.register",
    "work.newOrder",
    "work.fetchChallenges",
  ];
  goto("work");

  try {
    setLog("work.genAccountKey", "active");
    if (!state.accountKey) state.accountKey = await generateAccountKey();
    setLog("work.genAccountKey", "done");

    setLog("work.genCertKey", "active");
    state.certKey = await generateCertKey(cfg.keyType);
    setLog("work.genCertKey", "done");

    setLog("work.register", "active");
    state.client = new AcmeClient(cfg.env, state.accountKey, ACME_PROXY);
    await state.client.init();
    await state.client.createAccount(cfg.email || undefined);
    setLog("work.register", "done");

    setLog("work.newOrder", "active");
    state.order = await state.client.newOrder(cfg.domains);
    setLog("work.newOrder", "done");

    setLog("work.fetchChallenges", "active");
    state.challenges = await state.client.getChallenges(state.order, cfg.challenge);
    setLog("work.fetchChallenges", "done");

    if (state.challenges.length === 0) {
      await runFinalize(); // every identifier already authorized
    } else {
      // Persist so the user can close the tab and return to the SAME record.
      if (state.client.pendingOrderUrl && state.accountKey && state.order) {
        saveSession({
          config: cfg,
          accountKeyJwk: await exportAccountKeyJwk(state.accountKey),
          order: state.order,
          orderUrl: state.client.pendingOrderUrl,
          challenges: state.challenges,
        });
        pendingSession = loadSession();
      }
      showChallenge();
    }
  } catch (e) {
    fail(e);
  }
}

async function runVerify(btn: HTMLButtonElement): Promise<void> {
  btn.disabled = true;
  btn.replaceChildren(spinner(), document.createTextNode(t("chal.verifying")));
  try {
    await state.client!.verifyChallenges(state.challenges, (c, status) =>
      setRecordStatus(statusKey(c), status),
    );
    await runFinalize();
  } catch (e) {
    // A non-network failure means the authorization is terminally invalid and
    // the order can never finalize — drop the dead session so the resume banner
    // doesn't trap the user in a loop. Keep it on a transient network error.
    if (!(e instanceof TypeError)) {
      clearSession();
      pendingSession = null;
    }
    fail(e);
  }
}

async function runFinalize(): Promise<void> {
  const cfg = state.config!;
  state.workLines = ["work.finalizing", "work.downloading"];
  goto("work");
  try {
    setLog("work.finalizing", "active");
    if (!state.certKey) state.certKey = await generateCertKey(cfg.keyType); // resumed session
    const csr = await csrToAcmeBase64url(cfg.domains, state.certKey);
    state.bundle = await state.client!.finalize(state.order!, csr);
    setLog("work.finalizing", "done");

    setLog("work.downloading", "active");
    state.privateKeyPem = await exportPrivateKeyPem(state.certKey.privateKey);
    setLog("work.downloading", "done");

    clearSession(); // certificate issued — the pending session is done
    pendingSession = null;
    goto("done");
  } catch (e) {
    fail(e);
  }
}

// ---------------------------------------------------------------- boot
setLang(getLang());
pendingSession = loadSession();
render();
