-- Every five minutes: reminders around 24h before due and one due-cycle debit.
select cron.schedule('oeo-wallet-renewals','*/5 * * * *','select public.portal_wallet_renewals();');
