import {getGuidedTasks} from './ai-agent-catalog.mjs';
export function requestedAgentPlan(search,profile){
 const role={'Candidato':'learner','Empresa':'recruiter','Instituição de Ensino':'school_staff'}[profile];
 const task=getGuidedTasks(role,0).find(t=>t.id===new URLSearchParams(search||'').get('recurso'));
 return task?{taskId:task.id,label:task.label,tier:task.minTier}:null;
}
