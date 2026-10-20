/* Rebuild reading order from geometry, never PDF object/font order. */
const median=values=>{const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);return sorted[Math.floor(sorted.length/2)]||10;};
function rowsOf(items){
 const rows=[];
 for(const item of [...items].sort((a,b)=>a.y-b.y||a.x-b.x)){
  let row=rows.at(-1);const tolerance=Math.min(3,Math.max(1.5,item.height*.3));
  if(!row||Math.abs(row.y-item.y)>tolerance){row={y:item.y,items:[]};rows.push(row);}
  row.items.push(item);
 }
 return rows;
}
function spansOf(items){
 const spans=[];
 for(const row of rowsOf(items)){
  let span;for(const item of row.items.sort((a,b)=>a.x-b.x)){
   const gap=span?item.x-span.right:Infinity;
   if(!span||gap>Math.max(14,item.height*2)){
    span={x:item.x,y:row.y,right:item.x+item.width,height:item.height,text:item.text};spans.push(span);
   }else{
    const space=gap>Math.max(.7,item.height*.1)&&!span.text.endsWith(' ')&&!item.text.startsWith(' ')?' ':'';
    span.text+=space+item.text;span.right=Math.max(span.right,item.x+item.width);span.height=Math.max(span.height,item.height);
   }
  }
 }
 return spans;
}
function columnAnchor(spans,width){
 const clusters=[];
 for(const span of spans){let c=clusters.find(c=>Math.abs(c.x-span.x)<9);if(!c){c={x:span.x,rows:new Set(),count:0};clusters.push(c);}c.rows.add(Math.round(span.y/4));c.count++;}
 const minX=Math.min(...spans.map(s=>s.x)),minimum=Math.max(3,Math.floor(spans.length*.07));let best=null;
 for(const cluster of clusters){const anchor=cluster.x,split=anchor-6;if(anchor<width*.3||anchor>width*.86||anchor-minX<width*.25||cluster.rows.size<minimum)continue;
  const left=spans.filter(s=>s.x<split&&s.right<=anchor+6),right=spans.filter(s=>s.x>=split),cross=spans.filter(s=>s.x<split&&s.right>anchor+6);
  if(left.length<minimum||right.length<minimum||cross.length>Math.max(2,spans.length*.12))continue;
  // An indented list in one column has many lines crossing its indentation; reject it.
  const score=cluster.rows.size+Math.min(left.length,right.length)-cross.length*5;
  if(!best||score>best.score)best={anchor,split,score};
 }
 return best;
}
function blockOf(spans,column,page){
 const lines=spans.sort((a,b)=>a.y-b.y||a.x-b.x).map(s=>({...s,text:s.text.replace(/[ \t]+/g,' ').trim()}));
 let text='',previous=null;const lineHeight=median(lines.map(l=>l.height));
 for(const line of lines){
  if(previous){const wrapped=line.y-previous.y<=lineHeight*1.9&&/\b(?:de|do|da|dos|das|em|no|na|nos|nas|com|para|por|ao|aos|e|the|and|of)$/i.test(previous.text)&&/^[a-zà-ú]/.test(line.text);text+=wrapped?' ':line.y-previous.y>lineHeight*1.9?'\n\n':'\n';}
  text+=line.text;previous=line;
 }
 return {text,column,page,lines};
}
export function orderPositionedText(items,width,page=1){
 const spans=spansOf(items.filter(i=>i.text?.trim()&&Number.isFinite(i.x)&&Number.isFinite(i.y))),anchor=columnAnchor(spans,width);
 if(!spans.length)return {text:'',blocks:[],columns:1};
 if(!anchor){const block=blockOf(spans,0,page);return {text:block.text,blocks:[block],columns:1};}
 const full=spans.filter(s=>s.x<anchor.split&&s.right>anchor.anchor+6).sort((a,b)=>a.y-b.y),blocks=[];let top=-Infinity;
 function addBand(bottom){const band=spans.filter(s=>s.y>top&&s.y<bottom&&!full.includes(s));for(const column of [0,1]){const part=band.filter(s=>Number(s.x>=anchor.split)===column);if(part.length)blocks.push(blockOf(part,column,page));}}
 for(const span of full){addBand(span.y-1);blocks.push(blockOf([span],'full',page));top=span.y+1;}
 addBand(Infinity);
 return {text:blocks.map(b=>b.text).join('\n\n'),blocks,columns:2};
}
export function orderPdfText(items,viewport,page=1){
 const m=viewport.transform||[1,0,0,-1,0,viewport.height];
 return orderPositionedText(items.filter(i=>i.str?.trim()).map(i=>({text:i.str,x:m[0]*i.transform[4]+m[2]*i.transform[5]+m[4],y:m[1]*i.transform[4]+m[3]*i.transform[5]+m[5],width:i.width,height:Math.abs(i.height||i.transform[3]||10)})),viewport.width,page);
}
export function orderOcrText(data,width,page=1){
 const words=(data.blocks||[]).flatMap(b=>b.paragraphs||[]).flatMap(p=>p.lines||[]).flatMap(line=>(line.words||[]).map(w=>({text:w.text,x:w.bbox.x0,y:line.baseline?.y0??line.bbox.y1,width:w.bbox.x1-w.bbox.x0,height:w.bbox.y1-w.bbox.y0})));
 return words.length?orderPositionedText(words,width,page):{text:data.text,blocks:[],columns:1};
}
