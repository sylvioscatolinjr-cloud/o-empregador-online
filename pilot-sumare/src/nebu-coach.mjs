// Nebu incentivadora: regras locais sobre o que falta no cadastro.
// Recebe só marcas sim/não calculadas no navegador com dados já carregados pela própria tela.
// Nada é enviado a servidores nem a fornecedores de IA, e o conteúdo dos campos não sai daqui.

const filled=v=>String(v??'').trim().length>0;
const longEnough=(v,n)=>String(v??'').trim().length>=n;

// Fatos do portal usados nas mensagens (conferidos em db/ordered-public-feeds.sql e db/paid-candidate-priority.sql):
// currículos: destaque pago, nível do plano, pontos profissionais validados; só cartões públicos autorizados aparecem.
// anúncios: destaque pago, nível do plano da organização, média de pontos profissionais da equipe.
export const ORDER_CANDIDATES='Na busca das empresas e na vitrine, a ordem é: destaques pagos, depois assinantes (do nível mais alto ao Grátis), depois quem tem mais pontos profissionais.';
export const ORDER_LISTINGS='Na vitrine, os anúncios aparecem nesta ordem: destaques pagos, depois organizações assinantes (do nível mais alto ao Grátis), depois a média de pontos profissionais da equipe.';

// Candidato: profile (pilot_profiles), card (portal_candidate_cards), goal (meta).
export function candidateStatus({profile={},card=null,goal=null}={}){
 const d=profile?.resume_details||{},c=d.contact||{},entries=d.entries||{};
 const has=k=>filled(profile?.[k])||(Array.isArray(entries[k])&&entries[k].length>0);
 const names=String(profile?.display_name||'').trim().split(/\s+/).filter(Boolean);
 return {profile:'candidate',checks:{
  name:filled(c.first_name)&&filled(c.last_name)||names.length>=2,
  place:filled(profile?.city)&&filled(profile?.state_code),
  contact:filled(c.phone)||filled(c.email),
  photo:filled(profile?.photo_data),
  about:longEnough(profile?.about,40),
  experience:has('experience'),
  education:has('education'),
  courses:has('courses'),
  skills:filled(profile?.skills),
  card:Boolean(card?.visible),
  cardSearch:Boolean(card?.visible)&&filled(card?.headline)&&filled(card?.skills),
  goal:Boolean(goal&&filled(goal.role))
 }};
}

// Empresa ou instituição: org (portal_organizations), listings (próprias), points (média da equipe).
export function organizationStatus({school=false,org=null,listings=[],points=null}={}){
 const rows=(listings||[]).filter(l=>!l.is_fictitious),jobs=rows.filter(l=>l.kind==='job'),courses=rows.filter(l=>l.kind==='course'||l.kind==='training');
 const own=school?courses:jobs;
 const jobComplete=l=>longEnough(l.description,150)&&filled(l.required_requirements)&&filled(l.benefits)&&filled(l.salary)&&filled(l.behavioral_profile);
 const courseComplete=l=>longEnough(l.description,250)&&filled(l.modality)&&filled(l.postal_code);
 const members=points&&!points.unavailable?Number(points.organization?.members||0):null;
 return {profile:school?'school':'company',checks:{
  name:filled(org?.name),
  place:filled(org?.city)&&filled(org?.state_code),
  logo:filled(org?.logo_data),
  published:own.length>0,
  detailed:own.length>0&&own.every(school?courseComplete:jobComplete),
  ...(school?{}:{team:members===null?null:members>0,departments:points&&!points.unavailable?(points.departments||[]).length>0:null})
 },counts:{published:own.length}};
}

const tip=(id,title,text,target={})=>({id,title,text,...target});
const tipsFor={
 candidate:[
  tip('card','Apareça para as empresas','Só entra na busca das empresas quem autoriza o cartão público. Abra "Meu cartão na página inicial" e marque a autorização. Seu CPF, e-mail e currículo completo continuam privados.',{focus:'#portal-public-card'}),
  tip('cardSearch','Título e competências no cartão','A busca das empresas procura pelo seu título profissional e pelas competências do cartão. Sem eles, fica difícil alguém te encontrar.',{focus:'#portal-public-card'}),
  tip('name','Nome e sobrenome','Use seu nome completo na etapa Contato. É ele que a empresa vê quando você se candidata.',{focus:'#profile'}),
  tip('place','Cidade e estado','Com cidade e estado preenchidos, as empresas da sua região te acham mais fácil.',{focus:'#profile'}),
  tip('experience','Experiências','Conte onde trabalhou, o cargo e o que fazia. Vale bico, estágio e trabalho voluntário. Frases curtas, como "Atendi clientes" ou "Organizei o estoque".',{focus:'#profile'}),
  tip('education','Formação','Informe a escolaridade, mesmo que ainda esteja estudando. Muitas vagas pedem ensino médio ou técnico.',{focus:'#profile'}),
  tip('skills','Competências','Liste o que você sabe fazer, separado por vírgula: Excel, atendimento, solda, inglês básico.',{focus:'#profile'}),
  tip('about','Resumo','Duas ou três frases sobre quem você é e o que procura. É a primeira coisa que o recrutador lê.',{focus:'#profile'}),
  tip('courses','Cursos','Cursos livres também contam. E as formações comprovadas em "Minha formação e pontos" viram pontos profissionais.',{click:'[data-talent="learning"]'}),
  tip('contact','Contato','Um telefone ou e-mail de contato ajuda a empresa a te chamar. Você escolhe se ele aparece.',{focus:'#profile'}),
  tip('photo','Foto','Uma foto de rosto, com fundo simples, deixa seu cartão mais fácil de reconhecer. É opcional.',{focus:'#profile'}),
  tip('goal','Meta profissional','Diga o cargo que você quer alcançar. Assim eu e o portal mostramos vagas e cursos que combinam com você.',{click:'[data-view="goal"]'})
 ],
 company:[
  tip('name','Nome da empresa','Preencha o nome da organização. Ele aparece em todos os seus anúncios.',{focus:'#portal-organization'}),
  tip('logo','Logo','Anúncio com logo passa mais confiança e aparece com imagem na vitrine e nos destaques.',{focus:'#portal-organization'}),
  tip('place','Cidade e estado','Com cidade e estado, sua vaga aparece para quem procura perto de você.',{focus:'#portal-organization'}),
  tip('published','Publique sua primeira vaga','Clique em "Publicar oportunidade". O cadastro é grátis e a vaga já entra na vitrine.',{click:'[data-portal="publish"]'}),
  tip('detailed','Vagas bem preenchidas','Confira se cada vaga tem descrição com atividades, requisitos obrigatórios, perfil comportamental, benefícios ("Oferecemos") e salário ou faixa. Vaga completa atrai candidatos mais certos e evita perguntas repetidas.',{click:'[data-portal="publish"]'}),
  tip('team','Traga sua equipe','Peça aos seus funcionários que cadastrem o currículo no portal e convide cada um em "Departamentos e equipe". Com o vínculo aceito, você vê a média de pontos de cada setor e decide com mais segurança onde treinar e quem contratar. E a média da equipe também ajuda na ordem dos seus anúncios.',{click:'[data-extended="team"]'}),
  tip('departments','Organize por setor','Crie os departamentos (Vendas, Produção, Administrativo...) para ver a pontuação de cada setor separadamente.',{click:'[data-extended="team"]'})
 ],
 school:[
  tip('name','Nome da instituição','Preencha o nome da instituição. Ele aparece em todos os seus cursos.',{focus:'#portal-organization'}),
  tip('logo','Logo','Curso com logo passa mais confiança e aparece com imagem na vitrine e nos destaques.',{focus:'#portal-organization'}),
  tip('place','Cidade e estado','Com cidade e estado, seus cursos aparecem para quem procura perto de você.',{focus:'#portal-organization'}),
  tip('published','Cadastre seu primeiro curso','Clique em "Publicar oportunidade" e escolha Curso com certificado ou Treinamento.',{click:'[data-portal="publish"]'}),
  tip('detailed','Cursos bem descritos','Na descrição, conte o conteúdo, a carga horária, a data de início, os dias e horários, o valor e as formas de pagamento, o certificado e os pré-requisitos. Quanto mais claro, menos dúvidas e mais matrículas.',{click:'[data-portal="publish"]'})
 ]
};

// Dicas de crescimento: sempre verdadeiras, aparecem em rodízio depois que o básico está feito.
const growth={
 candidate:[
  tip('g-plan','Assinantes aparecem primeiro',ORDER_CANDIDATES+' Um plano pago coloca seu currículo à frente dos perfis gratuitos e parte do valor volta em créditos de IA.',{href:'/assinatura.html'}),
  tip('g-points','Ganhe pontos profissionais','Cadastre suas formações com comprovante em "Minha formação e pontos". Depois de validadas, elas somam pontos e melhoram sua posição na busca.',{click:'[data-talent="learning"]'}),
  tip('g-ai','Currículo revisado por IA','Em Meus agentes, a revisão de currículo sugere melhorias e você escolhe o que aceitar. Custa a partir de R$ 1,00 em créditos.',{href:'/assistente.html'}),
  tip('g-apply','Candidate-se toda semana','Separe um tempo fixo para olhar Vagas e cursos. Constância faz diferença.',{click:'[data-portal="listings"]'})
 ],
 company:[
  tip('g-plan','Assinantes aparecem primeiro',ORDER_LISTINGS+' Assinar coloca suas vagas à frente das organizações no plano Grátis e parte do valor volta em créditos de IA.',{href:'/assinatura.html'}),
  tip('g-ai','Agente de IA para recrutar','Em Meus agentes há tarefas como "Preparar descrição de vaga", "Criar perguntas de entrevista" e "Analisar competências do setor", a partir de R$ 1,00 em créditos.',{href:'/assistente.html'}),
  tip('g-boost','Turbine a vaga','Com Turbinar, o aviso da vaga chega a mais pessoas por R$ 0,05 por destinatário. O total aparece antes de confirmar.',{href:'/turbinar.html'}),
  tip('g-search','Busque currículos','Não espere só as candidaturas: use "Buscar currículos" para achar quem tem o perfil da vaga.',{click:'[data-portal="candidates"]'})
 ],
 school:[
  tip('g-ai','Agente de IA para captar alunos','Em Meus agentes há tarefas como "Preparar divulgação de curso", "Criar posts para divulgar cursos" e "Planejar parceria com empresas", a partir de R$ 1,00 em créditos. A pesquisa Premium de oportunidades para captar alunos custa R$ 2,50.',{href:'/assistente.html'}),
  tip('g-class','Sua próxima turma já está completa?','Se ainda faltam alunos, turbine o anúncio: o aviso chega a mais pessoas por R$ 0,05 por destinatário, e você vê o total antes de confirmar.',{href:'/turbinar.html'}),
  tip('g-plan','Assinantes aparecem primeiro',ORDER_LISTINGS+' Assinar coloca seus cursos à frente das instituições no plano Grátis e parte do valor volta em créditos de IA.',{href:'/assinatura.html'}),
  tip('g-search','Busque alunos','Use "Buscar alunos" para encontrar quem tem o perfil dos seus cursos.',{click:'[data-portal="candidates"]'})
 ]
};

const why={
 candidate:'Currículo incompleto aparece menos e convence menos. '+ORDER_CANDIDATES,
 company:'Cadastro e vagas completos passam confiança e atraem candidatos mais certos. '+ORDER_LISTINGS,
 school:'Cadastro e cursos completos passam confiança e trazem mais interessados. '+ORDER_LISTINGS
};

// status: saída de candidateStatus/organizationStatus. turn: número para o rodízio das dicas de crescimento.
export function nebuCoach(status,turn=0){
 if(!status||!tipsFor[status.profile])return null;
 const checks=Object.entries(status.checks).filter(([,v])=>v!==null&&v!==undefined);
 const done=checks.filter(([,v])=>v).length,total=checks.length;
 const missing=tipsFor[status.profile].filter(t=>status.checks[t.id]===false);
 const extra=growth[status.profile];
 const g=extra[Math.abs(Math.trunc(turn))%extra.length];
 return {profile:status.profile,done,total,percent:total?Math.round(done*100/total):100,complete:missing.length===0,
  why:why[status.profile],tips:missing.slice(0,3),growth:g};
}

// Frase curta para o balão, sem insistir: só a próxima coisa a fazer.
export function nebuNudge(coach){
 if(!coach)return '';
 if(coach.complete)return coach.growth.title+'! Quer ver?';
 return `Seu cadastro está ${coach.percent}% completo. Que tal: ${coach.tips[0].title.toLowerCase()}?`;
}

// Frases positivas, escritas para o portal, em rodízio pelo dia do ano (sem sorteio, sem rede).
export const quotes=[
 'Cada passo conta. Até o pequeno.',
 'Você não precisa ver a escada inteira para subir o primeiro degrau.',
 'Quem se prepara hoje encontra a oportunidade de amanhã.',
 'Seu esforço de hoje é o currículo de amanhã.',
 'Recomeçar também é avançar.',
 'Aprender algo novo hoje já faz de você alguém diferente de ontem.',
 'Um "não" é só o caminho perguntando se você quer mesmo. Continue.',
 'Constância vence talento que não aparece.',
 'Ninguém nasce pronto. A gente se faz no caminho.',
 'O trabalho dignifica, e o estudo abre portas.',
 'Grandes conquistas começam com uma decisão simples: tentar.',
 'Seu valor não cabe numa folha, mas uma boa folha ajuda a mostrar.',
 'Hoje é um bom dia para dar o próximo passo.',
 'Acredite no seu potencial. A gente acredita.',
 'Quem ensina transforma vidas. Quem aprende transforma o futuro.',
 'Equipe que aprende junto cresce junto.',
 'Contratar bem é cuidar de quem está e de quem vai chegar.',
 'Pequenas melhorias todos os dias fazem uma grande diferença no fim do ano.',
 'A oportunidade gosta de quem está preparado e visível.',
 'Coragem não é ausência de medo. É ir mesmo assim.',
 'Seu futuro agradece o que você faz por ele hoje.',
 'Cada currículo enviado é uma porta que você bateu. Uma vai abrir.',
 'Educação é o investimento que ninguém tira de você.',
 'Faça hoje o que o seu "eu" de daqui a um ano vai agradecer.',
 'Persistir é a forma mais bonita de acreditar.',
 'Toda experiência ensina, até as difíceis.',
 'Respira, organiza e segue. Você consegue.',
 'Talento se descobre. Competência se constrói.',
 'Um bom dia de trabalho começa com uma boa intenção.',
 'O caminho fica mais leve quando a gente sabe para onde vai.'
];
export function quoteOfDay(date=new Date()){
 const start=Date.UTC(date.getFullYear(),0,0),day=Math.floor((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-start)/86400000);
 return quotes[day%quotes.length];
}

// Ponte entre a tela (app.js) e a Nebu (nebu.js), dois arquivos separados no navegador.
// Leva só as marcas sim/não acima; fica na memória da página e some ao sair ou recarregar.
export const STATUS_EVENT='oeo:nebu-status';
export function publishNebuStatus(status,target=globalThis){
 target.__oeoNebuStatus=status||null;
 try{target.document?.dispatchEvent(new target.CustomEvent(STATUS_EVENT,{detail:status||null}));}catch{}
}
// Atualiza marcas depois que a pessoa salva algo, sem recarregar a tela.
export function patchNebuStatus(profiles,checks,target=globalThis){
 const s=target.__oeoNebuStatus;
 if(!s||![].concat(profiles).includes(s.profile))return;
 publishNebuStatus({...s,checks:{...s.checks,...checks}},target);
}
