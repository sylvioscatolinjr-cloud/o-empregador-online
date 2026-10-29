// Nebu: bulldog francês fêmea, inspirada nas fotos enviadas pelo titular em 29/10/2026.
// Cabeça preta com focinho grisalho, orelhas eretas, corpo branco com pintinhas cinzas e mancha preta no dorso.
export function nebuAvatar({size=64,title='Nebu, assistente do portal',mood='happy'}={}){
 const id='nebu-'+Math.random().toString(36).slice(2,8);
 const mouth=mood==='thinking'||mood==='sleep'?'<path d="M52 86q8 2 16 0" fill="none" stroke="#0d0b10" stroke-width="2" stroke-linecap="round"/>':'<path d="M50 85q10 6 20 0" fill="none" stroke="#0d0b10" stroke-width="2" stroke-linecap="round"/><path d="M56 87q4 8 8 0z" fill="#e8798f"/>';
 const eyes=mood==='sleep'?'<path d="M34 59q7 5 14 0M72 59q7 5 14 0" fill="none" stroke="#c4bec8" stroke-width="2.4" stroke-linecap="round"/>':`<g class="nebu-eyes"><g><circle cx="41" cy="58" r="7.5" fill="#f4eee6"/><circle cx="41.5" cy="58.5" r="6" fill="#4a2a17"/><circle cx="41.5" cy="58.5" r="3.4" fill="#0d0b10"/><circle cx="39.5" cy="56" r="1.7" fill="#fff"/></g>
<g><circle cx="79" cy="58" r="7.5" fill="#f4eee6"/><circle cx="78.5" cy="58.5" r="6" fill="#4a2a17"/><circle cx="78.5" cy="58.5" r="3.4" fill="#0d0b10"/><circle cx="76.5" cy="56" r="1.7" fill="#fff"/></g></g>`;
 return `<svg class="nebu-avatar" width="${Number(size)}" height="${Number(size)}" viewBox="0 0 120 120" role="img" aria-labelledby="${id}"><title id="${id}">${title}</title>
<path d="M14 120c0-26 20-40 46-40s46 14 46 40z" fill="#fbfaf7" stroke="#2c2138" stroke-width="1.5"/>
<path d="M80 92c12-2 22 6 25 22l1 6H86c-6-8-10-18-6-28z" fill="#1d1a22"/>
<g fill="#9a95a0"><circle cx="34" cy="104" r="1.6"/><circle cx="40" cy="110" r="1.3"/><circle cx="28" cy="112" r="1.4"/><circle cx="46" cy="102" r="1.1"/><circle cx="70" cy="108" r="1.4"/><circle cx="62" cy="114" r="1.2"/><circle cx="36" cy="97" r="1"/></g>
<g class="nebu-ear-l"><path d="M30 50C16 34 10 14 20 6c10-7 26 8 32 24z" fill="#1d1a22"/><path d="M31 42C22 30 18 17 23 12c6-4 16 7 21 18z" fill="#5a4648"/></g>
<g class="nebu-ear-r"><path d="M90 50c14-16 20-36 10-44-10-7-26 8-32 24z" fill="#1d1a22"/><path d="M89 42c9-12 13-25 8-30-6-4-16 7-21 18z" fill="#5a4648"/></g>
<path d="M60 26c26 0 46 14 46 38 0 18-14 30-46 30S14 82 14 64c0-24 20-38 46-38z" fill="#1d1a22"/>
<path d="M30 86q30 13 60 0" fill="none" stroke="#543878" stroke-width="7" stroke-linecap="round"/><circle cx="60" cy="97" r="4.5" fill="#f2c94c" stroke="#8a6d1c" stroke-width="1"/>
<ellipse cx="48" cy="80" rx="15" ry="10" fill="#3d3842"/><ellipse cx="72" cy="80" rx="15" ry="10" fill="#3d3842"/>
<g fill="#c4bec8"><circle cx="40" cy="78" r="1.1"/><circle cx="45" cy="84" r="1"/><circle cx="52" cy="77" r=".9"/><circle cx="80" cy="78" r="1.1"/><circle cx="75" cy="84" r="1"/><circle cx="68" cy="77" r=".9"/><circle cx="37" cy="83" r=".9"/><circle cx="83" cy="83" r=".9"/><circle cx="56" cy="66" r=".8"/><circle cx="64" cy="66" r=".8"/><circle cx="60" cy="63" r=".8"/></g>
<path d="M47 62q13-7 26 0" fill="none" stroke="#3d3842" stroke-width="2" stroke-linecap="round"/>
<path d="M51 72q9-6 18 0q1 6-9 7q-10-1-9-7z" fill="#0d0b10"/><ellipse cx="56" cy="71.5" rx="2.6" ry="1.2" fill="#6d6872"/><circle cx="56.5" cy="75" r="1.2" fill="#3d3842"/><circle cx="63.5" cy="75" r="1.2" fill="#3d3842"/>
<path d="M60 79v4" stroke="#0d0b10" stroke-width="1.6"/>
${mouth}
${eyes}
<g transform="translate(30 34) rotate(-20)"><path d="M0 0-11-6v12zM0 0l11-6v12z" fill="#ff7aa8" stroke="#c94a7a" stroke-width="1"/><circle r="3.4" fill="#ff9cc0" stroke="#c94a7a" stroke-width="1"/></g>
</svg>`;
}

// Figuras das brincadeiras de ociosidade (decorativas, sem texto para leitores de tela).
export function nebuRunner({duck=false}={}){
 return `<svg class="nebu-runner-svg" width="96" height="68" viewBox="0 0 100 70" aria-hidden="true" focusable="false">
<path d="M14 36l-6-4" stroke="#1d1a22" stroke-width="4" stroke-linecap="round"/>
<g class="nebu-leg-b"><rect x="22" y="46" width="7" height="18" rx="3.5" fill="#fbfaf7" stroke="#2c2138"/><rect x="58" y="46" width="7" height="18" rx="3.5" fill="#fbfaf7" stroke="#2c2138"/></g>
<ellipse cx="44" cy="40" rx="30" ry="16" fill="#fbfaf7" stroke="#2c2138" stroke-width="1.2"/>
<path d="M18 34c4-10 14-12 22-10 6 2 10 10 6 18-6 8-22 8-28 0z" fill="#1d1a22"/>
<path d="M44 26c8-4 16-2 18 3-6 3-12 3-18-3z" fill="#1d1a22"/>
<g fill="#9a95a0"><circle cx="56" cy="42" r="1.2"/><circle cx="62" cy="38" r="1"/><circle cx="52" cy="48" r="1"/><circle cx="66" cy="46" r="1.1"/></g>
<g class="nebu-leg-a"><rect x="30" y="46" width="7" height="18" rx="3.5" fill="#fbfaf7" stroke="#2c2138"/><rect x="66" y="46" width="7" height="18" rx="3.5" fill="#fbfaf7" stroke="#2c2138"/></g>
<path d="M66 28q8 8 16 6" stroke="#543878" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M70 20c-2-8 0-16 4-18 4 0 6 8 6 16z" fill="#1d1a22"/><path d="M72 18c-1-6 0-11 2-12 2 1 4 6 4 11z" fill="#5a4648"/>
<circle cx="80" cy="28" r="15" fill="#1d1a22"/>
<ellipse cx="91" cy="33" rx="8" ry="7" fill="#3d3842"/><g fill="#c4bec8"><circle cx="89" cy="36" r=".8"/><circle cx="93" cy="35" r=".8"/><circle cx="91" cy="38" r=".7"/></g>
<ellipse cx="96" cy="29" rx="3.5" ry="2.6" fill="#0d0b10"/>
<circle cx="83" cy="23" r="3.4" fill="#f4eee6"/><circle cx="84" cy="23" r="2.2" fill="#4a2a17"/><circle cx="83.4" cy="22.2" r=".8" fill="#fff"/>
<g transform="translate(70 22) rotate(-10)"><path d="M0 0-6-4v8zM0 0l6-4v8z" fill="#ff7aa8"/><circle r="2" fill="#ff9cc0"/></g>
${duck?`<g transform="translate(88 34)">${duckShape()}</g>`:''}
</svg>`;
}
function duckShape(){return '<ellipse cx="8" cy="12" rx="9" ry="6.5" fill="#ffd23f" stroke="#c99a00"/><circle cx="13" cy="4" r="5" fill="#ffd23f" stroke="#c99a00"/><path d="M17 4l5 1.5-5 1.5z" fill="#ff8a00"/><circle cx="14" cy="3" r=".9" fill="#2c2138"/>';}
export function duckToy(){return `<svg class="nebu-duck-svg" width="30" height="24" viewBox="-1 -2 25 22" aria-hidden="true" focusable="false">${duckShape()}</svg>`;}
export function catSprite(){
 return `<svg class="nebu-cat-svg" width="80" height="60" viewBox="0 0 80 60" aria-hidden="true" focusable="false">
<path d="M10 30C2 26 2 12 8 8" stroke="#d98a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
<g class="nebu-leg-b"><rect x="18" y="38" width="5" height="16" rx="2.5" fill="#d98a3a"/><rect x="46" y="38" width="5" height="16" rx="2.5" fill="#d98a3a"/></g>
<ellipse cx="34" cy="34" rx="24" ry="11" fill="#e8a25a"/>
<path d="M24 25v18M32 23v22M40 24v19" stroke="#c46f25" stroke-width="2.5"/>
<g class="nebu-leg-a"><rect x="24" y="38" width="5" height="16" rx="2.5" fill="#e8a25a"/><rect x="52" y="38" width="5" height="16" rx="2.5" fill="#e8a25a"/></g>
<circle cx="60" cy="24" r="11" fill="#e8a25a"/><path d="M52 17l1-10 7 7zM62 14l6-7 2 10z" fill="#e8a25a"/>
<circle cx="64" cy="22" r="2" fill="#2c2138"/><path d="M70 26l1 1-2 1z" fill="#c94a7a"/><path d="M69 28l8-1M69 29l8 2" stroke="#2c2138" stroke-width=".6"/>
</svg>`;
}
export function playToy(kind='ball'){
 return kind==='chicken'
  ?`<svg class="nebu-toy-svg" width="40" height="34" viewBox="0 0 40 34" aria-hidden="true" focusable="false"><ellipse cx="18" cy="22" rx="14" ry="9" fill="#ffd23f" stroke="#c99a00"/><path d="M4 20l-4-4 6 1z" fill="#ffd23f" stroke="#c99a00"/><circle cx="30" cy="11" r="7" fill="#ffd23f" stroke="#c99a00"/><path d="M27 4l2-4 2 3 2-3 1 5z" fill="#e2412b"/><path d="M36 11l4 2-4 2z" fill="#ff8a00"/><circle cx="32" cy="9.5" r="1" fill="#2c2138"/><path d="M14 30v4M22 30v4" stroke="#ff8a00" stroke-width="2"/></svg>`
  :`<svg class="nebu-toy-svg" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="14" fill="#cfe23a" stroke="#8fa012"/><path d="M5 7c7 4 7 14 0 18M27 7c-7 4-7 14 0 18" fill="none" stroke="#fff" stroke-width="2.2"/></svg>`;
}
