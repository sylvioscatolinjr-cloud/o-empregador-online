// Conteúdo da Nebu: próximos passos por página e dicas de campos.
// Tudo é texto fixo no navegador: nada é enviado a servidores nem a fornecedores de IA.
import {ORDER_CANDIDATES,ORDER_LISTINGS} from './nebu-coach.mjs';

const step=(text,target={})=>({text,...target});
const faq=(q,a)=>({q,a});

const common=[
 faq('O cadastro é grátis?','Sim. Criar a conta e usar os recursos básicos não custa nada. Os planos pagos liberam mais recursos e prioridade, e você pode conferir tudo em Planos.'),
 faq('Esqueci minha senha. E agora?','Na tela de entrar, clique em "Esqueci minha senha", informe o e-mail do cadastro e abra o link que chegar. Confira também o lixo eletrônico.'),
 faq('Meus dados ficam públicos?','Não. Seu currículo e seus dados ficam privados. Só aparece na página inicial o cartão que você decidir mostrar, com os campos que você escolher.')
];

const guides={
 home:({signedIn})=>({
  title:'Bem-vindo! Por onde começar?',
  steps:signedIn?[step('Abra sua área para continuar de onde parou.',{href:'/conta.html'}),step('Veja as vagas e cursos em destaque.',{href:'#vagas'}),step('Conheça os treinamentos do portal.',{href:'/treinamentos.html'})]
   :[step('Crie sua conta grátis: escolha Candidato, Empresa ou Instituição.',{href:'/conta.html?cadastro=1'}),step('Já tem conta? Entre com seu e-mail e senha.',{href:'/conta.html'}),step('Ou dê uma olhada nas vagas e cursos antes.',{href:'#vagas'})],
  faq:[faq('Qual perfil devo escolher?','Candidato é para quem procura trabalho ou estudo. Empresa é para quem contrata. Instituição é para escolas e cursos que querem divulgar turmas e captar alunos.'),...common]
 }),
 choose:()=>({
  title:'Escolha seu tipo de conta',
  steps:[step('Clique em Candidato, Empresa ou Instituição, conforme o seu caso.'),step('Preencha nome, documento, e-mail e uma senha de pelo menos 12 caracteres.'),step('Abra o e-mail de confirmação e clique no link para ativar a conta.')],
  faq:[faq('Qual perfil devo escolher?','Candidato é para quem procura trabalho ou estudo. Empresa é para quem contrata. Instituição é para escolas e cursos.'),faq('Posso ter mais de um perfil?','Cada e-mail corresponde a uma conta. Se você também representa uma empresa, use outro e-mail para ela.')]
 }),
 signup:()=>({
  title:'Vamos criar sua conta',
  steps:[step('Preencha todos os campos. Clique em um campo e eu explico para que ele serve.'),step('Crie uma senha forte, com 12 caracteres ou mais, e repita igual no campo seguinte.'),step('Clique em "Cadastrar e solicitar confirmação" e abra o link que chegar no seu e-mail.')],
  faq:[faq('Por que pedem CPF ou CNPJ?','Para evitar contas falsas e cadastros repetidos. O documento não aparece para outras pessoas.'),faq('Minha senha foi recusada. Por quê?','Ela precisa ter de 12 a 128 caracteres e não pode estar em listas de senhas vazadas na internet. Tente uma frase com palavras que só você conhece.'),faq('O e-mail de confirmação não chegou.','Espere alguns minutos e confira o lixo eletrônico e a aba Promoções. Na tela de entrar há a opção de reenviar o link.')]
 }),
 login:()=>({
  title:'Entrar na sua conta',
  steps:[step('Digite o e-mail e a senha usados no cadastro.'),step('Ainda não tem conta? Cadastre-se grátis.',{href:'/conta.html?cadastro=1'}),step('Não lembra a senha? Use "Esqueci minha senha".',{click:'[data-view="forgot"]'})],
  faq:[faq('Diz que meu e-mail não foi confirmado.','Abra o link de confirmação que enviamos no cadastro. Se não achar, peça para reenviar o link na própria tela.'),...common.slice(1)]
 }),
 verification:()=>({
  title:'Falta confirmar seu e-mail',
  steps:[step('Abra seu e-mail e procure a mensagem do O Empregador Online.'),step('Clique no link mais recente, de preferência no mesmo navegador.'),step('Não chegou? Confira o lixo eletrônico ou reenvie o link aqui mesmo.')],
  faq:[faq('Cliquei e deu erro.','O link vale uma vez e por tempo limitado. Peça um novo e use sempre o mais recente.')]
 }),
 forgot:()=>({
  title:'Recuperar a senha',
  steps:[step('Informe o e-mail usado no cadastro.'),step('Abra o link que chegar e crie uma nova senha com 12 caracteres ou mais.'),step('Depois, volte e entre normalmente.',{click:'[data-view="login"]'})],
  faq:[]
 }),
 resume:()=>({
  title:'Montando seu currículo',
  steps:[step('Siga as 7 etapas, de Contato até Revisar. Use "Próxima" para avançar.'),step('Tem um currículo em arquivo? Envie e confira o que foi aproveitado.'),step('No fim, clique em "Salvar currículo". Só depois disso ele fica gravado.'),step('Com o currículo salvo, defina sua meta profissional.',{click:'[data-view="goal"]'})],
  faq:[faq('Preciso preencher tudo?','Não. Nome, cidade e estado são o básico. Os campos marcados como opcionais só entram se você quiser.'),faq('Quem vê meu currículo?','Só você e as empresas ou instituições a quem você se candidatar ou der acesso. Você escolhe se mostra contato e foto.'),faq('Posso usar a IA para melhorar o texto?','Sim, em Meus agentes há a revisão de currículo. Ela usa créditos e você decide o que aceitar.')]
 }),
 goal:()=>({
  title:'Sua meta profissional',
  steps:[step('Diga o cargo que você quer alcançar e, se quiser, a empresa.'),step('Informe o salário desejado, as horas de estudo por semana e quanto pode investir.'),step('Clique em "Salvar minha meta". Depois veja as vagas e cursos.',{click:'[data-portal="listings"]'})],
  faq:[faq('A meta é uma promessa de emprego?','Não. Ela serve para organizar seus estudos e mostrar oportunidades que combinam com você.')]
 }),
 candidate:()=>({
  title:'O que fazer agora?',
  steps:[step('Complete seu currículo e autorize seu cartão público. Sem o cartão, as empresas não te encontram na busca.',{click:'[data-view="account"]'}),step('Defina sua meta profissional.',{click:'[data-view="goal"]'}),step('Procure vagas e cursos e candidate-se.',{click:'[data-portal="listings"]'}),step('Acompanhe as respostas em Minhas participações.',{click:'[data-portal="applications"]'})],
  faq:[faq('Como me candidato a uma vaga?','Abra Vagas e cursos, escolha a vaga e clique para participar. A empresa recebe seu currículo e responde pelo portal.'),faq('Como funciona a ordem dos currículos?',ORDER_CANDIDATES+' Só aparecem os cartões públicos autorizados, e a busca procura pelo título profissional e pelas competências do cartão.'),faq('Como ganho pontos profissionais?','Cadastre suas formações com comprovante em Minha formação e pontos. Depois de validadas, somam pontos: graduação 300, técnico 200, curso 1 ponto por hora, treinamento 2 pontos por hora, entre outros. O currículo em si não gera pontos.'),faq('Onde vejo se a empresa respondeu?','Em Minhas participações e no sino de Avisos. Você também pode ligar os Alertas no celular.'),...common.slice(2)]
 }),
 company:({school})=>({
  title:'O que fazer agora?',
  steps:school?[step('Complete os dados da instituição.',{click:'[data-view="account"]'}),step('Publique seus cursos e turmas.',{click:'[data-view="account"]'}),step('Veja os interesses recebidos.',{click:'[data-portal="applications"]'}),step('Busque alunos com o perfil dos seus cursos.',{click:'[data-portal="candidates"]'})]
   :[step('Complete os dados da empresa.',{click:'[data-view="account"]'}),step('Publique sua primeira vaga.',{click:'[data-view="account"]'}),step('Acompanhe as participações recebidas.',{click:'[data-portal="applications"]'}),step('Busque currículos com o perfil que você procura.',{click:'[data-portal="candidates"]'})],
  faq:[faq('Como publico uma vaga ou curso?','Em '+(school?'Dados da instituição e cursos':'Dados da empresa e publicações')+', preencha o formulário de publicação com título, descrição e local. O CEP define a região onde ela aparece.'),faq('Como dou acesso à minha equipe?','Em Equipe, use Subusuários e permissões. O convite exige o CPF exato da pessoa e ela precisa aceitar.'),faq('Como faço meu anúncio aparecer mais?','Use Destacar na vitrine ou Turbinar anúncio. O preço aparece antes de confirmar.'),faq('Como funciona a ordem dos anúncios?',ORDER_LISTINGS),faq('Como vejo a pontuação de cada setor?','Crie os departamentos e convide seus funcionários em Departamentos e equipe, pelo CPF. Depois que cada um aceita o vínculo e autoriza o cartão público, a média de pontos profissionais aparece por setor na área da '+(school?'instituição':'empresa')+'.')]
 }),
 signedIn:()=>({
  title:'O que fazer agora?',
  steps:[step('Use o menu do seu perfil para escolher o que fazer.'),step('Confira seus avisos e notificações.',{click:'[data-portal="notifications"]'}),step('Veja os planos e pacotes disponíveis.',{href:'/assinatura.html'})],
  faq:common.slice(2)
 }),
 assistente:()=>({
  title:'Usando os agentes de IA',
  steps:[step('Escolha uma tarefa na lista. O "?" ao lado explica cada uma.'),step('Escreva as informações pedidas. Não coloque CPF, telefone ou dados de outras pessoas.'),step('Confira o preço no botão e clique em "Confirmar e executar".'),step('Gostou da resposta? Salve no histórico privado.')],
  faq:[faq('Quanto custa?','A maioria das tarefas custa R$ 1,00 em créditos. A pesquisa externa Premium custa R$ 2,50 no modo padrão ou R$ 5,00 no modo ampliado. Selecionar uma tarefa não cobra nada.'),faq('Como coloco créditos?','Em Minha carteira, com recargas de R$ 10, R$ 25 ou R$ 50 por Pix ou cartão.')]
 }),
 assinatura:()=>({
  title:'Escolhendo um plano',
  steps:[step('Compare os níveis do seu perfil e o que cada um libera.'),step('Escolha o plano e a forma de pagamento.'),step('Depois do pagamento confirmado, o plano é liberado na sua conta.')],
  faq:[faq('Preciso de plano para usar o portal?','Não. O plano Grátis já permite cadastro, currículo e candidaturas. Os pagos dão mais recursos, prioridade e parte do valor em créditos de IA.'),faq('Posso cancelar?','Sim. As regras de cancelamento e reembolso estão nos Termos de Uso.')]
 }),
 carteira:()=>({
  title:'Sua carteira de créditos',
  steps:[step('Veja seu saldo de créditos de IA.'),step('Para recarregar, escolha R$ 10, R$ 25 ou R$ 50.'),step('Pague por Pix ou cartão. O saldo entra depois da confirmação.')],
  faq:[faq('Os créditos vencem?','Recargas avulsas não vencem. Créditos que vêm do plano seguem a validade do plano.'),faq('Paguei e o saldo não apareceu.','Pix costuma confirmar em poucos minutos. Atualize a página. Se demorar, fale com contato@oempregadoronline.com.br.')]
 }),
 treinamentos:()=>({
  title:'Cursos e treinamentos',
  steps:[step('Escolha um curso da lista.'),step('Assista às aulas na ordem e faça os exercícios.'),step('Seu progresso fica salvo na sua conta.')],
  faq:[faq('Os cursos são pagos?','Alguns são liberados conforme o nível do seu plano. O cadeado indica qual plano libera.')]
 }),
 blog:()=>({title:'Blog do portal',steps:[step('Leia as matérias sobre carreira e estudos.'),step('Crie sua conta para salvar cursos na sua lista de desejos.',{href:'/conta.html?cadastro=1'})],faq:[]}),
 desejos:()=>({title:'Sua lista de desejos',steps:[step('Diga o que você quer aprender.'),step('As instituições do portal usam esses pedidos para abrir novas turmas.')],faq:[]}),
 publicacoes:()=>({title:'Criando publicações',steps:[step('Escolha o formato e a qualidade da imagem.'),step('Escreva o que a publicação deve mostrar e confira o preço.'),step('Autorize a geração e baixe a imagem para postar nas suas redes.')],faq:[faq('A plataforma posta por mim?','Não. Você baixa a imagem e publica onde quiser.')]}),
 destaques:()=>({title:'Destacar na vitrine',steps:[step('Escolha o que quer destacar.'),step('Confira o período e o preço.'),step('Confirme o pagamento. O destaque entra no ar após a confirmação.')],faq:[]}),
 turbinar:()=>({title:'Turbinar anúncio',steps:[step('Escolha o anúncio e o público.'),step('Confira quantas pessoas recebem e o valor total antes de confirmar.')],faq:[faq('Quanto custa?','R$ 0,05 por pessoa que recebe o aviso. O total aparece antes da confirmação.')]}),
 instalar:()=>({title:'Instalar o aplicativo',steps:[step('No Android, toque em Instalar ou no menu ⋮ e "Adicionar à tela inicial".'),step('No iPhone, toque em Compartilhar e depois em "Adicionar à Tela de Início".')],faq:[]}),
 legal:()=>({title:'Documentos do portal',steps:[step('Aqui estão as regras de uso e de privacidade.'),step('Dúvidas? Escreva para contato@oempregadoronline.com.br.')],faq:[]})
};

const pages={'/':'home','/index.html':'home','/assistente.html':'assistente','/assinatura.html':'assinatura','/carteira.html':'carteira','/pagamentos.html':'carteira','/treinamentos.html':'treinamentos','/blog.html':'blog','/cursos-desejados.html':'desejos','/publicacoes.html':'publicacoes','/destaques.html':'destaques','/turbinar.html':'turbinar','/instalar.html':'instalar','/privacidade.html':'legal','/termos.html':'legal'};

// snapshot: {path, search, signedIn, forms:[ids], clickable:[selectors presentes], school}
export function nebuGuideKey(s={}){
 const path=String(s.path||'/'),forms=new Set(s.forms||[]);
 if(path==='/conta.html'||path.startsWith('/conta/')){
  if(forms.has('signup'))return 'signup';
  if(forms.has('verification'))return 'verification';
  if(forms.has('forgot')||forms.has('recovery-confirm'))return 'forgot';
  if(forms.has('login'))return /cadastro=1/.test(s.search||'')?'choose':'login';
  if(forms.has('profile'))return 'resume';
  if(forms.has('goal'))return 'goal';
  if(s.career)return 'candidate';
  if(s.recruiting)return 'company';
  if(s.signedIn)return 'signedIn';
  return /cadastro=1/.test(s.search||'')?'choose':'login';
 }
 return pages[path]||'home';
}

export function nebuGuide(s={}){
 const key=nebuGuideKey(s),g=guides[key](s),available=new Set(s.clickable||[]);
 // Atalhos que dependem de botões da tela só aparecem quando o botão existe.
 const steps=g.steps.map(x=>x.click&&!available.has(x.click)?{text:x.text}:x);
 return {key,title:g.title,steps,faq:g.faq};
}

const fields={
 name:'Seu nome como deve aparecer no portal. Use o nome verdadeiro; ele aparece para quem recebe sua candidatura.',
 document:'CPF para candidatos ou CNPJ para empresas e instituições. Só números ou com pontos, como preferir. Ele não aparece para ninguém.',
 email:'O e-mail que você usa de verdade. É por ele que você confirma a conta e recupera a senha.',
 password:'Use de 12 a 128 caracteres. Dica: uma frase com 3 ou 4 palavras que só você conhece. Senhas que já vazaram na internet são recusadas.',
 confirmation:'Digite a mesma senha de novo, para não haver erro de digitação.',
 first_name:'Seu primeiro nome.',last_name:'Seu sobrenome completo.',
 city:'A cidade onde você mora ou quer trabalhar. Ajuda a mostrar oportunidades perto de você.',
 state_code:'A sigla do estado com 2 letras, por exemplo SP ou MG.',
 phone:'Opcional. Com DDD. Só aparece para quem você autorizar.',
 address:'Opcional. Coloque só se a vaga pedir.',
 postal_code:'O CEP com 8 números. Ele preenche a região automaticamente.',postal:'O CEP com 8 números. Ele define a sua região sem mostrar seu endereço.',
 birth_date:'Opcional. Não é exigido para usar o portal.',
 marital_status:'Opcional. Você não é obrigado a informar.',
 nationality:'Opcional. Por exemplo: brasileira.',
 driving_license:'Só a categoria, como B ou AB. Nunca coloque o número da CNH.',
 photo_shape:'Escolha como a foto aparece no currículo: redonda, quadrada, arredondada ou retrato.',
 role:'O cargo que você quer, por exemplo "Auxiliar administrativo" ou "Técnico em eletrônica".',
 organization:'O nome da empresa ou instituição onde você trabalhou.',
 institution:'O nome da escola, faculdade ou curso.',
 level:'Por exemplo: Ensino médio, Técnico, Graduação, Pós-graduação.',
 hours:'O total de horas do curso, se você souber.',
 start:'Mês e ano em que começou.',end:'Mês e ano em que terminou. Se ainda está lá, marque "atualmente" e deixe em branco.',
 description:'Conte o que você fazia e os resultados. Frases curtas, com verbos: "Atendi clientes", "Organizei o estoque".',
 skills:'Suas habilidades separadas por vírgula, por exemplo: Excel, atendimento, solda.',
 about:'Um resumo curto de quem você é e do que procura. Duas ou três frases bastam.',
 certifications:'Certificados e cursos com nome e ano.',
 company:'Opcional. Uma empresa que você sonha em trabalhar.',
 salary:'O salário mensal que você deseja, só números.',
 target_date:'Opcional. Quando você quer alcançar essa meta.',
 weekly_hours:'Quantas horas por semana você consegue estudar.',
 budget:'Quanto pode investir por mês em cursos. Pode ser zero.',
 headline:'Uma frase curta sobre você, como "Eletricista com 5 anos de experiência".',
 title:'Um título claro e direto. Para vagas: o nome do cargo.',
 question:'Escreva o que precisa com detalhes, mas sem CPF, telefone ou dados de outras pessoas.',
 token:'O código que veio no convite. Copie e cole exatamente como recebeu.',
 query:'Digite uma palavra-chave, como um cargo ou uma habilidade.'
};
const byForm={signup:{name:'Seu nome completo ou, para empresa e instituição, o nome do responsável pela conta.'}};

export function nebuFieldTip({form='',name='',label='',type='',required=false,maxLength=-1}={}){
 const tip=byForm[form]?.[name]||fields[name];
 const clean=String(label||'').replace(/\s+/g,' ').trim();
 if(tip)return {label:clean||name,tip};
 if(!clean)return null;
 const parts=[required?'Este campo é obrigatório.':'',type==='email'?'Use um e-mail válido.':type==='date'?'Escolha a data no calendário.':type==='number'?'Use só números.':'',maxLength>0&&maxLength<=500?'Até '+maxLength+' caracteres.':''].filter(Boolean);
 return {label:clean,tip:parts.length?parts.join(' '):'Preencha com a informação pedida. Em caso de dúvida, use o "?" ao lado do campo, quando houver.'};
}

// Farejar: busca local no conteúdo da Nebu. A pergunta não sai do aparelho.
const places=[
 ['Criar conta grátis (cadastro)','Cadastre-se como Candidato, Empresa ou Instituição de ensino.','/conta.html?cadastro=1'],
 ['Entrar na minha conta (login)','Acesse com e-mail e senha. Também tem recuperar senha.','/conta.html'],
 ['Planos e assinatura','Compare os planos Grátis e pagos, preços, níveis e o que cada um libera.','/assinatura.html'],
 ['Minha carteira de créditos','Saldo de créditos de IA e recargas de R$ 10, R$ 25 ou R$ 50 por Pix ou cartão.','/carteira.html'],
 ['Agentes de IA (assistente)','Tarefas com inteligência artificial: currículo, entrevista, vaga, carreira, publicações.','/assistente.html'],
 ['Cursos e treinamentos','Aulas, exercícios e certificados do portal.','/treinamentos.html'],
 ['Blog','Matérias sobre carreira, emprego e estudos.','/blog.html'],
 ['Lista de desejos de cursos','Diga o que quer aprender para as instituições abrirem turmas.','/cursos-desejados.html'],
 ['Destacar na vitrine','Faça seu perfil, vaga ou curso aparecer em destaque na página inicial.','/destaques.html'],
 ['Turbinar anúncio','Envie aviso da sua vaga ou curso para mais pessoas. R$ 0,05 por pessoa.','/turbinar.html'],
 ['Publicações com imagem','Crie imagens para divulgar nas redes sociais.','/publicacoes.html'],
 ['Instalar o aplicativo no celular','Coloque o portal na tela inicial do Android ou iPhone.','/instalar.html'],
 ['Termos de Uso','Regras de uso, cancelamento e reembolso.','/termos.html'],
 ['Política de Privacidade','Como seus dados são usados e protegidos (LGPD), excluir conta.','/privacidade.html'],
 ['Vagas e cursos','Veja as oportunidades de emprego e cursos em destaque.','/#vagas'],
 ['Falar com a equipe (contato, suporte)','Escreva para contato@oempregadoronline.com.br.','mailto:contato@oempregadoronline.com.br']
].map(([title,text,href])=>({title,text,href,kind:'lugar'}));

const fieldTitles={document:'CPF ou CNPJ',password:'Senha',confirmation:'Repetir a senha',postal_code:'CEP',postal:'CEP',driving_license:'CNH (carteira de motorista)',email:'E-mail',phone:'Telefone',skills:'Competências e habilidades',about:'Resumo e objetivo do currículo',description:'Descrição das atividades',salary:'Salário desejado',state_code:'Estado (UF)',birth_date:'Data de nascimento',marital_status:'Estado civil',token:'Código do convite'};

export function nebuKnowledge(){
 const out=[...places],seen=new Set();
 const ctx=[{},{signedIn:true},{school:true}];
 for(const [key,fn] of Object.entries(guides))for(const c of ctx){const g=fn(c);for(const f of g.faq){const id=f.q+f.a;if(seen.has(id))continue;seen.add(id);out.push({title:f.q,text:f.a,kind:'dúvida'});}
  const id='g:'+g.title+g.steps.map(s=>s.text).join();if(!seen.has(id)){seen.add(id);out.push({title:g.title,text:g.steps.map((s,i)=>(i+1)+'. '+s.text).join(' '),kind:'passo',href:Object.entries(pages).find(([,k])=>k===key)?.[0]});}}
 for(const [name,title] of Object.entries(fieldTitles))out.push({title:'Campo: '+title,text:fields[name],kind:'campo'});
 return out;
}

const stop=new Set('a o as os de da do das dos e em no na nos nas um uma uns umas para pra por com como que qual quais onde quando eu meu minha meus minhas me se ao aos é ser ter tem tenho fazer faço faz posso pode consigo quero preciso sobre isso esse essa este esta nebu oi ola'.split(' '));
export const sniffWords=t=>words(t);
export const fold=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9@. ]+/g,' ');
const near=(a,b)=>{if(a===b)return true;let i=0;while(i<a.length&&a[i]===b[i])i++;return i>=Math.max(4,Math.min(a.length,b.length)-2);};
const stem=w=>w.length>4?w.replace(/(oes|aes|ais|eis|ns|s)$/,''):w;
const words=t=>fold(t).split(/\s+/).filter(w=>w&&!stop.has(w)).map(stem);
const synonyms={emprego:['vaga','trabalho'],trabalho:['vaga','emprego'],vaga:['emprego','trabalho'],login:['entrar'],entrar:['login'],logar:['entrar','login'],cadastrar:['cadastro','conta','criar'],registrar:['cadastro','conta'],dinheiro:['credito','pagamento','pix'],pagar:['pagamento','pix','cartao'],credito:['carteira','saldo','recarga'],saldo:['carteira','credito'],preco:['plano','custa','valor'],custa:['preco','plano','valor'],curso:['treinamento','aula'],ia:['agente','inteligencia'],robo:['agente','ia'],cv:['curriculo'],senha:['password'],celular:['aplicativo','instalar'],app:['aplicativo','instalar'],apagar:['excluir','privacidade'],excluir:['privacidade','dados'],empresa:['recrutar','publicar'],aluno:['instituicao','curso'],suporte:['contato','equipe'],ajuda:['contato','duvida']};

export function nebuSniff(query,entries=nebuKnowledge()){
 const problem=nebuTroubleshoot(query);if(problem)return [problem];
 const q=words(query);if(!q.length)return [];
 const terms=[...new Set(q.flatMap(w=>[w,...(synonyms[w]||[]).map(stem)]))];
 const score=e=>{const title=words(e.title),text=words(e.text);let s=0,hits=0;for(const t of terms){const main=q.includes(t)?1:0.5;const inTitle=title.some(w=>near(w,t)),inText=text.some(w=>near(w,t));if(inTitle||inText)hits+=main;s+=main*((inTitle?3:0)+(inText?1:0));}return hits?s*(hits/q.length):0;};
 const titles=new Set();
 return entries.map(e=>({...e,score:score(e)})).filter(e=>e.score>=1).sort((a,b)=>b.score-a.score).filter(e=>!titles.has(e.title)&&titles.add(e.title)).slice(0,3);
}

// Regras locais: uma dificuldade relatada tem prioridade sobre instruções de uso.
// Não consultam conta, pagamentos ou dados pessoais e não executam operações.
export function nebuTroubleshoot(query){
 const q=fold(query);
 const failed=/\b(erro|falha|travou|travado|expirou|expirado|recusado|problema)\b|nao (?:\w+ ){0,3}(?:funciona|funcionou|acontece|aconteceu|aparece|apareceu|chegou|recebi|consigo|entrou|liberou|salva|salvou|carrega|abre)|nada (?:\w+ ){0,2}acontece|sem (?:resposta|retorno)|deu errado|nao deu certo/.test(q);
 if(!failed)return null;
 const result=(title,text,href)=>({title,text,href,kind:'problema'});
 const support=' Se continuar, escreva para contato@oempregadoronline.com.br informando a etapa e a mensagem de erro. Não envie senha, código de acesso, CPF ou dados bancários.';
 if(/candidat|participa|vaga/.test(q))return result('A candidatura não funcionou?',
  'Primeiro, entre na sua conta de Candidato e confira Minhas participações para saber se a candidatura já foi registrada. Se não estiver lá, volte à vaga e confira se há algum campo obrigatório ou mensagem de erro. Preserve textos não salvos antes de atualizar a página. A Nebu não consegue confirmar ou enviar sua candidatura por você.'+support,'/conta.html');
 if(/pix|pag|credito|saldo|recarga|assinatura|plano/.test(q))return result('Pagamento ou benefício não apareceu?',
  'Confira se está na mesma conta usada na compra. Para recargas, abra Minha carteira; para planos, abra Planos e assinatura. Na compra correspondente, use "Atualizar situação do pagamento", se disponível, e confira a mensagem exibida. Não pague novamente para tentar liberar o saldo. A Nebu não consulta pagamentos e não confirma crédito ou estorno.'+support,/assinatura|plano/.test(q)?'/assinatura.html':'/carteira.html');
 if(/senha|login|entrar|acesso|email|e mail|confirm|link|otp/.test(q))return result('Não conseguiu entrar ou confirmar o e-mail?',
  'Confira o e-mail digitado e a mensagem exibida. Para recuperar a senha, use "Esqueci minha senha". Se o link expirou, solicite um novo e abra o mais recente; confira também o lixo eletrônico. Não compartilhe senha nem códigos com a Nebu ou com o atendimento.'+support,'/conta.html');
 if(/salv|curriculo|formulario|cadastro|campo|publica/.test(q))return result('Não conseguiu salvar ou concluir?',
  'Confira os campos obrigatórios e a mensagem mostrada junto ao formulário. Preserve o texto que ainda não foi salvo antes de sair ou atualizar a página. Só considere concluído depois de receber a confirmação na tela. A Nebu não salva nem altera seus dados.'+support);
 return result('Em qual etapa você encontrou o problema?',
  'Foi ao entrar, salvar o currículo, enviar uma candidatura ou conferir um pagamento? Escreva a etapa e o que apareceu na tela, sem senha, código de acesso, CPF ou dados bancários. A Nebu oferece orientações locais; não consulta sua conta. Se preferir, fale com contato@oempregadoronline.com.br.');
}

