# OEO AI Agents — Implementation contract (20 Oct 2026)

Status: approved product scope, implementation pending. Branch: feature/oeo-ai-agents. Do not deploy or charge real users until tests pass.

## Profiles
- Candidate: career diagnostics, truthful CV improvement, vacancy matching with evidence, gap analysis, career GPS with milestones, course suggestions, interview practice, progress tracking.
- Company: job description assistance, transparent skill-based candidate matching (human decision), departmental competency diagnostics, training paths, retention aggregates, succession planning.
- Institution: anonymized regional demand radar, curriculum suggestions, student/graduate employability metrics with consent, course proposals, company partnerships.

## Shared technical contract
- Resolve authenticated identity server-side; role and organization membership must come from trusted database records, never browser input.
- Endpoints: POST /api/ai/chat (profile-aware), POST /api/ai/analyze, GET /api/ai/goals, POST /api/ai/goals, GET /api/ai/usage; precise API naming may adapt to existing routing.
- Store agent conversations, goals, recommendations, evidence, progress events, token/cost ledger, credit debits, and idempotency keys in tenant-isolated tables with RLS.
- Default to data minimization, explicit consent for cross-profile personal data, aggregate demand reports with suppression of small cohorts, age-appropriate privacy.
- AI never autonomously hires, rejects, promotes, grades, purchases, or publishes without human confirmation.
- Credit debit must be atomic, idempotent and server-authoritative; limits must not be enforced only by UI. Cost ceilings and rate limits required.
- Recommendations should distinguish verified platform data from model suggestions and show source/evidence and confidence.

## Commercial presentation
- Homepage: three audience-specific feature sections and unified evolution narrative; no prices. CTAs to respective feature pages and plan comparisons.
- Pricing: candidate free/19.90/49.90/99.90 BRL monthly; organization free/99/599/2990 BRL monthly, subject to existing authoritative billing configuration. Explicit feature matrix, limits, AI credits and upgrades; do not mislabel unimplemented features as live.
- Existing billing, Asaas webhooks, access entitlements and upgrade/downgrade handling must be verified before enabling real subscriptions.

## Implementation order and acceptance
1. Inventory existing auth, billing, page routes, migrations and tests. Verify deployment source: public repo is a snapshot and may not be the Vercel source of truth.
2. Implement isolated server-side AI adapter and test provider failure, quota exhaustion, injection resistance, cross-tenant access and cost ledger.
3. Implement candidate career tools and goal persistence; run integration and UI tests.
4. Implement company and institution analyses, ensuring privacy/consent and human review.
5. Implement homepage and pricing feature comparisons, accessibility/mobile tests.
6. Staging smoke tests with synthetic accounts in all three roles; explicit production approval only after security and billing checks.

## Release gates
- npm test and npm run build pass.
- RLS verified with two distinct accounts per profile and organization.
- No private identifiers in AI prompts/logs without necessary consent and protection.
- No claims of live capabilities without working backend tests.
- Production deployment and payment changes must be separately verified.
