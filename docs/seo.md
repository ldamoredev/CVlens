# SEO audit

Phase 8 reviews the public home page at <https://cvlens.up.railway.app>. The work stays
inside the existing privacy and security model: no analytics, tracking, external fonts,
external scripts, or third-party assets were added.

## Lighthouse baseline and result

Both runs used Lighthouse 13.4.0 with its mobile defaults against the public production
URL. The measurements are lab snapshots, so performance values can vary between runs;
the SEO, accessibility, endpoint, and console changes are the relevant release checks.

| Audit | Before (2026-07-14 23:33 UTC) | After (2026-07-14 23:44 UTC) |
| --- | ---: | ---: |
| Performance | 78 | 99 |
| Accessibility | 96 | 100 |
| Best Practices | 92 | 96 |
| SEO | 100 | 100 |

The baseline SEO category was already 100 because Lighthouse marked the absent canonical
and robots checks as not applicable. Direct HTTP inspection still found `/favicon.ico`,
`/robots.txt`, and `/sitemap.xml` returning 404. The favicon request caused the single
browser-console error, and the accessibility audit reported 11 low-contrast elements.

After deployment:

- favicon, 512 px app icon, 180 px Apple icon, `robots.txt`, and `sitemap.xml` return 200
  with the expected MIME types;
- Lighthouse evaluates both `robots.txt` and the canonical URL and they pass;
- console errors and contrast failures are both zero;
- one generic Chrome “Content security policy” inspector issue remains in Lighthouse
  without a URL or actionable detail. It produces the remaining Best Practices deduction,
  but the browser console is clean and the nonce checks below pass.

## Metadata and crawl surface

The root metadata now includes a canonical URL, index/follow directives (including
Googlebot preview directives), CVLens authorship/publisher fields, focused keywords, and
the existing OpenGraph/Twitter metadata. All canonical, author, OpenGraph, Twitter, JSON-LD,
robots, and sitemap URLs resolve to `https://cvlens.up.railway.app` in production.

`CVLENS_SITE_URL` is normalized to an HTTP(S) origin and rejects embedded credentials.
`robots.txt` allows the public site while excluding `/api/` and `/health`; the sitemap lists
only the canonical home page because CVLens currently has no other indexable pages.

The optional structured data describes CVLens as a free `WebApplication` in Spanish and
English. Its inline `application/ld+json` script receives the request nonce propagated by
`src/proxy.ts`. Production inspection found 14 script tags and confirmed every one carried
the same nonce declared by the response CSP. No external origin is requested.

## Semantic and visual review

The home and result flows use one visible `h1`, followed by `h2` sections and `h3` findings
where applicable. Header, main, section/article, complementary, and footer landmarks expose
the page structure. There are no HTML images without alt text; decorative SVGs are hidden
from assistive technology and the score graphic has an accessible label.

The interface updates the document `lang` attribute when the user selects Spanish or
English, including when a cached analysis selects its CV language. The browser review at
390 px and 1440 px found no horizontal overflow in dark or light theme. The cached example
flow still completes without an API call, and the browser console contained no warnings or
errors.

## Production security regression check

The deployed home continues to return:

- nonce-based `Content-Security-Policy` with `default-src 'self'` and no production
  `unsafe-eval`;
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`;
- `X-Frame-Options: DENY`;
- `X-Content-Type-Options: nosniff`.

No extraction, rubric, cached-fixture, upload, rate-limit, timeout, logging, or privacy
boundary changed during this phase.
