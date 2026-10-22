import {noticeLink,noticeUUID} from './notice-material.mjs';
export function metricPeriod(period='month',now=new Date()){
 const local=new Date(now.getTime()-3*3600000),y=local.getUTCFullYear(),m=local.getUTCMonth(),d=local.getUTCDate();
 let start,bucket='day';
 if(period==='day'){start=Date.UTC(y,m,d,3);bucket='hour';}
 else if(period==='week')start=Date.UTC(y,m,d-6,3);
 else if(period==='month')start=Date.UTC(y,m,1,3);
 else if(period==='quarter'){start=Date.UTC(y,Math.floor(m/3)*3,1,3);bucket='month';}
 else if(period==='semester'){start=Date.UTC(y,Math.floor(m/6)*6,1,3);bucket='month';}
 else if(period==='year'){start=Date.UTC(y,0,1,3);bucket='month';}
 else throw Error('Período inválido.');
 return {start:new Date(start).toISOString(),end:new Date(now.getTime()+1).toISOString(),bucket};
}
const regions={Norte:['AC','AP','AM','PA','RO','RR','TO'],Nordeste:['AL','BA','CE','MA','PB','PE','PI','RN','SE'],'Centro-Oeste':['DF','GO','MT','MS'],Sudeste:['ES','MG','RJ','SP'],Sul:['PR','RS','SC']};
const states=Object.values(regions).flat();
export function broadcastInput(input){
 const role=String(input.role||'all'),region=String(input.region||''),state=String(input.state||'').trim().toUpperCase(),city=String(input.city||'').trim(),title=String(input.title||'').trim(),body=String(input.body||'').trim();
 if(!['all','learner','recruiter','school_staff'].includes(role)||region&&!Object.hasOwn(regions,region)||state&&!states.includes(state)||region&&state&&!regions[region].includes(state)||city.length>100||title.length<1||title.length>160||body.length<1||body.length>4000)throw Error('Confira mensagem, perfil, região, estado e cidade.');
 const attachment=input.attachment_id||null;if(attachment&&!noticeUUID(attachment))throw Error('Anexo inválido.');
 return {p_access_url:noticeLink(input.access_url),p_attachment:attachment,p_role:role,p_states:state?[state]:region?regions[region]:null,p_city:city,p_title:title,p_body:body};
}
