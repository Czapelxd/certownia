// WebCrypto key generation and JOSE helpers. Everything here runs in the
// browser; private keys are created with crypto.subtle and never transmitted.
//
// Two independent key pairs are involved:
//   - the ACME *account* key: always ECDSA P-256 (JWS alg ES256). Private key is
//     non-extractable — it only signs API requests and never needs to leave.
//   - the *certificate* key: user's choice (EC P-256 / RSA 2048 / RSA 4096). Its
//     private key IS extractable, because the user downloads it as PEM.

import { bytesToBase64url, bytesToPem } from "./base64.js";

export type CertKeyType = "ecdsa" | "rsa2048" | "rsa4096";

/** JWS `alg` for a given public key (only ES256/RS256 are used here). */
export function jwsAlg(key: CryptoKey): "ES256" | "RS256" {
  return key.algorithm.name === "ECDSA" ? "ES256" : "RS256";
}

/** Generate the ACME account key pair (ECDSA P-256, non-extractable private). */
export function generateAccountKey(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, [
    "sign",
    "verify",
  ]) as Promise<CryptoKeyPair>;
}

/** Generate the certificate key pair; private key is extractable for download. */
export function generateCertKey(type: CertKeyType): Promise<CryptoKeyPair> {
  const algorithm: RsaHashedKeyGenParams | EcKeyGenParams =
    type === "ecdsa"
      ? { name: "ECDSA", namedCurve: "P-256" }
      : {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: type === "rsa4096" ? 4096 : 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: "SHA-256",
        };
  return crypto.subtle.generateKey(algorithm, true, ["sign", "verify"]) as Promise<CryptoKeyPair>;
}

/** Export a private key as an unencrypted PKCS#8 PEM string. */
export async function exportPrivateKeyPem(privateKey: CryptoKey): Promise<string> {
  const der = await crypto.subtle.exportKey("pkcs8", privateKey);
  return bytesToPem(der, "PRIVATE KEY");
}

/** Minimal public JWK for the JWS `jwk` protected-header field. */
export async function publicJwk(publicKey: CryptoKey): Promise<JsonWebKey> {
  const jwk = await crypto.subtle.exportKey("jwk", publicKey);
  if (jwk.kty === "EC") {
    return { crv: jwk.crv, kty: "EC", x: jwk.x, y: jwk.y };
  }
  return { e: jwk.e, kty: "RSA", n: jwk.n };
}

/**
 * RFC 7638 JWK thumbprint: SHA-256 over the canonical JWK JSON with members in
 * lexicographic order and no whitespace, base64url-encoded (unpadded).
 * For EC:  {"crv","kty","x","y"} ; for RSA: {"e","kty","n"}.
 */
export async function jwkThumbprint(publicKey: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey("jwk", publicKey);
  const canonical =
    jwk.kty === "EC"
      ? `{"crv":"${jwk.crv}","kty":"EC","x":"${jwk.x}","y":"${jwk.y}"}`
      : `{"e":"${jwk.e}","kty":"RSA","n":"${jwk.n}"}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return bytesToBase64url(digest);
}

/**
 * ACME key authorization for a challenge token: `token.base64url(thumbprint)`.
 * http-01 serves this verbatim; dns-01 publishes base64url(SHA256(keyAuth)).
 */
export async function keyAuthorization(token: string, accountKey: CryptoKey): Promise<string> {
  const thumb = await jwkThumbprint(accountKey);
  return `${token}.${thumb}`;
}

/** dns-01 TXT value = base64url( SHA256( keyAuthorization ) ). */
export async function dns01Value(token: string, accountKey: CryptoKey): Promise<string> {
  const keyAuth = await keyAuthorization(token, accountKey);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyAuth));
  return bytesToBase64url(digest);
}
