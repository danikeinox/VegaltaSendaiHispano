# Security audit checklist (level 2)

Operational follow-up for the 2026-06-11 grey-box audit. Code items are tracked
in git; platform items require console configuration.

## Code changes (this repository)

| Item | Status | Notes |
|------|--------|-------|
| CORS fail-closed for disallowed origins | Done | PR #14 |
| Locale bypass for metadata/dotfiles | Done | PR #14 |
| Deploy secrets scoped to upload step | Done | PR #15 |
| Data protection runbook | Done | PR #16 — `DATA_PROTECTION_RUNBOOK.md` |
| Turnstile on `/api/recover` | Done | feat/security-audit-level2 |
| Distinct `TURNSTILE_FAILED` message | Done | feat/security-audit-level2 |
| `/.well-known/security.txt` | Done | `public/.well-known/security.txt` |
| CSP report-only (stricter target) | Done | `next.config.ts` — see `CSP_MIGRATION.md` |

## GitHub (manual)

- [ ] **Branch protection** on `master`: require pull request, at least one
      approval, and required status checks (`security.yml`).
- [ ] **Environment** for production deploy (optional): required reviewers before
      `workflow_dispatch` or deploy jobs that touch Worker secrets.
- [ ] Confirm **Dependabot** and **security.yml** stay enabled.

## Cloudflare (manual)

- [ ] After each security deploy, re-run probes:
  - `OPTIONS /api/register` with `Origin: https://evil.example` → no
    `Access-Control-Allow-Origin` header.
  - `GET /sitemap.xml`, `/robots.txt`, `/.well-known/security.txt` → 200 at
    root (no redirect to `/es/...`).
- [ ] Review **WAF / bot rules** for `/api/register` and `/api/recover`.
- [ ] Configure **alerts** for spikes in 4xx, 429, and 5xx on API routes (plan
      permitting).

## Appwrite (manual)

- [ ] Collections remain **server-only** (no public read/write).
- [ ] API key in Cloudflare has **minimum scopes** (database only).
- [ ] Rotate `APPWRITE_API_KEY` if a build ever ran with runtime secrets in
      job-wide env (before PR #15).

## Upstash (manual)

- [ ] Monitor command usage after recovery/register abuse attempts.
- [ ] Use separate key prefixes if a staging environment is added.

## Post-deploy smoke tests

```bash
curl -sI -X OPTIONS "https://www.vegalta.es/api/register" \
  -H "Origin: https://evil.example" | grep -i access-control

curl -sI "https://www.vegalta.es/sitemap.xml" | grep -i location
curl -sI "https://www.vegalta.es/.well-known/security.txt" | head
curl -sI "https://www.vegalta.es/llms.txt" | head
```

## Related docs

- [DATA_PROTECTION_RUNBOOK.md](DATA_PROTECTION_RUNBOOK.md)
- [CSP_MIGRATION.md](CSP_MIGRATION.md)
- [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md)
