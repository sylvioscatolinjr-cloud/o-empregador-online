// Nebu: bulldog francês fêmea, inspirada nas fotos enviadas pelo titular em 29/10/2026.
// Cabeça preta com focinho grisalho, orelhas eretas, corpo branco com pintinhas cinzas e mancha preta no dorso.
export function nebuAvatar({size=64,title='Nebu, assistente do portal',mood='happy'}={}){
 const id='nebu-'+Math.random().toString(36).slice(2,8);
 const mouth=mood==='thinking'?'<path d="M52 86q8 2 16 0" fill="none" stroke="#0d0b10" stroke-width="2" stroke-linecap="round"/>':'<path d="M50 85q10 6 20 0" fill="none" stroke="#0d0b10" stroke-width="2" stroke-linecap="round"/><path d="M56 87q4 8 8 0z" fill="#e8798f"/>';
 return `<svg class="nebu-avatar" width="${Number(size)}" height="${Number(size)}" viewBox="0 0 120 120" role="img" aria-labelledby="${id}"><title id="${id}">${title}</title>
<path d="M14 120c0-26 20-40 46-40s46 14 46 40z" fill="#fbfaf7" stroke="#2c2138" stroke-width="1.5"/>
<path d="M80 92c12-2 22 6 25 22l1 6H86c-6-8-10-18-6-28z" fill="#1d1a22"/>
<g fill="#9a95a0"><circle cx="34" cy="104" r="1.6"/><circle cx="40" cy="110" r="1.3"/><circle cx="28" cy="112" r="1.4"/><circle cx="46" cy="102" r="1.1"/><circle cx="70" cy="108" r="1.4"/><circle cx="62" cy="114" r="1.2"/><circle cx="36" cy="97" r="1"/></g>
<path d="M30 50C16 34 10 14 20 6c10-7 26 8 32 24z" fill="#1d1a22"/><path d="M31 42C22 30 18 17 23 12c6-4 16 7 21 18z" fill="#5a4648"/>
<path d="M90 50c14-16 20-36 10-44-10-7-26 8-32 24z" fill="#1d1a22"/><path d="M89 42c9-12 13-25 8-30-6-4-16 7-21 18z" fill="#5a4648"/>
<path d="M60 26c26 0 46 14 46 38 0 18-14 30-46 30S14 82 14 64c0-24 20-38 46-38z" fill="#1d1a22"/>
<path d="M30 86q30 13 60 0" fill="none" stroke="#543878" stroke-width="7" stroke-linecap="round"/><circle cx="60" cy="97" r="4.5" fill="#f2c94c" stroke="#8a6d1c" stroke-width="1"/>
<ellipse cx="48" cy="80" rx="15" ry="10" fill="#3d3842"/><ellipse cx="72" cy="80" rx="15" ry="10" fill="#3d3842"/>
<g fill="#c4bec8"><circle cx="40" cy="78" r="1.1"/><circle cx="45" cy="84" r="1"/><circle cx="52" cy="77" r=".9"/><circle cx="80" cy="78" r="1.1"/><circle cx="75" cy="84" r="1"/><circle cx="68" cy="77" r=".9"/><circle cx="37" cy="83" r=".9"/><circle cx="83" cy="83" r=".9"/><circle cx="56" cy="66" r=".8"/><circle cx="64" cy="66" r=".8"/><circle cx="60" cy="63" r=".8"/></g>
<path d="M47 62q13-7 26 0" fill="none" stroke="#3d3842" stroke-width="2" stroke-linecap="round"/>
<path d="M51 72q9-6 18 0q1 6-9 7q-10-1-9-7z" fill="#0d0b10"/><ellipse cx="56" cy="71.5" rx="2.6" ry="1.2" fill="#6d6872"/><circle cx="56.5" cy="75" r="1.2" fill="#3d3842"/><circle cx="63.5" cy="75" r="1.2" fill="#3d3842"/>
<path d="M60 79v4" stroke="#0d0b10" stroke-width="1.6"/>
${mouth}
<g><circle cx="41" cy="58" r="7.5" fill="#f4eee6"/><circle cx="41.5" cy="58.5" r="6" fill="#4a2a17"/><circle cx="41.5" cy="58.5" r="3.4" fill="#0d0b10"/><circle cx="39.5" cy="56" r="1.7" fill="#fff"/></g>
<g><circle cx="79" cy="58" r="7.5" fill="#f4eee6"/><circle cx="78.5" cy="58.5" r="6" fill="#4a2a17"/><circle cx="78.5" cy="58.5" r="3.4" fill="#0d0b10"/><circle cx="76.5" cy="56" r="1.7" fill="#fff"/></g>
<g transform="translate(30 34) rotate(-20)"><path d="M0 0-11-6v12zM0 0l11-6v12z" fill="#ff7aa8" stroke="#c94a7a" stroke-width="1"/><circle r="3.4" fill="#ff9cc0" stroke="#c94a7a" stroke-width="1"/></g>
</svg>`;
}
