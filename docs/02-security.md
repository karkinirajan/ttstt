# 02. Security

The site is static: it has no server code of its own, reads no environment variable, stores nothing, and calls no API at run time. Its
attack surface is what the browser is told to do with the pages, and the data that goes into them.

## What was looked at

| Area | Finding |
|---|---|
| Secrets | None in the tree or the 10 commits (a pattern scan, counts only; `.env*` files were not read, and none was ever tracked). The site uses no key. |
| Dependencies | `npm audit`: 0 vulnerabilities, before and after (the `minimatch` override keeps the lint tools clean). |
| Injection | No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `fetch` or `localStorage` anywhere in `src/`. Provider text is rendered by React, which escapes it. |
| External links | Every `target="_blank"` link has `rel="noopener noreferrer"` (checked in the rendered pages). A test also requires every `website` and `pricingUrl` in the data to be an `https:` URL without credentials. |
| Browser hardening | **Missing at the start**: no CSP, HSTS, framing or sniffing protection, and the `X-Powered-By` header was sent. |

## What was added

`next.config.ts` now sends, on every route (`src/lib/security-headers.ts`, 16 tests, 29 deliberate bugs that they catch):

| Header | Value |
|---|---|
| Content-Security-Policy | `default-src 'self'`; scripts and styles from the site plus inline (Next.js writes small inline scripts without a nonce); images and fonts from the site (fonts are self-hosted by `next/font` at build time); `connect-src 'self'`; no plugins; `frame-ancestors 'none'`; `base-uri` and `form-action` the site only. Development adds `'unsafe-eval'` for hot reloading. |
| Strict-Transport-Security | two years, including subdomains |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | camera, microphone, geolocation, payment, USB off |
| Cross-Origin-Opener-Policy | `same-origin` |

Checked on the built site (`next start`): all headers present, `X-Powered-By` gone (`poweredByHeader: false`), all three pages loaded in
Chromium with **no console errors or CSP violations**, and the only origin the page contacted was its own.

## Known and left alone

- The CSP allows `'unsafe-inline'` scripts and styles (Next.js inline scripts have no nonce here). With no user input and no stored
  content, there is nothing for an injected script to come from.
- HSTS is sent on every response, including development on `localhost` (browsers ignore it over plain http). If a subdomain is ever served
  without HTTPS, drop `includeSubDomains`.
- The provider data (prices, benchmark scores, compliance claims) is trusted as written. It is the owner's research and was not
  re-verified.
