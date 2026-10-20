/* Local suggestions only: preserve source text, respect section boundaries and flag uncertainty. */
(function(root){
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const clean=v=>String(v||'').normalize('NFKC').replace(/[\u0000\u00ad]/g,'').replace(/\r\n?/g,'\n').replace(/[ \t\u00a0]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
  const rules=[
    ['experience',/^(?:experiencia(?:s)?(?: profissional| profissionais| de trabalho)?|historico profissional|historico de trabalho|trajetoria profissional|atuacao profissional|empregos anteriores|professional experience|work experience|employment(?: history)?)$/],
    ['certifications',/^(?:certificacoes(?: profissionais)?|certificados|licencas(?: e certificacoes| e certificados)?|cursos e certificacoes|certificacoes e cursos|certifications|licenses(?: and certifications)?)$/],
    ['courses',/^(?:cursos?(?: complementares| realizados| livres| de aperfeicoamento| e treinamentos| e capacitacoes)?|treinamentos(?: realizados)?|capacitacoes|aperfeicoamento(?: profissional)?|formacao complementar|formacao continuada|complementary courses|courses(?: and training)?|training)$/],
    ['education',/^(?:formacao(?: academica| escolar| profissional| tecnica| e cursos| academica e profissional| academica e tecnica| academica e cursos)?|escolaridade|educacao(?: e formacao)?|qualificacoes academicas|historico academico|academic background|education(?: and training)?)$/],
    ['skills',/^(?:competencias(?: tecnicas| profissionais| e habilidades)?|habilidades(?: tecnicas| e competencias)?|conhecimentos(?: tecnicos)?|qualificacoes(?: profissionais)?|ferramentas|idiomas|skills|technical skills|core competencies|languages)$/],
    ['about',/^(?:resumo(?: profissional)?|perfil(?: profissional)?|sobre mim|apresentacao|professional summary|profile|summary)$/],
    ['portfolio',/^(?:portfolio|projetos(?: pessoais)?|links|projects)$/],
    ['target',/^(?:objetivo(?: profissional)?|cargo desejado|area de interesse|career objective|objective)$/],
    ['ignore',/^(?:dados pessoais|informacoes pessoais|contatos?|contact(?: details)?|personal details|referencias(?: profissionais)?|references|informacoes adicionais|outras informacoes|atividades extracurriculares|interesses(?: pessoais)?|hobbies)$/]
  ];
  function heading(value){
    const line=clean(value).replace(/^[•●▪\-–—\d.)\s]+/,'').replace(/\s*[:：]\s*$/,'');
    const match=prefix=>{const n=norm(prefix).replace(/\s*[/&+]\s*/g,' e ').trim();return rules.find(([,re])=>re.test(n))?.[0];};
    const exact=match(line);if(exact)return {key:exact,value:''};
    const split=line.match(/^(.{3,65}?)(?:[:：]|\s+[—–-]\s+)\s*(.+)$/);if(split){const key=match(split[1]);if(key)return {key,value:split[2]};}
    return null;
  }
  const senaiPattern=/\bsenai\b|servico nacional de aprendizagem industrial/i;
  function isContact(line){
    const digits=line.replace(/\D/g,'');
    const phoneOnly=/^\+?[\d(][\d() .+-]+$/.test(line)&&digits.length>=10&&digits.length<=13;
    return phoneOnly||/@|https?:\/\/|www\./i.test(line)||/^(?:e-?mail|telefone|celular|whatsapp|contato|endereco|rua|avenida|av\.|cep|data de nascimento|nascimento|idade|estado civil|cpf|rg|nacionalidade)\s*[:.]/i.test(line)||/^[\p{L} .'-]+[,/|—–-]\s*(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/u.test(line);
  }
  function plausibleName(line){return line.length>=5&&line.length<100&&/^[\p{L} .'-]+$/u.test(line)&&line.split(/\s+/).length>=2&&line.split(/\s+/).length<=7&&!heading(line)&&!/curriculo|curriculum|vitae|tecnico|tecnica|engenheiro|engenheira|desenhista|analista|profissional|senai|trabalh|equipe|comunicacao|conhecimento|facilidade|institu|universidade|faculdade|escola/i.test(norm(line));}
  function trainingKind(value){
    const n=norm(value);
    if(/^(?:pre-requisitos?|requisitos?|exige|destinado a)\s*[:—-]/.test(n))return null;
    const short=n.match(/\b(?:treinamento|workshop|capacitacao|curso livre|curso preparatorio|curso de (?:extensao|introducao|preparacao|atualizacao|aperfeicoamento|curta duracao)|(?:qualificacao|iniciacao|aperfeicoamento|especializacao) profissional)\b/);
    const formal=n.match(/\b(?:curso tecnico|tecnic[oa] (?:em|de nivel medio)|habilitacao tecnica|diploma de tecnico|ensino (?:medio|fundamental|superior)|pos[- ]?graduacao|graduacao|bacharelado|licenciatura|tecnologo|mestrado|doutorado|mba)\b/);
    if(short&&(!formal||short.index<formal.index))return 'courses';
    if(formal)return 'education';
    if(/\b(?:aprendizagem industrial|curso de aprendizagem|aprendiz senai|cai|curso(?: complementar)? (?:de|em))\b/.test(n))return 'courses';
    if(/(?:^|[-—–])\s*(?:medio|fundamental|superior)\b/.test(n))return 'education';
    return null;
  }
  const trainingInstitution=value=>/\b(?:senai|senac|universidade|faculdade|instituto|escola|centro universitario)\b/.test(norm(value));
  function trainingRecords(value){
    const records=[];let entry={lines:[],kind:null,qualified:false,institution:false};
    const flush=()=>{const text=clean(entry.lines.join('\n'));if(text)records.push({text,kind:entry.kind});entry={lines:[],kind:null,qualified:false,institution:false};};
    for(const raw of String(value||'').split('\n')){
      const line=raw.trim();if(!line){if(entry.lines.length&&entry.lines.at(-1))entry.lines.push('');continue;}
      const kind=trainingKind(line),institution=trainingInstitution(line),unit=/^(?:unidade|campus|escola senai|escola senac)\b/.test(norm(line));
      // Keep provider/unit/period with its qualification, stopping at the next qualification/provider.
      if(entry.lines.length&&(kind&&entry.qualified||institution&&entry.institution&&!unit))flush();
      entry.lines.push(line);if(kind){entry.kind=kind;entry.qualified=true;}if(institution)entry.institution=true;
    }
    flush();return records;
  }
  function partitionTraining(parts){
    const output={education:[],courses:[]},seen={education:new Set(),courses:new Set()},warnings=[];
    for(const source of ['education','courses'])for(const record of trainingRecords(parts[source])){
      const destination=record.kind||source,key=norm(record.text).replace(/\s+/g,' ');
      if(!seen[destination].has(key)){output[destination].push(record.text);seen[destination].add(key);}
      if(destination!==source)warnings.push(destination==='courses'?'Uma formação de aprendizagem, qualificação ou capacitação foi separada para Cursos e treinamentos, com instituição e período.':'Uma formação escolar, acadêmica ou técnica foi separada dos cursos e treinamentos.');
    }
    return {parts:{...parts,education:output.education.join('\n\n'),courses:output.courses.join('\n\n')},warnings:[...new Set(warnings)]};
  }
  function strongCategory(line){
    const n=norm(line);
    if(/\b(?:ltda|s\.a\.|empresa modelo|empresa exemplo)\b/.test(n)&&/[-—–]|cargo|auxiliar|assistente|atendente|analista|operador|aprendiz/.test(n)||/^(?:empresa|cargo|funcao)\s*:/.test(n))return 'experience';
    if(/^(?:certificacao|certificado|credencial)\s+(?!de participacao em trabalho)/.test(n))return 'certifications';
    const training=trainingKind(line);if(training)return training;
    if(/^(?:universidade|faculdade|escola tecnica)\b/.test(n))return 'education';
    if(/^(?:curso(?: livre| complementar)?(?: de| em)?|treinamento(?: de| em)?|workshop|capacitacao)\s+/.test(n)||senaiPattern.test(n)&&/\bcurso\b/.test(n))return 'courses';
    return null;
  }
  function sectionText(text,blocks,name){
    const found={},unclassified=[],warnings=[],cursors=new Map();
    const add=(key,line)=>{found[key]??=[];if(line||found[key].at(-1))found[key].push(line);};
    for(const block of blocks?.length?blocks:[{text,column:0,page:1}]){
      const column=block.column??0;let cursor=cursors.get(column)||{key:null,explicit:false};
      for(const raw of clean(block.text).split('\n')){
        const line=raw.trim();if(!line){if(cursor.key&&cursor.key!=='ignore')add(cursor.key,'');continue;}
        const title=heading(line);if(title){cursor={key:title.key,explicit:true};if(title.value&&title.key!=='ignore')add(title.key,title.value);continue;}
        if(line===name||isContact(line)||/^(?:página\s*\d{1,3}|\d{1,3}\s*(?:de|\/)\s*\d{1,3})$/i.test(line))continue;
        if(cursor.key==='ignore')continue;
        const inferred=strongCategory(line);
        if(inferred&&(!cursor.key||!cursor.explicit||cursor.key==='skills')){
          if(cursor.key==='skills')warnings.push('Um trecho com características de formação ou experiência foi separado das competências. Confira a classificação.');
          cursor={key:inferred,explicit:false};
        }
        // Dates, paragraphs and employer records do not become skills just because a heading is missing.
        if(cursor.key==='skills'&&(/\b(?:19|20)\d{2}\s*(?:-|—|a|ate)\s*(?:(?:19|20)\d{2}|atual)/.test(norm(line))||line.length>280&&!/[,;|]/.test(line))){unclassified.push(line);cursor={key:null,explicit:false};continue;}
        if(cursor.key)add(cursor.key,line);else unclassified.push(line);
      }
      cursors.set(column,cursor);
    }
    return {parts:Object.fromEntries(Object.entries(found).map(([key,lines])=>[key,clean(lines.join('\n'))]).filter(([,value])=>value)),unclassified:clean(unclassified.join('\n')),warnings:[...new Set(warnings)]};
  }
  function senaiEducation(education,raw=''){
    let records=trainingRecords(education).map(r=>r.text);
    if(!records.length){const lines=clean(raw).split('\n');records=lines.filter((line,i)=>senaiPattern.test(norm(line))&&/\b(curso|tecnico|tecnica|tecnologo|tecnologia|aprendizagem|formacao|certificado|qualificacao|graduacao)\b/.test(norm(lines.slice(Math.max(0,i-1),i+2).join(' '))));}
    const matched=records.filter(record=>senaiPattern.test(norm(record))&&!/\b(pretendo|desejo|quero|interesse em|nao estudei|nao fiz|nao cursei|nao possuo|nao tenho)\b/.test(norm(record)));
    if(!matched.length)return {senaiTraining:false,senaiStatus:'unspecified',evidence:''};
    const ongoing=/\b(cursando|em andamento|em curso|conclusao prevista|previsao de conclusao|nao concluido|incompleto)\b/,completed=/\b(concluido|concluida|conclusao|finalizado|finalizada|certificado|formado|formada)\b/;
    const statuses=matched.map(record=>ongoing.test(norm(record))?'in_progress':completed.test(norm(record))?'completed':'unspecified');
    return {senaiTraining:true,senaiStatus:statuses.includes('completed')?'completed':statuses.includes('in_progress')?'in_progress':'unspecified',evidence:matched.join('\n\n').slice(0,1500)};
  }
  function parseResumeText(value,options={}){
    const text=clean(value);if(text.length<35)throw Error('O arquivo não contém texto suficiente para sugerir o preenchimento.');if(text.length>200000)throw Error('O currículo excede o limite de texto desta importação.');
    const lines=text.split('\n').map(x=>x.trim()).filter(Boolean),fields={},warnings=[];
    const email=text.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+/);if(email)fields.email=email[0];
    const phone=text.match(/(?:\+55[\s.-]*)?(?:\(?[1-9]\d\)?[\s.-]*)(?:9[\s.-]*)?\d{4}[\s.-]?\d{4}\b/);if(phone)fields.phone=phone[0].trim();
    const explicitName=lines.find(x=>/^nome(?: completo)?\s*:/i.test(x));
    const headerCandidates=(options.blocks||[]).filter(b=>b.page===1).flatMap(b=>(b.lines||[]).filter(l=>l.y<240&&plausibleName(l.text))).sort((a,b)=>b.height-a.height||a.y-b.y);
    const blockCandidates=(options.blocks||[]).flatMap(b=>clean(b.text).split('\n').slice(0,3)).filter(plausibleName);
    const name=explicitName?explicitName.replace(/^nome(?: completo)?\s*:\s*/i,'').trim():headerCandidates[0]?.text||lines.slice(0,6).find(plausibleName)||blockCandidates[0];if(name)fields.name=name;
    const location=lines.map(l=>l.match(/^(?:cidade\s*:\s*)?([\p{L}][\p{L} .'-]{1,70})\s*(?:[-/|,—–])\s*(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/iu)).find(Boolean);if(location){fields.city=location[1].trim();fields.addressCity=location[1].trim();fields.uf=location[2].toUpperCase();}
    const cep=text.match(/\b(?:CEP\s*:?\s*)(\d{5}-?\d{3})\b/i)||location?.[0]&&lines.find(l=>l.startsWith(location[0]))?.match(/\b(\d{5}-\d{3})\b/);if(cep)fields.cep=cep[1].replace(/(\d{5})(\d{3})/,'$1-$2');
    const classified=sectionText(text,options.blocks,fields.name),trainingParts=partitionTraining(classified.parts),parts=trainingParts.parts;warnings.push(...classified.warnings,...trainingParts.warnings);
    for(const key of ['education','courses','certifications','experience','about','target'])if(parts[key]){const max=key==='target'?150:12000;fields[key]=parts[key].slice(0,max);if(parts[key].length>max)warnings.push('A seção '+key+' excedeu o limite do campo; confira o arquivo original.');}
    if(parts.skills){fields.skills=parts.skills.replace(/\b(de|do|da|dos|das|em|no|na|com|para|e)\n(?=[a-zà-ú])/g,'$1 ').replace(/[.;]+\s*\n/g,'\n').replace(/\n+/g,', ').replace(/[.;]+$/,'').replace(/,\s*,/g,',').slice(0,3000);if(parts.skills.length>3000)warnings.push('As competências excederam o limite do campo. Confira o arquivo original.');}
    const links=text.match(/https?:\/\/[^\s<>"']+/g)||[];const portfolio=links.filter(l=>!/\b(linkedin\.com|facebook\.com|instagram\.com)\b/i.test(l));if(portfolio.length)fields.portfolio=portfolio[0].replace(/[),.;]+$/,'');else if(links.length)fields.portfolio=links[0].replace(/[),.;]+$/,'');
    const training=[parts.education,parts.courses,parts.certifications].filter(Boolean).join('\n');
    const senai=senaiEducation(training,!training&&senaiPattern.test(norm(parts.experience||''))?'':text);
    if(!parts.education&&!parts.courses&&!parts.certifications)warnings.push('A formação e os cursos não foram identificados com segurança. Confira manualmente.');
    if(!parts.experience)warnings.push('A seção de experiência não foi identificada com segurança.');
    if(senai.senaiTraining&&senai.senaiStatus==='unspecified')warnings.push('Há formação no SENAI mencionada, mas a conclusão precisa ser confirmada.');
    if(classified.unclassified)warnings.push('Alguns trechos ficaram para revisão e não foram colocados automaticamente em competências.');
    return {fields,senai,warnings:[...new Set(warnings)],unclassified:classified.unclassified,text};
  }
  const api={parseResumeText,senaiEducation,cleanText:clean};root.ResumeParser=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
