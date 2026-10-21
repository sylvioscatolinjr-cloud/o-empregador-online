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
  const key = AGENT_ROLES[role];
  if (!key) return null; // owner/admin is not implicitly another tenant
  const agent = catalogs[key];
  return {profile:key,title:agent.title,mission:agent.mission,
    capabilities:agent.capabilities.map(([id,label])=>({id,label,status:'planned'}))};
}
