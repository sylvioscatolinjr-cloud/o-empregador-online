// Regenerates the small public assets derived from the approved logo:
// app/og-image.png (1200x630 link preview for WhatsApp/LinkedIn), app/favicon.ico (32 px)
// and app/logo-header.webp (300 px wide, used at 120-150 px in the internal page headers).
// Run once after changing the logo or the launch tagline: node scripts/share-assets.mjs
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {writeFile} from 'node:fs/promises';
const logo=await loadImage('app/logo-web.webp'),icon=await loadImage('app/icon-192.png');
const purple='#543878',turquoise='#02b7ca';

const og=createCanvas(1200,630),g=og.getContext('2d');
g.fillStyle='#ffffff';g.fillRect(0,0,1200,630);
g.fillStyle=purple;g.fillRect(0,590,1200,40);g.fillStyle=turquoise;g.fillRect(0,580,1200,10);
const lw=520,lh=lw*logo.height/logo.width;g.drawImage(logo,40,(580-lh)/2,lw,lh);
g.textBaseline='alphabetic';g.fillStyle=purple;g.font='800 52px Inter';
// Mesmo destaque turquesa aprovado no título da home e no flyer.
[[['Sua ',purple],['plataforma',turquoise],[' de',purple]],[['conexão',turquoise],[' e ',purple],['evolução',turquoise]],[['profissional.',purple]]].forEach((parts,i)=>{let x=600;for(const [text,color] of parts){g.fillStyle=color;g.fillText(text,x,200+i*64);x+=g.measureText(text).width;}});
g.font='600 30px Inter';g.fillStyle='#3d3348';
['Vagas, cursos e talentos','no mesmo lugar.'].forEach((line,i)=>g.fillText(line,600,420+i*40));
g.fillStyle=turquoise;g.font='800 30px Inter';g.fillText('Cadastre-se grátis →',600,525);
await writeFile('app/og-image.png',og.toBuffer('image/png'));

const fav=createCanvas(32,32);fav.getContext('2d').drawImage(icon,0,0,32,32);
const png=fav.toBuffer('image/png'),header=Buffer.alloc(22);
header.writeUInt16LE(0,0);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);
header.writeUInt8(32,6);header.writeUInt8(32,7);header.writeUInt8(0,8);header.writeUInt8(0,9);
header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
await writeFile('app/favicon.ico',Buffer.concat([header,png]));

const small=createCanvas(300,Math.round(300*logo.height/logo.width));small.getContext('2d').drawImage(logo,0,0,small.width,small.height);
await writeFile('app/logo-header.webp',small.toBuffer('image/webp',90));
console.log('og-image.png, favicon.ico e logo-header.webp gerados.',small.width+'x'+small.height);
