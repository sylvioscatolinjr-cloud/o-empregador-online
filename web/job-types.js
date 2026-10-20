// Shared selection/help and explicit vacancy metadata. PCD is an independent destination.
const jobTypes=[
 {value:'CLT',label:'CLT (Assalariado/Formal)',help:'Emprego formal com registro em carteira e salário. Informe jornada, remuneração e benefícios oferecidos.'},
 {value:'PJ',label:'PJ (Pessoa Jurídica)',help:'Prestação de serviços contratada com uma pessoa jurídica, conforme contrato comercial. Informe escopo, valor e condições. Ter CNPJ não substitui o registro quando há uma relação de emprego.'},
 {value:'MEI',label:'MEI (Microempreendedor Individual)',help:'Prestação de serviços por profissional formalizado como MEI, em atividade permitida para esse enquadramento. Informe o serviço e as condições. MEI é uma forma de empresa, não um contrato de emprego.'},
 {value:'Autônomo/Freelancer',label:'Autônomo/Freelancer',help:'Trabalho por conta própria ou por projeto, com autonomia na prestação do serviço. Informe entregas, prazo, pagamento e condições combinadas.'},
 {value:'Estágio',label:'Estágio',help:'Atividade educativa supervisionada para estudantes, vinculada à formação. Informe curso exigido, jornada, duração, bolsa quando houver e orientação das atividades.'},
 {value:'Jovem Aprendiz',label:'Jovem Aprendiz',help:'Contrato de aprendizagem que combina trabalho e formação profissional. Informe atividades, jornada e programa de aprendizagem.'},
 {value:'Trabalho Temporário',label:'Trabalho Temporário',help:'Trabalho por período limitado para atender substituição transitória ou demanda complementar, por empresa de trabalho temporário. Informe duração prevista, motivo e empresa responsável pela contratação.'},
 {value:'Trabalho Intermitente',label:'Trabalho Intermitente',help:'Contrato de emprego com alternância entre períodos de trabalho e de inatividade. Informe atividade, valor por hora e como ocorrerão as convocações.'},
 {value:'Trabalho Doméstico',label:'Trabalho Doméstico',help:'Trabalho contínuo para pessoa ou família, no ambiente residencial e sem finalidade lucrativa, com regras próprias do emprego doméstico. Informe tarefas, jornada e remuneração.'},
 {value:'Trabalho Voluntário',label:'Trabalho Voluntário',help:'Atividade não remunerada para entidade pública ou instituição privada sem fins lucrativos. Informe causa, tarefas, disponibilidade e condições de participação.'},
 {value:'PCD',label:'PCD',help:'Vaga destinada a pessoas com deficiência. PCD identifica o público da vaga, não o contrato. Selecione também o regime de contratação, como CLT ou Estágio.'}
];
function validJobType(value){return jobTypes.some(x=>x.value===value)}
function vacancyForPCD(x){return x.jobType==='PCD'||x.pcd===true||x.pcd==='on'}
function vacancyRegime(x){return x.jobType==='PCD'?(x.pcdRegime||''):x.jobType||''}
function matchesJobType(x,value){return x.type==='Vaga'&&(value==='PCD'?vacancyForPCD(x):vacancyRegime(x)===value)}
function jobTypeLabel(value){return jobTypes.find(x=>x.value===value)?.label||'Tipo não informado'}
function vacancyTypeText(x){const regime=vacancyRegime(x);return (regime?jobTypeLabel(regime):'Tipo não informado')+(vacancyForPCD(x)?' · Vaga para PCD':'')}
function jobChooser(id,name,value='',all=false){
 const options=all?[{value:'',label:'Todos os tipos de vaga'},...jobTypes]:jobTypes;
 return `<div class="job-chooser" data-job-chooser="${id}"><input type="hidden" name="${name}" id="${id}" value="${esc(value)}"><details><summary><span class="job-choice-label">${esc(value?jobTypeLabel(value):all?'Todos os tipos de vaga':'Selecione o tipo da vaga')}</span><span aria-hidden="true">⌄</span></summary><div class="job-options">${options.map((option,i)=>`<div class="job-option"><button type="button" class="job-option-select ${option.value===value?'selected':''}" data-job-choice="${esc(option.value)}" aria-pressed="${option.value===value}">${esc(option.label)}</button>${option.help?`<button type="button" class="job-option-help" data-job-help="${id}-${i}" aria-label="Ajuda: ${esc(option.label)}" aria-expanded="false" aria-controls="job-help-${id}-${i}">?</button><p class="job-option-explanation" id="job-help-${id}-${i}" hidden>${esc(option.help)}</p>`:''}</div>`).join('')}</div></details><p class="job-choice-error" role="alert" hidden>Selecione o tipo da vaga antes de publicar.</p></div>`;
}
function setJobChoice(chooser,value){
 const input=chooser.querySelector('input');input.value=value;
 chooser.querySelector('.job-choice-label').textContent=value?jobTypeLabel(value):'Todos os tipos de vaga';
 chooser.querySelectorAll('[data-job-choice]').forEach(button=>{const selected=button.dataset.jobChoice===value;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected))});
 chooser.querySelector('details').open=false;chooser.querySelector('.job-choice-error').hidden=true;
 input.dispatchEvent(new Event('change',{bubbles:true}));
 chooser.querySelector('summary').focus?.();
}
function updateJobFields(form){
 const isJob=form.querySelector('[name=type]').value==='Vaga',block=form.querySelector('.vacancy-fields');block.hidden=!isJob;
 for(const input of block.querySelectorAll('input,select'))input.disabled=!isJob;
 const isPCD=isJob&&form.querySelector('[name=jobType]').value==='PCD';
 const regime=form.querySelector('[name=pcdRegime]');regime.closest('label').hidden=!isPCD;regime.disabled=!isPCD;regime.required=isPCD;
 form.querySelector('.pcd-checkbox').hidden=isPCD;
}
fieldHelp.pcdRegime={title:'Contratação da vaga PCD',text:'Informe o regime efetivo da contratação. A vaga continuará aparecendo no filtro PCD e também na busca pelo regime escolhido.'};
const publishBeforeJobTypes=publish;publish=function(panel){
 publishBeforeJobTypes(panel);const form=panel.querySelector('#postForm');
 const block=document.createElement('fieldset');block.className='vacancy-fields full';block.innerHTML=`<legend>Tipo da Vaga <span class="meta">· obrigatório</span></legend>${jobChooser('jobType','jobType')}<label class="pcd-regime">Regime de contratação da vaga PCD<select name="pcdRegime"><option value="">Selecione o regime</option>${jobTypes.filter(x=>x.value!=='PCD').map(x=>`<option value="${esc(x.value)}">${esc(x.label)}</option>`).join('')}</select></label><label class="check-label pcd-checkbox"><input name="pcd" type="checkbox">Esta vaga é destinada a pessoas com deficiência (PCD)</label>`;
 form.querySelector('.formgrid').prepend(block);
 form.querySelector('[name=type]').addEventListener('change',()=>updateJobFields(form));updateJobFields(form);
};
function normalizeJobPublicationData(data){
 if(data.type!=='Vaga'){delete data.jobType;delete data.pcd;delete data.pcdRegime;return data}
 const pcd=data.jobType==='PCD'||data.pcd==='on';
 data.jobType=data.jobType==='PCD'?data.pcdRegime:data.jobType;data.pcd=pcd;delete data.pcdRegime;return data;
}
document.addEventListener('submit',event=>{
 const form=event.target;if(form.id!=='postForm'||form.querySelector('[name=type]').value!=='Vaga')return;
 const value=form.querySelector('[name=jobType]')?.value,regime=form.querySelector('[name=pcdRegime]')?.value;
 if(validJobType(value)&&(value!=='PCD'||validJobType(regime)&&regime!=='PCD'))return;
 event.preventDefault();event.stopImmediatePropagation();
 const chooser=form.querySelector('[data-job-chooser="jobType"]');chooser.querySelector('details').open=true;
 const error=chooser.querySelector('.job-choice-error');error.textContent=value==='PCD'?'Informe também o regime de contratação da vaga PCD.':'Selecione o tipo da vaga antes de publicar.';error.hidden=false;
 (value==='PCD'?form.querySelector('[name=pcdRegime]'):chooser.querySelector('summary')).focus?.();toast(error.textContent);
},true);
const exploreBeforeJobTypes=explore;explore=function(){
 exploreBeforeJobTypes();const filters=main.querySelector('.filters');
 const field=document.createElement('div');field.className='job-type-search';field.innerHTML=`<span class="filter-label">Tipo da Vaga</span>${jobChooser('jobTypeFilter','jobTypeFilter',searchJobType,true)}`;filters.append(field);
 const button=document.createElement('button');button.type='button';button.className='primary';button.id='searchOpportunities';button.textContent='Pesquisar';filters.append(button);
};
function applyOpportunitySearch(){
 const filters=main.querySelector('.filters');if(!filters)return;
 query=filters.querySelector('#search').value;city=filters.querySelector('#city').value;type=filters.querySelector('#type').value;
 searchMode=filters.querySelector('#modeFilter').value;searchLevel=filters.querySelector('#levelFilter').value;searchSalary=filters.querySelector('#salaryFilter').value;
 searchJobType=filters.querySelector('#jobTypeFilter').value;
 if(searchJobType){type='Vaga';filters.querySelector('#type').value='Vaga'}organicPage=0;results();
}
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-job-choice')){const chooser=button.closest('.job-chooser');setJobChoice(chooser,button.dataset.jobChoice);if(chooser.dataset.jobChooser==='jobTypeFilter')applyOpportunitySearch();else updateJobFields(button.closest('form'))}
 if(button.dataset.jobHelp){const text=document.getElementById('job-help-'+button.dataset.jobHelp);const open=text.hidden;text.hidden=!open;button.setAttribute('aria-expanded',String(open))}
 if(button.id==='searchOpportunities')applyOpportunitySearch();
});
document.addEventListener('change',event=>{
 if(event.target.id!=='type'||event.target.value==='Vaga'||event.target.value==='Todos')return;
 searchJobType='';const chooser=main.querySelector('[data-job-chooser="jobTypeFilter"]');if(chooser)setJobChoice(chooser,'');
},true);
document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='search'){event.preventDefault();applyOpportunitySearch()}if(event.key==='Escape'&&event.target.closest('.job-chooser')){const chooser=event.target.closest('.job-chooser');chooser.querySelector('details').open=false;chooser.querySelector('summary').focus?.()}});
// Explicit metadata only: never guess employment contracts from title/description.
const sampleJobTypes={'v1':'CLT','v2':'CLT','v3':'Estágio','extra-job1':'Jovem Aprendiz','extra-job2':'PJ'};
const jobTypeExamples=jobTypes.filter(x=>!Object.values(sampleJobTypes).includes(x.value)).map((x,i)=>({id:'job-type-example-'+i,type:'Vaga',jobType:x.value==='PCD'?'CLT':x.value,pcd:x.value==='PCD',title:({MEI:'Modelador 3D por projeto','Autônomo/Freelancer':'Designer freelancer','Trabalho Temporário':'Operador para demanda temporária','Trabalho Intermitente':'Atendente por convocação','Trabalho Doméstico':'Profissional de serviços domésticos','Trabalho Voluntário':'Apoio voluntário a oficinas educativas',PCD:'Assistente administrativo — PCD'})[x.value],org:'Organização '+(i+1)+' · exemplo fictício',city:i%2?'Campinas':'Sumaré',mode:'Presencial',skills:'Organização, comunicação',description:'Vaga fictícia para testar o filtro de tipo da vaga. Não representa contratação real.',publisherPlan:'Grátis'}));
const itemsBeforeJobTypes=items;items=function(){return itemsBeforeJobTypes().map(x=>{
 if(x.type!=='Vaga'||x.jobType)return x;
 if(sampleJobTypes[x.id])return {...x,jobType:sampleJobTypes[x.id]};
 if(x.id.startsWith('volume-Vaga-')){const kind=jobTypes[Number(x.id.split('-').at(-1))%jobTypes.length].value;return {...x,jobType:kind==='PCD'?'CLT':kind,pcd:kind==='PCD'}}
 return x;
}).concat(state.demoVolume?[]:jobTypeExamples)};
const cardBeforeJobTypes=card;card=function(x){let html=cardBeforeJobTypes(x);if(x.type==='Vaga')html=html.replace('<div class="bottom">',`<p class="vacancy-type-badge">${esc(vacancyTypeText(x))}</p><div class="bottom">`);return html};
function vacancyDetailTypeMarkup(x){return x.type==='Vaga'?`<p class="vacancy-detail-type vacancy-type-badge">${esc(vacancyTypeText(x))}</p>`:''}
if(page==='inicio')home();if(page==='explorar')explore();if(page==='painel')dashboard();
