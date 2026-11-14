import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "@/lib/security-headers";

const directives = (csp: string) => Object.fromEntries(csp.split("; ").map((d) => [d.split(" ")[0], d.split(" ").slice(1)]));
const byName = (headers: { key: string; value: string }[]) => Object.fromEntries(headers.map((h) => [h.key, h.value]));

describe("contentSecurityPolicy", () => {
  const prod = directives(contentSecurityPolicy(false));
  const dev = directives(contentSecurityPolicy(true));

  it("defaults every kind of resource to the site's own origin", () => expect(prod["default-src"]).toEqual(["'self'"]));
  it("allows only the site's own scripts and inline scripts, never eval, in production", () => {
    expect(prod["script-src"]).toEqual(["'self'", "'unsafe-inline'"]);
  });
  it("allows eval only in development (hot reloading)", () => expect(dev["script-src"]).toContain("'unsafe-eval'"));
  it("allows no remote origin in any directive", () => {
    for (const [name, values] of Object.entries({ ...prod })) {
      for (const v of values) expect(v, name).not.toMatch(/^(https?:|\*|wss?:)/);
    }
  });
  it("forbids plugins, framing, and a changed base or form target", () => {
    expect(prod["object-src"]).toEqual(["'none'"]);
    expect(prod["frame-ancestors"]).toEqual(["'none'"]);
    expect(prod["base-uri"]).toEqual(["'self'"]);
    expect(prod["form-action"]).toEqual(["'self'"]);
  });
  it("lets the page connect only to itself", () => expect(prod["connect-src"]).toEqual(["'self'"]));
  it("is the same in development apart from eval", () => {
    expect({ ...dev, "script-src": prod["script-src"] }).toEqual(prod);
  });
});

describe("securityHeaders", () => {
  const h = byName(securityHeaders(false));

  it("sends the policy", () => expect(h["Content-Security-Policy"]).toBe(contentSecurityPolicy(false)));
  it("sends the development policy in development", () => {
    expect(byName(securityHeaders(true))["Content-Security-Policy"]).toBe(contentSecurityPolicy(true));
  });
  it("sends HSTS for two years including subdomains", () => expect(h["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains"));
  it("stops MIME sniffing", () => expect(h["X-Content-Type-Options"]).toBe("nosniff"));
  it("refuses to be framed, in both the old and the new header", () => {
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(directives(h["Content-Security-Policy"] as string)["frame-ancestors"]).toEqual(["'none'"]);
  });
  it("sends a referrer policy that does not leak paths cross-origin", () => expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin"));
  it("turns off the powerful browser features the site never uses", () => {
    const policy = h["Permissions-Policy"] as string;
    for (const feature of ["camera", "microphone", "geolocation", "payment", "usb"]) expect(policy).toContain(`${feature}=()`);
  });
  it("isolates the browsing context", () => expect(h["Cross-Origin-Opener-Policy"]).toBe("same-origin"));
  it("has no duplicate header names", () => {
    const names = securityHeaders(false).map((x) => x.key);
    expect(new Set(names).size).toBe(names.length);
  });
});
