// Nebu: bulldog francês fêmea no visual da Nebu da Super Maker (imagem enviada pelo titular em 29/10/2026).
// Desenho simples, sentada: cabeça preta, orelhas rosadas por dentro com lacinho, olhos castanhos,
// coleira azul-turquesa com medalhinha dourada, corpo branco e mancha preta no lado.
const INK='#2b2a33',PINK='#f2a5b0',TEAL='#1aa3b8';
export function nebuAvatar({size=64,title='Nebu, assistente do portal',mood='happy'}={}){
 const id='nebu-'+Math.random().toString(36).slice(2,8);
 const mouth=mood==='thinking'||mood==='sleep'?'<path d="M60 67q5 2 10 0" fill="none" stroke="#0d0b10" stroke-width="1.6" stroke-linecap="round"/>':'<path d="M59 65q3 3 6 0q3 3 6 0" fill="none" stroke="#0d0b10" stroke-width="1.6" stroke-linecap="round"/><path d="M62.5 67q2.5 6 5 0z" fill="#e8798f"/>';
 const eyes=mood==='sleep'?'<path d="M45 51q6 4 12 0M73 51q6 4 12 0" fill="none" stroke="#c4bec8" stroke-width="2.2" stroke-linecap="round"/>':`<g class="nebu-eyes"><circle cx="51" cy="50" r="7.2" fill="#3a1a08"/><circle cx="51" cy="50" r="6" fill="#7a3b14"/><circle cx="51" cy="50" r="3.2" fill="#1a0c04"/><circle cx="49" cy="47.5" r="2.2" fill="#fff"/><circle cx="53.2" cy="52" r="1" fill="#fff"/>
<circle cx="79" cy="50" r="7.2" fill="#3a1a08"/><circle cx="79" cy="50" r="6" fill="#7a3b14"/><circle cx="79" cy="50" r="3.2" fill="#1a0c04"/><circle cx="77" cy="47.5" r="2.2" fill="#fff"/><circle cx="81.2" cy="52" r="1" fill="#fff"/></g>`;
 return `<svg class="nebu-avatar" width="${Number(size)}" height="${Number(size)}" viewBox="18 0 94 128" role="img" aria-labelledby="${id}"><title id="${id}">${title}</title>
<ellipse cx="65" cy="125" rx="32" ry="3.5" fill="#000" opacity=".1"/>
<path d="M38 123C30 101 34 81 50 75h30c16 6 20 26 12 48z" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
<path d="M84 88c11 6 13 24 8 35H82c4-12 4-24 2-35z" fill="${INK}"/>
<g fill="#b9b6c0"><circle cx="46" cy="90" r="1.2"/><circle cx="50" cy="97" r="1"/><circle cx="44" cy="104" r="1.1"/><circle cx="78" cy="94" r="1"/></g>
<g fill="#fff" stroke="${INK}" stroke-width="1.8"><rect x="52" y="93" width="11" height="30" rx="5"/><rect x="67" y="93" width="11" height="30" rx="5"/></g>
<path d="M55.5 118v5M59.5 118v5M70.5 118v5M74.5 118v5" stroke="${INK}" stroke-width="1.2"/>
<g class="nebu-ear-l"><path d="M40 40 33 7c-1-4 3-6 6-3l18 27z" fill="${INK}"/><path d="M42 34 37.5 13 51 30z" fill="${PINK}"/></g>
<g class="nebu-ear-r"><path d="M90 40l7-33c1-4-3-6-6-3L73 31z" fill="${INK}"/><path d="M88 34l4.5-21L79 30z" fill="${PINK}"/></g>
<path d="M65 26c23 0 34 12 34 28 0 16-12 24-34 24S31 70 31 54c0-16 11-28 34-28z" fill="${INK}"/>
<path d="M44 76q21 10 42 0" fill="none" stroke="${TEAL}" stroke-width="6" stroke-linecap="round"/>
<circle cx="65" cy="84" r="5" fill="#f2c230" stroke="#b8860b" stroke-width="1"/><path d="M63 86v-4l4 4v-4" fill="none" stroke="#8a6410" stroke-width=".9"/>
<ellipse cx="65" cy="63" rx="15" ry="10" fill="#393843"/>
<g fill="#9e9aa6"><circle cx="54" cy="64" r=".9"/><circle cx="56" cy="68" r=".8"/><circle cx="76" cy="64" r=".9"/><circle cx="74" cy="68" r=".8"/><circle cx="58" cy="60" r=".7"/><circle cx="72" cy="60" r=".7"/></g>
<ellipse cx="42" cy="62" rx="4.5" ry="2.6" fill="#e9768a" opacity=".75"/><ellipse cx="88" cy="62" rx="4.5" ry="2.6" fill="#e9768a" opacity=".75"/>
<path d="M60 58.5q5-3.5 10 0q0 4-5 5q-5-1-5-5z" fill="#0d0b10"/><ellipse cx="63" cy="58.6" rx="1.6" ry=".8" fill="#6d6872"/>
<path d="M65 63.5v2" stroke="#0d0b10" stroke-width="1.4"/>
${mouth}
${eyes}
<g transform="translate(88 31) rotate(18)"><path d="M0 0-8-4.5v9zM0 0l8-4.5v9z" fill="#ff7aa8" stroke="#c94a7a" stroke-width=".9"/><circle r="2.6" fill="#ff9cc0" stroke="#c94a7a" stroke-width=".9"/></g>
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
<path d="M70 20c-2-8 0-16 4-18 4 0 6 8 6 16z" fill="#2b2a33"/><path d="M72 18c-1-6 0-11 2-12 2 1 4 6 4 11z" fill="#f2a5b0"/>
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
