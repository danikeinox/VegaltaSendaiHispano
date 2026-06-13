# CSP migration plan

Production currently ships a **enforcing** Content-Security-Policy that
includes `'unsafe-inline'` for scripts and styles. This is common with Next.js
App Router inline bootstrap scripts, but it increases XSS impact if injection
ever appears.

## Current state

- **Enforcing CSP** (`Content-Security-Policy`): allows `'unsafe-inline'` on
  `script-src` and `style-src` so the app and Turnstile work without nonces.
- **Report-only CSP** (`Content-Security-Policy-Report-Only`): stricter target
  without `'unsafe-inline'`. Violations appear in browser devtools only; they do
  not block users.

Both policies are defined in `next.config.ts`.

## Goal

Move to nonce- or hash-based `script-src` / `style-src` and remove
`'unsafe-inline'` from the enforcing policy.

## Recommended phases

1. **Observe (now)** — Report-only header enabled. After deploy, spot-check home,
   registration, recovery, and carnet pages in Chrome DevTools → Console for CSP
   violation reports.
2. **Next.js nonces** — Adopt framework-supported nonces for inline scripts
   (Next.js 15+ middleware or documented CSP nonce pattern for App Router).
3. **Styles** — Prefer Tailwind compiled CSS without inline `style=""` where
   possible; hash static inline blocks if any remain.
4. **Turnstile** — Keep `https://challenges.cloudflare.com` in `script-src` and
   `frame-src`; verify widget after each CSP change.
5. **Enforce** — When report-only is clean in production for one release cycle,
   copy the strict policy into `Content-Security-Policy` and remove report-only
   (or keep report-only with a stricter experimental policy).

## Optional: reporting endpoint

To collect violations centrally, add a `report-uri` or `report-to` directive
pointing at a Cloudflare Worker or logging endpoint. Not required for the first
phase.

## References

- [SECURITY_AUDIT_CHECKLIST.md](SECURITY_AUDIT_CHECKLIST.md)
- [Next.js Content Security Policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
