// PKCS#10 CSR generation with PKI.js v3, in the browser, from a WebCrypto key.
//
// Two v3-specific gotchas (verified): PKI.js keeps a global crypto-engine
// singleton that can read back undefined under a bundler, so we set it
// explicitly once; and the v3 setEngine signature is (name, CryptoEngine).

import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { bytesToBase64url } from "./base64.js";

let engineReady = false;
function ensureEngine(): void {
  if (engineReady) return;
  pkijs.setEngine(
    "browser",
    new pkijs.CryptoEngine({ name: "browser", crypto: globalThis.crypto }),
  );
  engineReady = true;
}

/** Build and self-sign a CSR for the given domains; return the DER bytes. */
export async function generateCsrDer(
  domains: string[],
  keyPair: CryptoKeyPair,
): Promise<ArrayBuffer> {
  ensureEngine();

  const csr = new pkijs.CertificationRequest();
  csr.version = 0;

  // CN = first domain. Let's Encrypt validates against the SAN list below, but
  // a CN is conventional and keeps the CSR readable in tooling.
  csr.subject.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.3", // commonName
      value: new asn1js.Utf8String({ value: domains[0] }),
    }),
  );

  await csr.subjectPublicKeyInfo.importKey(keyPair.publicKey);

  // subjectAltName (2.5.29.17) with one dNSName (GeneralName type 2) per domain,
  // wrapped in the pkcs-9 extensionRequest attribute (1.2.840.113549.1.9.14).
  const altNames = new pkijs.GeneralNames({
    names: domains.map((d) => new pkijs.GeneralName({ type: 2, value: d })),
  });
  const extensions = new pkijs.Extensions({
    extensions: [
      new pkijs.Extension({
        extnID: "2.5.29.17",
        critical: false,
        extnValue: altNames.toSchema().toBER(false),
      }),
    ],
  });
  csr.attributes = [
    new pkijs.Attribute({
      type: "1.2.840.113549.1.9.14",
      values: [extensions.toSchema()],
    }),
  ];

  await csr.sign(keyPair.privateKey, "SHA-256");
  return csr.toSchema(true).toBER(false);
}

/** CSR encoded as unpadded base64url of its DER bytes, for the ACME finalize call. */
export async function csrToAcmeBase64url(
  domains: string[],
  keyPair: CryptoKeyPair,
): Promise<string> {
  const der = await generateCsrDer(domains, keyPair);
  return bytesToBase64url(der);
}
