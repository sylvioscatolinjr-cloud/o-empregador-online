// Emits SQL for existing, banned demonstration accounts only. Never creates real users.
import {readFile,writeFile} from 'node:fs/promises';
const a=JSON.parse(await readFile(new URL('../db/fixtures/card-images.json',import.meta.url),'utf8'));
const sql=`do $$ declare r record; image_value text; begin
for r in select u.id,u.email,m.role,substring(u.email from '-([0-9]{2})@')::int as n from auth.users u join public.pilot_memberships m on m.user_id=u.id join public.pilot_cohorts c on c.id=m.cohort_id where c.slug='senai-sumare-2026' and m.is_fictitious and u.raw_app_meta_data->>'demo'='true' and u.banned_until>now() and u.email ~ '^(learner|recruiter|school_staff)-(0[1-9]|[1-4][0-9]|50)@demo[.]oempregador[.]invalid$' loop
if r.role='learner' then
 image_value=case when r.n%2=0 then '${a.man}' else '${a.woman}' end;
 update public.pilot_profiles set photo_data=case when r.n<=25 then image_value else '' end where user_id=r.id;
 update public.portal_candidate_cards set show_card_image=(r.n<=25) where user_id=r.id and is_fictitious;
else
 image_value=case when r.role='recruiter' then '${a.company}' else '${a.school}' end;
 update public.portal_organizations set logo_data=case when r.n<=25 then image_value else '' end,show_card_image=(r.n<=25) where user_id=r.id;
end if;
end loop;
end $$;`;
if(!process.argv[2])throw Error('Provide output SQL path');await writeFile(process.argv[2],sql);
