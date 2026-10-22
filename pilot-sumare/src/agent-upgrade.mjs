import {trainingMetadata} from './training-metadata.mjs';
import {getGuidedTasks} from './ai-agent-catalog.mjs';
export function requestedAgentPlan(search,profile){
 const role={'Candidato':'learner','Empresa':'recruiter','Instituição de Ensino':'school_staff'}[profile];
 const params=new URLSearchParams(search||'');
 if(params.has('treinamento')){const c=trainingMetadata.find(c=>c.id===params.get('treinamento')&&c.role===role);return c?{taskId:c.id,label:c.title,tier:c.tier}:null;}
 const task=getGuidedTasks(role,0).find(t=>t.id===new URLSearchParams(search||'').get('recurso'));
 return task?{taskId:task.id,label:task.label,tier:task.minTier}:null;
}
