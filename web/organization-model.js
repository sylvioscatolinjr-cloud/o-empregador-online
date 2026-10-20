/* Membership state machine. The hosted review uses fictitious identities in one browser. */
(function(root){
 const activeStatuses=new Set(['pending','awaiting_registration','accepted']);
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
 const error=message=>{throw Error(message)};
 const requireOwner=(actor,organizationId)=>{if(actor?.kind!=='organization'||actor.id!==organizationId||!actor.canManage)error('Somente o responsável autorizado pode gerenciar esta organização.');};
 const uid=(data,prefix)=>prefix+'-'+(++data.sequence);
 function create(){return {version:1,sequence:0,departments:[],invitations:[],notifications:[],outbox:[],history:[],registrations:[],activeCandidate:'own-cv'};}
 function department(data,id,organizationId){const d=data.departments.find(d=>d.id===id&&d.organizationId===organizationId);if(!d)error('Departamento não encontrado nesta organização.');return d;}
 function accepted(data,organizationId,departmentId=null){const seen=new Set();return data.invitations.filter(i=>i.organizationId===organizationId&&i.status==='accepted'&&(!departmentId||i.departmentId===departmentId)).filter(i=>{if(seen.has(i.candidateId))return false;seen.add(i.candidateId);return true;});}
 function stats(data,organizationId,scoreOf,departmentId=null){const members=accepted(data,organizationId,departmentId),sum=members.reduce((s,i)=>s+Math.max(0,Number(scoreOf(i.candidateId))||0),0);return {count:members.length,sum,average:members.length?sum/members.length:null,pending:data.invitations.filter(i=>i.organizationId===organizationId&&(!departmentId||i.departmentId===departmentId)&&['pending','awaiting_registration'].includes(i.status)&&i.expiresAt>Date.now()).length};}
 function variation(before,after){return {points:before===null||after===null?null:after-before,percent:before===null||after===null||before===0?null:(after-before)/before*100};}
 function notify(data,kind,recipientId,title,message,invitationId,now){data.notifications.unshift({id:uid(data,'organization-note'),kind,recipientId,title,message,invitationId,at:now,read:false});}
 function snapshot(data,organizationId,departmentId,scoreOf){return {organization:stats(data,organizationId,scoreOf),department:stats(data,organizationId,scoreOf,departmentId)};}
 function history(data,type,invitation,before,scoreOf,now,details={}){const after=snapshot(data,invitation.organizationId,invitation.departmentId,scoreOf);data.history.unshift({id:uid(data,'movement'),type,organizationId:invitation.organizationId,departmentId:invitation.departmentId,at:now,before,after,delta:variation(before.organization.average,after.organization.average),departmentDelta:variation(before.department.average,after.department.average),...details});}
 function addDepartment(data,actor,name){requireOwner(actor,actor.id);name=String(name||'').trim().replace(/\s+/g,' ');if(!name||name.length>100)error('Informe um nome de departamento com até 100 caracteres.');if(data.departments.some(d=>d.organizationId===actor.id&&normalize(d.name)===normalize(name)))error('Este departamento já existe na organização.');const d={id:uid(data,'department'),organizationId:actor.id,name};data.departments.push(d);return d;}
 function expire(data,now=Date.now()){for(const i of data.invitations){if(['pending','awaiting_registration'].includes(i.status)&&i.expiresAt<=now){i.status='expired';notify(data,'organization',i.organizationId,'Convite expirado','O convite para '+i.name+' expirou sem confirmação.',i.id,now);}}}
 function invite(data,actor,input,now=Date.now()){
  requireOwner(actor,actor.id);department(data,input.departmentId,actor.id);expire(data,now);
  if(!input.personRef||!input.name?.trim())error('Selecione um candidato ou informe o destinatário do convite.');
  if(data.invitations.some(i=>i.organizationId===actor.id&&(i.personRef===input.personRef||input.candidateId&&i.candidateId===input.candidateId)&&activeStatuses.has(i.status)))error('Esta pessoa já é membro ou tem um convite pendente nesta organização.');
  let replaced=null;if(input.replacesId){replaced=data.invitations.find(i=>i.id===input.replacesId&&i.organizationId===actor.id&&i.status==='accepted');if(!replaced||replaced.departmentId!==input.departmentId)error('O vínculo a substituir não está ativo neste departamento.');if(replaced.personRef===input.personRef)error('Escolha outra pessoa para a substituição.');if(data.invitations.some(i=>i.replacesId===replaced.id&&['pending','awaiting_registration'].includes(i.status)))error('Já há uma substituição pendente para este membro.');}
  const email=String(input.email||'').trim().toLowerCase();if(!input.candidateId&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))error('Informe um e-mail válido para enviar o convite de cadastro.');
  if(!input.candidateId&&data.invitations.some(i=>i.organizationId===actor.id&&i.email===email&&activeStatuses.has(i.status)))error('Já existe um membro ou convite para este e-mail na organização.');
  const i={id:uid(data,'organization-invite'),organizationId:actor.id,organizationName:input.organizationName,departmentId:input.departmentId,personRef:input.personRef,name:input.name.trim(),candidateId:input.candidateId||null,email:input.candidateId?'':email,status:input.candidateId?'pending':'awaiting_registration',createdAt:now,expiresAt:now+14*86400000,replacesId:replaced?.id||null};data.invitations.push(i);
  if(i.candidateId)notify(data,'candidate',i.candidateId,'Convite para fazer parte de uma equipe',i.organizationName+' convidou você para o departamento '+department(data,i.departmentId,actor.id).name+'. Confirme ou recuse o vínculo.',i.id,now);
  else data.outbox.push({id:uid(data,'organization-mail'),invitationId:i.id,to:email,status:'not_configured',createdAt:now,subject:'Convite para '+i.organizationName,providerId:null});
  return i;
 }
 function respond(data,actor,invitationId,decision,scoreOf,now=Date.now()){
  expire(data,now);const i=data.invitations.find(i=>i.id===invitationId);if(actor?.kind!=='candidate'||!i||i.candidateId!==actor.id)error('Este convite não pertence ao candidato ativo.');
  if(i.status!=='pending')error('Este convite não está mais pendente.');if(!['accept','decline'].includes(decision))error('Resposta inválida.');
  if(decision==='decline'){i.status='declined';i.respondedAt=now;notify(data,'organization',i.organizationId,'Convite recusado',i.name+' recusou o convite para '+department(data,i.departmentId,i.organizationId).name+'.',i.id,now);}
  else{
   if(accepted(data,i.organizationId).some(m=>m.candidateId===actor.id))error('O candidato já tem um vínculo ativo com esta organização.');
   const old=i.replacesId?data.invitations.find(m=>m.id===i.replacesId&&m.organizationId===i.organizationId&&m.departmentId===i.departmentId&&m.status==='accepted'):null;
   if(i.replacesId&&!old)error('O vínculo a substituir foi encerrado. Peça um novo convite à organização.');
   const before=snapshot(data,i.organizationId,i.departmentId,scoreOf);
   if(old){old.status='removed';old.endedAt=now;notify(data,'candidate',old.candidateId,'Vínculo encerrado',i.organizationName+' encerrou seu vínculo com o departamento '+department(data,old.departmentId,i.organizationId).name+'.',old.id,now);}
   i.status='accepted';i.respondedAt=now;
   history(data,old?'replacement':'join',i,before,scoreOf,now,{incomingName:i.name,incomingPoints:scoreOf(i.candidateId)||0,outgoingName:old?.name||null,outgoingPoints:old?scoreOf(old.candidateId)||0:null});
   notify(data,'organization',i.organizationId,'Convite aceito',i.name+' confirmou a participação em '+department(data,i.departmentId,i.organizationId).name+'. A média da equipe foi atualizada.',i.id,now);
  }
  for(const n of data.notifications)if(n.kind==='candidate'&&n.recipientId===actor.id&&n.invitationId===i.id)n.read=true;
  return i;
 }
 function cancel(data,actor,invitationId,scoreOf,now=Date.now()){
  const i=data.invitations.find(i=>i.id===invitationId);if(!i)error('Convite não encontrado.');requireOwner(actor,i.organizationId);
  if(!['pending','awaiting_registration','accepted'].includes(i.status))error('Este vínculo já foi encerrado.');
  const confirmed=i.status==='accepted',before=snapshot(data,i.organizationId,i.departmentId,scoreOf);i.status=confirmed?'removed':'cancelled';i.endedAt=now;
  for(const m of data.outbox)if(m.invitationId===i.id&&m.status==='not_configured')m.status='cancelled';
  if(confirmed)history(data,'leave',i,before,scoreOf,now,{outgoingName:i.name,outgoingPoints:scoreOf(i.candidateId)||0});
  if(i.candidateId)notify(data,'candidate',i.candidateId,confirmed?'Vínculo encerrado':'Convite cancelado',i.organizationName+(confirmed?' encerrou seu vínculo.':' cancelou o convite para participar da equipe.'),i.id,now);
  return i;
 }
 function register(data,input,now=Date.now()){
  expire(data,now);const i=data.invitations.find(i=>i.id===input.invitationId),email=String(input.email||'').trim().toLowerCase();
  if(!i||i.status!=='awaiting_registration'||i.email!==email||i.personRef!==input.personRef)error('O e-mail e o documento precisam corresponder ao convite de cadastro.');
  if(!input.emailConfirmed)error('Confirme o e-mail da conta antes de vincular o convite.');if(!input.name?.trim())error('Informe o nome do candidato.');
  let person=data.registrations.find(r=>r.personRef===input.personRef||r.email===email);
  if(person&&(person.personRef!==input.personRef||person.email!==email))error('O documento e o e-mail não correspondem à mesma conta.');
  if(!person){person={id:uid(data,'registered-candidate'),personRef:input.personRef,email,name:input.name.trim(),learningRecords:[]};data.registrations.push(person);}
  for(const pending of data.invitations.filter(x=>x.status==='awaiting_registration'&&x.personRef===person.personRef&&x.email===person.email)){pending.candidateId=person.id;pending.name=person.name;pending.status='pending';notify(data,'candidate',person.id,'Confirme seu vínculo com a organização',pending.organizationName+' convidou você para '+department(data,pending.departmentId,pending.organizationId).name+'. O cadastro não aceita o vínculo automaticamente.',pending.id,now);}
  return person;
 }
 function project(data,organizationId,departmentId,incomingId,outgoingId,scoreOf){
  department(data,departmentId,organizationId);const copy=JSON.parse(JSON.stringify(data)),before=snapshot(data,organizationId,departmentId,scoreOf);
  if(outgoingId){const old=copy.invitations.find(i=>i.id===outgoingId&&i.organizationId===organizationId&&i.departmentId===departmentId&&i.status==='accepted');if(!old)error('Selecione um membro confirmado deste departamento.');old.status='removed';}
  if(incomingId){if(accepted(copy,organizationId).some(i=>i.candidateId===incomingId))error('A pessoa selecionada já faz parte da organização.');copy.invitations.push({id:'projection',organizationId,departmentId,candidateId:incomingId,status:'accepted'});}
  const after=snapshot(copy,organizationId,departmentId,scoreOf),incomingPoints=incomingId?Math.max(0,Number(scoreOf(incomingId))||0):null,outgoing=data.invitations.find(i=>i.id===outgoingId);
  return {before,after,delta:variation(before.organization.average,after.organization.average),departmentDelta:variation(before.department.average,after.department.average),incomingPoints,outgoingPoints:outgoing?scoreOf(outgoing.candidateId)||0:null,comparedToTeam:incomingPoints===null||before.organization.average===null?null:incomingPoints-before.organization.average};
 }
 const api={create,addDepartment,invite,respond,cancel,register,expire,accepted,stats,variation,project,normalize};root.OrganizationMembership=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
