// Regenerates app/logo-web.webp from the approved app/logo.png.
// Applies the same white-to-alpha rule the old SVG filter used (alpha = 28 - 10·(r+g+b), sRGB, clamped)
// and resizes to 1024 px wide, enough for the hero on 3x screens.
// Run once after changing logo.png: npm i --no-save sharp && node scripts/logo-web.mjs
import sharp from 'sharp';
const {data,info}=await sharp('app/logo.png').removeAlpha().raw().toBuffer({resolveWithObject:true});
const rgba=Buffer.alloc(info.width*info.height*4);
for(let i=0,j=0;i<data.length;i+=3,j+=4){
 const r=data[i],g=data[i+1],b=data[i+2];
 rgba[j]=r;rgba[j+1]=g;rgba[j+2]=b;
 rgba[j+3]=Math.round(255*Math.min(1,Math.max(0,28-10*(r+g+b)/255)));
}
await sharp(rgba,{raw:{width:info.width,height:info.height,channels:4}}).resize({width:1024}).webp({quality:90,alphaQuality:100,effort:6}).toFile('app/logo-web.webp');
console.log('app/logo-web.webp gerado.');
