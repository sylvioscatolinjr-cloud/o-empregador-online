import {cleanImage} from '../src/resume-model.mjs';
// Server publishes only the opted-in image; reject invalid markup even in fixtures.
export function cardIdentity(value,fictitious=false,portrait=false){
 let image='';try{image=cleanImage(value||'');}catch{}
 const mark=fictitious?'<span class="fictitious-watermark">Fictício</span>':'';
 return image?`<div class="card-identity"><img class="card-image ${portrait?'card-portrait':'card-logo'}" src="${image}" alt="${portrait?'Foto do candidato':'Logo da organização'}" width="64" height="64" loading="lazy" decoding="async">${mark}</div>`:mark;
}
