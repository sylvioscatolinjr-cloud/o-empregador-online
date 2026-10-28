-- Created during preparation; deliberately inactive until rollout validation and activation.
select cron.schedule('oeo-wallet-renewals','*/5 * * * *','select public.portal_wallet_renewals();');
select cron.alter_job(jobid,active:=false) from cron.job where jobname='oeo-wallet-renewals';
