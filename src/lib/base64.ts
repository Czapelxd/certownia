// Base64 / base64url helpers.
//
// ACME (RFC 8555) and JOSE (RFC 7515) require base64url WITHOUT padding for
// every field: JWS protected header, payload, signature, JWK thumbprint, and
// the `csr` finalize field. Getting padding wrong makes Let's Encrypt reject
// the request ("illegal base64 data"), so all base64url output here is unpadded.

export function bytesToBase64(bytes: Uint8Array): string {
  // Chunk to avoid "Maximum call stack size exceeded" on large inputs.
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function bytesToBase64url(bytes: Uint8Array | ArrayBuffer): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return bytesToBase64(u8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return base64ToBytes(b64 + pad);
}

export function stringToBase64url(s: string): string {
  return bytesToBase64url(new TextEncoder().encode(s));
}

/** Wrap DER bytes as a PEM block with the given label (e.g. "CERTIFICATE"). */
export function bytesToPem(bytes: Uint8Array | ArrayBuffer, label: string): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const b64 = bytesToBase64(u8);
  const lines = b64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}
