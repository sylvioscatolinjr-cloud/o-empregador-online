create index if not exists access_events_actor on pilot_private.access_events(actor_id);
create index if not exists access_events_cohort on pilot_private.access_events(cohort_id);
create index if not exists invitations_redeemed_by on pilot_private.invitations(redeemed_by);
