// JWS signing for ACME (RFC 8555 §6.2 / RFC 7515 Flattened JSON Serialization).
//
// Every ACME request body is a JWS object {protected, payload, signature}, sent
// with Content-Type: application/jose+json. Two shapes of protected header:
//   - newAccount: carries the public key as `jwk`
//   - everything else: carries the account URL as `kid`
// POST-as-GET requests (reading a resource) use an empty-STRING payload "".

import { bytesToBase64url, stringToBase64url } from "./base64.js";

export interface JwsParams {
  /** Account private key (ECDSA P-256 → ES256). */
  privateKey: CryptoKey;
  alg: "ES256" | "RS256";
  url: string;
  nonce: string;
  /** JSON payload object, or "" for a POST-as-GET request. */
  payload: Record<string, unknown> | "";
  /** Public JWK — only on the newAccount request. */
  jwk?: JsonWebKey;
  /** Account URL — on every request after the account exists. */
  kid?: string;
}

export async function signJws(p: JwsParams): Promise<string> {
  const protectedHeader: Record<string, unknown> = {
    alg: p.alg,
    nonce: p.nonce,
    url: p.url,
  };
  if (p.jwk) protectedHeader.jwk = p.jwk;
  if (p.kid) protectedHeader.kid = p.kid;

  const protectedB64 = stringToBase64url(JSON.stringify(protectedHeader));
  const payloadB64 = p.payload === "" ? "" : stringToBase64url(JSON.stringify(p.payload));
  const signingInput = new TextEncoder().encode(`${protectedB64}.${payloadB64}`);

  const algorithm =
    p.alg === "ES256"
      ? { name: "ECDSA", hash: "SHA-256" }
      : { name: "RSASSA-PKCS1-v1_5" };
  const signature = await crypto.subtle.sign(algorithm, p.privateKey, signingInput);

  return JSON.stringify({
    protected: protectedB64,
    payload: payloadB64,
    signature: bytesToBase64url(signature),
  });
}
