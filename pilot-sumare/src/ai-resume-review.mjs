import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {resumeState,mergeResume} from './resume-model.mjs';
export const resumeColumns='about,skills,experience,education,courses,certifications,resume_details,resume_path,display_name';
export const resumeLabels={about:'Objetivo e resumo',skills:'Competências',experience:'Histórico profissional',education:'Formação acadêmica',courses:'Cursos e treinamentos',certifications:'Certificações'};
const sections=['experience','education','courses'];
export function resumeVersion(p){return createHash('sha256').update(JSON.stringify(p)).digest('hex');}
export function resumeTargets(p){
 const d=resumeState(p),out=[];
 for(const key of Object.keys(resumeLabels))out.push({target:key,label:resumeLabels[key],value:sections.includes(key)?d.legacy[key]:p[key]||''});
 for(const key of sections)for(const [i,row] of d.entries[key].entries())out.push({target:`${key}.${i}.description`,label:`${resumeLabels[key]} · ${i+1} · descrição`,value:row.description||'',facts:Object.fromEntries(Object.entries(row).filter(([k])=>['role','organization','title','institution','level','city','state','start','end','current','hours'].includes(k)))});
 return out;
}
export function redactResume(text,p){
 let s=String(text||'');const contact=p.resume_details?.contact||{};
 for(const value of [p.display_name,...Object.values(contact)])if(typeof value==='string'&&value.trim().length>2)s=s.split(value).join('[dado pessoal omitido]');
 return s.replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,'[e-mail omitido]').replace(/https?:\/\/\S+/gi,'[link omitido]').replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,'[documento omitido]').replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,'[documento omitido]').replace(/(?:\+?55\s*)?\(?\d{2}\)?[\s.-]*\d{4,5}[\s.-]*\d{4}\b/g,'[telefone omitido]');
}
export const reviewFormat={type:'json_schema',name:'resume_review',strict:true,schema:{type:'object',additionalProperties:false,properties:{summary:{type:'string'},changes:{type:'array',items:{type:'object',additionalProperties:false,properties:{target:{type:'string'},value:{type:'string'},reason:{type:'string'}},required:['target','value','reason']}}},required:['summary','changes']}};
export function reviewFormatFor(p){
 const format=structuredClone(reviewFormat);
 format.schema.properties.summary.maxLength=1000;
 format.schema.properties.changes.maxItems=12;
 format.schema.properties.changes.items.properties.value={type:'string',minLength:1,maxLength:3000};
 format.schema.properties.changes.items.properties.reason={type:'string',maxLength:500};
 format.schema.properties.changes.items.properties.target.enum=resumeTargets(p).map(t=>t.target);
 return format;
}
function invalidReview(code){throw Object.assign(Error('invalid review'),{reviewCode:code});}
export function validateReview(raw,p){
 if(!raw||typeof raw.summary!=='string'||raw.summary.length>2000||!Array.isArray(raw.changes)||raw.changes.length>12)invalidReview('invalid_envelope');
 const targets=resumeTargets(p),seen=new Set(),changes=[];
 for(const c of raw.changes){if(!c||typeof c!=='object')invalidReview('invalid_change');const t=targets.find(t=>t.target===c.target);if(!t)invalidReview('unknown_target');if(seen.has(c.target))invalidReview('duplicate_target');if(typeof c.value!=='string')invalidReview('invalid_value_type');if(c.value.length>(c.target==='skills'?3000:5000))invalidReview('invalid_value_length');if(!c.value.trim()||c.value===t.value){seen.add(c.target);continue;}if(typeof c.reason!=='string'||c.reason.length>1500)invalidReview('invalid_reason');seen.add(c.target);if(c.value!==t.value)changes.push({target:c.target,label:t.label,before:t.value,after:c.value,reason:c.reason});}
 if(JSON.stringify(changes).length>100000)throw Error('review too large');
 return {summary:raw.summary,changes};
}
export function signReview(payload,secret){const body=Buffer.from(JSON.stringify(payload)).toString('base64url');return body+'.'+createHmac('sha256',secret).update('oeo-resume-review-v1:'+body).digest('base64url');}
export function verifyReview(token,secret,userId){
 if(typeof token!=='string'||token.length>180000)throw Error('invalid proposal');const [body,mac,...extra]=token.split('.');if(!body||!mac||extra.length)throw Error('invalid proposal');const expected=createHmac('sha256',secret).update('oeo-resume-review-v1:'+body).digest(),actual=Buffer.from(mac,'base64url');if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw Error('invalid proposal');const p=JSON.parse(Buffer.from(body,'base64url').toString());if(p.userId!==userId||!Number.isFinite(p.expires)||p.expires<Date.now())throw Error('expired proposal');return p;
}
export function applyReview(p,changes,selected){
 if(!Array.isArray(selected)||!selected.length||selected.length>12||new Set(selected).size!==selected.length)throw Error('Selecione as sugestões que deseja salvar.');
 const d=structuredClone(resumeState(p)),patch={},altered=new Set();
 for(const target of selected){const c=changes.find(c=>c.target===target);if(!c)throw Error('Sugestão inválida.');const parts=target.split('.');if(parts.length===3){d.entries[parts[0]][Number(parts[1])].description=c.after;altered.add(parts[0]);}else if(sections.includes(target)){d.legacy[target]=c.after;altered.add(target);}else patch[target]=c.after;}
 if(altered.size){const merged=mergeResume(p,d);for(const key of altered)patch[key]=merged[key];patch.resume_details=d;}
 for(const [key,value] of Object.entries(patch))if(typeof value==='string'&&value.length>(key==='skills'?3000:12000))throw Error('A sugestão excede o tamanho do campo.');
 return patch;
}
