import { describe, expect, it } from "vitest";
import { LANGS, resolveLang } from "../src/lib/i18n.js";
import { en } from "../src/lib/locales/en.js";
import { pl } from "../src/lib/locales/pl.js";
import { de } from "../src/lib/locales/de.js";
import { es } from "../src/lib/locales/es.js";
import { fr } from "../src/lib/locales/fr.js";
import { it as itDict } from "../src/lib/locales/it.js";
import { pt } from "../src/lib/locales/pt.js";

const DICTS = { en, pl, de, es, fr, it: itDict, pt } as const;
const enKeys = Object.keys(en).sort();

describe("i18n", () => {
  it("every language in the selector has a dictionary", () => {
    for (const { code } of LANGS) {
      expect(DICTS[code], `missing dict for ${code}`).toBeDefined();
    }
  });

  it("the selector lists English first and Polish second", () => {
    expect(LANGS[0].code).toBe("en");
    expect(LANGS[1].code).toBe("pl");
  });

  for (const { code } of LANGS) {
    it(`${code} has exactly the English key set`, () => {
      expect(Object.keys(DICTS[code]).sort()).toEqual(enKeys);
    });

    it(`${code} has no empty values and preserves {n} placeholders`, () => {
      const dict = DICTS[code];
      for (const k of enKeys) {
        expect(dict[k]?.trim(), `${code}.${k} is empty`).toBeTruthy();
        const enPh = (en[k].match(/\{\d+\}/g) ?? []).sort();
        const trPh = (dict[k].match(/\{\d+\}/g) ?? []).sort();
        expect(trPh, `${code}.${k} placeholder mismatch`).toEqual(enPh);
      }
    });
  }
});

describe("resolveLang (system-language auto-select)", () => {
  it("an explicit saved choice wins over the system language", () => {
    expect(resolveLang("de", ["pl-PL", "en"])).toBe("de");
  });

  it("ignores an unsupported saved value and falls through to the system", () => {
    expect(resolveLang("zz", ["pl-PL"])).toBe("pl");
  });

  it("auto-selects the first supported system language", () => {
    expect(resolveLang(null, ["cs-CZ", "de-DE", "en"])).toBe("de");
  });

  it("matches on the primary subtag (fr-CA → fr, pt-BR → pt)", () => {
    expect(resolveLang(null, ["fr-CA"])).toBe("fr");
    expect(resolveLang(null, ["pt-BR"])).toBe("pt");
  });

  it("falls back to English when no system language is supported", () => {
    expect(resolveLang(null, ["zh-CN", "ja", "ar"])).toBe("en");
  });

  it("falls back to English with no saved value and no system info", () => {
    expect(resolveLang(null, [])).toBe("en");
  });
});
