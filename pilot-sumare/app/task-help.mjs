const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const purposes={
 free_learner:'Atende pedidos abertos sobre currículo, estudos, carreira e preparação profissional usando as informações fornecidas, sem executar ações nem consultar dados externos automaticamente.',
 free_recruiter:'Atende pedidos abertos sobre gestão, vagas, recrutamento e desenvolvimento de equipes com revisão humana e sem decisões automáticas sobre pessoas.',
 free_school_staff:'Atende pedidos abertos sobre aulas, cursos, parcerias e empregabilidade usando textos autorizados e dados agregados, sem identificar ou avaliar alunos.',
 resume_review:'Compara os campos do currículo salvo com o texto do anexo e propõe melhorias de redação. Você escolhe quais sugestões salvar; o original não é substituído automaticamente.',
 vacancy_pitch:'Adapta sua apresentação às exigências da vaga informada, usando somente suas experiências e competências verdadeiras.',
 application_message:'Prepara uma mensagem de candidatura para o canal escolhido. A plataforma não envia a mensagem por você.',
 experience_writing:'Melhora a clareza da descrição de atividades e resultados profissionais, sem inventar fatos ou números.',
 vacancy_requirements:'Explica os requisitos da vaga que você informar e ajuda a esclarecer suas dúvidas.',
 personal_introduction:'Organiza uma apresentação pessoal a partir do objetivo e das experiências que você informar.',
 interview_practice:'Sugere preparação e perguntas de entrevista e comenta respostas de treino, conforme a vaga informada.',
 resume_vacancy_match:'Compara o resumo profissional informado com os requisitos da vaga e aponta pontos fortes e lacunas. Esta tarefa usa o texto que você fornecer.',
 study_plan:'Organiza uma sequência de estudos conforme seu objetivo, conhecimentos, tempo disponível e prazo.',
 salary_negotiation:'Ajuda a estruturar argumentos e prioridades para uma negociação salarial. Não promete valores nem negocia por você.',
 portfolio_review:'Sugere melhorias na apresentação dos projetos descritos. Links e arquivos externos não são acessados automaticamente.',
 career_transition:'Organiza passos para mudar de área considerando suas competências, objetivos e restrições.',
 career_gps:'Transforma o objetivo profissional informado em etapas de desenvolvimento e critérios de acompanhamento.',
 goal_followup:'Revê o andamento de uma meta e sugere ajustes com base no plano anterior e no progresso informado. Não acompanha suas ações automaticamente.',
 monthly_progress:'Organiza uma revisão do mês com avanços, dificuldades e próximos passos, usando os resultados que você informar.',
 offer_comparison:'Compara condições das oportunidades que você apresentar de acordo com suas prioridades. Não busca vagas automaticamente.',
 promotion_preparation:'Ajuda a preparar uma conversa sobre promoção com argumentos baseados em responsabilidades e contribuições comprovadas.',
 learning_next_steps:'Sugere como aplicar aprendizados recentes ao seu objetivo profissional.',
 job_description:'Organiza um rascunho de vaga com atividades e requisitos profissionais. A publicação continua sob sua decisão.',
 interview_questions:'Sugere perguntas relacionadas à função e às competências desejadas. Não decide contratação ou rejeição.',
 candidate_messages:'Prepara mensagens para etapas do processo seletivo. Nenhuma mensagem é enviada automaticamente.',
 onboarding_script:'Organiza um roteiro de integração com etapas, rotinas e recursos para a função informada.',
 internal_announcements:'Prepara um comunicado interno claro com assunto, público e ação esperada. O envio é feito por você.',
 role_description:'Estrutura a finalidade, as responsabilidades e as interfaces de um cargo.',
 practical_assessment:'Sugere um teste prático e critérios verificáveis conforme a função, o tempo e os recursos disponíveis.',
 competency_interview:'Organiza uma entrevista por competências com perguntas e critérios profissionais para revisão humana.',
 training_paths:'Sugere uma trilha de treinamento a partir das competências e lacunas agregadas informadas, sem analisar pessoas identificadas.',
 feedback_conversation:'Ajuda a estruturar uma conversa de feedback com fatos profissionais e melhorias desejadas, sem julgamentos automáticos sobre pessoas.',
 job_requirements_review:'Revê a relação entre atividades da função e exigências da vaga para identificar ajustes de clareza e pertinência.',
 recruitment_diagnosis:'Analisa etapas, prazos e números agregados informados para sugerir melhorias no recrutamento.',
 department_diagnosis:'Relaciona objetivos do setor e competências agregadas para sugerir prioridades de desenvolvimento.',
 employee_development:'Organiza um plano de desenvolvimento a partir de competências e objetivos informados, sem acessar ou avaliar trabalhadores identificados.',
 succession_planning:'Ajuda a estruturar necessidades de sucessão por funções e competências. Não escolhe sucessores nem classifica pessoas.',
 recruiting_metrics:'Interpreta os indicadores agregados de recrutamento que você fornecer. Não coleta métricas automaticamente.',
 onboarding_review:'Compara o plano de integração com resultados agregados informados e sugere ajustes para o próximo ciclo.',
 recurring_training:'Organiza ciclos de capacitação considerando prioridades, capacidade e resultados agregados anteriores.',
 course_planning:'Estrutura uma proposta de curso com objetivos, conteúdo, carga horária e recursos.',
 lesson_plan:'Organiza objetivos, atividades e recursos de uma aula conforme o tempo e os conhecimentos prévios gerais.',
 exercises_rubrics:'Sugere exercícios e critérios de avaliação de acordo com os objetivos de aprendizagem. Não atribui notas automaticamente.',
 teaching_material_review:'Revê a clareza e a organização do trecho didático próprio ou autorizado que você informar.',
 course_promotion:'Prepara um texto de divulgação com informações confirmadas do curso. Não publica nem envia automaticamente.',
 partnership_draft:'Organiza um rascunho de proposta de parceria com objetivos e contrapartidas, sujeito à revisão dos responsáveis.',
 curriculum_review:'Revê a coerência entre ementa, conteúdo e objetivos de aprendizagem informados.',
 learning_adaptation:'Sugere adaptações de aula para níveis de conhecimento apresentados de forma agregada.',
 practical_projects:'Propõe projetos práticos alinhados às competências, ao tempo e aos recursos informados.',
 vacancy_curriculum_alignment:'Relaciona os requisitos profissionais das vagas informadas com a ementa do curso. Não pesquisa vagas automaticamente.',
 learning_recovery:'Sugere atividades de recuperação com base em dificuldades agregadas, sem dados ou notas individuais de alunos.',
 course_path:'Organiza uma sequência de cursos efetivamente oferecidos, respeitando objetivos e pré-requisitos informados.',
 industry_partnerships:'Ajuda a planejar uma parceria com empresas a partir de área, região e resultados agregados. Não contata empresas.',
 skill_demand_review:'Interpreta contagens agregadas de competências fornecidas por você. Não realiza pesquisa automática de mercado.',
 course_calendar:'Organiza uma proposta de portfólio e calendário conforme cursos, capacidade e demanda agregada informados.',
 education_metrics:'Ajuda a interpretar indicadores educacionais agregados, considerando período, método e amostra, sem avaliar alunos identificados.',
 syllabus_cycle:'Propõe ajustes periódicos em ementas a partir da revisão anterior e dos resultados agregados informados.',
 training_results:'Organiza uma análise dos objetivos, ações e resultados agregados de programas formativos com empresas.'
};
export function taskHelp(task){
 const resume=task.id==='resume_review';
 return {description:purposes[task.id]||task.hint||'Consulte as instruções deste recurso.',steps:resume?[
  'Em Meu currículo, envie o PDF/DOCX ou preencha os campos, revise e salve na mesma conta.',
  'Selecione Revisar meu currículo e clique em Carregar meu currículo e anexo. Confira os campos e o texto extraído.',
  'Marque a autorização de envio dos textos à OpenAI e clique em Analisar currículo salvo. A análise custa R$ 1,00 em créditos.',
  'Compare Original e Sugestão da IA. Marque apenas o que deseja aceitar e clique em Salvar somente sugestões selecionadas, ou escolha Manter o original. Salvar não cobra novamente.'
 ]:[
  'Selecione este recurso. Confira o marcador de seleção. Todos os recursos do seu perfil estão disponíveis; a execução exige saldo.',
  task.hint||'Informe o objetivo e as informações profissionais necessárias no campo da tarefa.',
  'Confira o texto, retire contatos e dados sensíveis e clique em Confirmar e executar — R$ 1,00 em créditos.',
  'Revise a resposta. Se desejar, salve no histórico privado. Consultar, salvar e retomar são gratuitos; executar uma nova análise custa R$ 1,00.'
 ]};
}
export function taskHelpMarkup(task,prefix,index){
 const help=taskHelp(task),id=prefix+'-help-'+task.id;
 if(task.ownerTesting)help.steps=help.steps.map(step=>step.replaceAll('R$ 1,00 em créditos','uma tentativa do limite de teste, sem débito na carteira').replaceAll('custa R$ 1,00','usa uma tentativa do limite de teste, sem débito na carteira'));
 return `<button type="button" class="ai-task-help" data-task-help aria-label="Ajuda: ${esc(task.label)}" aria-expanded="false" aria-controls="${esc(id)}">?</button>${Number.isInteger(index)?`<span class="ai-resource-number" aria-label="Recurso ${index+1}">${index+1}</span>`:''}<div class="ai-task-help-panel" id="${esc(id)}" hidden><strong>Para que serve</strong><p>${esc(help.description)}</p><strong>Como usar</strong><ol>${help.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><p>${task.available?(task.ownerTesting?'Liberado para teste do proprietário.':'Disponível em todos os planos do seu perfil; execução com saldo.'):'Requer plano nível '+Number(task.minTier)+'. Clique no recurso para consultar o plano que libera o acesso.'} Abrir esta ajuda não seleciona o recurso nem consome créditos.</p>${task.id==='resume_review'?'':'<p>Esta tarefa usa o texto informado por você. Dados da plataforma, resultados, vagas ou indicadores não são consultados automaticamente. Não informe dados pessoais de terceiros.</p>'}</div>`;
}
const helpRoots=new WeakSet();
export function attachTaskHelp(root){
 if(helpRoots.has(root))return;helpRoots.add(root);
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-task-help]');if(!button||!root.contains(button))return;
  event.preventDefault();event.stopPropagation();
  const panel=root.ownerDocument.getElementById(button.getAttribute('aria-controls'));if(!panel||!root.contains(panel))return;
  const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));panel.hidden=!open;
 });
}
