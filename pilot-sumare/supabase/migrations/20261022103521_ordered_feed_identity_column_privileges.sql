-- Server-only identity status; no email, credentials or session data.
grant select (id,email_confirmed_at,banned_until) on auth.users to service_role;
