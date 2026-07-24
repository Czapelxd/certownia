import { afterEach, describe, expect, it, vi } from "vitest";
import { checkHttpFile } from "../src/lib/doh.js";

afterEach(() => vi.restoreAllMocks());

describe("checkHttpFile", () => {
  it("returns true when the relay body matches (trimmed)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("TOKEN.keyauth\n", { status: 200 })));
    expect(
      await checkHttpFile("http://example.com/.well-known/acme-challenge/x", "TOKEN.keyauth"),
    ).toBe(true);
  });

  it("returns false when the body differs", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("something else", { status: 200 })));
    expect(await checkHttpFile("http://example.com/x", "TOKEN.keyauth")).toBe(false);
  });

  it("throws when the relay responds with an error status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad gateway", { status: 502 })));
    await expect(checkHttpFile("http://example.com/x", "y")).rejects.toThrow();
  });

  it("passes the target URL to the relay, url-encoded", async () => {
    const spy = vi.fn(async (_url?: unknown, _init?: unknown) => new Response("y", { status: 200 }));
    vi.stubGlobal("fetch", spy);
    await checkHttpFile("http://ex.com/a?b=1", "y");
    expect(String(spy.mock.calls[0][0])).toContain(
      "api.allorigins.win/raw?url=" + encodeURIComponent("http://ex.com/a?b=1"),
    );
  });
});
