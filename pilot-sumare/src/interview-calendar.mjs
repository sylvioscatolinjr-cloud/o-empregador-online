export const interviewStatuses={proposed:'Aguardando aceite do candidato',confirmed:'Confirmada',declined:'Horário recusado',cancelled:'Cancelada'};
export function brasiliaToUTC(value){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value||''))throw Error('Informe data e horário.');const d=new Date(value+':00-03:00');if(!Number.isFinite(d.getTime())||new Date(d.getTime()-3*3600000).toISOString().slice(0,16)!==value)throw Error('Data inválida.');return d.toISOString();}
export function googleInterviewURL(interview,listing,{origin,now=Date.now()}={}){
 if(interview?.status!=='confirmed'||!listing||['withdrawn','rejected'].includes(listing.applicationStatus))return null;
 const start=new Date(interview.starts_at),end=new Date(interview.ends_at);if(!Number.isFinite(+start)||!Number.isFinite(+end)||+end<=+start||+start<=now)return null;
 const portal=new URL('/conta.html',origin);if(portal.protocol!=='https:')throw Error('Endereço do portal inválido.');portal.searchParams.set('entrevistas','1');
 const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const u=new URL('https://calendar.google.com/calendar/r/eventedit');u.search=new URLSearchParams({action:'TEMPLATE',text:`Entrevista — ${listing.title} — ${listing.organization}`,dates:stamp(start)+'/'+stamp(end),stz:'America/Sao_Paulo',etz:'America/Sao_Paulo',location:interview.location,details:[listing.is_fictitious?'FICTÍCIO — entrevista de teste.':'Entrevista confirmada no O Empregador Online.',interview.meeting_url?'Videochamada: '+interview.meeting_url:'','Consulte o agendamento: '+portal.href,'Alterações e cancelamentos devem ser atualizados manualmente no Google Agenda.'].filter(Boolean).join('\n')}).toString();return u.href;
}
