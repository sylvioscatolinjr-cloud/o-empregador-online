do $$
declare v_cohort uuid;v_user uuid;begin
select id into strict v_cohort from public.pilot_cohorts where slug='senai-sumare-2026';

-- learner 01
select id into v_user from auth.users where email='learner-01@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-01@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Ana Modelo 01'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Ana Modelo 01','Campinas','SP','Técnico em impressão 3D, Comunicação, Trabalho em equipe, SolidWorks — peças e montagens','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em impressão 3D.','Experiência simulada em Nexo Soluções 01 — Demonstração nas atividades de técnico em impressão 3d.','Curso técnico — instituição fictícia','SolidWorks — peças e montagens; Inglês básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Ana Modelo 01','Técnico em impressão 3D Júnior','Campinas','SP','Técnico em impressão 3D, Comunicação, Trabalho em equipe, SolidWorks — peças e montagens',true,true,true,'{"display_name":"Ana Modelo 01","city":"Campinas","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em impressão 3D.","experience":"Experiência simulada em Nexo Soluções 01 — Demonstração nas atividades de técnico em impressão 3d.","education":"Curso técnico — instituição fictícia","courses":"SolidWorks — peças e montagens; Inglês básico","skills":"Técnico em impressão 3D, Comunicação, Trabalho em equipe, SolidWorks — peças e montagens","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 01
select id into v_user from auth.users where email='recruiter-01@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-01@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 01 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 01 — Demonstração','Campinas','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico em impressão 3D Júnior','Nexo Soluções 01 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico em impressão 3D Júnior, com conhecimentos de Técnico em impressão 3D, Comunicação, Trabalho em equipe, SolidWorks — peças e montagens. Jornada e benefícios ilustrativos. Não representa contratação real.','13010000','Campinas','SP','Presencial','CLT',true,true);
end if;

-- school_staff 01
select id into v_user from auth.users where email='school_staff-01@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-01@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 01 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 01 — Demonstração','Campinas','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Inglês básico','Instituto Horizonte 01 — Demonstração','Curso fictício de Inglês básico. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13010000','Campinas','SP','Presencial',null,true,true);
end if;

-- learner 02
select id into v_user from auth.users where email='learner-02@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-02@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Bruno Modelo 02'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Bruno Modelo 02','Sumaré','SP','Projetista SolidWorks, Comunicação, Trabalho em equipe, Impressão 3D FDM','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Projetista SolidWorks.','Experiência simulada em Nexo Soluções 02 — Demonstração nas atividades de projetista solidworks.','Graduação tecnológica — instituição fictícia','Impressão 3D FDM; Inglês intermediário','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Bruno Modelo 02','Projetista SolidWorks Júnior','Sumaré','SP','Projetista SolidWorks, Comunicação, Trabalho em equipe, Impressão 3D FDM',true,true,true,'{"display_name":"Bruno Modelo 02","city":"Sumaré","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Projetista SolidWorks.","experience":"Experiência simulada em Nexo Soluções 02 — Demonstração nas atividades de projetista solidworks.","education":"Graduação tecnológica — instituição fictícia","courses":"Impressão 3D FDM; Inglês intermediário","skills":"Projetista SolidWorks, Comunicação, Trabalho em equipe, Impressão 3D FDM","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 02
select id into v_user from auth.users where email='recruiter-02@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-02@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 02 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 02 — Demonstração','Sumaré','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Projetista SolidWorks Júnior','Nexo Soluções 02 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Projetista SolidWorks Júnior, com conhecimentos de Projetista SolidWorks, Comunicação, Trabalho em equipe, Impressão 3D FDM. Jornada e benefícios ilustrativos. Não representa contratação real.','13170000','Sumaré','SP','Online','PJ',true,true);
end if;

-- school_staff 02
select id into v_user from auth.users where email='school_staff-02@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-02@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 02 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 02 — Demonstração','Sumaré','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Inglês intermediário','Instituto Horizonte 02 — Demonstração','Curso fictício de Inglês intermediário. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13170000','Sumaré','SP','Online',null,true,true);
end if;

-- learner 03
select id into v_user from auth.users where email='learner-03@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-03@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Carla Modelo 03'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Carla Modelo 03','São Paulo','SP','Desenhista CAD, Comunicação, Trabalho em equipe, Impressão 3D em resina','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Desenhista CAD.','Experiência simulada em Nexo Soluções 03 — Demonstração nas atividades de desenhista cad.','Curso técnico — instituição fictícia','Impressão 3D em resina; Inglês para entrevistas','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Carla Modelo 03','Desenhista CAD Júnior','São Paulo','SP','Desenhista CAD, Comunicação, Trabalho em equipe, Impressão 3D em resina',true,true,true,'{"display_name":"Carla Modelo 03","city":"São Paulo","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Desenhista CAD.","experience":"Experiência simulada em Nexo Soluções 03 — Demonstração nas atividades de desenhista cad.","education":"Curso técnico — instituição fictícia","courses":"Impressão 3D em resina; Inglês para entrevistas","skills":"Desenhista CAD, Comunicação, Trabalho em equipe, Impressão 3D em resina","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 03
select id into v_user from auth.users where email='recruiter-03@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-03@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 03 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 03 — Demonstração','São Paulo','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Desenhista CAD Júnior','Nexo Soluções 03 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Desenhista CAD Júnior, com conhecimentos de Desenhista CAD, Comunicação, Trabalho em equipe, Impressão 3D em resina. Jornada e benefícios ilustrativos. Não representa contratação real.','01001000','São Paulo','SP','Híbrido','Estágio',true,true);
end if;

-- school_staff 03
select id into v_user from auth.users where email='school_staff-03@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-03@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 03 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 03 — Demonstração','São Paulo','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Inglês para entrevistas','Instituto Horizonte 03 — Demonstração','Curso fictício de Inglês para entrevistas. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','01001000','São Paulo','SP','Híbrido',null,true,true);
end if;

-- learner 04
select id into v_user from auth.users where email='learner-04@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-04@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Diego Modelo 04'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Diego Modelo 04','Jundiaí','SP','Operador CNC, Comunicação, Trabalho em equipe, Modelagem CAD 2D','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Operador CNC.','Experiência simulada em Nexo Soluções 04 — Demonstração nas atividades de operador cnc.','Graduação tecnológica — instituição fictícia','Modelagem CAD 2D; Inglês técnico industrial','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Diego Modelo 04','Operador CNC Júnior','Jundiaí','SP','Operador CNC, Comunicação, Trabalho em equipe, Modelagem CAD 2D',true,true,true,'{"display_name":"Diego Modelo 04","city":"Jundiaí","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Operador CNC.","experience":"Experiência simulada em Nexo Soluções 04 — Demonstração nas atividades de operador cnc.","education":"Graduação tecnológica — instituição fictícia","courses":"Modelagem CAD 2D; Inglês técnico industrial","skills":"Operador CNC, Comunicação, Trabalho em equipe, Modelagem CAD 2D","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 04
select id into v_user from auth.users where email='recruiter-04@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-04@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 04 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 04 — Demonstração','Jundiaí','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Operador CNC Júnior','Nexo Soluções 04 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Operador CNC Júnior, com conhecimentos de Operador CNC, Comunicação, Trabalho em equipe, Modelagem CAD 2D. Jornada e benefícios ilustrativos. Não representa contratação real.','13201000','Jundiaí','SP','Presencial','Jovem Aprendiz',true,true);
end if;

-- school_staff 04
select id into v_user from auth.users where email='school_staff-04@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-04@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 04 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 04 — Demonstração','Jundiaí','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Inglês técnico industrial','Instituto Horizonte 04 — Demonstração','Curso fictício de Inglês técnico industrial. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13201000','Jundiaí','SP','Presencial',null,true,true);
end if;

-- learner 05
select id into v_user from auth.users where email='learner-05@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-05@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Elisa Modelo 05'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Elisa Modelo 05','Curitiba','PR','Técnico em eletroeletrônica, Comunicação, Trabalho em equipe, Programação CNC','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em eletroeletrônica.','Experiência simulada em Nexo Soluções 05 — Demonstração nas atividades de técnico em eletroeletrônica.','Curso técnico — instituição fictícia','Programação CNC; Espanhol básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Elisa Modelo 05','Técnico em eletroeletrônica Júnior','Curitiba','PR','Técnico em eletroeletrônica, Comunicação, Trabalho em equipe, Programação CNC',true,true,true,'{"display_name":"Elisa Modelo 05","city":"Curitiba","state_code":"PR","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em eletroeletrônica.","experience":"Experiência simulada em Nexo Soluções 05 — Demonstração nas atividades de técnico em eletroeletrônica.","education":"Curso técnico — instituição fictícia","courses":"Programação CNC; Espanhol básico","skills":"Técnico em eletroeletrônica, Comunicação, Trabalho em equipe, Programação CNC","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 05
select id into v_user from auth.users where email='recruiter-05@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-05@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 05 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 05 — Demonstração','Curitiba','PR') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico em eletroeletrônica Júnior','Nexo Soluções 05 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico em eletroeletrônica Júnior, com conhecimentos de Técnico em eletroeletrônica, Comunicação, Trabalho em equipe, Programação CNC. Jornada e benefícios ilustrativos. Não representa contratação real.','80010000','Curitiba','PR','Online','Temporário',true,true);
end if;

-- school_staff 05
select id into v_user from auth.users where email='school_staff-05@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-05@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 05 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 05 — Demonstração','Curitiba','PR') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Espanhol básico','Instituto Horizonte 05 — Demonstração','Curso fictício de Espanhol básico. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','80010000','Curitiba','PR','Online',null,true,true);
end if;

-- learner 06
select id into v_user from auth.users where email='learner-06@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-06@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Fábio Modelo 06'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Fábio Modelo 06','Belo Horizonte','MG','Eletricista de manutenção, Comunicação, Trabalho em equipe, Eletroeletrônica básica','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Eletricista de manutenção.','Experiência simulada em Nexo Soluções 06 — Demonstração nas atividades de eletricista de manutenção.','Graduação tecnológica — instituição fictícia','Eletroeletrônica básica; Espanhol para negócios','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Fábio Modelo 06','Eletricista de manutenção Júnior','Belo Horizonte','MG','Eletricista de manutenção, Comunicação, Trabalho em equipe, Eletroeletrônica básica',true,true,true,'{"display_name":"Fábio Modelo 06","city":"Belo Horizonte","state_code":"MG","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Eletricista de manutenção.","experience":"Experiência simulada em Nexo Soluções 06 — Demonstração nas atividades de eletricista de manutenção.","education":"Graduação tecnológica — instituição fictícia","courses":"Eletroeletrônica básica; Espanhol para negócios","skills":"Eletricista de manutenção, Comunicação, Trabalho em equipe, Eletroeletrônica básica","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 06
select id into v_user from auth.users where email='recruiter-06@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-06@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 06 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 06 — Demonstração','Belo Horizonte','MG') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Eletricista de manutenção Júnior','Nexo Soluções 06 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Eletricista de manutenção Júnior, com conhecimentos de Eletricista de manutenção, Comunicação, Trabalho em equipe, Eletroeletrônica básica. Jornada e benefícios ilustrativos. Não representa contratação real.','30110000','Belo Horizonte','MG','Híbrido','CLT',true,true);
end if;

-- school_staff 06
select id into v_user from auth.users where email='school_staff-06@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-06@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 06 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 06 — Demonstração','Belo Horizonte','MG') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Espanhol para negócios','Instituto Horizonte 06 — Demonstração','Curso fictício de Espanhol para negócios. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','30110000','Belo Horizonte','MG','Híbrido',null,true,true);
end if;

-- learner 07
select id into v_user from auth.users where email='learner-07@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-07@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Gabriela Modelo 07'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Gabriela Modelo 07','Rio de Janeiro','RJ','Mecânico industrial, Comunicação, Trabalho em equipe, Comandos elétricos','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Mecânico industrial.','Experiência simulada em Nexo Soluções 07 — Demonstração nas atividades de mecânico industrial.','Curso técnico — instituição fictícia','Comandos elétricos; Francês iniciante','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Gabriela Modelo 07','Mecânico industrial Júnior','Rio de Janeiro','RJ','Mecânico industrial, Comunicação, Trabalho em equipe, Comandos elétricos',true,true,true,'{"display_name":"Gabriela Modelo 07","city":"Rio de Janeiro","state_code":"RJ","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Mecânico industrial.","experience":"Experiência simulada em Nexo Soluções 07 — Demonstração nas atividades de mecânico industrial.","education":"Curso técnico — instituição fictícia","courses":"Comandos elétricos; Francês iniciante","skills":"Mecânico industrial, Comunicação, Trabalho em equipe, Comandos elétricos","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 07
select id into v_user from auth.users where email='recruiter-07@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-07@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 07 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 07 — Demonstração','Rio de Janeiro','RJ') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Mecânico industrial Júnior','Nexo Soluções 07 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Mecânico industrial Júnior, com conhecimentos de Mecânico industrial, Comunicação, Trabalho em equipe, Comandos elétricos. Jornada e benefícios ilustrativos. Não representa contratação real.','20040000','Rio de Janeiro','RJ','Presencial','PJ',true,true);
end if;

-- school_staff 07
select id into v_user from auth.users where email='school_staff-07@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-07@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 07 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 07 — Demonstração','Rio de Janeiro','RJ') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Francês iniciante','Instituto Horizonte 07 — Demonstração','Curso fictício de Francês iniciante. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','20040000','Rio de Janeiro','RJ','Presencial',null,true,true);
end if;

-- learner 08
select id into v_user from auth.users where email='learner-08@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-08@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Hugo Modelo 08'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Hugo Modelo 08','Porto Alegre','RS','Soldador TIG, Comunicação, Trabalho em equipe, Automação industrial','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Soldador TIG.','Experiência simulada em Nexo Soluções 08 — Demonstração nas atividades de soldador tig.','Graduação tecnológica — instituição fictícia','Automação industrial; Alemão básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Hugo Modelo 08','Soldador TIG Júnior','Porto Alegre','RS','Soldador TIG, Comunicação, Trabalho em equipe, Automação industrial',true,true,true,'{"display_name":"Hugo Modelo 08","city":"Porto Alegre","state_code":"RS","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Soldador TIG.","experience":"Experiência simulada em Nexo Soluções 08 — Demonstração nas atividades de soldador tig.","education":"Graduação tecnológica — instituição fictícia","courses":"Automação industrial; Alemão básico","skills":"Soldador TIG, Comunicação, Trabalho em equipe, Automação industrial","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 08
select id into v_user from auth.users where email='recruiter-08@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-08@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 08 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 08 — Demonstração','Porto Alegre','RS') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Soldador TIG Júnior','Nexo Soluções 08 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Soldador TIG Júnior, com conhecimentos de Soldador TIG, Comunicação, Trabalho em equipe, Automação industrial. Jornada e benefícios ilustrativos. Não representa contratação real.','90010000','Porto Alegre','RS','Online','Estágio',true,true);
end if;

-- school_staff 08
select id into v_user from auth.users where email='school_staff-08@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-08@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 08 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 08 — Demonstração','Porto Alegre','RS') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Alemão básico','Instituto Horizonte 08 — Demonstração','Curso fictício de Alemão básico. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','90010000','Porto Alegre','RS','Online',null,true,true);
end if;

-- learner 09
select id into v_user from auth.users where email='learner-09@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-09@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Isabela Modelo 09'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Isabela Modelo 09','Recife','PE','Técnico em automação, Comunicação, Trabalho em equipe, Soldagem TIG','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em automação.','Experiência simulada em Nexo Soluções 09 — Demonstração nas atividades de técnico em automação.','Curso técnico — instituição fictícia','Soldagem TIG; Italiano para iniciantes','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Isabela Modelo 09','Técnico em automação Júnior','Recife','PE','Técnico em automação, Comunicação, Trabalho em equipe, Soldagem TIG',true,true,true,'{"display_name":"Isabela Modelo 09","city":"Recife","state_code":"PE","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em automação.","experience":"Experiência simulada em Nexo Soluções 09 — Demonstração nas atividades de técnico em automação.","education":"Curso técnico — instituição fictícia","courses":"Soldagem TIG; Italiano para iniciantes","skills":"Técnico em automação, Comunicação, Trabalho em equipe, Soldagem TIG","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 09
select id into v_user from auth.users where email='recruiter-09@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-09@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 09 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 09 — Demonstração','Recife','PE') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico em automação Júnior','Nexo Soluções 09 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico em automação Júnior, com conhecimentos de Técnico em automação, Comunicação, Trabalho em equipe, Soldagem TIG. Jornada e benefícios ilustrativos. Não representa contratação real.','50010000','Recife','PE','Híbrido','Jovem Aprendiz',true,true);
end if;

-- school_staff 09
select id into v_user from auth.users where email='school_staff-09@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-09@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 09 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 09 — Demonstração','Recife','PE') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Italiano para iniciantes','Instituto Horizonte 09 — Demonstração','Curso fictício de Italiano para iniciantes. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','50010000','Recife','PE','Híbrido',null,true,true);
end if;

-- learner 10
select id into v_user from auth.users where email='learner-10@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-10@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','João Modelo 10'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'João Modelo 10','Salvador','BA','Analista de qualidade, Comunicação, Trabalho em equipe, Metrologia','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de qualidade.','Experiência simulada em Nexo Soluções 10 — Demonstração nas atividades de analista de qualidade.','Graduação tecnológica — instituição fictícia','Metrologia; Japonês básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'João Modelo 10','Analista de qualidade Júnior','Salvador','BA','Analista de qualidade, Comunicação, Trabalho em equipe, Metrologia',true,true,true,'{"display_name":"João Modelo 10","city":"Salvador","state_code":"BA","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de qualidade.","experience":"Experiência simulada em Nexo Soluções 10 — Demonstração nas atividades de analista de qualidade.","education":"Graduação tecnológica — instituição fictícia","courses":"Metrologia; Japonês básico","skills":"Analista de qualidade, Comunicação, Trabalho em equipe, Metrologia","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 10
select id into v_user from auth.users where email='recruiter-10@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-10@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 10 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 10 — Demonstração','Salvador','BA') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Analista de qualidade Júnior','Nexo Soluções 10 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Analista de qualidade Júnior, com conhecimentos de Analista de qualidade, Comunicação, Trabalho em equipe, Metrologia. Jornada e benefícios ilustrativos. Não representa contratação real.','40020000','Salvador','BA','Presencial','Temporário',true,true);
end if;

-- school_staff 10
select id into v_user from auth.users where email='school_staff-10@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-10@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 10 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 10 — Demonstração','Salvador','BA') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Japonês básico','Instituto Horizonte 10 — Demonstração','Curso fictício de Japonês básico. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','40020000','Salvador','BA','Presencial',null,true,true);
end if;

-- learner 11
select id into v_user from auth.users where email='learner-11@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-11@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Ana Modelo 11'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Ana Modelo 11','Campinas','SP','Assistente administrativo, Comunicação, Trabalho em equipe, Leitura de desenho técnico','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Assistente administrativo.','Experiência simulada em Nexo Soluções 11 — Demonstração nas atividades de assistente administrativo.','Curso técnico — instituição fictícia','Leitura de desenho técnico; Mandarim introdutório','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Ana Modelo 11','Assistente administrativo Júnior','Campinas','SP','Assistente administrativo, Comunicação, Trabalho em equipe, Leitura de desenho técnico',true,true,true,'{"display_name":"Ana Modelo 11","city":"Campinas","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Assistente administrativo.","experience":"Experiência simulada em Nexo Soluções 11 — Demonstração nas atividades de assistente administrativo.","education":"Curso técnico — instituição fictícia","courses":"Leitura de desenho técnico; Mandarim introdutório","skills":"Assistente administrativo, Comunicação, Trabalho em equipe, Leitura de desenho técnico","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 11
select id into v_user from auth.users where email='recruiter-11@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-11@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 11 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 11 — Demonstração','Campinas','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Assistente administrativo Júnior','Nexo Soluções 11 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Assistente administrativo Júnior, com conhecimentos de Assistente administrativo, Comunicação, Trabalho em equipe, Leitura de desenho técnico. Jornada e benefícios ilustrativos. Não representa contratação real.','13010000','Campinas','SP','Online','CLT',true,true);
end if;

-- school_staff 11
select id into v_user from auth.users where email='school_staff-11@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-11@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 11 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 11 — Demonstração','Campinas','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Mandarim introdutório','Instituto Horizonte 11 — Demonstração','Curso fictício de Mandarim introdutório. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13010000','Campinas','SP','Online',null,true,true);
end if;

-- learner 12
select id into v_user from auth.users where email='learner-12@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-12@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Bruno Modelo 12'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Bruno Modelo 12','Sumaré','SP','Analista de RH, Comunicação, Trabalho em equipe, Manutenção mecânica','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de RH.','Experiência simulada em Nexo Soluções 12 — Demonstração nas atividades de analista de rh.','Graduação tecnológica — instituição fictícia','Manutenção mecânica; Libras introdutório','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Bruno Modelo 12','Analista de RH Júnior','Sumaré','SP','Analista de RH, Comunicação, Trabalho em equipe, Manutenção mecânica',true,true,true,'{"display_name":"Bruno Modelo 12","city":"Sumaré","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de RH.","experience":"Experiência simulada em Nexo Soluções 12 — Demonstração nas atividades de analista de rh.","education":"Graduação tecnológica — instituição fictícia","courses":"Manutenção mecânica; Libras introdutório","skills":"Analista de RH, Comunicação, Trabalho em equipe, Manutenção mecânica","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 12
select id into v_user from auth.users where email='recruiter-12@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-12@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 12 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 12 — Demonstração','Sumaré','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Analista de RH Júnior','Nexo Soluções 12 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Analista de RH Júnior, com conhecimentos de Analista de RH, Comunicação, Trabalho em equipe, Manutenção mecânica. Jornada e benefícios ilustrativos. Não representa contratação real.','13170000','Sumaré','SP','Híbrido','PJ',true,true);
end if;

-- school_staff 12
select id into v_user from auth.users where email='school_staff-12@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-12@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 12 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 12 — Demonstração','Sumaré','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Libras introdutório','Instituto Horizonte 12 — Demonstração','Curso fictício de Libras introdutório. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13170000','Sumaré','SP','Híbrido',null,true,true);
end if;

-- learner 13
select id into v_user from auth.users where email='learner-13@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-13@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Carla Modelo 13'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Carla Modelo 13','São Paulo','SP','Auxiliar de logística, Comunicação, Trabalho em equipe, Excel básico','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar de logística.','Experiência simulada em Nexo Soluções 13 — Demonstração nas atividades de auxiliar de logística.','Curso técnico — instituição fictícia','Excel básico; Inglês básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Carla Modelo 13','Auxiliar de logística Júnior','São Paulo','SP','Auxiliar de logística, Comunicação, Trabalho em equipe, Excel básico',true,true,true,'{"display_name":"Carla Modelo 13","city":"São Paulo","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar de logística.","experience":"Experiência simulada em Nexo Soluções 13 — Demonstração nas atividades de auxiliar de logística.","education":"Curso técnico — instituição fictícia","courses":"Excel básico; Inglês básico","skills":"Auxiliar de logística, Comunicação, Trabalho em equipe, Excel básico","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 13
select id into v_user from auth.users where email='recruiter-13@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-13@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 13 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 13 — Demonstração','São Paulo','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Auxiliar de logística Júnior','Nexo Soluções 13 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Auxiliar de logística Júnior, com conhecimentos de Auxiliar de logística, Comunicação, Trabalho em equipe, Excel básico. Jornada e benefícios ilustrativos. Não representa contratação real.','01001000','São Paulo','SP','Presencial','Estágio',true,true);
end if;

-- school_staff 13
select id into v_user from auth.users where email='school_staff-13@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-13@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 13 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 13 — Demonstração','São Paulo','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Português e redação profissional','Instituto Horizonte 13 — Demonstração','Curso fictício de Português e redação profissional. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','01001000','São Paulo','SP','Presencial',null,true,true);
end if;

-- learner 14
select id into v_user from auth.users where email='learner-14@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-14@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Diego Modelo 14'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Diego Modelo 14','Jundiaí','SP','Vendedor técnico, Comunicação, Trabalho em equipe, Excel avançado','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Vendedor técnico.','Experiência simulada em Nexo Soluções 14 — Demonstração nas atividades de vendedor técnico.','Graduação tecnológica — instituição fictícia','Excel avançado; Inglês intermediário','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Diego Modelo 14','Vendedor técnico Júnior','Jundiaí','SP','Vendedor técnico, Comunicação, Trabalho em equipe, Excel avançado',true,true,true,'{"display_name":"Diego Modelo 14","city":"Jundiaí","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Vendedor técnico.","experience":"Experiência simulada em Nexo Soluções 14 — Demonstração nas atividades de vendedor técnico.","education":"Graduação tecnológica — instituição fictícia","courses":"Excel avançado; Inglês intermediário","skills":"Vendedor técnico, Comunicação, Trabalho em equipe, Excel avançado","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 14
select id into v_user from auth.users where email='recruiter-14@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-14@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 14 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 14 — Demonstração','Jundiaí','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Vendedor técnico Júnior','Nexo Soluções 14 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Vendedor técnico Júnior, com conhecimentos de Vendedor técnico, Comunicação, Trabalho em equipe, Excel avançado. Jornada e benefícios ilustrativos. Não representa contratação real.','13201000','Jundiaí','SP','Online','Jovem Aprendiz',true,true);
end if;

-- school_staff 14
select id into v_user from auth.users where email='school_staff-14@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-14@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 14 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 14 — Demonstração','Jundiaí','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','SolidWorks — peças e montagens','Instituto Horizonte 14 — Demonstração','Curso fictício de SolidWorks — peças e montagens. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13201000','Jundiaí','SP','Online',null,true,true);
end if;

-- learner 15
select id into v_user from auth.users where email='learner-15@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-15@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Elisa Modelo 15'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Elisa Modelo 15','Curitiba','PR','Atendente comercial, Comunicação, Trabalho em equipe, Power BI','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Atendente comercial.','Experiência simulada em Nexo Soluções 15 — Demonstração nas atividades de atendente comercial.','Curso técnico — instituição fictícia','Power BI; Inglês para entrevistas','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Elisa Modelo 15','Atendente comercial Júnior','Curitiba','PR','Atendente comercial, Comunicação, Trabalho em equipe, Power BI',true,true,true,'{"display_name":"Elisa Modelo 15","city":"Curitiba","state_code":"PR","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Atendente comercial.","experience":"Experiência simulada em Nexo Soluções 15 — Demonstração nas atividades de atendente comercial.","education":"Curso técnico — instituição fictícia","courses":"Power BI; Inglês para entrevistas","skills":"Atendente comercial, Comunicação, Trabalho em equipe, Power BI","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 15
select id into v_user from auth.users where email='recruiter-15@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-15@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 15 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 15 — Demonstração','Curitiba','PR') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Atendente comercial Júnior','Nexo Soluções 15 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Atendente comercial Júnior, com conhecimentos de Atendente comercial, Comunicação, Trabalho em equipe, Power BI. Jornada e benefícios ilustrativos. Não representa contratação real.','80010000','Curitiba','PR','Híbrido','Temporário',true,true);
end if;

-- school_staff 15
select id into v_user from auth.users where email='school_staff-15@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-15@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 15 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 15 — Demonstração','Curitiba','PR') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Impressão 3D FDM','Instituto Horizonte 15 — Demonstração','Curso fictício de Impressão 3D FDM. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','80010000','Curitiba','PR','Híbrido',null,true,true);
end if;

-- learner 16
select id into v_user from auth.users where email='learner-16@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-16@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Fábio Modelo 16'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Fábio Modelo 16','Belo Horizonte','MG','Desenvolvedor web, Comunicação, Trabalho em equipe, Python para iniciantes','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Desenvolvedor web.','Experiência simulada em Nexo Soluções 16 — Demonstração nas atividades de desenvolvedor web.','Graduação tecnológica — instituição fictícia','Python para iniciantes; Inglês técnico industrial','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Fábio Modelo 16','Desenvolvedor web Júnior','Belo Horizonte','MG','Desenvolvedor web, Comunicação, Trabalho em equipe, Python para iniciantes',true,true,true,'{"display_name":"Fábio Modelo 16","city":"Belo Horizonte","state_code":"MG","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Desenvolvedor web.","experience":"Experiência simulada em Nexo Soluções 16 — Demonstração nas atividades de desenvolvedor web.","education":"Graduação tecnológica — instituição fictícia","courses":"Python para iniciantes; Inglês técnico industrial","skills":"Desenvolvedor web, Comunicação, Trabalho em equipe, Python para iniciantes","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 16
select id into v_user from auth.users where email='recruiter-16@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-16@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 16 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 16 — Demonstração','Belo Horizonte','MG') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Desenvolvedor web Júnior','Nexo Soluções 16 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Desenvolvedor web Júnior, com conhecimentos de Desenvolvedor web, Comunicação, Trabalho em equipe, Python para iniciantes. Jornada e benefícios ilustrativos. Não representa contratação real.','30110000','Belo Horizonte','MG','Presencial','CLT',true,true);
end if;

-- school_staff 16
select id into v_user from auth.users where email='school_staff-16@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-16@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 16 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 16 — Demonstração','Belo Horizonte','MG') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Impressão 3D em resina','Instituto Horizonte 16 — Demonstração','Curso fictício de Impressão 3D em resina. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','30110000','Belo Horizonte','MG','Presencial',null,true,true);
end if;

-- learner 17
select id into v_user from auth.users where email='learner-17@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-17@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Gabriela Modelo 17'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Gabriela Modelo 17','Rio de Janeiro','RJ','Analista de dados, Comunicação, Trabalho em equipe, Desenvolvimento web','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de dados.','Experiência simulada em Nexo Soluções 17 — Demonstração nas atividades de analista de dados.','Curso técnico — instituição fictícia','Desenvolvimento web; Espanhol básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Gabriela Modelo 17','Analista de dados Júnior','Rio de Janeiro','RJ','Analista de dados, Comunicação, Trabalho em equipe, Desenvolvimento web',true,true,true,'{"display_name":"Gabriela Modelo 17","city":"Rio de Janeiro","state_code":"RJ","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de dados.","experience":"Experiência simulada em Nexo Soluções 17 — Demonstração nas atividades de analista de dados.","education":"Curso técnico — instituição fictícia","courses":"Desenvolvimento web; Espanhol básico","skills":"Analista de dados, Comunicação, Trabalho em equipe, Desenvolvimento web","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 17
select id into v_user from auth.users where email='recruiter-17@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-17@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 17 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 17 — Demonstração','Rio de Janeiro','RJ') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Analista de dados Júnior','Nexo Soluções 17 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Analista de dados Júnior, com conhecimentos de Analista de dados, Comunicação, Trabalho em equipe, Desenvolvimento web. Jornada e benefícios ilustrativos. Não representa contratação real.','20040000','Rio de Janeiro','RJ','Online','PJ',true,true);
end if;

-- school_staff 17
select id into v_user from auth.users where email='school_staff-17@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-17@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 17 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 17 — Demonstração','Rio de Janeiro','RJ') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Modelagem CAD 2D','Instituto Horizonte 17 — Demonstração','Curso fictício de Modelagem CAD 2D. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','20040000','Rio de Janeiro','RJ','Online',null,true,true);
end if;

-- learner 18
select id into v_user from auth.users where email='learner-18@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-18@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Hugo Modelo 18'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Hugo Modelo 18','Porto Alegre','RS','Técnico em redes, Comunicação, Trabalho em equipe, Redes de computadores','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em redes.','Experiência simulada em Nexo Soluções 18 — Demonstração nas atividades de técnico em redes.','Graduação tecnológica — instituição fictícia','Redes de computadores; Espanhol para negócios','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Hugo Modelo 18','Técnico em redes Júnior','Porto Alegre','RS','Técnico em redes, Comunicação, Trabalho em equipe, Redes de computadores',true,true,true,'{"display_name":"Hugo Modelo 18","city":"Porto Alegre","state_code":"RS","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em redes.","experience":"Experiência simulada em Nexo Soluções 18 — Demonstração nas atividades de técnico em redes.","education":"Graduação tecnológica — instituição fictícia","courses":"Redes de computadores; Espanhol para negócios","skills":"Técnico em redes, Comunicação, Trabalho em equipe, Redes de computadores","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 18
select id into v_user from auth.users where email='recruiter-18@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-18@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 18 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 18 — Demonstração','Porto Alegre','RS') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico em redes Júnior','Nexo Soluções 18 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico em redes Júnior, com conhecimentos de Técnico em redes, Comunicação, Trabalho em equipe, Redes de computadores. Jornada e benefícios ilustrativos. Não representa contratação real.','90010000','Porto Alegre','RS','Híbrido','Estágio',true,true);
end if;

-- school_staff 18
select id into v_user from auth.users where email='school_staff-18@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-18@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 18 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 18 — Demonstração','Porto Alegre','RS') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Programação CNC','Instituto Horizonte 18 — Demonstração','Curso fictício de Programação CNC. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','90010000','Porto Alegre','RS','Híbrido',null,true,true);
end if;

-- learner 19
select id into v_user from auth.users where email='learner-19@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-19@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Isabela Modelo 19'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Isabela Modelo 19','Recife','PE','Designer gráfico, Comunicação, Trabalho em equipe, Segurança digital básica','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Designer gráfico.','Experiência simulada em Nexo Soluções 19 — Demonstração nas atividades de designer gráfico.','Curso técnico — instituição fictícia','Segurança digital básica; Francês iniciante','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Isabela Modelo 19','Designer gráfico Júnior','Recife','PE','Designer gráfico, Comunicação, Trabalho em equipe, Segurança digital básica',true,true,true,'{"display_name":"Isabela Modelo 19","city":"Recife","state_code":"PE","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Designer gráfico.","experience":"Experiência simulada em Nexo Soluções 19 — Demonstração nas atividades de designer gráfico.","education":"Curso técnico — instituição fictícia","courses":"Segurança digital básica; Francês iniciante","skills":"Designer gráfico, Comunicação, Trabalho em equipe, Segurança digital básica","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 19
select id into v_user from auth.users where email='recruiter-19@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-19@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 19 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 19 — Demonstração','Recife','PE') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Designer gráfico Júnior','Nexo Soluções 19 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Designer gráfico Júnior, com conhecimentos de Designer gráfico, Comunicação, Trabalho em equipe, Segurança digital básica. Jornada e benefícios ilustrativos. Não representa contratação real.','50010000','Recife','PE','Presencial','Jovem Aprendiz',true,true);
end if;

-- school_staff 19
select id into v_user from auth.users where email='school_staff-19@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-19@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 19 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 19 — Demonstração','Recife','PE') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Eletroeletrônica básica','Instituto Horizonte 19 — Demonstração','Curso fictício de Eletroeletrônica básica. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','50010000','Recife','PE','Presencial',null,true,true);
end if;

-- learner 20
select id into v_user from auth.users where email='learner-20@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-20@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','João Modelo 20'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'João Modelo 20','Salvador','BA','Auxiliar contábil, Comunicação, Trabalho em equipe, Gestão de recursos humanos','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar contábil.','Experiência simulada em Nexo Soluções 20 — Demonstração nas atividades de auxiliar contábil.','Graduação tecnológica — instituição fictícia','Gestão de recursos humanos; Alemão básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'João Modelo 20','Auxiliar contábil Júnior','Salvador','BA','Auxiliar contábil, Comunicação, Trabalho em equipe, Gestão de recursos humanos',true,true,true,'{"display_name":"João Modelo 20","city":"Salvador","state_code":"BA","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar contábil.","experience":"Experiência simulada em Nexo Soluções 20 — Demonstração nas atividades de auxiliar contábil.","education":"Graduação tecnológica — instituição fictícia","courses":"Gestão de recursos humanos; Alemão básico","skills":"Auxiliar contábil, Comunicação, Trabalho em equipe, Gestão de recursos humanos","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 20
select id into v_user from auth.users where email='recruiter-20@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-20@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 20 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 20 — Demonstração','Salvador','BA') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Auxiliar contábil Júnior','Nexo Soluções 20 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Auxiliar contábil Júnior, com conhecimentos de Auxiliar contábil, Comunicação, Trabalho em equipe, Gestão de recursos humanos. Jornada e benefícios ilustrativos. Não representa contratação real.','40020000','Salvador','BA','Online','Temporário',true,true);
end if;

-- school_staff 20
select id into v_user from auth.users where email='school_staff-20@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-20@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 20 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 20 — Demonstração','Salvador','BA') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Comandos elétricos','Instituto Horizonte 20 — Demonstração','Curso fictício de Comandos elétricos. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','40020000','Salvador','BA','Online',null,true,true);
end if;

-- learner 21
select id into v_user from auth.users where email='learner-21@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-21@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Ana Modelo 21'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Ana Modelo 21','Campinas','SP','Cozinheiro, Comunicação, Trabalho em equipe, Recrutamento e seleção','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Cozinheiro.','Experiência simulada em Nexo Soluções 21 — Demonstração nas atividades de cozinheiro.','Curso técnico — instituição fictícia','Recrutamento e seleção; Italiano para iniciantes','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Ana Modelo 21','Cozinheiro Júnior','Campinas','SP','Cozinheiro, Comunicação, Trabalho em equipe, Recrutamento e seleção',true,true,true,'{"display_name":"Ana Modelo 21","city":"Campinas","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Cozinheiro.","experience":"Experiência simulada em Nexo Soluções 21 — Demonstração nas atividades de cozinheiro.","education":"Curso técnico — instituição fictícia","courses":"Recrutamento e seleção; Italiano para iniciantes","skills":"Cozinheiro, Comunicação, Trabalho em equipe, Recrutamento e seleção","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 21
select id into v_user from auth.users where email='recruiter-21@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-21@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 21 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 21 — Demonstração','Campinas','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Cozinheiro Júnior','Nexo Soluções 21 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Cozinheiro Júnior, com conhecimentos de Cozinheiro, Comunicação, Trabalho em equipe, Recrutamento e seleção. Jornada e benefícios ilustrativos. Não representa contratação real.','13010000','Campinas','SP','Híbrido','CLT',true,true);
end if;

-- school_staff 21
select id into v_user from auth.users where email='school_staff-21@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-21@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 21 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 21 — Demonstração','Campinas','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Automação industrial','Instituto Horizonte 21 — Demonstração','Curso fictício de Automação industrial. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13010000','Campinas','SP','Híbrido',null,true,true);
end if;

-- learner 22
select id into v_user from auth.users where email='learner-22@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-22@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Bruno Modelo 22'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Bruno Modelo 22','Sumaré','SP','Técnico em refrigeração, Comunicação, Trabalho em equipe, Preparação para entrevistas','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em refrigeração.','Experiência simulada em Nexo Soluções 22 — Demonstração nas atividades de técnico em refrigeração.','Graduação tecnológica — instituição fictícia','Preparação para entrevistas; Japonês básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Bruno Modelo 22','Técnico em refrigeração Júnior','Sumaré','SP','Técnico em refrigeração, Comunicação, Trabalho em equipe, Preparação para entrevistas',true,true,true,'{"display_name":"Bruno Modelo 22","city":"Sumaré","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em refrigeração.","experience":"Experiência simulada em Nexo Soluções 22 — Demonstração nas atividades de técnico em refrigeração.","education":"Graduação tecnológica — instituição fictícia","courses":"Preparação para entrevistas; Japonês básico","skills":"Técnico em refrigeração, Comunicação, Trabalho em equipe, Preparação para entrevistas","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 22
select id into v_user from auth.users where email='recruiter-22@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-22@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 22 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 22 — Demonstração','Sumaré','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico em refrigeração Júnior','Nexo Soluções 22 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico em refrigeração Júnior, com conhecimentos de Técnico em refrigeração, Comunicação, Trabalho em equipe, Preparação para entrevistas. Jornada e benefícios ilustrativos. Não representa contratação real.','13170000','Sumaré','SP','Presencial','PJ',true,true);
end if;

-- school_staff 22
select id into v_user from auth.users where email='school_staff-22@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-22@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 22 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 22 — Demonstração','Sumaré','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Soldagem TIG','Instituto Horizonte 22 — Demonstração','Curso fictício de Soldagem TIG. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13170000','Sumaré','SP','Presencial',null,true,true);
end if;

-- learner 23
select id into v_user from auth.users where email='learner-23@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-23@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Carla Modelo 23'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Carla Modelo 23','São Paulo','SP','Instalador de piscinas, Comunicação, Trabalho em equipe, Elaboração de currículo','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Instalador de piscinas.','Experiência simulada em Nexo Soluções 23 — Demonstração nas atividades de instalador de piscinas.','Curso técnico — instituição fictícia','Elaboração de currículo; Mandarim introdutório','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Carla Modelo 23','Instalador de piscinas Júnior','São Paulo','SP','Instalador de piscinas, Comunicação, Trabalho em equipe, Elaboração de currículo',true,true,true,'{"display_name":"Carla Modelo 23","city":"São Paulo","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Instalador de piscinas.","experience":"Experiência simulada em Nexo Soluções 23 — Demonstração nas atividades de instalador de piscinas.","education":"Curso técnico — instituição fictícia","courses":"Elaboração de currículo; Mandarim introdutório","skills":"Instalador de piscinas, Comunicação, Trabalho em equipe, Elaboração de currículo","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 23
select id into v_user from auth.users where email='recruiter-23@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-23@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 23 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 23 — Demonstração','São Paulo','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Instalador de piscinas Júnior','Nexo Soluções 23 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Instalador de piscinas Júnior, com conhecimentos de Instalador de piscinas, Comunicação, Trabalho em equipe, Elaboração de currículo. Jornada e benefícios ilustrativos. Não representa contratação real.','01001000','São Paulo','SP','Online','Estágio',true,true);
end if;

-- school_staff 23
select id into v_user from auth.users where email='school_staff-23@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-23@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 23 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 23 — Demonstração','São Paulo','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Metrologia','Instituto Horizonte 23 — Demonstração','Curso fictício de Metrologia. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','01001000','São Paulo','SP','Online',null,true,true);
end if;

-- learner 24
select id into v_user from auth.users where email='learner-24@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-24@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Diego Modelo 24'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Diego Modelo 24','Jundiaí','SP','Técnico de segurança do trabalho, Comunicação, Trabalho em equipe, Liderança de equipes','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico de segurança do trabalho.','Experiência simulada em Nexo Soluções 24 — Demonstração nas atividades de técnico de segurança do trabalho.','Graduação tecnológica — instituição fictícia','Liderança de equipes; Libras introdutório','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Diego Modelo 24','Técnico de segurança do trabalho Júnior','Jundiaí','SP','Técnico de segurança do trabalho, Comunicação, Trabalho em equipe, Liderança de equipes',true,true,true,'{"display_name":"Diego Modelo 24","city":"Jundiaí","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico de segurança do trabalho.","experience":"Experiência simulada em Nexo Soluções 24 — Demonstração nas atividades de técnico de segurança do trabalho.","education":"Graduação tecnológica — instituição fictícia","courses":"Liderança de equipes; Libras introdutório","skills":"Técnico de segurança do trabalho, Comunicação, Trabalho em equipe, Liderança de equipes","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 24
select id into v_user from auth.users where email='recruiter-24@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-24@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 24 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 24 — Demonstração','Jundiaí','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico de segurança do trabalho Júnior','Nexo Soluções 24 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico de segurança do trabalho Júnior, com conhecimentos de Técnico de segurança do trabalho, Comunicação, Trabalho em equipe, Liderança de equipes. Jornada e benefícios ilustrativos. Não representa contratação real.','13201000','Jundiaí','SP','Híbrido','Jovem Aprendiz',true,true);
end if;

-- school_staff 24
select id into v_user from auth.users where email='school_staff-24@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-24@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 24 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 24 — Demonstração','Jundiaí','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Leitura de desenho técnico','Instituto Horizonte 24 — Demonstração','Curso fictício de Leitura de desenho técnico. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13201000','Jundiaí','SP','Híbrido',null,true,true);
end if;

-- learner 25
select id into v_user from auth.users where email='learner-25@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-25@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Elisa Modelo 25'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Elisa Modelo 25','Curitiba','PR','Auxiliar de produção, Comunicação, Trabalho em equipe, Gestão de projetos','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar de produção.','Experiência simulada em Nexo Soluções 25 — Demonstração nas atividades de auxiliar de produção.','Curso técnico — instituição fictícia','Gestão de projetos; Inglês básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Elisa Modelo 25','Auxiliar de produção Júnior','Curitiba','PR','Auxiliar de produção, Comunicação, Trabalho em equipe, Gestão de projetos',true,true,true,'{"display_name":"Elisa Modelo 25","city":"Curitiba","state_code":"PR","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar de produção.","experience":"Experiência simulada em Nexo Soluções 25 — Demonstração nas atividades de auxiliar de produção.","education":"Curso técnico — instituição fictícia","courses":"Gestão de projetos; Inglês básico","skills":"Auxiliar de produção, Comunicação, Trabalho em equipe, Gestão de projetos","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 25
select id into v_user from auth.users where email='recruiter-25@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-25@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 25 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 25 — Demonstração','Curitiba','PR') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Auxiliar de produção Júnior','Nexo Soluções 25 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Auxiliar de produção Júnior, com conhecimentos de Auxiliar de produção, Comunicação, Trabalho em equipe, Gestão de projetos. Jornada e benefícios ilustrativos. Não representa contratação real.','80010000','Curitiba','PR','Presencial','Temporário',true,true);
end if;

-- school_staff 25
select id into v_user from auth.users where email='school_staff-25@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-25@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 25 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 25 — Demonstração','Curitiba','PR') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Manutenção mecânica','Instituto Horizonte 25 — Demonstração','Curso fictício de Manutenção mecânica. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','80010000','Curitiba','PR','Presencial',null,true,true);
end if;

-- learner 26
select id into v_user from auth.users where email='learner-26@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-26@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Fábio Modelo 26'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Fábio Modelo 26','Belo Horizonte','MG','Técnico em impressão 3D, Comunicação, Trabalho em equipe, Empreendedorismo','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em impressão 3D.','Experiência simulada em Nexo Soluções 26 — Demonstração nas atividades de técnico em impressão 3d.','Graduação tecnológica — instituição fictícia','Empreendedorismo; Inglês intermediário','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Fábio Modelo 26','Técnico em impressão 3D Pleno','Belo Horizonte','MG','Técnico em impressão 3D, Comunicação, Trabalho em equipe, Empreendedorismo',true,true,true,'{"display_name":"Fábio Modelo 26","city":"Belo Horizonte","state_code":"MG","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em impressão 3D.","experience":"Experiência simulada em Nexo Soluções 26 — Demonstração nas atividades de técnico em impressão 3d.","education":"Graduação tecnológica — instituição fictícia","courses":"Empreendedorismo; Inglês intermediário","skills":"Técnico em impressão 3D, Comunicação, Trabalho em equipe, Empreendedorismo","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 26
select id into v_user from auth.users where email='recruiter-26@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-26@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 26 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 26 — Demonstração','Belo Horizonte','MG') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico em impressão 3D Pleno','Nexo Soluções 26 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico em impressão 3D Pleno, com conhecimentos de Técnico em impressão 3D, Comunicação, Trabalho em equipe, Empreendedorismo. Jornada e benefícios ilustrativos. Não representa contratação real.','30110000','Belo Horizonte','MG','Online','CLT',true,true);
end if;

-- school_staff 26
select id into v_user from auth.users where email='school_staff-26@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-26@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 26 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 26 — Demonstração','Belo Horizonte','MG') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Excel básico','Instituto Horizonte 26 — Demonstração','Curso fictício de Excel básico. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','30110000','Belo Horizonte','MG','Online',null,true,true);
end if;

-- learner 27
select id into v_user from auth.users where email='learner-27@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-27@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Gabriela Modelo 27'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Gabriela Modelo 27','Rio de Janeiro','RJ','Projetista SolidWorks, Comunicação, Trabalho em equipe, Finanças para pequenos negócios','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Projetista SolidWorks.','Experiência simulada em Nexo Soluções 27 — Demonstração nas atividades de projetista solidworks.','Curso técnico — instituição fictícia','Finanças para pequenos negócios; Inglês para entrevistas','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Gabriela Modelo 27','Projetista SolidWorks Pleno','Rio de Janeiro','RJ','Projetista SolidWorks, Comunicação, Trabalho em equipe, Finanças para pequenos negócios',true,true,true,'{"display_name":"Gabriela Modelo 27","city":"Rio de Janeiro","state_code":"RJ","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Projetista SolidWorks.","experience":"Experiência simulada em Nexo Soluções 27 — Demonstração nas atividades de projetista solidworks.","education":"Curso técnico — instituição fictícia","courses":"Finanças para pequenos negócios; Inglês para entrevistas","skills":"Projetista SolidWorks, Comunicação, Trabalho em equipe, Finanças para pequenos negócios","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 27
select id into v_user from auth.users where email='recruiter-27@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-27@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 27 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 27 — Demonstração','Rio de Janeiro','RJ') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Projetista SolidWorks Pleno','Nexo Soluções 27 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Projetista SolidWorks Pleno, com conhecimentos de Projetista SolidWorks, Comunicação, Trabalho em equipe, Finanças para pequenos negócios. Jornada e benefícios ilustrativos. Não representa contratação real.','20040000','Rio de Janeiro','RJ','Híbrido','PJ',true,true);
end if;

-- school_staff 27
select id into v_user from auth.users where email='school_staff-27@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-27@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 27 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 27 — Demonstração','Rio de Janeiro','RJ') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Excel avançado','Instituto Horizonte 27 — Demonstração','Curso fictício de Excel avançado. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','20040000','Rio de Janeiro','RJ','Híbrido',null,true,true);
end if;

-- learner 28
select id into v_user from auth.users where email='learner-28@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-28@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Hugo Modelo 28'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Hugo Modelo 28','Porto Alegre','RS','Desenhista CAD, Comunicação, Trabalho em equipe, Marketing digital','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Desenhista CAD.','Experiência simulada em Nexo Soluções 28 — Demonstração nas atividades de desenhista cad.','Graduação tecnológica — instituição fictícia','Marketing digital; Inglês técnico industrial','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Hugo Modelo 28','Desenhista CAD Pleno','Porto Alegre','RS','Desenhista CAD, Comunicação, Trabalho em equipe, Marketing digital',true,true,true,'{"display_name":"Hugo Modelo 28","city":"Porto Alegre","state_code":"RS","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Desenhista CAD.","experience":"Experiência simulada em Nexo Soluções 28 — Demonstração nas atividades de desenhista cad.","education":"Graduação tecnológica — instituição fictícia","courses":"Marketing digital; Inglês técnico industrial","skills":"Desenhista CAD, Comunicação, Trabalho em equipe, Marketing digital","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 28
select id into v_user from auth.users where email='recruiter-28@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-28@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 28 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 28 — Demonstração','Porto Alegre','RS') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Desenhista CAD Pleno','Nexo Soluções 28 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Desenhista CAD Pleno, com conhecimentos de Desenhista CAD, Comunicação, Trabalho em equipe, Marketing digital. Jornada e benefícios ilustrativos. Não representa contratação real.','90010000','Porto Alegre','RS','Presencial','Estágio',true,true);
end if;

-- school_staff 28
select id into v_user from auth.users where email='school_staff-28@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-28@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 28 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 28 — Demonstração','Porto Alegre','RS') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Power BI','Instituto Horizonte 28 — Demonstração','Curso fictício de Power BI. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','90010000','Porto Alegre','RS','Presencial',null,true,true);
end if;

-- learner 29
select id into v_user from auth.users where email='learner-29@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-29@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Isabela Modelo 29'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Isabela Modelo 29','Recife','PE','Operador CNC, Comunicação, Trabalho em equipe, Atendimento ao cliente','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Operador CNC.','Experiência simulada em Nexo Soluções 29 — Demonstração nas atividades de operador cnc.','Curso técnico — instituição fictícia','Atendimento ao cliente; Espanhol básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Isabela Modelo 29','Operador CNC Pleno','Recife','PE','Operador CNC, Comunicação, Trabalho em equipe, Atendimento ao cliente',true,true,true,'{"display_name":"Isabela Modelo 29","city":"Recife","state_code":"PE","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Operador CNC.","experience":"Experiência simulada em Nexo Soluções 29 — Demonstração nas atividades de operador cnc.","education":"Curso técnico — instituição fictícia","courses":"Atendimento ao cliente; Espanhol básico","skills":"Operador CNC, Comunicação, Trabalho em equipe, Atendimento ao cliente","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 29
select id into v_user from auth.users where email='recruiter-29@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-29@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 29 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 29 — Demonstração','Recife','PE') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Operador CNC Pleno','Nexo Soluções 29 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Operador CNC Pleno, com conhecimentos de Operador CNC, Comunicação, Trabalho em equipe, Atendimento ao cliente. Jornada e benefícios ilustrativos. Não representa contratação real.','50010000','Recife','PE','Online','Jovem Aprendiz',true,true);
end if;

-- school_staff 29
select id into v_user from auth.users where email='school_staff-29@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-29@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 29 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 29 — Demonstração','Recife','PE') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Python para iniciantes','Instituto Horizonte 29 — Demonstração','Curso fictício de Python para iniciantes. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','50010000','Recife','PE','Online',null,true,true);
end if;

-- learner 30
select id into v_user from auth.users where email='learner-30@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-30@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','João Modelo 30'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'João Modelo 30','Salvador','BA','Técnico em eletroeletrônica, Comunicação, Trabalho em equipe, Vendas consultivas','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em eletroeletrônica.','Experiência simulada em Nexo Soluções 30 — Demonstração nas atividades de técnico em eletroeletrônica.','Graduação tecnológica — instituição fictícia','Vendas consultivas; Espanhol para negócios','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'João Modelo 30','Técnico em eletroeletrônica Pleno','Salvador','BA','Técnico em eletroeletrônica, Comunicação, Trabalho em equipe, Vendas consultivas',true,true,true,'{"display_name":"João Modelo 30","city":"Salvador","state_code":"BA","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em eletroeletrônica.","experience":"Experiência simulada em Nexo Soluções 30 — Demonstração nas atividades de técnico em eletroeletrônica.","education":"Graduação tecnológica — instituição fictícia","courses":"Vendas consultivas; Espanhol para negócios","skills":"Técnico em eletroeletrônica, Comunicação, Trabalho em equipe, Vendas consultivas","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 30
select id into v_user from auth.users where email='recruiter-30@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-30@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 30 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 30 — Demonstração','Salvador','BA') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico em eletroeletrônica Pleno','Nexo Soluções 30 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico em eletroeletrônica Pleno, com conhecimentos de Técnico em eletroeletrônica, Comunicação, Trabalho em equipe, Vendas consultivas. Jornada e benefícios ilustrativos. Não representa contratação real.','40020000','Salvador','BA','Híbrido','Temporário',true,true);
end if;

-- school_staff 30
select id into v_user from auth.users where email='school_staff-30@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-30@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 30 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 30 — Demonstração','Salvador','BA') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Desenvolvimento web','Instituto Horizonte 30 — Demonstração','Curso fictício de Desenvolvimento web. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','40020000','Salvador','BA','Híbrido',null,true,true);
end if;

-- learner 31
select id into v_user from auth.users where email='learner-31@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-31@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Ana Modelo 31'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Ana Modelo 31','Campinas','SP','Eletricista de manutenção, Comunicação, Trabalho em equipe, Logística e estoque','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Eletricista de manutenção.','Experiência simulada em Nexo Soluções 31 — Demonstração nas atividades de eletricista de manutenção.','Curso técnico — instituição fictícia','Logística e estoque; Francês iniciante','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Ana Modelo 31','Eletricista de manutenção Pleno','Campinas','SP','Eletricista de manutenção, Comunicação, Trabalho em equipe, Logística e estoque',true,true,true,'{"display_name":"Ana Modelo 31","city":"Campinas","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Eletricista de manutenção.","experience":"Experiência simulada em Nexo Soluções 31 — Demonstração nas atividades de eletricista de manutenção.","education":"Curso técnico — instituição fictícia","courses":"Logística e estoque; Francês iniciante","skills":"Eletricista de manutenção, Comunicação, Trabalho em equipe, Logística e estoque","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 31
select id into v_user from auth.users where email='recruiter-31@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-31@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 31 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 31 — Demonstração','Campinas','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Eletricista de manutenção Pleno','Nexo Soluções 31 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Eletricista de manutenção Pleno, com conhecimentos de Eletricista de manutenção, Comunicação, Trabalho em equipe, Logística e estoque. Jornada e benefícios ilustrativos. Não representa contratação real.','13010000','Campinas','SP','Presencial','CLT',true,true);
end if;

-- school_staff 31
select id into v_user from auth.users where email='school_staff-31@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-31@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 31 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 31 — Demonstração','Campinas','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Redes de computadores','Instituto Horizonte 31 — Demonstração','Curso fictício de Redes de computadores. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13010000','Campinas','SP','Presencial',null,true,true);
end if;

-- learner 32
select id into v_user from auth.users where email='learner-32@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-32@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Bruno Modelo 32'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Bruno Modelo 32','Sumaré','SP','Mecânico industrial, Comunicação, Trabalho em equipe, Assistente administrativo','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Mecânico industrial.','Experiência simulada em Nexo Soluções 32 — Demonstração nas atividades de mecânico industrial.','Graduação tecnológica — instituição fictícia','Assistente administrativo; Alemão básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Bruno Modelo 32','Mecânico industrial Pleno','Sumaré','SP','Mecânico industrial, Comunicação, Trabalho em equipe, Assistente administrativo',true,true,true,'{"display_name":"Bruno Modelo 32","city":"Sumaré","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Mecânico industrial.","experience":"Experiência simulada em Nexo Soluções 32 — Demonstração nas atividades de mecânico industrial.","education":"Graduação tecnológica — instituição fictícia","courses":"Assistente administrativo; Alemão básico","skills":"Mecânico industrial, Comunicação, Trabalho em equipe, Assistente administrativo","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 32
select id into v_user from auth.users where email='recruiter-32@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-32@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 32 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 32 — Demonstração','Sumaré','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Mecânico industrial Pleno','Nexo Soluções 32 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Mecânico industrial Pleno, com conhecimentos de Mecânico industrial, Comunicação, Trabalho em equipe, Assistente administrativo. Jornada e benefícios ilustrativos. Não representa contratação real.','13170000','Sumaré','SP','Online','PJ',true,true);
end if;

-- school_staff 32
select id into v_user from auth.users where email='school_staff-32@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-32@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 32 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 32 — Demonstração','Sumaré','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Segurança digital básica','Instituto Horizonte 32 — Demonstração','Curso fictício de Segurança digital básica. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13170000','Sumaré','SP','Online',null,true,true);
end if;

-- learner 33
select id into v_user from auth.users where email='learner-33@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-33@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Carla Modelo 33'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Carla Modelo 33','São Paulo','SP','Soldador TIG, Comunicação, Trabalho em equipe, Qualidade e melhoria contínua','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Soldador TIG.','Experiência simulada em Nexo Soluções 33 — Demonstração nas atividades de soldador tig.','Curso técnico — instituição fictícia','Qualidade e melhoria contínua; Italiano para iniciantes','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Carla Modelo 33','Soldador TIG Pleno','São Paulo','SP','Soldador TIG, Comunicação, Trabalho em equipe, Qualidade e melhoria contínua',true,true,true,'{"display_name":"Carla Modelo 33","city":"São Paulo","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Soldador TIG.","experience":"Experiência simulada em Nexo Soluções 33 — Demonstração nas atividades de soldador tig.","education":"Curso técnico — instituição fictícia","courses":"Qualidade e melhoria contínua; Italiano para iniciantes","skills":"Soldador TIG, Comunicação, Trabalho em equipe, Qualidade e melhoria contínua","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 33
select id into v_user from auth.users where email='recruiter-33@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-33@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 33 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 33 — Demonstração','São Paulo','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Soldador TIG Pleno','Nexo Soluções 33 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Soldador TIG Pleno, com conhecimentos de Soldador TIG, Comunicação, Trabalho em equipe, Qualidade e melhoria contínua. Jornada e benefícios ilustrativos. Não representa contratação real.','01001000','São Paulo','SP','Híbrido','Estágio',true,true);
end if;

-- school_staff 33
select id into v_user from auth.users where email='school_staff-33@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-33@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 33 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 33 — Demonstração','São Paulo','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Gestão de recursos humanos','Instituto Horizonte 33 — Demonstração','Curso fictício de Gestão de recursos humanos. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','01001000','São Paulo','SP','Híbrido',null,true,true);
end if;

-- learner 34
select id into v_user from auth.users where email='learner-34@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-34@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Diego Modelo 34'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Diego Modelo 34','Jundiaí','SP','Técnico em automação, Comunicação, Trabalho em equipe, Refrigeração básica','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em automação.','Experiência simulada em Nexo Soluções 34 — Demonstração nas atividades de técnico em automação.','Graduação tecnológica — instituição fictícia','Refrigeração básica; Japonês básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Diego Modelo 34','Técnico em automação Pleno','Jundiaí','SP','Técnico em automação, Comunicação, Trabalho em equipe, Refrigeração básica',true,true,true,'{"display_name":"Diego Modelo 34","city":"Jundiaí","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em automação.","experience":"Experiência simulada em Nexo Soluções 34 — Demonstração nas atividades de técnico em automação.","education":"Graduação tecnológica — instituição fictícia","courses":"Refrigeração básica; Japonês básico","skills":"Técnico em automação, Comunicação, Trabalho em equipe, Refrigeração básica","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 34
select id into v_user from auth.users where email='recruiter-34@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-34@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 34 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 34 — Demonstração','Jundiaí','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico em automação Pleno','Nexo Soluções 34 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico em automação Pleno, com conhecimentos de Técnico em automação, Comunicação, Trabalho em equipe, Refrigeração básica. Jornada e benefícios ilustrativos. Não representa contratação real.','13201000','Jundiaí','SP','Presencial','Jovem Aprendiz',true,true);
end if;

-- school_staff 34
select id into v_user from auth.users where email='school_staff-34@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-34@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 34 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 34 — Demonstração','Jundiaí','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Recrutamento e seleção','Instituto Horizonte 34 — Demonstração','Curso fictício de Recrutamento e seleção. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13201000','Jundiaí','SP','Presencial',null,true,true);
end if;

-- learner 35
select id into v_user from auth.users where email='learner-35@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-35@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Elisa Modelo 35'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Elisa Modelo 35','Curitiba','PR','Analista de qualidade, Comunicação, Trabalho em equipe, Tratamento de piscinas','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de qualidade.','Experiência simulada em Nexo Soluções 35 — Demonstração nas atividades de analista de qualidade.','Curso técnico — instituição fictícia','Tratamento de piscinas; Mandarim introdutório','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Elisa Modelo 35','Analista de qualidade Pleno','Curitiba','PR','Analista de qualidade, Comunicação, Trabalho em equipe, Tratamento de piscinas',true,true,true,'{"display_name":"Elisa Modelo 35","city":"Curitiba","state_code":"PR","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de qualidade.","experience":"Experiência simulada em Nexo Soluções 35 — Demonstração nas atividades de analista de qualidade.","education":"Curso técnico — instituição fictícia","courses":"Tratamento de piscinas; Mandarim introdutório","skills":"Analista de qualidade, Comunicação, Trabalho em equipe, Tratamento de piscinas","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 35
select id into v_user from auth.users where email='recruiter-35@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-35@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 35 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 35 — Demonstração','Curitiba','PR') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Analista de qualidade Pleno','Nexo Soluções 35 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Analista de qualidade Pleno, com conhecimentos de Analista de qualidade, Comunicação, Trabalho em equipe, Tratamento de piscinas. Jornada e benefícios ilustrativos. Não representa contratação real.','80010000','Curitiba','PR','Online','Temporário',true,true);
end if;

-- school_staff 35
select id into v_user from auth.users where email='school_staff-35@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-35@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 35 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 35 — Demonstração','Curitiba','PR') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Preparação para entrevistas','Instituto Horizonte 35 — Demonstração','Curso fictício de Preparação para entrevistas. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','80010000','Curitiba','PR','Online',null,true,true);
end if;

-- learner 36
select id into v_user from auth.users where email='learner-36@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-36@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Fábio Modelo 36'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Fábio Modelo 36','Belo Horizonte','MG','Assistente administrativo, Comunicação, Trabalho em equipe, Segurança no trabalho','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Assistente administrativo.','Experiência simulada em Nexo Soluções 36 — Demonstração nas atividades de assistente administrativo.','Graduação tecnológica — instituição fictícia','Segurança no trabalho; Libras introdutório','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Fábio Modelo 36','Assistente administrativo Pleno','Belo Horizonte','MG','Assistente administrativo, Comunicação, Trabalho em equipe, Segurança no trabalho',true,true,true,'{"display_name":"Fábio Modelo 36","city":"Belo Horizonte","state_code":"MG","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Assistente administrativo.","experience":"Experiência simulada em Nexo Soluções 36 — Demonstração nas atividades de assistente administrativo.","education":"Graduação tecnológica — instituição fictícia","courses":"Segurança no trabalho; Libras introdutório","skills":"Assistente administrativo, Comunicação, Trabalho em equipe, Segurança no trabalho","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 36
select id into v_user from auth.users where email='recruiter-36@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-36@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 36 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 36 — Demonstração','Belo Horizonte','MG') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Assistente administrativo Pleno','Nexo Soluções 36 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Assistente administrativo Pleno, com conhecimentos de Assistente administrativo, Comunicação, Trabalho em equipe, Segurança no trabalho. Jornada e benefícios ilustrativos. Não representa contratação real.','30110000','Belo Horizonte','MG','Híbrido','CLT',true,true);
end if;

-- school_staff 36
select id into v_user from auth.users where email='school_staff-36@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-36@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 36 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 36 — Demonstração','Belo Horizonte','MG') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Elaboração de currículo','Instituto Horizonte 36 — Demonstração','Curso fictício de Elaboração de currículo. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','30110000','Belo Horizonte','MG','Híbrido',null,true,true);
end if;

-- learner 37
select id into v_user from auth.users where email='learner-37@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-37@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Gabriela Modelo 37'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Gabriela Modelo 37','Rio de Janeiro','RJ','Analista de RH, Comunicação, Trabalho em equipe, Design gráfico','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de RH.','Experiência simulada em Nexo Soluções 37 — Demonstração nas atividades de analista de rh.','Curso técnico — instituição fictícia','Design gráfico; Inglês básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Gabriela Modelo 37','Analista de RH Pleno','Rio de Janeiro','RJ','Analista de RH, Comunicação, Trabalho em equipe, Design gráfico',true,true,true,'{"display_name":"Gabriela Modelo 37","city":"Rio de Janeiro","state_code":"RJ","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de RH.","experience":"Experiência simulada em Nexo Soluções 37 — Demonstração nas atividades de analista de rh.","education":"Curso técnico — instituição fictícia","courses":"Design gráfico; Inglês básico","skills":"Analista de RH, Comunicação, Trabalho em equipe, Design gráfico","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 37
select id into v_user from auth.users where email='recruiter-37@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-37@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 37 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 37 — Demonstração','Rio de Janeiro','RJ') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Analista de RH Pleno','Nexo Soluções 37 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Analista de RH Pleno, com conhecimentos de Analista de RH, Comunicação, Trabalho em equipe, Design gráfico. Jornada e benefícios ilustrativos. Não representa contratação real.','20040000','Rio de Janeiro','RJ','Presencial','PJ',true,true);
end if;

-- school_staff 37
select id into v_user from auth.users where email='school_staff-37@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-37@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 37 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 37 — Demonstração','Rio de Janeiro','RJ') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Liderança de equipes','Instituto Horizonte 37 — Demonstração','Curso fictício de Liderança de equipes. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','20040000','Rio de Janeiro','RJ','Presencial',null,true,true);
end if;

-- learner 38
select id into v_user from auth.users where email='learner-38@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-38@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Hugo Modelo 38'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Hugo Modelo 38','Porto Alegre','RS','Auxiliar de logística, Comunicação, Trabalho em equipe, Inglês básico','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar de logística.','Experiência simulada em Nexo Soluções 38 — Demonstração nas atividades de auxiliar de logística.','Graduação tecnológica — instituição fictícia','Inglês básico; Inglês intermediário','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Hugo Modelo 38','Auxiliar de logística Pleno','Porto Alegre','RS','Auxiliar de logística, Comunicação, Trabalho em equipe, Inglês básico',true,true,true,'{"display_name":"Hugo Modelo 38","city":"Porto Alegre","state_code":"RS","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar de logística.","experience":"Experiência simulada em Nexo Soluções 38 — Demonstração nas atividades de auxiliar de logística.","education":"Graduação tecnológica — instituição fictícia","courses":"Inglês básico; Inglês intermediário","skills":"Auxiliar de logística, Comunicação, Trabalho em equipe, Inglês básico","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 38
select id into v_user from auth.users where email='recruiter-38@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-38@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 38 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 38 — Demonstração','Porto Alegre','RS') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Auxiliar de logística Pleno','Nexo Soluções 38 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Auxiliar de logística Pleno, com conhecimentos de Auxiliar de logística, Comunicação, Trabalho em equipe, Inglês básico. Jornada e benefícios ilustrativos. Não representa contratação real.','90010000','Porto Alegre','RS','Online','Estágio',true,true);
end if;

-- school_staff 38
select id into v_user from auth.users where email='school_staff-38@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-38@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 38 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 38 — Demonstração','Porto Alegre','RS') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Gestão de projetos','Instituto Horizonte 38 — Demonstração','Curso fictício de Gestão de projetos. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','90010000','Porto Alegre','RS','Online',null,true,true);
end if;

-- learner 39
select id into v_user from auth.users where email='learner-39@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-39@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Isabela Modelo 39'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Isabela Modelo 39','Recife','PE','Vendedor técnico, Comunicação, Trabalho em equipe, Inglês intermediário','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Vendedor técnico.','Experiência simulada em Nexo Soluções 39 — Demonstração nas atividades de vendedor técnico.','Curso técnico — instituição fictícia','Inglês intermediário; Inglês para entrevistas','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Isabela Modelo 39','Vendedor técnico Pleno','Recife','PE','Vendedor técnico, Comunicação, Trabalho em equipe, Inglês intermediário',true,true,true,'{"display_name":"Isabela Modelo 39","city":"Recife","state_code":"PE","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Vendedor técnico.","experience":"Experiência simulada em Nexo Soluções 39 — Demonstração nas atividades de vendedor técnico.","education":"Curso técnico — instituição fictícia","courses":"Inglês intermediário; Inglês para entrevistas","skills":"Vendedor técnico, Comunicação, Trabalho em equipe, Inglês intermediário","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 39
select id into v_user from auth.users where email='recruiter-39@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-39@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 39 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 39 — Demonstração','Recife','PE') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Vendedor técnico Pleno','Nexo Soluções 39 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Vendedor técnico Pleno, com conhecimentos de Vendedor técnico, Comunicação, Trabalho em equipe, Inglês intermediário. Jornada e benefícios ilustrativos. Não representa contratação real.','50010000','Recife','PE','Híbrido','Jovem Aprendiz',true,true);
end if;

-- school_staff 39
select id into v_user from auth.users where email='school_staff-39@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-39@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 39 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 39 — Demonstração','Recife','PE') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Empreendedorismo','Instituto Horizonte 39 — Demonstração','Curso fictício de Empreendedorismo. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','50010000','Recife','PE','Híbrido',null,true,true);
end if;

-- learner 40
select id into v_user from auth.users where email='learner-40@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-40@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','João Modelo 40'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'João Modelo 40','Salvador','BA','Atendente comercial, Comunicação, Trabalho em equipe, Inglês para entrevistas','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Atendente comercial.','Experiência simulada em Nexo Soluções 40 — Demonstração nas atividades de atendente comercial.','Graduação tecnológica — instituição fictícia','Inglês para entrevistas; Inglês técnico industrial','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'João Modelo 40','Atendente comercial Pleno','Salvador','BA','Atendente comercial, Comunicação, Trabalho em equipe, Inglês para entrevistas',true,true,true,'{"display_name":"João Modelo 40","city":"Salvador","state_code":"BA","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Atendente comercial.","experience":"Experiência simulada em Nexo Soluções 40 — Demonstração nas atividades de atendente comercial.","education":"Graduação tecnológica — instituição fictícia","courses":"Inglês para entrevistas; Inglês técnico industrial","skills":"Atendente comercial, Comunicação, Trabalho em equipe, Inglês para entrevistas","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 40
select id into v_user from auth.users where email='recruiter-40@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-40@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 40 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 40 — Demonstração','Salvador','BA') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Atendente comercial Pleno','Nexo Soluções 40 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Atendente comercial Pleno, com conhecimentos de Atendente comercial, Comunicação, Trabalho em equipe, Inglês para entrevistas. Jornada e benefícios ilustrativos. Não representa contratação real.','40020000','Salvador','BA','Presencial','Temporário',true,true);
end if;

-- school_staff 40
select id into v_user from auth.users where email='school_staff-40@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-40@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 40 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 40 — Demonstração','Salvador','BA') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Finanças para pequenos negócios','Instituto Horizonte 40 — Demonstração','Curso fictício de Finanças para pequenos negócios. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','40020000','Salvador','BA','Presencial',null,true,true);
end if;

-- learner 41
select id into v_user from auth.users where email='learner-41@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-41@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Ana Modelo 41'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Ana Modelo 41','Campinas','SP','Desenvolvedor web, Comunicação, Trabalho em equipe, Inglês técnico industrial','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Desenvolvedor web.','Experiência simulada em Nexo Soluções 41 — Demonstração nas atividades de desenvolvedor web.','Curso técnico — instituição fictícia','Inglês técnico industrial; Espanhol básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Ana Modelo 41','Desenvolvedor web Pleno','Campinas','SP','Desenvolvedor web, Comunicação, Trabalho em equipe, Inglês técnico industrial',true,true,true,'{"display_name":"Ana Modelo 41","city":"Campinas","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Desenvolvedor web.","experience":"Experiência simulada em Nexo Soluções 41 — Demonstração nas atividades de desenvolvedor web.","education":"Curso técnico — instituição fictícia","courses":"Inglês técnico industrial; Espanhol básico","skills":"Desenvolvedor web, Comunicação, Trabalho em equipe, Inglês técnico industrial","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 41
select id into v_user from auth.users where email='recruiter-41@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-41@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 41 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 41 — Demonstração','Campinas','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Desenvolvedor web Pleno','Nexo Soluções 41 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Desenvolvedor web Pleno, com conhecimentos de Desenvolvedor web, Comunicação, Trabalho em equipe, Inglês técnico industrial. Jornada e benefícios ilustrativos. Não representa contratação real.','13010000','Campinas','SP','Online','CLT',true,true);
end if;

-- school_staff 41
select id into v_user from auth.users where email='school_staff-41@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-41@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 41 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 41 — Demonstração','Campinas','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Marketing digital','Instituto Horizonte 41 — Demonstração','Curso fictício de Marketing digital. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13010000','Campinas','SP','Online',null,true,true);
end if;

-- learner 42
select id into v_user from auth.users where email='learner-42@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-42@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Bruno Modelo 42'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Bruno Modelo 42','Sumaré','SP','Analista de dados, Comunicação, Trabalho em equipe, Espanhol básico','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de dados.','Experiência simulada em Nexo Soluções 42 — Demonstração nas atividades de analista de dados.','Graduação tecnológica — instituição fictícia','Espanhol básico; Espanhol para negócios','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Bruno Modelo 42','Analista de dados Pleno','Sumaré','SP','Analista de dados, Comunicação, Trabalho em equipe, Espanhol básico',true,true,true,'{"display_name":"Bruno Modelo 42","city":"Sumaré","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Analista de dados.","experience":"Experiência simulada em Nexo Soluções 42 — Demonstração nas atividades de analista de dados.","education":"Graduação tecnológica — instituição fictícia","courses":"Espanhol básico; Espanhol para negócios","skills":"Analista de dados, Comunicação, Trabalho em equipe, Espanhol básico","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 42
select id into v_user from auth.users where email='recruiter-42@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-42@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 42 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 42 — Demonstração','Sumaré','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Analista de dados Pleno','Nexo Soluções 42 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Analista de dados Pleno, com conhecimentos de Analista de dados, Comunicação, Trabalho em equipe, Espanhol básico. Jornada e benefícios ilustrativos. Não representa contratação real.','13170000','Sumaré','SP','Híbrido','PJ',true,true);
end if;

-- school_staff 42
select id into v_user from auth.users where email='school_staff-42@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-42@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 42 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 42 — Demonstração','Sumaré','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Atendimento ao cliente','Instituto Horizonte 42 — Demonstração','Curso fictício de Atendimento ao cliente. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13170000','Sumaré','SP','Híbrido',null,true,true);
end if;

-- learner 43
select id into v_user from auth.users where email='learner-43@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-43@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Carla Modelo 43'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Carla Modelo 43','São Paulo','SP','Técnico em redes, Comunicação, Trabalho em equipe, Espanhol para negócios','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em redes.','Experiência simulada em Nexo Soluções 43 — Demonstração nas atividades de técnico em redes.','Curso técnico — instituição fictícia','Espanhol para negócios; Francês iniciante','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Carla Modelo 43','Técnico em redes Pleno','São Paulo','SP','Técnico em redes, Comunicação, Trabalho em equipe, Espanhol para negócios',true,true,true,'{"display_name":"Carla Modelo 43","city":"São Paulo","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em redes.","experience":"Experiência simulada em Nexo Soluções 43 — Demonstração nas atividades de técnico em redes.","education":"Curso técnico — instituição fictícia","courses":"Espanhol para negócios; Francês iniciante","skills":"Técnico em redes, Comunicação, Trabalho em equipe, Espanhol para negócios","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 43
select id into v_user from auth.users where email='recruiter-43@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-43@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 43 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 43 — Demonstração','São Paulo','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico em redes Pleno','Nexo Soluções 43 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico em redes Pleno, com conhecimentos de Técnico em redes, Comunicação, Trabalho em equipe, Espanhol para negócios. Jornada e benefícios ilustrativos. Não representa contratação real.','01001000','São Paulo','SP','Presencial','Estágio',true,true);
end if;

-- school_staff 43
select id into v_user from auth.users where email='school_staff-43@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-43@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 43 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 43 — Demonstração','São Paulo','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Vendas consultivas','Instituto Horizonte 43 — Demonstração','Curso fictício de Vendas consultivas. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','01001000','São Paulo','SP','Presencial',null,true,true);
end if;

-- learner 44
select id into v_user from auth.users where email='learner-44@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-44@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Diego Modelo 44'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Diego Modelo 44','Jundiaí','SP','Designer gráfico, Comunicação, Trabalho em equipe, Francês iniciante','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Designer gráfico.','Experiência simulada em Nexo Soluções 44 — Demonstração nas atividades de designer gráfico.','Graduação tecnológica — instituição fictícia','Francês iniciante; Alemão básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Diego Modelo 44','Designer gráfico Pleno','Jundiaí','SP','Designer gráfico, Comunicação, Trabalho em equipe, Francês iniciante',true,true,true,'{"display_name":"Diego Modelo 44","city":"Jundiaí","state_code":"SP","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Designer gráfico.","experience":"Experiência simulada em Nexo Soluções 44 — Demonstração nas atividades de designer gráfico.","education":"Graduação tecnológica — instituição fictícia","courses":"Francês iniciante; Alemão básico","skills":"Designer gráfico, Comunicação, Trabalho em equipe, Francês iniciante","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 44
select id into v_user from auth.users where email='recruiter-44@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-44@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 44 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 44 — Demonstração','Jundiaí','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Designer gráfico Pleno','Nexo Soluções 44 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Designer gráfico Pleno, com conhecimentos de Designer gráfico, Comunicação, Trabalho em equipe, Francês iniciante. Jornada e benefícios ilustrativos. Não representa contratação real.','13201000','Jundiaí','SP','Online','Jovem Aprendiz',true,true);
end if;

-- school_staff 44
select id into v_user from auth.users where email='school_staff-44@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-44@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 44 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 44 — Demonstração','Jundiaí','SP') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Logística e estoque','Instituto Horizonte 44 — Demonstração','Curso fictício de Logística e estoque. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','13201000','Jundiaí','SP','Online',null,true,true);
end if;

-- learner 45
select id into v_user from auth.users where email='learner-45@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-45@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Elisa Modelo 45'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Elisa Modelo 45','Curitiba','PR','Auxiliar contábil, Comunicação, Trabalho em equipe, Alemão básico','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar contábil.','Experiência simulada em Nexo Soluções 45 — Demonstração nas atividades de auxiliar contábil.','Curso técnico — instituição fictícia','Alemão básico; Italiano para iniciantes','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Elisa Modelo 45','Auxiliar contábil Pleno','Curitiba','PR','Auxiliar contábil, Comunicação, Trabalho em equipe, Alemão básico',true,true,true,'{"display_name":"Elisa Modelo 45","city":"Curitiba","state_code":"PR","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar contábil.","experience":"Experiência simulada em Nexo Soluções 45 — Demonstração nas atividades de auxiliar contábil.","education":"Curso técnico — instituição fictícia","courses":"Alemão básico; Italiano para iniciantes","skills":"Auxiliar contábil, Comunicação, Trabalho em equipe, Alemão básico","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 45
select id into v_user from auth.users where email='recruiter-45@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-45@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 45 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 45 — Demonstração','Curitiba','PR') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Auxiliar contábil Pleno','Nexo Soluções 45 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Auxiliar contábil Pleno, com conhecimentos de Auxiliar contábil, Comunicação, Trabalho em equipe, Alemão básico. Jornada e benefícios ilustrativos. Não representa contratação real.','80010000','Curitiba','PR','Híbrido','Temporário',true,true);
end if;

-- school_staff 45
select id into v_user from auth.users where email='school_staff-45@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-45@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 45 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 45 — Demonstração','Curitiba','PR') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Assistente administrativo','Instituto Horizonte 45 — Demonstração','Curso fictício de Assistente administrativo. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','80010000','Curitiba','PR','Híbrido',null,true,true);
end if;

-- learner 46
select id into v_user from auth.users where email='learner-46@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-46@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Fábio Modelo 46'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Fábio Modelo 46','Belo Horizonte','MG','Cozinheiro, Comunicação, Trabalho em equipe, Italiano para iniciantes','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Cozinheiro.','Experiência simulada em Nexo Soluções 46 — Demonstração nas atividades de cozinheiro.','Graduação tecnológica — instituição fictícia','Italiano para iniciantes; Japonês básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Fábio Modelo 46','Cozinheiro Pleno','Belo Horizonte','MG','Cozinheiro, Comunicação, Trabalho em equipe, Italiano para iniciantes',true,true,true,'{"display_name":"Fábio Modelo 46","city":"Belo Horizonte","state_code":"MG","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Cozinheiro.","experience":"Experiência simulada em Nexo Soluções 46 — Demonstração nas atividades de cozinheiro.","education":"Graduação tecnológica — instituição fictícia","courses":"Italiano para iniciantes; Japonês básico","skills":"Cozinheiro, Comunicação, Trabalho em equipe, Italiano para iniciantes","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 46
select id into v_user from auth.users where email='recruiter-46@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-46@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 46 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 46 — Demonstração','Belo Horizonte','MG') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Cozinheiro Pleno','Nexo Soluções 46 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Cozinheiro Pleno, com conhecimentos de Cozinheiro, Comunicação, Trabalho em equipe, Italiano para iniciantes. Jornada e benefícios ilustrativos. Não representa contratação real.','30110000','Belo Horizonte','MG','Presencial','CLT',true,true);
end if;

-- school_staff 46
select id into v_user from auth.users where email='school_staff-46@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-46@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 46 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 46 — Demonstração','Belo Horizonte','MG') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Qualidade e melhoria contínua','Instituto Horizonte 46 — Demonstração','Curso fictício de Qualidade e melhoria contínua. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','30110000','Belo Horizonte','MG','Presencial',null,true,true);
end if;

-- learner 47
select id into v_user from auth.users where email='learner-47@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-47@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Gabriela Modelo 47'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Gabriela Modelo 47','Rio de Janeiro','RJ','Técnico em refrigeração, Comunicação, Trabalho em equipe, Japonês básico','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em refrigeração.','Experiência simulada em Nexo Soluções 47 — Demonstração nas atividades de técnico em refrigeração.','Curso técnico — instituição fictícia','Japonês básico; Mandarim introdutório','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Gabriela Modelo 47','Técnico em refrigeração Pleno','Rio de Janeiro','RJ','Técnico em refrigeração, Comunicação, Trabalho em equipe, Japonês básico',true,true,true,'{"display_name":"Gabriela Modelo 47","city":"Rio de Janeiro","state_code":"RJ","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico em refrigeração.","experience":"Experiência simulada em Nexo Soluções 47 — Demonstração nas atividades de técnico em refrigeração.","education":"Curso técnico — instituição fictícia","courses":"Japonês básico; Mandarim introdutório","skills":"Técnico em refrigeração, Comunicação, Trabalho em equipe, Japonês básico","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 47
select id into v_user from auth.users where email='recruiter-47@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-47@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 47 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 47 — Demonstração','Rio de Janeiro','RJ') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico em refrigeração Pleno','Nexo Soluções 47 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico em refrigeração Pleno, com conhecimentos de Técnico em refrigeração, Comunicação, Trabalho em equipe, Japonês básico. Jornada e benefícios ilustrativos. Não representa contratação real.','20040000','Rio de Janeiro','RJ','Online','PJ',true,true);
end if;

-- school_staff 47
select id into v_user from auth.users where email='school_staff-47@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-47@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 47 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 47 — Demonstração','Rio de Janeiro','RJ') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Refrigeração básica','Instituto Horizonte 47 — Demonstração','Curso fictício de Refrigeração básica. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','20040000','Rio de Janeiro','RJ','Online',null,true,true);
end if;

-- learner 48
select id into v_user from auth.users where email='learner-48@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-48@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Hugo Modelo 48'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Hugo Modelo 48','Porto Alegre','RS','Instalador de piscinas, Comunicação, Trabalho em equipe, Mandarim introdutório','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Instalador de piscinas.','Experiência simulada em Nexo Soluções 48 — Demonstração nas atividades de instalador de piscinas.','Graduação tecnológica — instituição fictícia','Mandarim introdutório; Libras introdutório','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Hugo Modelo 48','Instalador de piscinas Pleno','Porto Alegre','RS','Instalador de piscinas, Comunicação, Trabalho em equipe, Mandarim introdutório',true,true,true,'{"display_name":"Hugo Modelo 48","city":"Porto Alegre","state_code":"RS","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Instalador de piscinas.","experience":"Experiência simulada em Nexo Soluções 48 — Demonstração nas atividades de instalador de piscinas.","education":"Graduação tecnológica — instituição fictícia","courses":"Mandarim introdutório; Libras introdutório","skills":"Instalador de piscinas, Comunicação, Trabalho em equipe, Mandarim introdutório","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 48
select id into v_user from auth.users where email='recruiter-48@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-48@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 48 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 48 — Demonstração','Porto Alegre','RS') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Instalador de piscinas Pleno','Nexo Soluções 48 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Instalador de piscinas Pleno, com conhecimentos de Instalador de piscinas, Comunicação, Trabalho em equipe, Mandarim introdutório. Jornada e benefícios ilustrativos. Não representa contratação real.','90010000','Porto Alegre','RS','Híbrido','Estágio',true,true);
end if;

-- school_staff 48
select id into v_user from auth.users where email='school_staff-48@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-48@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 48 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 48 — Demonstração','Porto Alegre','RS') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Tratamento de piscinas','Instituto Horizonte 48 — Demonstração','Curso fictício de Tratamento de piscinas. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','90010000','Porto Alegre','RS','Híbrido',null,true,true);
end if;

-- learner 49
select id into v_user from auth.users where email='learner-49@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-49@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Isabela Modelo 49'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'Isabela Modelo 49','Recife','PE','Técnico de segurança do trabalho, Comunicação, Trabalho em equipe, Libras introdutório','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico de segurança do trabalho.','Experiência simulada em Nexo Soluções 49 — Demonstração nas atividades de técnico de segurança do trabalho.','Curso técnico — instituição fictícia','Libras introdutório; Inglês básico','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'Isabela Modelo 49','Técnico de segurança do trabalho Pleno','Recife','PE','Técnico de segurança do trabalho, Comunicação, Trabalho em equipe, Libras introdutório',true,true,true,'{"display_name":"Isabela Modelo 49","city":"Recife","state_code":"PE","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Técnico de segurança do trabalho.","experience":"Experiência simulada em Nexo Soluções 49 — Demonstração nas atividades de técnico de segurança do trabalho.","education":"Curso técnico — instituição fictícia","courses":"Libras introdutório; Inglês básico","skills":"Técnico de segurança do trabalho, Comunicação, Trabalho em equipe, Libras introdutório","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 49
select id into v_user from auth.users where email='recruiter-49@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-49@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 49 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 49 — Demonstração','Recife','PE') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Técnico de segurança do trabalho Pleno','Nexo Soluções 49 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Técnico de segurança do trabalho Pleno, com conhecimentos de Técnico de segurança do trabalho, Comunicação, Trabalho em equipe, Libras introdutório. Jornada e benefícios ilustrativos. Não representa contratação real.','50010000','Recife','PE','Presencial','Jovem Aprendiz',true,true);
end if;

-- school_staff 49
select id into v_user from auth.users where email='school_staff-49@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-49@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 49 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 49 — Demonstração','Recife','PE') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Segurança no trabalho','Instituto Horizonte 49 — Demonstração','Curso fictício de Segurança no trabalho. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','50010000','Recife','PE','Presencial',null,true,true);
end if;

-- learner 50
select id into v_user from auth.users where email='learner-50@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','learner-50@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','João Modelo 50'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'learner','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.pilot_profiles(user_id,display_name,city,state_code,skills,about,experience,education,courses,certifications) values(v_user,'João Modelo 50','Salvador','BA','Auxiliar de produção, Comunicação, Trabalho em equipe, Português e redação profissional','Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar de produção.','Experiência simulada em Nexo Soluções 50 — Demonstração nas atividades de auxiliar de produção.','Graduação tecnológica — instituição fictícia','Português e redação profissional; Inglês intermediário','Certificações ilustrativas, sem validade.') on conflict(user_id) do nothing;
insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,state_code,skills,visible,is_fictitious,is_featured,demo_resume) values(v_user,v_cohort,'João Modelo 50','Auxiliar de produção Pleno','Salvador','BA','Auxiliar de produção, Comunicação, Trabalho em equipe, Português e redação profissional',true,true,true,'{"display_name":"João Modelo 50","city":"Salvador","state_code":"BA","about":"Perfil inteiramente fictício para testar pesquisas e visualização. Objetivo: Auxiliar de produção.","experience":"Experiência simulada em Nexo Soluções 50 — Demonstração nas atividades de auxiliar de produção.","education":"Graduação tecnológica — instituição fictícia","courses":"Português e redação profissional; Inglês intermediário","skills":"Auxiliar de produção, Comunicação, Trabalho em equipe, Português e redação profissional","certifications":"Certificações ilustrativas, sem validade."}'::jsonb) on conflict(user_id) do nothing;

-- recruiter 50
select id into v_user from auth.users where email='recruiter-50@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','recruiter-50@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Nexo Soluções 50 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'recruiter','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Nexo Soluções 50 — Demonstração','Salvador','BA') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'job','Auxiliar de produção Pleno','Nexo Soluções 50 — Demonstração','Vaga fictícia para teste da plataforma. Atuação em Auxiliar de produção Pleno, com conhecimentos de Auxiliar de produção, Comunicação, Trabalho em equipe, Português e redação profissional. Jornada e benefícios ilustrativos. Não representa contratação real.','40020000','Salvador','BA','Online','Temporário',true,true);
end if;

-- school_staff 50
select id into v_user from auth.users where email='school_staff-50@demo.oempregador.invalid';
if not found then
v_user:=gen_random_uuid();
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,banned_until) values('00000000-0000-0000-0000-000000000000',v_user,'authenticated','authenticated','school_staff-50@demo.oempregador.invalid',null,now(),'{"provider":"email","providers":["email"],"demo":true}',jsonb_build_object('display_name','Instituto Horizonte 50 — Demonstração'),now(),now(),'2099-12-31');
end if;
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(v_cohort,v_user,'school_staff','active',true) on conflict(cohort_id,user_id) do nothing;
insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(v_user,v_cohort,'Instituto Horizonte 50 — Demonstração','Salvador','BA') on conflict(user_id) do nothing;
if not exists(select 1 from public.portal_listings where publisher_id=v_user and is_fictitious) then
insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type,is_fictitious,is_featured) values(v_cohort,v_user,'course','Design gráfico','Instituto Horizonte 50 — Demonstração','Curso fictício de Design gráfico. Conteúdo introdutório e atividades práticas, com foco no desenvolvimento profissional. Oferta demonstrativa: não há matrícula, cobrança ou certificado real.','40020000','Salvador','BA','Online',null,true,true);
end if;

-- Public access is opened only after both code and schema are deployed.
end $$;
