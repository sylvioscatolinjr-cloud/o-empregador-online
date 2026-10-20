/* Only caller-approved public content may be passed here. Never serialize records into URLs. */
(function(root){
 function link(origin,key,id,base='/'){if(!['/','/laboratorio/'].includes(base))throw Error('Endereço inválido');const u=new URL(base,origin);if(!['anuncio','artigo'].includes(key)||typeof id!=='string'||!id||id.length>120)throw Error('Conteúdo inválido');if(key==='artigo')u.pathname='/blog.html';u.searchParams.set(key,id);return u.href;}
 async function share(data,nav){if(typeof nav.share==='function'&&(!nav.canShare||nav.canShare(data))){try{await nav.share(data);return 'shared';}catch(e){if(e.name==='AbortError')return 'canceled';}}if(nav.clipboard?.writeText){try{await nav.clipboard.writeText(data.url);return 'copied';}catch{}}return 'manual';}
 root.PortalShare={link,share};
})(globalThis);
