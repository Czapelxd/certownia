import { describe, expect, it } from "vitest";
import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import {
  base64urlToBytes,
  bytesToBase64url,
  bytesToPem,
  stringToBase64url,
} from "../src/lib/base64.js";
import { dns01Value, generateAccountKey, jwkThumbprint, keyAuthorization } from "../src/lib/crypto.js";
import { csrToAcmeBase64url } from "../src/lib/csr.js";

describe("base64url", () => {
  // RFC 4648 §10 test vectors (unpadded).
  const vectors: [string, string][] = [
    ["", ""],
    ["f", "Zg"],
    ["fo", "Zm8"],
    ["foo", "Zm9v"],
    ["foob", "Zm9vYg"],
    ["fooba", "Zm9vYmE"],
    ["foobar", "Zm9vYmFy"],
  ];
  it.each(vectors)("encodes %j -> %j (unpadded)", (input, expected) => {
    expect(stringToBase64url(input)).toBe(expected);
  });

  it("uses url-safe alphabet and never pads", () => {
    // Bytes chosen to force '+' and '/' in standard base64.
    const bytes = new Uint8Array([0xfb, 0xff, 0xbf, 0x00, 0x3e, 0x3f]);
    const out = bytesToBase64url(bytes);
    expect(out).not.toMatch(/[+/=]/);
  });

  it("round-trips arbitrary bytes", () => {
    const bytes = new Uint8Array(256).map((_, i) => (i * 37 + 11) & 0xff);
    expect(Array.from(base64urlToBytes(bytesToBase64url(bytes)))).toEqual(Array.from(bytes));
  });

  it("wraps PEM at 64 chars with the right label", () => {
    const pem = bytesToPem(new Uint8Array(100).fill(0x41), "CERTIFICATE");
    const lines = pem.trimEnd().split("\n");
    expect(lines[0]).toBe("-----BEGIN CERTIFICATE-----");
    expect(lines.at(-1)).toBe("-----END CERTIFICATE-----");
    for (const l of lines.slice(1, -1)) expect(l.length).toBeLessThanOrEqual(64);
  });
});

describe("JWK thumbprint (RFC 7638)", () => {
  it("matches the RFC 7638 §3.1 known-answer", async () => {
    // The canonical RSA example from RFC 7638; thumbprint is the published value.
    const jwk: JsonWebKey = {
      kty: "RSA",
      e: "AQAB",
      n: "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw",
    };
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      true,
      ["verify"],
    );
    expect(await jwkThumbprint(key)).toBe("NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs");
  });

  it("produces a 43-char url-safe digest for an EC key", async () => {
    const kp = await generateAccountKey();
    const thumb = await jwkThumbprint(kp.publicKey);
    expect(thumb).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});

describe("ACME challenge derivations", () => {
  it("keyAuthorization is token.thumbprint and dns-01 is its base64url SHA-256", async () => {
    const kp = await generateAccountKey();
    const token = "someToken-123_abc";
    const keyAuth = await keyAuthorization(token, kp.publicKey);
    const thumb = await jwkThumbprint(kp.publicKey);
    expect(keyAuth).toBe(`${token}.${thumb}`);

    // Independently recompute SHA-256(keyAuth) and compare with dns01Value.
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyAuth));
    expect(await dns01Value(token, kp.publicKey)).toBe(bytesToBase64url(digest));
  });
});

describe("CSR", () => {
  it("produces a valid, self-signed CSR carrying the SANs", async () => {
    const domains = ["a.example.com", "b.example.com"];
    const kp = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
      "sign",
      "verify",
    ])) as CryptoKeyPair;

    const b64 = await csrToAcmeBase64url(domains, kp);
    expect(b64).not.toMatch(/[+/=]/); // unpadded url-safe, as ACME requires

    const der = base64urlToBytes(b64);
    const asn1 = asn1js.fromBER(der);
    const csr = new pkijs.CertificationRequest({ schema: asn1.result });

    expect(await csr.verify()).toBe(true); // self-signature valid

    const cn = csr.subject.typesAndValues.find((t) => t.type === "2.5.4.3");
    expect(cn?.value.valueBlock.value).toBe("a.example.com");

    const extReq = csr.attributes?.find((a) => a.type === "1.2.840.113549.1.9.14");
    const extensions = new pkijs.Extensions({ schema: extReq!.values[0] });
    const san = extensions.extensions.find((e) => e.extnID === "2.5.29.17");
    const names = new pkijs.GeneralNames({
      schema: asn1js.fromBER(san!.extnValue.valueBlock.valueHexView).result,
    }).names.map((n) => n.value);
    expect(names).toEqual(domains);
  });
});
