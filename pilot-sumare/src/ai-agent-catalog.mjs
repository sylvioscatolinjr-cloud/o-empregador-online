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
    mission: 'Alinhar formação, competências e empregabilidade.',
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

// Guided text assistance only; connected data tools above remain planned.
const guided = {
 learner: [
  ['resume_review','Revisar meu currículo',1,'Carregue seu currículo salvo e o anexo. Compare as sugestões e escolha o que salvar.','Revise o texto do currículo, preserve os fatos e indique melhorias sem inventar experiências.'],
  ['interview_practice','Preparar uma entrevista',2,'Informe a vaga e suas competências, sem dados do entrevistador.','Sugira perguntas de treino e orientações para entrevista com base na vaga informada.'],
  ['career_gps','Planejar minha carreira',3,'Informe objetivo, competências, prazo e disponibilidade.','Proponha uma trilha de desenvolvimento com etapas verificáveis; não prometa emprego ou renda.']
 ],
 recruiter: [
  ['job_description','Preparar descrição de vaga',1,'Informe função, atividades, requisitos técnicos e local.','Redija uma descrição de vaga com critérios profissionais objetivos e não discriminatórios.'],
  ['training_paths','Planejar treinamento da equipe',2,'Informe competências desejadas e lacunas, sem nomes ou avaliações individuais.','Proponha uma trilha de treinamento para as lacunas agregadas informadas.'],
  ['department_diagnosis','Analisar competências do setor',3,'Descreva objetivos e competências agregadas do setor, sem identificar pessoas.','Analise lacunas do setor e proponha ações verificáveis; não classifique nem decida sobre pessoas.']
 ],
 school_staff: [
  ['course_planning','Planejar um curso',1,'Informe tema, público geral, carga horária e recursos disponíveis.','Proponha módulos de curso com objetivos de aprendizagem, sem prometer certificação ou emprego.'],
  ['curriculum_review','Revisar conteúdo curricular',2,'Cole a ementa e os objetivos, sem dados de alunos.','Revise a ementa fornecida e sugira melhorias justificadas e atividades.'],
  ['industry_partnerships','Planejar parceria com empresas',3,'Descreva a área, região e proposta, sem contatos ou dados pessoais.','Prepare uma proposta de parceria educacional e próximos passos; não alegue contato ou acordo firmado.']
 ]
};
export function getGuidedTasks(role,tier=0){
 return (Object.hasOwn(guided,role)?guided[role]:[]).map(([id,label,minTier,hint,instruction])=>({id,label,minTier,hint,instruction,costCents:100,mode:id==='resume_review'?'saved_resume':'guided_text',available:Number.isInteger(tier)&&tier>=minTier}));
}
