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
  exportPrivateKeyPem,
  generateAccountKey,
  generateCertKey,
  type CertKeyType,
} from "./lib/crypto.js";
import { csrToAcmeBase64url } from "./lib/csr.js";
import { copyToClipboard, downloadText } from "./lib/download.js";

const SOURCE_URL = "https://github.com/Czapelxd/certownia";
const BAXY_URL = "https://baxy.it";

// Optional ACME proxy. Empty by default — the browser talks to Let's Encrypt
// directly (it serves CORS). Set VITE_ACME_PROXY at build time only if you must
// route through your own proxy (see proxy/) or target a CA without CORS.
const ACME_PROXY = String(import.meta.env.VITE_ACME_PROXY ?? "");

// ---------------------------------------------------------------- icons
const ICON = {
  brand: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="40" height="40"><path d="M11 14v-2.5a5 5 0 0 1 10 0V14" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round"/><rect x="8.5" y="14" width="15" height="11" rx="2.6" fill="var(--accent)"/><circle cx="16" cy="18.6" r="1.7" fill="var(--bg)"/><rect x="15.2" y="19.4" width="1.6" height="3.4" rx="0.8" fill="var(--bg)"/></svg>`,
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

function initTheme(): "dark" | "light" {
  try {
    const saved = localStorage.getItem("certownia.theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "dark";
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
        el("span", { class: "brand-name" }, ["Cert", el("b", {}, ["ownia"])]),
        el("span", { class: "brand-tag" }, [t("app.tagline")]),
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
      el("a", { href: BAXY_URL, target: "_blank", rel: "noopener" }, ["BAXY IT"]),
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

  return el("section", { class: "view hero" }, [
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

  const domains = el("input", {
    type: "text",
    id: "f-domains",
    placeholder: t("cfg.domains.placeholder"),
    autocomplete: "off",
    spellcheck: "false",
    value: state.config?.domains.join(" ") ?? "",
  });
  const email = el("input", {
    type: "email",
    id: "f-email",
    placeholder: t("cfg.email.placeholder"),
    autocomplete: "off",
    value: state.config?.email ?? "",
  });

  const env = state.config?.env ?? "staging";
  const key = state.config?.keyType ?? "ecdsa";
  const chal = state.config?.challenge ?? "dns-01";

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

function readConfig(form: HTMLFormElement): Config | string {
  const raw = (form.querySelector("#f-domains") as HTMLInputElement).value;
  const domains = raw
    .split(/[\s,]+/)
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
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
    children.push(el("div", { class: "record-status", "data-status": c.domain }, [el("span", {}, ["·"])]));
    return el("div", { class: "record" }, children);
  });

  const verifyBtn = el("button", { class: "btn btn-primary btn-block", type: "button" }, [
    t("chal.verify"),
    icon(ICON.arrow),
  ]);
  verifyBtn.addEventListener("click", () => void runVerify(verifyBtn));

  const panelChildren: (Node | string)[] = [
    el("h2", {}, [t("chal.title")]),
    el("div", { class: "chal-intro" }, [isDns ? t("chal.dns.intro") : t("chal.http.intro")]),
    ...records,
  ];
  if (isDns) panelChildren.push(el("p", { class: "note" }, [t("chal.dns.propagation")]));
  panelChildren.push(el("div", { class: "form-actions" }, [verifyBtn]));

  return el("section", { class: "view" }, [stepper(1), el("div", { class: "panel" }, panelChildren)]);
}

function setRecordStatus(domain: string, status: string): void {
  const node = root.querySelector(`[data-status="${domain}"]`);
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
        el("button", { class: "btn btn-primary", type: "button", onclick: () => goto("config") }, [
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
  state.certKey = null;
  state.order = null;
  state.challenges = [];
  state.bundle = null;
  state.privateKeyPem = "";
  state.client = null;
  goto("config");
}

function describeError(e: unknown): string {
  if (e instanceof AcmeError) {
    if (e.isRateLimit) return `${t("err.rateLimited")}\n\n${e.detail}`;
    return e.detail;
  }
  if (e instanceof TypeError) return t("err.network");
  return e instanceof Error ? e.message : String(e);
}

function fail(e: unknown): void {
  console.error("[certownia]", e);
  state.error = describeError(e);
  goto("error");
}

async function runSetup(): Promise<void> {
  const cfg = state.config!;
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
      goto("challenge");
    }
  } catch (e) {
    fail(e);
  }
}

async function runVerify(btn: HTMLButtonElement): Promise<void> {
  btn.disabled = true;
  btn.replaceChildren(spinner(), document.createTextNode(t("chal.verifying")));
  try {
    await state.client!.verifyChallenges(state.challenges, (domain, status) =>
      setRecordStatus(domain, status),
    );
    await runFinalize();
  } catch (e) {
    fail(e);
  }
}

async function runFinalize(): Promise<void> {
  const cfg = state.config!;
  state.workLines = ["work.finalizing", "work.downloading"];
  goto("work");
  try {
    setLog("work.finalizing", "active");
    const csr = await csrToAcmeBase64url(cfg.domains, state.certKey!);
    state.bundle = await state.client!.finalize(state.order!, csr);
    setLog("work.finalizing", "done");

    setLog("work.downloading", "active");
    state.privateKeyPem = await exportPrivateKeyPem(state.certKey!.privateKey);
    setLog("work.downloading", "done");

    goto("done");
  } catch (e) {
    fail(e);
  }
}

// ---------------------------------------------------------------- boot
setLang(getLang());
render();
