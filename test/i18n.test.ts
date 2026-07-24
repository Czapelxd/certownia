import { describe, expect, it } from "vitest";
import { LANGS } from "../src/lib/i18n.js";
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
