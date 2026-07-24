import { describe, expect, it } from "vitest";
import { detectProvider } from "../src/lib/providers.js";

describe("detectProvider", () => {
  it.each([
    [["adam.ns.cloudflare.com", "kate.ns.cloudflare.com"], "cloudflare"],
    [["dns1.cyberfolks.pl", "dns2.cyberfolks.pl"], "cyberfolks"],
    [["dns.cyber-folks.pl"], "cyberfolks"],
    [["dns.home.pl", "dns2.home.pl"], "homepl"],
    [["ns1.ovh.net", "dns1.ovh.net"], "ovh"],
    [["ns1.nazwa.pl", "ns2.nazwadns.pl"], "nazwapl"],
  ])("detects %j -> %s", (ns, id) => {
    expect(detectProvider(ns as string[])?.id).toBe(id);
  });

  it("returns null for an unknown provider", () => {
    expect(detectProvider(["ns1.some-registrar.net", "ns2.some-registrar.net"])).toBeNull();
  });

  it("does not false-match a lookalike suffix", () => {
    // "notcloudflare.com" must NOT match the cloudflare rule.
    expect(detectProvider(["ns.notcloudflare.com"])).toBeNull();
  });
});
