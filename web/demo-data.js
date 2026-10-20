/* Private review sandbox. All /api requests stay in this browser; no real account data is read. */
window.EMPLOYER_DEMO = true;
window.EMPLOYER_DEMO_KEY = 'empregador-private-review-v17';
window.makeEmployerDemo = function () {
  const now=Date.now(),day=86400000;
  const cv=(id,name,skills)=>({id,type:'Currículo',org:name,title:'Desenhista mecânico',city:'Campinas',mode:'Presencial',skills,description:'Perfil inteiramente fictício para demonstração.',publisherPlan:'Profissional'});
  const person=(id,name,stages)=>({id,name,status:'Em seleção',stages});
  const interview=(id,candidateID,candidateName,offset,status,rating=null)=>({id,owner:'Empresa',processID:'demo-process',candidateID,candidateName,recruiter:'Marina Exemplo',organization:'Horizonte Industrial · fictícia',at:now+offset,duration:30,meetingMode:'demo',meetingURL:'',notes:'Prepare um exemplo de projeto e conte como resolveu um desafio técnico. Entrevista de demonstração.',status,proposal:null,rating});
  return {role:'Empresa',plan:'Premium',plansByRole:{Empresa:'Premium',Candidato:'Profissional','Instituição de Ensino':'Profissional'},profile:{
    Candidato:{name:'Alex Modelo',email:'alex@example.com',city:'Campinas',addressCity:'Campinas',uf:'SP',cep:'13025-000',target:'Desenhista mecânico',skills:'SolidWorks, desenho técnico',about:'Profissional fictício em desenvolvimento na área industrial.',experience:'Histórico de demonstração.',visibility:'Visível para recrutadores',receiveAds:true},
    Empresa:{name:'Horizonte Industrial · fictícia',email:'recrutamento@example.com',city:'Campinas',addressCity:'Campinas',uf:'SP',cep:'13025-000',target:'Indústria e tecnologia',skills:'Engenharia, manufatura',receiveAds:true},
    'Instituição de Ensino':{name:'Instituto Técnico Modelo · fictício',email:'ensino@example.com',city:'Campinas',addressCity:'Campinas',uf:'SP',cep:'13025-000',skills:'Formação profissional',receiveAds:true}},
    favorites:['c1'],applications:['demo-vaga'],posts:[
      {id:'demo-vaga',type:'Vaga',owner:'Empresa',title:'Desenhista mecânico',org:'Horizonte Industrial · fictícia',city:'Campinas',mode:'Presencial',skills:'SolidWorks, metrologia, desenho técnico',description:'Desenvolvimento de peças e conjuntos industriais. Vaga fictícia.',opportunityCEP:'13025-000',salaryMin:4000,salaryMax:5500,publisherPlan:'Premium',jobType:'CLT'},
      cv('demo-bia','Beatriz Exemplo','SolidWorks, metrologia'),cv('demo-caio','Caio Ilustrativo','SolidWorks, desenho técnico'),cv('demo-dani','Daniela Modelo','Metrologia, desenho técnico')],
    applicationRecords:[{id:'demo-application',jobID:'demo-vaga',candidateID:'own-cv',name:'Alex Modelo',status:'Em seleção',at:now-day}],
    recruitment:{processes:[{id:'demo-process',owner:'Empresa',title:'Desenhista mecânico · seleção 2026',vacancyID:'demo-vaga',created:now-7*day,criteria:['Conhecimento técnico','Comunicação','Resolução de problemas','Competências da vaga'],stages:[{name:'Triagem dos currículos',done:true,at:now-3*day},{name:'Entrevista inicial',done:false,at:now+day},{name:'Desafio técnico',done:false,at:now+3*day},{name:'Proposta de contratação',done:false,at:now+5*day}],people:[person('own-cv','Alex Modelo',[true,false,false,false]),person('demo-bia','Beatriz Exemplo',[true,true,true,false]),person('demo-caio','Caio Ilustrativo',[true,true,false,false]),person('demo-dani','Daniela Modelo',[true,false,false,false])]}],interviews:[
      interview('demo-live','own-cv','Alex Modelo',0,'Aceita'),
      interview('demo-pending','own-cv','Alex Modelo',day,'Pendente'),
      interview('demo-alt','own-cv','Alex Modelo',2*day,'Pendente'),
      interview('demo-decline','own-cv','Alex Modelo',3*day,'Pendente'),
      interview('demo-bia-done','demo-bia','Beatriz Exemplo',-2*day,'Realizada',{scores:[9,8,9,10],notes:'Respondeu com evidências do projeto fictício; demonstrou domínio técnico.',at:now-day,by:'Marina Exemplo'}),
      interview('demo-caio-done','demo-caio','Caio Ilustrativo',-day,'Realizada',{scores:[8,8,8,8],notes:'Boa comunicação; pode aprofundar a análise do projeto fictício.',at:now-day,by:'Marina Exemplo'})]},
    career:{jobs:[{id:'demo-job-1',company:'Oficina Aurora · fictícia',start:'2018-03-01',end:'2021-06-30',role:'Auxiliar técnico',salary:1800,level:1,exitNotes:'Transição para nova oportunidade no exemplo.',events:[{id:'demo-event-1',date:'2020-01-01',type:'Promoção',role:'Técnico',salary:2800,level:2,notes:'Assumiu projetos no cenário fictício.'}]},{id:'demo-job-2',company:'Horizonte Industrial · fictícia',start:'2021-07-01',end:null,role:'Técnico pleno',salary:3500,level:3,events:[{id:'demo-event-2',date:'2024-02-01',type:'Promoção',role:'Líder técnico',salary:5200,level:4,notes:'Liderança de uma equipe fictícia.'}]}],goal:{role:'Coordenador de projetos',company:'Indústria Modelo · fictícia',salary:8000,date:new Date(now+365*day).toISOString().slice(0,10),skills:'SolidWorks, metrologia, liderança',weeklyHours:6,budget:300},learning:[{id:'demo-learning-1',title:'Metrologia aplicada · exemplo',hours:24,cost:240,source:'Valor fictício para simulação'},{id:'demo-learning-2',title:'Liderança de equipes · exemplo',hours:36,cost:360,source:'Valor fictício para simulação'}],steps:{requisitos:true}},progress:{records:[]},demoVersion:17};
};
(function () {
  const nativeFetch=window.fetch?.bind(window),key=window.EMPLOYER_DEMO_KEY;
  const load=()=>{try{return JSON.parse(localStorage.getItem(key+'-api')||'null')}catch{return null}};
  const initial=load();let snapshot=initial?.state||window.makeEmployerDemo(),version=initial?.version||1;
  const messages=initial?.messages||[{id:'welcome-candidate',title:'Seu próximo passo está agendado',message:'Confira seus convites na Agenda de entrevistas. Você pode aceitar, recusar ou propor outro horário.',roles:['Candidato'],kind:'comunicado',at:Date.now(),read:false,demo:true},{id:'welcome-company',title:'Processo pronto para testar',message:'Quatro candidatos fictícios e avaliações de exemplo já estão disponíveis no seu processo.',roles:['Empresa','Instituição de Ensino'],kind:'comunicado',at:Date.now(),read:false,demo:true}];
  const campaigns=initial?.campaigns||[],quotes=new Map();let unlocked=true;
  const persist=()=>{localStorage.setItem(key+'-api',JSON.stringify({state:snapshot,version,messages,campaigns}))};
  const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','ETag':'"demo-'+version+'"'}});
  window.employerDemoStore={get snapshot(){return snapshot},messages,async reset(){await window.ResumeFiles.remove();localStorage.removeItem(key+'-api');localStorage.removeItem(key+'-demo-reviewer');localStorage.removeItem(key);}};
  window.fetch=async function(input,options={}) {
    const url=new URL(typeof input==='string'?input:input.url,window.location?.origin||'https://demo.example');
    if(!url.pathname.startsWith('/api/'))return nativeFetch(input,options);
    const path=url.pathname.replace('/api/',''),body=typeof options.body==='string'?JSON.parse(options.body):{};
    if(path==='state'){if(options.method==='PUT'){const expected='"demo-'+version+'"';if(options.headers?.['If-Match']!==expected)return response({error:'Os dados mudaram em outra sessão.'},412);snapshot=body;version++;persist();return response({saved:true})}return response({user:{id:'demo-reviewer',email:'demonstracao@example.com'},state:snapshot})}
    if(path==='resume'){
      if(options.method==='PUT'){
        const blob=options.body;let name;try{name=decodeURIComponent(options.headers?.['X-File-Name']||'')}catch{return response({error:'Nome inválido.'},400)}
        if(!blob?.arrayBuffer||!blob.size||blob.size>5*1024*1024||!/[.](pdf|docx)$/i.test(name))return response({error:'Escolha PDF ou DOCX de até 5 MB.'},415);
        const bytes=new Uint8Array(await blob.arrayBuffer()),pdf=new TextDecoder().decode(bytes.slice(0,5))==='%PDF-',word=bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4;
        if(/[.]pdf$/i.test(name)?!pdf:!word)return response({error:'O conteúdo não corresponde ao formato.'},415);
        const metadata=await window.ResumeFiles.put(blob,name,pdf?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document');return response(metadata);
      }
      const record=await window.ResumeFiles.get();if(!record)return response({error:'Anexo não encontrado neste navegador.'},404);
      return new Response(record.blob,{headers:{'Content-Type':record.type,'Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(record.name),'Cache-Control':'private, no-store'}});
    }
    if(path==='portal/session')return response({eligible:true,unlocked,email:'administrador@example.com',document:'DEMONSTRAÇÃO',paymentsConnected:false});
    if(path==='portal/owner-logout'){unlocked=false;return response({unlocked})}
    if(path==='portal/owner-login'){unlocked=true;return response({unlocked})}
    if(path==='portal/inbox'){const role=window.employerDemoRole||snapshot.role;const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();const profile=snapshot.profile[role]||{};const list=messages.filter(m=>{if(!m.roles.includes(role))return false;const t=m.target;if(!t||t.scope==='Brasil')return true;if(t.scope==='Região')return norm(t.region)==='sudeste';if(norm(t.uf)!==norm(profile.uf))return false;if(t.scope==='Estado')return true;if(norm(t.city)!==norm(profile.addressCity||profile.city))return false;return t.scope!=='Bairro'||norm(t.district)===norm(profile.district)});return response({messages:list,unread:list.filter(m=>!m.read).length})}
    if(path==='portal/read'){const item=messages.find(m=>m.id===body.id);if(item)item.read=true;persist();return response({read:true})}
    if(path.startsWith('portal/cep/'))return response({cep:path.split('/').at(-1),addressCity:'Campinas',uf:'SP',district:'Bairro Modelo · fictício',street:'Via de demonstração',region:'Sudeste',latitude:-22.90,longitude:-47.06});
    if(path==='portal/owner-stats'){
      const p=url.searchParams.get('period')||'mes',n={dia:24,semana:7,mes:30,trimestre:3,semestre:6,ano:12}[p]||12;
      const scale={dia:1,semana:4,mes:12,trimestre:36,semestre:72,ano:144}[p]||12;
      const anchor=new Date((url.searchParams.get('anchor')||new Date().toISOString().slice(0,10))+'T12:00:00-03:00');const end=anchor.getTime()+43200000,start=end-({dia:1,semana:7,mes:30,trimestre:90,semestre:180,ano:365}[p])*86400000;
      const series=Object.fromEntries(['curriculos','vagas','cursos','receita'].map((k,j)=>[k,Array.from({length:n},(_,i)=>({label:p==='dia'?i+'h':p==='semana'?['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][i]:String(i+1),value:Math.round((2+(i*7+j*3)%9)*scale*(j===3?1200:1))}))]));
      const metrics=Object.fromEntries(Object.entries(series).map(([k,a])=>[k,a.reduce((s,x)=>s+x.value,0)]));return response({demo:true,coverage:'Indicadores inteiramente fictícios. Os seis filtros recalculam contadores e gráficos para demonstrar a navegação.',period:{start,end},metrics,totals:{curriculos:18420,vagas:14256,cursos:12348,receita:18975000},series,unknownDates:{curriculos:0,vagas:0,cursos:0}});
    }
    if(path==='portal/quote'){
      if(!body.target?.roles?.length)return response({error:'Selecione pelo menos um público.'},400);
      const multiplier={Brasil:60,Região:25,Estado:12,Cidade:6,Bairro:2}[body.target.scope]||1;
      const q={id:'demo-quote-'+Date.now(),reach:multiplier*body.target.roles.length,amountCents:body.notice?0:multiplier*body.target.roles.length*5,target:body.target,demo:true,notice:body.notice,expiresAt:Date.now()+900000};quotes.set(q.id,q);return response(q);
    }
    if(path==='portal/campaigns'&&options.method==='POST'){
      const q=quotes.get(body.quoteID);if(!q)return response({error:'Calcule o público novamente.'},400);
      const c={id:'demo-notice-'+Date.now(),title:body.title,message:body.message,target:q.target,notice:q.notice,demo:true,reach:q.reach,amountCents:q.amountCents,publicationRole:window.employerDemoRole||snapshot.role,status:q.notice?'enviada':'pendente',createdAt:Date.now(),updatedAt:Date.now()};campaigns.unshift(c);
      if(q.notice)messages.unshift({id:c.id,title:c.title,message:c.message,roles:c.target.roles,target:c.target,kind:'comunicado',at:Date.now(),read:false,demo:true});persist();return response(c);
    }
    if(path==='portal/campaigns')return response({campaigns});
    if(path.startsWith('portal/campaigns/')){const [, ,id,action]=path.split('/'),c=campaigns.find(c=>c.id===id);if(!c)return response({error:'Campanha não encontrada.'},404);
      if(action==='review'){c.status=body.action==='aprovar'?'aguardando_pagamento':'recusada';c.decisionReason=body.reason||'Aprovado na demonstração.';c.updatedAt=Date.now();persist();return response(c)}
      if(action==='simulate-payment'){if(c.status!=='aguardando_pagamento')return response({error:'Aguarde a aprovação da campanha.'},400);c.status='enviada';c.updatedAt=Date.now();messages.unshift({id:c.id,title:c.title,message:c.message,target:c.target,roles:c.target.roles,kind:'anuncio',at:Date.now(),read:false,demo:true});persist();return response(c)}
      const read=messages.filter(m=>m.id===c.id&&m.read).length;return response({campaign:c,reached:c.status==='enviada'?c.reach:0,confirmedRead:read,readRate:c.status==='enviada'?read/c.reach*100:0})}
    return response({error:'Esta ação exige a integração real e não está ativa no protótipo.'},400);
  };
})();
