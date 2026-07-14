# Production hardening

Phase 6 hardens the existing upload and result flow without changing the extraction
contract or deterministic rubric.

## Request boundary and quota

`POST /api/analyze` accepts only bounded `multipart/form-data` requests with a boundary
and a positive decimal `Content-Length`. The request is rejected before `formData()` when
the declared body exceeds the 8 MiB upload limit plus 64 KiB multipart allowance. Browser
cross-site submissions are rejected through Fetch Metadata; malformed bodies are mapped
to a generic request error.

Each source address receives three analysis attempts per ten-minute fixed window. The
address is hashed with a random process-local salt before it becomes a map key, the map is
bounded to 10,000 entries, and no raw address is logged or exposed. A rejected request
returns `429`, `Retry-After`, and aggregate quota headers. State resets on restart, which
is an intentional MVP tradeoff; `railway.json` fixes the service to one replica so quota
state remains coherent. The deployment edge must supply a trustworthy
`X-Forwarded-For` or `X-Real-IP` header.

## Provider limits and errors

The Anthropic SDK has retries disabled, a 60-second attempt timeout, and a shared
75-second deadline across the initial extraction and optional single reinspection. The
incoming request abort signal also cancels provider work. The Next.js route has a
90-second maximum duration.

Provider response bodies and error messages are never returned. The public API exposes
only stable codes:

| Condition | HTTP | Public code |
| --- | ---: | --- |
| Invalid or unbounded request | 400/403/411/415 | `invalid_request` |
| Invalid or oversized upload | 400/413/415 | `invalid_format` / `file_too_large` |
| Local quota exhausted | 429 | `rate_limited` |
| Valid extraction still fails the schema | 422 | `insufficient` |
| Provider busy or quota | 503 | `provider_busy` |
| Provider connection failure | 502 | `provider_unavailable` |
| Deadline exceeded | 504 | `timeout` |
| Missing configuration or unknown failure | 502/503 | `technical_error` |

All analysis responses set `Cache-Control: no-store`.

## Browser security

The root document receives a per-request CSP nonce. Production scripts require the nonce,
objects and framing are denied, forms and base URLs are same-origin, and connections are
same-origin. Inline styles remain allowed because the result meters use bounded React
style attributes. `next build --webpack` is deliberate: Next.js nonce propagation for App
Router pages currently depends on the webpack production build.

Static headers add MIME sniffing protection, no-referrer behavior, frame denial,
restricted browser capabilities, same-origin opener/resource policies, and production
HSTS. QA query-string states are disabled in production unless the server-only
`CVLENS_ENABLE_PREVIEW_STATES=true` switch is set deliberately.

## Privacy, health, and metrics

The visible notice states that CVLens does not store the CV and that Anthropic processes
it for the analysis. Upload buffers remain request-local and are zeroed by the upload
pipeline after success or failure. Application code does not log CV content, filenames,
contact details, provider payloads, or raw addresses.

`GET /health` returns `status`, process uptime, and only aggregate analysis counters:
in-flight count, outcome counts, and four coarse duration buckets. It does not reveal
environment values, model configuration, file metadata, or user identifiers and is
always `no-store`. Railway uses this endpoint for service health checks.

## Railway readiness

`railway.json` selects Railpack, `pnpm build`, `pnpm start`, `/health`, one replica, and a
bounded restart-on-failure policy. Phase 6 does not create or deploy a Railway project.
The service still requires `ANTHROPIC_API_KEY` and may optionally receive
`ANTHROPIC_MODEL`; public deployment remains Phase 7.
