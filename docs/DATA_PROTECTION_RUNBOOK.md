# Data Protection Runbook

Operational guide for protecting Vegalta Sendai Hispano member data.

## Data inventory

The `members` collection stores the minimum data needed to issue and recover a
digital community card:

| Field | Purpose | Notes |
|-------|---------|-------|
| `memberNumber` | Sequential internal member number | Publicly represented as `displayId`. |
| `displayId` | Public member ID (`VS-0001`) | May appear on cards and verification pages. |
| `firstName` | Card display and recovery email personalization | Personal data. |
| `lastName` | Card display and verification | Personal data. |
| `email` | Duplicate prevention and card recovery | Personal data; do not expose in public APIs. |
| `country` | Optional community/card metadata | Personal data if combined with name/ID. |
| `accessTokenHash` | Private card access token verifier | SHA-256 hash only; never store the raw token. |
| `tokenVersion` | Private token rotation counter | Increment when issuing a new private token. |

Recovery tokens are stored in Upstash Redis as SHA-256 hashes with a short TTL.
Raw recovery tokens are only sent to the user by email.

## Existing controls

- Appwrite collections are server-only: no public collection permissions.
- Browser traffic must use the application API routes, not direct Appwrite reads.
- Private card access tokens are generated with 32 random bytes and stored hashed.
- Recovery tokens are generated with 32 random bytes, stored hashed, expire after
  30 minutes, and are deleted after successful use.
- Registration, member lookup, and recovery routes are rate limited in
  production through Upstash Redis.
- Member lookup returns `404` for missing members and invalid tokens to avoid
  confirming whether a member ID exists.
- Public verification tokens do not grant access to the private card URL.

## Deleting a member

Use this procedure when a member requests deletion of their personal data.

1. Verify the requester controls the registered email address.
2. Locate the member by exact email in Appwrite.
3. Record only the deletion request metadata needed for accountability:
   request date, deletion date, and operator. Do not keep the deleted personal
   data in a separate file.
4. Delete the member document from the `members` collection.
5. Do not decrement or reuse `memberNumber`; sequential IDs are append-only.
6. Delete any related recovery keys if known. If not known, wait for the
   recovery TTL to expire.
7. Confirm deletion to the requester.

Recommended follow-up: add a small admin-only script for this procedure once
there is an authenticated operator workflow. Until then, perform deletion in
the Appwrite console with a second-person review.

## Rotating a member private token

Use token rotation when a private card URL may have been shared accidentally.

1. Confirm the requester controls the registered email address.
2. Trigger the existing recovery flow or manually issue a new 32-byte access
   token through the application code path.
3. Store only the new `accessTokenHash`.
4. Increment `tokenVersion`.
5. Tell the member that old card and wallet URLs no longer work.

Never send or store the raw token outside the recovery/issuance response.

## Rotating application secrets

Rotate secrets after suspected exposure, compromised CI, accidental logging, or
operator turnover.

### Appwrite API key

1. Create a new Appwrite API key with the minimum required database scopes.
2. Add it as `APPWRITE_API_KEY` in GitHub Actions/Cloudflare secret storage.
3. Deploy the Worker.
4. Verify registration and member lookup.
5. Revoke the old Appwrite API key.

### Member verification secret

`MEMBER_VERIFICATION_SECRET` signs public verification tokens and legacy private
tokens. Rotating it invalidates existing public verification URLs and any legacy
private tokens that have no `accessTokenHash`.

1. Prefer migrating all members to hashed random private tokens before rotation.
2. Set a new `MEMBER_VERIFICATION_SECRET`.
3. Deploy the Worker.
4. Ask members to recover their cards if public verification QR codes fail.

### Upstash and email provider secrets

1. Rotate the provider token in its dashboard.
2. Update the Worker/GitHub secret.
3. Deploy and verify the affected flow.
4. Revoke the old token.

## Incident response

For any suspected personal-data breach:

1. Stop the source of exposure, for example disable registration or revoke a
   leaked key.
2. Preserve minimal evidence: timestamps, affected service, suspected scope, and
   actions taken.
3. Determine whether names, emails, countries, tokens, or provider credentials
   were exposed.
4. Rotate affected secrets.
5. Invalidate or reissue member private tokens if card URLs may be exposed.
6. Notify affected users and, when legally required, the relevant authority.
7. Document the final timeline and preventive fix.

Do not paste personal data into issue trackers, PRs, chat logs, or public
documents while investigating.

## Review cadence

- Quarterly: review Appwrite collection permissions and API key scopes.
- Quarterly: run `npm audit --omit=dev` and review GitHub security alerts.
- After each security PR: verify production CORS, headers, and Appwrite public
  access checks.
- After any deploy workflow change: confirm runtime secrets are scoped to the
  minimum required steps.
- Security contact for researchers: `/.well-known/security.txt` (see
  [SECURITY_AUDIT_CHECKLIST.md](SECURITY_AUDIT_CHECKLIST.md)).
