// Accessible field instructions shared by all current and future form renders.
const fieldHelp={
 careerCompany:{title:"Empresa do vínculo",text:"Informe a organização em que trabalhou ou trabalha. Cada vínculo tem sua própria admissão, saída e mudanças. Você pode registrar vínculos simultâneos."},
 careerStart:{title:"Data de admissão",text:"Informe quando começou neste vínculo. Use a data real, não a data da promoção. Promoções entram em registros separados."},
 careerEnd:{title:"Demissão ou saída",text:"Informe o último dia do vínculo, se já terminou. Deixe vazio se ainda trabalha nesta empresa. A data não pode anteceder a admissão."},
 careerRole:{title:"Cargo neste momento",text:"Na admissão, informe o cargo inicial. Em uma promoção ou mudança, informe o cargo após o evento. Ex.: Auxiliar técnico, Técnico ou Líder de equipe."},
 careerSalary:{title:"Salário mensal",text:"Informe o salário bruto mensal em reais, de forma consistente em todo o histórico. Não inclua bônus ou benefícios aqui. Na mudança, registre o novo valor mensal completo, não apenas o aumento."},
 careerLevel:{title:"Responsabilidade de 1 a 5",text:"Escolha um nível pessoal de responsabilidade: 1 inicial, 2 execução orientada, 3 autonomia, 4 liderança, 5 gestão estratégica. A escala é sua autoavaliação e não classifica o valor de uma profissão."},
 careerExitNotes:{title:"Contexto da saída",text:"Opcionalmente registre o contexto que deseja lembrar, como mudança de cidade ou nova oportunidade. Este histórico não entra automaticamente no currículo público."},
 careerEventType:{title:"Que mudança ocorreu?",text:"Promoção: evolução de cargo ou responsabilidade. Mudança de cargo: nova função. Reajuste salarial: mudança de remuneração. Em todos os casos, informe a situação completa após o evento."},
 careerEventDate:{title:"Data efetiva da mudança",text:"Informe quando a mudança passou a valer, dentro do período deste vínculo. Se já houver um registro na mesma data, edite-o para reunir as mudanças."},
 careerEventNotes:{title:"Resultados e conquistas",text:"Registre projetos, responsabilidades ou resultados que acompanharam a promoção. Use fatos concretos para lembrar sua evolução."},
 goalRole:{title:"Seu cargo desejado",text:"Informe uma função específica. Ex.: Técnico em automação pleno ou Coordenador de produção. Quanto mais clara a meta, melhor o planejamento."},
 goalCompany:{title:"Sua empresa-alvo",text:"Opcionalmente informe a empresa em que gostaria de trabalhar. Isso é uma preferência; o portal não garante vagas nessa empresa."},
 goalSalary:{title:"Sua meta de salário",text:"Informe o valor mensal bruto em reais que deseja receber. É um objetivo pessoal, não uma previsão ou promessa de remuneração."},
 goalDate:{title:"Quando pretende chegar lá?",text:"Escolha uma data futura como objetivo pessoal. O prazo de estudo pode ser calculado pelos dados informados, mas a contratação depende de fatores externos."},
 goalSkills:{title:"Requisitos da meta",text:"Liste com vírgulas as competências que o cargo exige. Consulte descrições de vagas reais. Ex.: CLP, elétrica industrial, liderança e inglês."},
 goalWeeklyHours:{title:"Tempo disponível por semana",text:"Informe quantas horas por semana consegue dedicar à formação, entre 1 e 60. Use um valor realista; ele será usado no cálculo do tempo de estudo."},
 goalBudget:{title:"Orçamento de formação",text:"Informe o valor mensal que pode reservar para cursos e desenvolvimento. Zero significa que não há orçamento mensal disponível. O cálculo não recomenda comprometer despesas essenciais."},
 learningTitle:{title:"Curso ou ação de desenvolvimento",text:"Informe o curso, projeto de portfólio, prática ou certificação que deseja realizar. As recomendações demonstrativas precisam ser confirmadas com fontes reais."},
 learningHours:{title:"Carga horária",text:"Informe o total de horas da ação. Deixe vazio se ainda não souber. O plano soma essas horas e divide pela disponibilidade semanal."},
 learningCost:{title:"Custo da ação",text:"Informe o custo total estimado, confirmado por você. Zero significa gratuito; vazio significa desconhecido. Inclua taxas ou materiais relevantes no valor ou como outra ação."},
 learningSource:{title:"De onde veio o valor?",text:"Registre a fonte e a data da consulta. Ex.: orçamento da escola em 10/10/2026. Nesta versão os preços não são pesquisados automaticamente."},
 processTitle:{title:"Qual vaga este processo atende?",text:"Use o cargo e, se necessário, turma ou unidade. Ex.: Técnico em manutenção — unidade Campinas."},
 processStages:{title:"Etapas da contratação",text:"Informe uma etapa por linha, na ordem do processo. Ex.: Triagem, entrevista, teste técnico e proposta. Depois, cada etapa poderá receber uma data e ser marcada ou desmarcada como concluída."},
 processCriteria:{title:"Como comparar candidatos?",text:"Informe critérios relacionados à vaga, um por linha. Todos os candidatos deste processo usarão os mesmos critérios, com notas de 0 a 10 e pesos iguais. Registre evidências ao avaliar."},
 interviewProcess:{title:"Escolha o processo",text:"Selecione o processo seletivo ao qual esta entrevista pertence. A avaliação será incluída somente no ranking desse processo."},
 interviewCandidate:{title:"Quem será entrevistado?",text:"Escolha um candidato de teste. Para responder ao convite, alterne para Candidato e selecione o mesmo perfil na agenda. Não há envio real de convite."},
 interviewAt:{title:"Horário da entrevista",text:"Informe uma data futura no horário de Brasília. O sistema avisa se houver sobreposição com outra entrevista do candidato ou organização."},
 interviewDuration:{title:"Tempo reservado",text:"Informe entre 10 e 180 minutos. Esse tempo é usado para verificar conflitos na agenda e o período de acesso à sala."},
 interviewURL:{title:"Sala de vídeo externa",text:"Cole o endereço HTTPS de uma sala que você criou em um serviço de vídeo. O portal não cria salas nesta versão. O botão de acesso aparece após confirmação, de 5 minutos antes até o término previsto."},
 interviewNotes:{title:"Prepare o candidato",text:"Informe assuntos, materiais necessários, orientações de acesso e o que será esperado na entrevista. Evite informações confidenciais."},
 proposalAt:{title:"Sua contraproposta",text:"Escolha outra data e hora futura em Brasília. O contratante precisa aceitar para confirmar o novo horário."},
 stageAt:{title:"Cronograma da etapa",text:"Informe quando esta etapa deve acontecer, no horário de Brasília. Você pode deixar vazio para remover o horário. A conclusão da etapa é independente da data."},
 ratingNotes:{title:"Evidências da avaliação",text:"Registre exemplos observados durante a entrevista que sustentem as notas. Essas observações são internas e não aparecem no painel do candidato."},
 boostItem:{title:"O que será impulsionado?",text:"Selecione o currículo ou publicação que você quer destacar. Um impulsionamento promove este conteúdo específico, não todas as publicações da conta."},
 boostDuration:{title:"Duração da campanha",text:"Escolha por quantos dias deseja participar do rodízio de destaques. Esta simulação não cobra e não garante uma quantidade de visualizações."},
 ownerTestPassword:{title:"Autorização pontual de teste",text:"Use uma senha fictícia de pelo menos 12 caracteres. O protótipo não autentica o responsável e não realiza compras. A senha não será salva; as permissões permanentes do usuário não mudam."},
 accountDocument:{title:"CPF ou CNPJ",text:"Candidatos: informe CPF. Organizações: informe CNPJ, incluindo letras quando houver. A verificação dos dígitos ajuda a detectar erros, mas não confirma identidade. Use dados de teste; o documento completo não será salvo."},
 accountPassword:{title:"Senha de teste",text:"Use pelo menos 12 caracteres e uma senha inventada para este teste. Ela não será salva nem autenticada. Nunca use a senha do seu e-mail ou de outro serviço."},
 confirmPassword:{title:"Confirme a senha",text:"Digite novamente a mesma senha fictícia para conferir se houve erro de digitação."},
 verificationCode:{title:"Segunda etapa de teste",text:"Nesta demonstração, use o código público 123456. Nenhum e-mail foi enviado. Na versão real, o código será enviado ao e-mail da conta e conferido no servidor."},
 memberName:{title:"Quem vai gerenciar?",text:"Informe o nome da pessoa que receberá acesso à organização. Na versão real, cada usuário terá sua própria conta."},
 memberEmail:{title:"E-mail do usuário",text:"Informe o e-mail da pessoa que vai administrar o perfil. Este teste não envia convite nem confirma titularidade."},
 memberPassword:{title:"Senha inicial de teste",text:"Crie uma senha fictícia de pelo menos 12 caracteres. Ela não será salva. Na versão real, o usuário definirá sua senha ao aceitar o convite."},
 name:{title:'Como se apresentar',candidate:'Informe seu nome completo como deseja que apareça no currículo. Ex.: Maria Oliveira Santos.',organization:'Use o nome pelo qual sua organização é conhecida. Ex.: Indústria Horizonte ou Escola Técnica Modelo.'},
 city:{title:'Localização',text:'Informe a cidade e o estado. Ex.: Sumaré / SP. Em oportunidades online, informe a cidade da organização; a modalidade é escolhida em outro campo.'},
 email:{title:'E-mail de contato',text:'Use um endereço que você consulta com frequência, sem espaços. Ex.: nome@exemplo.com. Conferir o formato não comprova que o endereço pertence a você.'},
 target:{title:'Seu objetivo',candidate:'Informe o cargo ou área em que quer trabalhar. Ex.: Desenhista mecânico júnior, estágio em automação ou primeiro emprego na indústria.',organization:'Informe o setor de atuação da organização. Ex.: Metalurgia, tecnologia, educação técnica ou manutenção industrial.'},
 skills:{title:'O que são competências?',candidate:'São conhecimentos e habilidades que você sabe aplicar. Ex.: SolidWorks, leitura de desenho técnico, metrologia, Excel, atendimento ao cliente e trabalho em equipe. Liste com vírgulas e inclua somente o que realmente domina.',organization:'Informe as habilidades exigidas pela vaga ou os assuntos abordados no curso ou treinamento. Ex.: CLP, elétrica industrial, Excel e gestão de equipes.'},
 about:{title:'Uma boa apresentação',candidate:'Resuma sua formação, principais habilidades e objetivo em 3 a 5 linhas. Ex.: Estudante de mecânica, com conhecimento em SolidWorks e metrologia, buscando minha primeira oportunidade na indústria.',organization:'Apresente o que sua organização faz, quem atende e seus diferenciais. Evite frases genéricas; use informações concretas.'},
 experience:{title:'O que colocar em experiência profissional?',text:'Para cada experiência, informe cargo, empresa, período e principais atividades ou resultados. Ex.: Auxiliar de produção — Empresa X — 03/2024 a 08/2026. Apoio à montagem e inspeção de peças. Se nunca trabalhou, escreva que busca o primeiro emprego e descreva projetos escolares, estágio ou trabalho voluntário, identificando cada atividade corretamente.'},
 education:{title:'Formação acadêmica e técnica',text:'Informe escolaridade, curso técnico de nível médio, graduação e pós-graduação, com instituição, unidade, período e situação. Aprendizagem industrial (CAI), qualificação e cursos livres entram em Cursos e treinamentos; certificações têm campo próprio.'},
 portfolio:{title:'Mostre o que você fez',text:'Cole um link público para seus projetos ou trabalhos, como um portfólio, GitHub ou pasta compartilhada. Confira se o recrutador consegue abrir o link. Não inclua documentos confidenciais de empresas.'},
 visibility:{title:'Quem poderá acessar seu currículo?',text:'Somente candidaturas: disponibilizar o currículo nas vagas às quais você se candidatar. Visível para recrutadores: permitir que organizações autorizadas o encontrem. Nesta demonstração os dados continuam somente neste navegador.'},
 resumeFile:{title:'Currículo pronto',text:'Selecione um arquivo PDF ou DOCX legível e atualizado. Confira nome, contatos e datas antes de anexar. Nesta versão somente o nome do arquivo é salvo; o conteúdo não é enviado nem extraído.'},
 type:{title:'Qual tipo de oportunidade?',text:'Vaga: oportunidade de trabalho. Curso: formação que oferece certificado. Treinamento: atividade sem certificado, conforme a classificação deste portal. Escolha antes de preencher os demais campos.'},
 title:{title:'Um título claro',text:'Para vagas, use cargo e nível: Técnico em manutenção júnior. Para cursos e treinamentos, informe o assunto: Modelagem 3D com SolidWorks. Evite títulos genéricos como Oportunidade imperdível.'},
 mode:{title:'Onde acontece?',text:'Presencial: exige comparecimento ao local. Online: trabalho remoto ou formação pela internet. Híbrido: combina atividades presenciais e a distância. Especifique dias e local na descrição.'},
 description:{title:'Informações que ajudam a decidir',text:'Vagas: descreva atividades, requisitos essenciais, jornada, local, remuneração, benefícios e seleção. Cursos: objetivo, conteúdo, público, requisitos, carga horária, datas, preço e condições do certificado. Treinamentos: use os mesmos detalhes e informe que não há certificado.'},
 accountName:{title:'Nome para o cadastro',text:'Informe seu nome completo. Se vai representar uma empresa ou instituição, use o seu nome como responsável; o nome da organização será preenchido no perfil.'},
 accountEmail:{title:'E-mail para acesso',text:'Informe um endereço ao qual você tem acesso. Ex.: nome@exemplo.com. A confirmação real exigirá um link ou código enviado a esse endereço; o envio ainda não está ativo nesta demonstração.'},
 accountRole:{title:'Escolha seu perfil inicial',text:'Candidato: buscar trabalho e formação. Empresa: contratar e divulgar oportunidades. Instituição de Ensino: divulgar cursos e vagas. Nesta demonstração você poderá alternar entre os perfis.'}
};
let helpCounter=0;
function attachFieldGuidance(){
 document.querySelectorAll('form label').forEach(label=>{
  const field=label.querySelector('input,select,textarea');if(!field||label.querySelector('.field-help'))return;
  const key=field.name||field.id;const entry=fieldHelp[key];if(!entry)return;
  const text=entry.text||(state.role==='Candidato'?entry.candidate:entry.organization);if(!text)return;
  const id='field-help-'+(++helpCounter);const inputId=field.id||'guided-field-'+helpCounter;field.id=inputId;label.htmlFor=inputId;
  const wrap=document.createElement('div');wrap.className='field-help';
  const trigger=document.createElement('button');trigger.type='button';trigger.className='help-trigger';trigger.textContent='?';trigger.setAttribute('aria-label','Ajuda: '+entry.title);trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',id);
  const popup=document.createElement('div');popup.id=id;popup.className='help-popup';popup.setAttribute('role','tooltip');
  const heading=document.createElement('strong');heading.textContent=entry.title;const body=document.createElement('p');body.textContent=text;popup.append(heading,body);wrap.append(trigger,popup);label.append(wrap);label.classList.add('guided-label');
  field.setAttribute('aria-describedby',[field.getAttribute('aria-describedby'),id].filter(Boolean).join(' '));
  trigger.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();const open=!wrap.classList.contains('help-open');document.querySelectorAll('.help-open').forEach(other=>{other.classList.remove('help-open');other.querySelector('button').setAttribute('aria-expanded','false');});wrap.classList.toggle('help-open',open);trigger.setAttribute('aria-expanded',String(open));});
  label.addEventListener('keydown',event=>{if(event.key==='Escape'){wrap.classList.remove('help-open');trigger.setAttribute('aria-expanded','false');}});
  if(key==='email'||key==='accountEmail'||key==='memberEmail')field.type='email';
 });
}
const fieldObserver=new MutationObserver(attachFieldGuidance);fieldObserver.observe(document.querySelector('#main'),{childList:true,subtree:true});attachFieldGuidance();
document.addEventListener('click',event=>{if(!event.target.closest('.guided-label'))document.querySelectorAll('.help-open').forEach(x=>{x.classList.remove('help-open');x.querySelector('button').setAttribute('aria-expanded','false');});});
