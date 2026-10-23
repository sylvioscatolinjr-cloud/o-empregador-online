/**
 * Agent capability catalog. Product metadata only: it does not authorize paid
 * entitlements or invoke an AI provider. Server must verify both separately.
 */
export const AGENT_ROLES = Object.freeze({
  learner: 'candidate',
  recruiter: 'company',
  school_staff: 'institution'
});

const catalogs = {
  candidate: {
    title: 'Agente de Carreira',
    mission: 'Evoluir profissionalmente com metas verificáveis.',
    capabilities: [
      ['career_diagnosis','Diagnóstico de carreira'],
      ['resume_review','Revisão de currículo sem inventar experiências'],
      ['career_gps','GPS de Carreira e metas'],
      ['skill_gaps','Lacunas de competências'],
      ['job_matching','Compatibilidade com vagas'],
      ['course_guidance','Cursos e treinamentos'],
      ['interview_practice','Simulação de entrevistas']
    ]
  },
  company: {
    title: 'Agente de Gestão e Talentos',
    mission: 'Desenvolver equipes e apoiar contratações responsáveis.',
    capabilities: [
      ['job_description','Apoio à descrição de vagas'],
      ['skill_matching','Comparação explicável de competências'],
      ['department_diagnosis','Diagnóstico de departamentos'],
      ['training_paths','Trilhas de treinamento'],
      ['succession_planning','Planejamento de sucessão']
    ]
  },
  institution: {
    title: 'Agente de Evolução Educacional',
    mission: 'Atrair novos alunos, divulgar cursos e desenvolver a oferta educacional.',
    capabilities: [
      ['demand_radar','Radar agregado de demanda profissional'],
      ['course_planning','Planejamento de cursos'],
      ['employability','Indicadores de empregabilidade consentidos'],
      ['industry_partnerships','Parcerias com empresas'],
      ['curriculum_review','Sugestões de atualização curricular']
    ]
  }
};
export function getAgentCatalog(role) {
  const key = typeof role==='string'&&Object.hasOwn(AGENT_ROLES,role)?AGENT_ROLES[role]:null;
  if (!key) return null; // owner/admin is not implicitly another tenant
  const agent = catalogs[key];
  return {profile:key,title:agent.title,mission:agent.mission,
    capabilities:agent.capabilities.map(([id,label])=>({id,label,status:'planned'}))};
}

// Six functions per tier and profile. Only resume_review reads saved data.
const guided = {
 "learner": [
  [
   "resume_review",
   "Revisar meu currículo",
   1,
   "Carregue seu currículo salvo e o anexo. Compare as sugestões e escolha o que salvar.",
   "Revise o texto do currículo, preserve os fatos e indique melhorias sem inventar experiências."
  ],
  [
   "vacancy_pitch",
   "Adaptar apresentação para uma vaga",
   1,
   "Informe a vaga e um resumo profissional verdadeiro.",
   "Redija apresentação curta alinhada à vaga, apontando quais informações fornecidas sustentam cada destaque; não invente qualificações."
  ],
  [
   "application_message",
   "Escrever mensagem de candidatura",
   1,
   "Informe cargo, canal e competências relevantes, sem contatos.",
   "Crie mensagem objetiva de candidatura e assunto de e-mail, sem afirmar envio."
  ],
  [
   "experience_writing",
   "Melhorar descrição de experiências",
   1,
   "Informe atividades e resultados comprováveis, sem nomes de terceiros.",
   "Reescreva atividades com clareza e verbos concretos; não invente números, cargos ou resultados."
  ],
  [
   "vacancy_requirements",
   "Entender requisitos de uma vaga",
   1,
   "Cole os requisitos e suas dúvidas.",
   "Explique requisitos em linguagem simples, diferencie obrigatório e desejável quando explicitados, e liste pontos a confirmar."
  ],
  [
   "personal_introduction",
   "Preparar apresentação pessoal",
   1,
   "Informe objetivo e experiências relevantes.",
   "Prepare apresentações profissionais de 30 e 60 segundos fiéis aos fatos fornecidos."
  ],
  [
   "interview_practice",
   "Preparar uma entrevista",
   2,
   "Informe a vaga, suas competências e, se houver, respostas de treino.",
   "Proponha perguntas de entrevista; quando houver respostas fornecidas, dê feedback com critérios e exemplos, sem garantir aprovação."
  ],
  [
   "resume_vacancy_match",
   "Comparar currículo com uma vaga",
   2,
   "Informe resumo profissional e requisitos da vaga, sem contatos.",
   "Compare requisitos com evidências fornecidas em tabela, diferencie lacuna de informação ausente e priorize melhorias; não estime probabilidade de contratação."
  ],
  [
   "study_plan",
   "Montar plano de estudos",
   2,
   "Informe objetivo, conhecimentos, horas semanais e prazo.",
   "Monte plano semanal com prática, marcos verificáveis e revisão; não invente cursos disponíveis ou preços."
  ],
  [
   "salary_negotiation",
   "Preparar negociação salarial",
   2,
   "Informe proposta, prioridades e argumentos profissionais; omita dados de terceiros.",
   "Crie roteiro de negociação e alternativas; não invente média salarial nem ofereça garantia financeira."
  ],
  [
   "portfolio_review",
   "Revisar apresentação do portfólio",
   2,
   "Cole descrição dos projetos e objetivos; links não são acessados.",
   "Revise clareza, contribuição individual e evidências dos projetos fornecidos; indique informações ausentes e melhorias de apresentação."
  ],
  [
   "career_transition",
   "Planejar transição de carreira",
   2,
   "Informe área atual, área desejada, competências e restrições.",
   "Mapeie competências transferíveis, lacunas, projetos de teste e etapas de transição sem prometer emprego."
  ],
  [
   "career_gps",
   "Planejar minha carreira",
   3,
   "Informe objetivo, competências, prazo e disponibilidade.",
   "Proponha trilha com etapas verificáveis, horas estimadas e revisão periódica; não prometa emprego ou renda."
  ],
  [
   "goal_followup",
   "Acompanhar minhas metas",
   3,
   "Informe meta, plano anterior e o que concluiu ou ficou pendente.",
   "Compare progresso declarado com a meta, identifique obstáculos e proponha próximos passos verificáveis; não alegue acompanhamento automático."
  ],
  [
   "monthly_progress",
   "Revisar meu progresso mensal",
   3,
   "Informe ações do mês, resultados e plano anterior.",
   "Faça revisão mensal das evidências fornecidas, aprendizados, pendências e prioridades do próximo mês."
  ],
  [
   "offer_comparison",
   "Comparar oportunidades profissionais",
   3,
   "Informe condições das oportunidades e suas prioridades, sem identificar pessoas.",
   "Compare condições em matriz transparente segundo prioridades declaradas, destaque dúvidas e deixe a escolha ao candidato."
  ],
  [
   "promotion_preparation",
   "Preparar conversa sobre promoção",
   3,
   "Informe responsabilidades, contribuições comprovadas e objetivo.",
   "Prepare pauta, argumentos com evidências e perguntas para conversa de promoção, sem inventar resultados ou garantir decisão."
  ],
  [
   "learning_next_steps",
   "Definir próximos passos após aprender",
   3,
   "Informe cursos ou experiências recentes e objetivo profissional.",
   "Transforme conhecimentos declarados em ações práticas, evidências de aplicação e metas de revisão, sem tratar curso como certificação comprovada."
  ]
 ],
 "recruiter": [
  [
   "job_description",
   "Preparar descrição de vaga",
   1,
   "Informe função, atividades, requisitos técnicos e local.",
   "Redija vaga com critérios objetivos e não discriminatórios; não invente benefícios ou condições."
  ],
  [
   "interview_questions",
   "Criar perguntas de entrevista",
   1,
   "Informe função e competências profissionais a observar.",
   "Crie perguntas por competência e sinais de evidência, sem perguntas sobre atributos sensíveis ou vida privada."
  ],
  [
   "candidate_messages",
   "Preparar mensagens para candidatos",
   1,
   "Informe etapa, canal e informações autorizadas, sem nomes ou contatos.",
   "Redija modelos de convite, atualização e encerramento respeitosos; não envie mensagens nem alegue decisão tomada."
  ],
  [
   "onboarding_script",
   "Preparar roteiro de integração",
   1,
   "Informe função, rotinas, recursos e duração da integração.",
   "Monte roteiro de integração com responsáveis por função, checklist e pontos de verificação sem dados individuais."
  ],
  [
   "internal_announcements",
   "Escrever comunicado interno",
   1,
   "Informe assunto, público geral e ação esperada.",
   "Redija comunicado claro, com prazo apenas se informado e sem expor dados de trabalhadores."
  ],
  [
   "role_description",
   "Organizar descrição de cargo",
   1,
   "Informe finalidade, responsabilidades e interfaces da função.",
   "Organize missão do cargo, responsabilidades e competências sem requisitos discriminatórios nem parecer jurídico."
  ],
  [
   "practical_assessment",
   "Criar teste prático e critérios",
   2,
   "Informe função, competências, duração e recursos.",
   "Proponha teste fictício proporcional à função, rubrica objetiva, acessibilidade e orientações de avaliação humana; não use trabalho produtivo gratuito."
  ],
  [
   "competency_interview",
   "Estruturar entrevista por competências",
   2,
   "Informe função, competências e etapas previstas.",
   "Monte roteiro estruturado, perguntas situacionais e rubrica comum; não pontue ou classifique pessoas reais."
  ],
  [
   "training_paths",
   "Planejar treinamento da equipe",
   2,
   "Informe competências desejadas e lacunas agregadas, sem nomes.",
   "Proponha trilha de treinamento, prática, marcos e avaliação agregada das lacunas informadas."
  ],
  [
   "feedback_conversation",
   "Preparar conversa de feedback",
   2,
   "Descreva situação profissional anonimizada, fatos e melhoria desejada.",
   "Prepare conversa baseada em comportamento observável, escuta, acordos e acompanhamento; não diagnostique pessoas."
  ],
  [
   "job_requirements_review",
   "Revisar exigências de uma vaga",
   2,
   "Informe atividades e requisitos previstos.",
   "Examine relevância e proporcionalidade dos requisitos, distinga essencial e treinável e sinalize critérios potencialmente discriminatórios para revisão humana."
  ],
  [
   "recruitment_diagnosis",
   "Analisar dificuldades no recrutamento",
   2,
   "Informe etapas, prazos e números agregados, sem dados de candidatos.",
   "Analise gargalos a partir dos dados fornecidos, diferencie hipótese de evidência e sugira experimentos mensuráveis."
  ],
  [
   "department_diagnosis",
   "Analisar competências do setor",
   3,
   "Descreva objetivos e competências agregadas, sem identificar pessoas.",
   "Analise lacunas agregadas do setor e proponha ações verificáveis; não classifique nem decida sobre pessoas."
  ],
  [
   "employee_development",
   "Planejar desenvolvimento profissional",
   3,
   "Informe competências necessárias e objetivos de desenvolvimento sem identificar trabalhadores.",
   "Crie modelo de desenvolvimento com ações, evidências e revisões para aplicação com participação humana, sem decisão sobre emprego."
  ],
  [
   "succession_planning",
   "Estruturar plano de sucessão",
   3,
   "Informe funções críticas e competências agregadas, sem nomes.",
   "Proponha processo de sucessão por critérios profissionais, desenvolvimento e revisão humana; não selecione ou ranqueie pessoas."
  ],
  [
   "recruiting_metrics",
   "Revisar indicadores de recrutamento",
   3,
   "Informe período, etapas e métricas agregadas.",
   "Analise indicadores e limitações da amostra, calcule apenas com dados fornecidos e proponha próximos experimentos; não alegue consulta ao banco."
  ],
  [
   "onboarding_review",
   "Revisar resultados da integração",
   3,
   "Informe plano anterior e resultados agregados, sem avaliações individuais.",
   "Compare objetivos e resultados da integração, identifique lacunas e proponha revisão do próximo ciclo."
  ],
  [
   "recurring_training",
   "Organizar ciclos de capacitação",
   3,
   "Informe prioridades, capacidade e resultados agregados do ciclo anterior.",
   "Monte calendário recorrente de capacitação com prática, responsáveis por função e critérios de revisão, sem agendamento automático."
  ]
 ],
 "school_staff": [
  [
   "course_planning",
   "Planejar um curso",
   1,
   "Informe tema, público geral, carga horária e recursos.",
   "Proponha módulos e objetivos de aprendizagem sem prometer certificação ou emprego."
  ],
  [
   "lesson_plan",
   "Criar plano de aula",
   1,
   "Informe tema, duração, conhecimentos prévios gerais e recursos.",
   "Monte plano de aula com objetivos observáveis, sequência, prática, acessibilidade e verificação de aprendizagem."
  ],
  [
   "exercises_rubrics",
   "Criar exercícios e rubricas",
   1,
   "Informe tema, nível geral e objetivos de aprendizagem.",
   "Crie exercícios originais, respostas esperadas e rubrica de avaliação humana; não avalie alunos identificáveis."
  ],
  [
   "teaching_material_review",
   "Revisar material didático",
   1,
   "Cole trecho próprio ou autorizado e objetivos, sem dados de alunos.",
   "Revise clareza, coerência e acessibilidade do trecho; indique dúvidas factuais sem inventar referências."
  ],
  [
   "course_promotion",
   "Preparar divulgação de curso",
   1,
   "Informe conteúdo, público, datas e condições confirmadas.",
   "Redija divulgação com informações fornecidas, sem inventar vagas, credenciamento, certificação ou garantia de emprego."
  ],
  [
   "partnership_draft",
   "Esboçar proposta de parceria",
   1,
   "Informe área, objetivo e contrapartidas pretendidas, sem contatos.",
   "Redija esboço de proposta educacional e perguntas para negociação; não alegue parceria firmada."
  ],
  [
   "curriculum_review",
   "Revisar conteúdo curricular",
   2,
   "Cole ementa e objetivos, sem dados de alunos.",
   "Revise ementa e sugira melhorias justificadas, atividades e alinhamento aos objetivos fornecidos."
  ],
  [
   "learning_adaptation",
   "Adaptar aula ao conhecimento prévio",
   2,
   "Informe objetivos, recursos e níveis de conhecimento agregados.",
   "Adapte sequência e atividades a diferentes conhecimentos prévios sem inferir deficiência ou características sensíveis."
  ],
  [
   "practical_projects",
   "Criar projetos práticos",
   2,
   "Informe competências, tempo e recursos disponíveis.",
   "Proponha projetos fictícios com entregáveis, etapas, rubrica e critérios de acessibilidade."
  ],
  [
   "vacancy_curriculum_alignment",
   "Relacionar curso às exigências de vagas",
   2,
   "Cole requisitos profissionais de vagas e ementa, sem contatos.",
   "Compare competências demandadas nos textos com ementa, identifique lacunas e proponha atualização; não alegue pesquisa atual do mercado."
  ],
  [
   "learning_recovery",
   "Planejar recuperação de aprendizagem",
   2,
   "Informe dificuldades agregadas e objetivos, sem nomes ou notas individuais.",
   "Proponha diagnóstico formativo, atividades alternativas, prática e reavaliação sem rotular alunos."
  ],
  [
   "course_path",
   "Organizar trilha de cursos",
   2,
   "Informe objetivo, pré-requisitos e cursos efetivamente oferecidos.",
   "Organize sequência de cursos fornecidos, dependências e práticas; não invente oferta, certificação ou disponibilidade."
  ],
  [
   "industry_partnerships",
   "Planejar parceria com empresas",
   3,
   "Descreva área, região, proposta e resultados anteriores agregados.",
   "Prepare plano de parceria com etapas, responsabilidades e indicadores de revisão; não alegue contato ou acordo firmado."
  ],
  [
   "skill_demand_review",
   "Analisar demanda agregada de competências",
   3,
   "Forneça contagens agregadas por competência, período e origem, sem pessoas.",
   "Analise apenas dados agregados fornecidos, limites da amostra e implicações educacionais; não alegue radar automático ou tendências externas verificadas."
  ],
  [
   "course_calendar",
   "Planejar portfólio e calendário de cursos",
   3,
   "Informe cursos, capacidade, calendário e demanda agregada.",
   "Proponha portfólio e calendário viável com dependências e hipóteses explícitas; não publique ou agende automaticamente."
  ],
  [
   "education_metrics",
   "Revisar indicadores educacionais",
   3,
   "Informe métricas agregadas, período, método e tamanho da amostra; não envie notas individuais.",
   "Analise aprendizagem e empregabilidade a partir dos indicadores fornecidos, ressalve correlação e amostra; não infira desempenho individual."
  ],
  [
   "syllabus_cycle",
   "Revisar ementas periodicamente",
   3,
   "Informe ementa, revisão anterior e resultados agregados.",
   "Compare versões e evidências, proponha mudanças justificadas e critérios para o próximo ciclo, sujeitos à aprovação docente."
  ],
  [
   "training_results",
   "Analisar resultados de programas formativos",
   3,
   "Informe objetivos, ações e resultados agregados de programas com empresas.",
   "Compare objetivos e resultados informados, limitações e ações do próximo ciclo; não exponha pessoas nem atribua causalidade sem evidência."
  ]
 ]
};
export function getGuidedTasks(role,tier=0){
 if(!Object.hasOwn(guided,role))return [];
 const tasks=guided[role].map(([id,label,suggestedTier,hint,instruction])=>({id,label,minTier:0,suggestedTier,hint,instruction,costCents:100,mode:id==='resume_review'?'saved_resume':'guided_text',available:true}));
 return [...tasks,...additionalTasks(role),{id:'free_'+role,label:'Agente livre',minTier:0,hint:'Descreva seu pedido e as informações profissionais necessárias. Cada envio confirmado custa R$ 1,00.',instruction:'Atenda ao pedido livre dentro do contexto profissional deste perfil. Esclareça limites e não invente dados, ferramentas ou acessos.',costCents:100,mode:'free_text',available:true}];
}

function additionalTasks(role){
 const research={
  learner:['Pesquisar vagas e cursos — Premium','Informe profissão ou curso desejado, cidade/região e modalidade. Use apenas critérios profissionais, sem nome, contatos ou documentos.','Pesquise vagas e cursos em fontes públicas conforme profissão, competências e região informadas. Apresente requisitos e compatibilidade como orientação, sem garantir vaga ou matrícula.'],
  recruiter:['Pesquisar capacitação e canais de recrutamento — Premium','Informe competências da equipe, setor, região e objetivo. Não informe nomes ou dados de trabalhadores ou candidatos.','Pesquise cursos, eventos profissionais, instituições e canais públicos de divulgação de vagas ou parcerias. Não busque pessoas, currículos individuais ou contatos pessoais.'],
  school_staff:['Pesquisar oportunidades de captar alunos — Premium','Informe cursos oferecidos, público em termos gerais, cidade/região, modalidade e objetivo de matrículas. Não informe dados pessoais de alunos.','O foco é atrair novos alunos e matrículas para a escola. Pesquise canais públicos de divulgação, eventos locais, organizações e possíveis parcerias de captação relacionadas aos cursos e à região. Para cada oportunidade, explique o encaixe, uma ação sugerida e uma mensagem inicial. Não busque empregos para alunos nem listas de pessoas ou contatos pessoais. Diferencie oportunidade potencial de parceria confirmada; não estime demanda ou matrículas sem evidência.']
 }[role];
 const out=[{id:'external_'+role,label:research[0],hint:research[1],instruction:research[2],minTier:0,costCents:250,premium:true,mode:'external_search',available:true}];
 if(role!=='learner')out.push({id:'social_posts_'+role,label:role==='school_staff'?'Criar posts para divulgar cursos e atividades':'Criar posts para divulgar a empresa',hint:role==='school_staff'?'Informe curso ou atividade, público, rede social, objetivo, datas e condições confirmadas, tom e chamada para matrícula.':'Informe produto, serviço, vaga ou atividade, público, rede social, objetivo, condições confirmadas, tom e chamada para ação.',instruction:'Crie um pacote de divulgação pronto para revisar: 3 legendas com chamadas para ação, sugestão de carrossel por slide, roteiro de vídeo curto e hashtags relevantes. Adapte à rede e ao objetivo informados. Use somente fatos e condições fornecidos; quando faltar preço, data, contato ou endereço, use um marcador explícito para preencher. Não invente descontos, depoimentos, números, credenciamento ou garantia de resultado. Entregue texto e ideias visuais; não gere imagens, publique ou agende. Não inclua dados ou imagem de pessoas sem autorização.',minTier:0,costCents:100,mode:'guided_text',available:true});
 return out;
}
