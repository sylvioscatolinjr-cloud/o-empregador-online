// Nebu: bulldog francês fêmea no visual da Nebu da Super Maker (imagem enviada pelo titular em 29/10/2026).
// Desenho simples, sentada: cabeça preta, orelhas rosadas por dentro com lacinho, olhos castanhos,
// coleira azul-turquesa com medalhinha dourada, corpo branco e mancha preta no lado.
const INK='#2b2a33',PINK='#f2a5b0',TEAL='#1aa3b8';
export function nebuAvatar({size=64,title='Nebu, assistente do portal',mood='happy'}={}){
 const id='nebu-'+Math.random().toString(36).slice(2,8);
 const mouth=mood==='thinking'||mood==='sleep'?'':'<path d="M61.5 75q3.5 6 7 0z" fill="#e8798f"/>';
 const eye=(x)=>`<circle cx="${x}" cy="52" r="8" fill="#3a1a08"/><circle cx="${x}" cy="52" r="6.6" fill="#7a3b14"/><circle cx="${x}" cy="52" r="3.6" fill="#1a0c04"/><circle cx="${x-2.4}" cy="49.2" r="2.4" fill="#fff"/><circle cx="${x+2.4}" cy="54.4" r="1.1" fill="#fff"/>`;
 const eyes=mood==='sleep'?'<path d="M40 53q7 4.5 14 0M76 53q7 4.5 14 0" fill="none" stroke="#c4bec8" stroke-width="2.4" stroke-linecap="round"/>':`<g class="nebu-eyes">${eye(47)}${eye(83)}</g>`;
 return `<svg class="nebu-avatar" width="${Number(size)}" height="${Number(size)}" viewBox="12 0 106 128" role="img" aria-labelledby="${id}"><title id="${id}">${title}</title>
<ellipse cx="65" cy="125" rx="38" ry="3.5" fill="#000" opacity=".1"/>
<path d="M28 124c-6-20 0-38 16-44h42c16 6 22 24 16 44z" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
<path d="M88 86c12 6 16 24 11 38H86c4-13 4-26 2-38z" fill="${INK}"/>
<g fill="#b9b6c0"><circle cx="40" cy="94" r="1.3"/><circle cx="45" cy="101" r="1.1"/><circle cx="38" cy="108" r="1.2"/><circle cx="82" cy="98" r="1"/><circle cx="56" cy="88" r="1"/></g>
<g fill="#fff" stroke="${INK}" stroke-width="1.8"><rect x="46" y="95" width="16" height="29" rx="7"/><rect x="68" y="95" width="16" height="29" rx="7"/></g>
<path d="M50.5 119v5M55 119v5M73 119v5M78 119v5" stroke="${INK}" stroke-width="1.2"/>
<g class="nebu-ear-l"><path d="M33 46C22 32 17 16 21 8c4-7 15-5 24 5 6 7 12 15 14 20z" fill="${INK}"/><path d="M35 39c-7-10-10-20-8-25 3-4 10-2 16 5 4 5 8 10 9 13z" fill="${PINK}"/></g>
<g class="nebu-ear-r"><path d="M97 46c11-14 16-30 12-38-4-7-15-5-24 5-6 7-12 15-14 20z" fill="${INK}"/><path d="M95 39c7-10 10-20 8-25-3-4-10-2-16 5-4 5-8 10-9 13z" fill="${PINK}"/></g>
<path d="M65 27c27 0 40 12 40 30 0 17-14 27-40 27S25 74 25 57c0-18 13-30 40-30z" fill="${INK}"/>
<path d="M41 82q24 11 48 0" fill="none" stroke="${TEAL}" stroke-width="6.5" stroke-linecap="round"/>
<circle cx="65" cy="91" r="5" fill="#f2c230" stroke="#b8860b" stroke-width="1"/><path d="M63 93v-4l4 4v-4" fill="none" stroke="#8a6410" stroke-width=".9"/>
<path d="M50 44q15-6 30 0" fill="none" stroke="#45434f" stroke-width="2" stroke-linecap="round"/><path d="M56 40q9-3 18 0" fill="none" stroke="#45434f" stroke-width="1.6" stroke-linecap="round"/>
<path d="M52 63q13-5 26 0" fill="none" stroke="#45434f" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="55" cy="72" rx="12.5" ry="8.5" fill="#3b3a45"/><ellipse cx="75" cy="72" rx="12.5" ry="8.5" fill="#3b3a45"/>
<path d="M45 76q4 6 10 5M85 76q-4 6-10 5" fill="none" stroke="#1d1c24" stroke-width="1.4" stroke-linecap="round"/>
<g fill="#a29eaa"><circle cx="48" cy="71" r=".9"/><circle cx="51" cy="75" r=".8"/><circle cx="53" cy="69" r=".7"/><circle cx="82" cy="71" r=".9"/><circle cx="79" cy="75" r=".8"/><circle cx="77" cy="69" r=".7"/></g>
<ellipse cx="37" cy="66" rx="4.5" ry="2.6" fill="#e9768a" opacity=".7"/><ellipse cx="93" cy="66" rx="4.5" ry="2.6" fill="#e9768a" opacity=".7"/>
<path d="M57 65q8-5 16 0q0 5.5-8 6.5q-8-1-8-6.5z" fill="#0d0b10"/><ellipse cx="61" cy="65" rx="2" ry=".9" fill="#6d6872"/><circle cx="61.5" cy="68" r="1" fill="#2b2a33"/><circle cx="68.5" cy="68" r="1" fill="#2b2a33"/>
<path d="M65 71.5v3" stroke="#0d0b10" stroke-width="1.4"/>
${mouth}
${eyes}
<g transform="translate(91 34) rotate(20)"><path d="M0 0-8-4.5v9zM0 0l8-4.5v9z" fill="#ff7aa8" stroke="#c94a7a" stroke-width=".9"/><circle r="2.6" fill="#ff9cc0" stroke="#c94a7a" stroke-width=".9"/></g>
</svg>`;
}

// Figuras das brincadeiras de ociosidade (decorativas, sem texto para leitores de tela).
export function nebuRunner({duck=false}={}){
 return `<svg class="nebu-runner-svg" width="96" height="68" viewBox="0 0 100 70" aria-hidden="true" focusable="false">
<path d="M14 36l-6-4" stroke="#2b2a33" stroke-width="4" stroke-linecap="round"/>
<g class="nebu-leg-b"><rect x="22" y="46" width="7" height="18" rx="3.5" fill="#fbfaf7" stroke="#2c2138"/><rect x="58" y="46" width="7" height="18" rx="3.5" fill="#fbfaf7" stroke="#2c2138"/></g>
<ellipse cx="44" cy="40" rx="30" ry="16" fill="#fbfaf7" stroke="#2c2138" stroke-width="1.2"/>
<path d="M18 34c4-10 14-12 22-10 6 2 10 10 6 18-6 8-22 8-28 0z" fill="#2b2a33"/>
<path d="M44 26c8-4 16-2 18 3-6 3-12 3-18-3z" fill="#2b2a33"/>
<g fill="#9a95a0"><circle cx="56" cy="42" r="1.2"/><circle cx="62" cy="38" r="1"/><circle cx="52" cy="48" r="1"/><circle cx="66" cy="46" r="1.1"/></g>
<g class="nebu-leg-a"><rect x="30" y="46" width="7" height="18" rx="3.5" fill="#fbfaf7" stroke="#2c2138"/><rect x="66" y="46" width="7" height="18" rx="3.5" fill="#fbfaf7" stroke="#2c2138"/></g>
<path d="M66 28q8 8 16 6" stroke="#1aa3b8" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M68 20c-4-8-3-17 2-19 5-1 10 7 12 17z" fill="#2b2a33"/><path d="M70.5 17c-2.5-6-2-11 1-12.5 3-.5 6 4.5 7.5 11z" fill="#f2a5b0"/>
<circle cx="80" cy="28" r="15" fill="#2b2a33"/>
<ellipse cx="91" cy="33" rx="8" ry="7" fill="#3d3842"/><g fill="#c4bec8"><circle cx="89" cy="36" r=".8"/><circle cx="93" cy="35" r=".8"/><circle cx="91" cy="38" r=".7"/></g>
<ellipse cx="96" cy="29" rx="3.5" ry="2.6" fill="#0d0b10"/>
<circle cx="83" cy="23" r="3.4" fill="#3a1a08"/><circle cx="83.2" cy="23" r="2.6" fill="#7a3b14"/><circle cx="83.4" cy="22.2" r=".8" fill="#fff"/>
<g transform="translate(70 22) rotate(-10)"><path d="M0 0-6-4v8zM0 0l6-4v8z" fill="#ff7aa8"/><circle r="2" fill="#ff9cc0"/></g>
${duck?`<g transform="translate(88 34)">${duckShape()}</g>`:''}
</svg>`;
}
function duckShape(){return '<ellipse cx="8" cy="12" rx="9" ry="6.5" fill="#ffd23f" stroke="#c99a00"/><circle cx="13" cy="4" r="5" fill="#ffd23f" stroke="#c99a00"/><path d="M17 4l5 1.5-5 1.5z" fill="#ff8a00"/><circle cx="14" cy="3" r=".9" fill="#2c2138"/>';}
export function duckToy(){return `<svg class="nebu-duck-svg" width="30" height="24" viewBox="-1 -2 25 22" aria-hidden="true" focusable="false">${duckShape()}</svg>`;}
export function catSprite({stick=false}={}){
 return `<svg class="nebu-cat-svg" width="${stick?124:80}" height="60" viewBox="0 0 ${stick?124:80} 60" aria-hidden="true" focusable="false">
<path d="M10 30C2 26 2 12 8 8" stroke="#d98a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
<g class="nebu-leg-b"><rect x="18" y="38" width="5" height="16" rx="2.5" fill="#d98a3a"/><rect x="46" y="38" width="5" height="16" rx="2.5" fill="#d98a3a"/></g>
<ellipse cx="34" cy="34" rx="24" ry="11" fill="#e8a25a"/>
<path d="M24 25v18M32 23v22M40 24v19" stroke="#c46f25" stroke-width="2.5"/>
<g class="nebu-leg-a"><rect x="24" y="38" width="5" height="16" rx="2.5" fill="#e8a25a"/><rect x="52" y="38" width="5" height="16" rx="2.5" fill="#e8a25a"/></g>
<circle cx="60" cy="24" r="11" fill="#e8a25a"/><path d="M52 17l1-10 7 7zM62 14l6-7 2 10z" fill="#e8a25a"/>
<circle cx="64" cy="22" r="2" fill="#2c2138"/><path d="M70 26l1 1-2 1z" fill="#c94a7a"/><path d="M69 28l8-1M69 29l8 2" stroke="#2c2138" stroke-width=".6"/>
${stick?'<g class="nebu-stick"><path d="M60 34 120 22" stroke="#8b5a2b" stroke-width="3" stroke-linecap="round"/><path d="M96 27l6-8M108 24.5l5 4" stroke="#8b5a2b" stroke-width="1.8" stroke-linecap="round"/><circle cx="105" cy="18" r="2.6" fill="#6aa84f"/><circle cx="61" cy="34" r="4" fill="#e8a25a" stroke="#c46f25"/></g>':''}
</svg>`;
}
export function playToy(kind='ball'){
 return kind==='chicken'
  ?`<svg class="nebu-toy-svg" width="40" height="34" viewBox="0 0 40 34" aria-hidden="true" focusable="false"><ellipse cx="18" cy="22" rx="14" ry="9" fill="#ffd23f" stroke="#c99a00"/><path d="M4 20l-4-4 6 1z" fill="#ffd23f" stroke="#c99a00"/><circle cx="30" cy="11" r="7" fill="#ffd23f" stroke="#c99a00"/><path d="M27 4l2-4 2 3 2-3 1 5z" fill="#e2412b"/><path d="M36 11l4 2-4 2z" fill="#ff8a00"/><circle cx="32" cy="9.5" r="1" fill="#2c2138"/><path d="M14 30v4M22 30v4" stroke="#ff8a00" stroke-width="2"/></svg>`
  :`<svg class="nebu-toy-svg" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="14" fill="#cfe23a" stroke="#8fa012"/><path d="M5 7c7 4 7 14 0 18M27 7c-7 4-7 14 0 18" fill="none" stroke="#fff" stroke-width="2.2"/></svg>`;
}
