# Ordered public feeds — verified paid plan ordering

Ordering applies before pagination: featured, verified paid tier, then organization/title; public candidate cards use validated professional points before name. Only opted-in candidate projections are returned; billing identifiers, tiers and ledger data stay private. Existing filters and carousel behavior are retained.

Production migrations: 20261022102931, 20261022103521 and 20261022110515. Invoker privileges are limited to Auth ID, confirmation timestamp and ban timestamp; browser roles receive no privileges. No new definer function is introduced.

Sylvio explicitly authorized the demo exception on 2026-10-22 after automatic review: an active confirmed membership AND its displayed listing/card must both be marked fictitious to retain visibility when login is banned. Real records from banned accounts stay hidden; login bans are unchanged. Production feed queries return 50 jobs, 50 courses and 50 candidate cards. Pagination limits the returned page, not the ordered input set.

Privacy: existing public listing purpose and candidate opt-in remain; no new data collection or wallet charge. Auth status is used server-side to restrict public projection; passwords, emails and sessions are not read. No new retained personal data. Existing correction/removal paths remain. This is a technical review, not legal certification.

Updated: organization-average ordering and optional distance are integrated; see ORGANIZATION-POINTS-AND-DISTANCE.md. Delegated plan entitlements and authenticated browser QA remain pending.
