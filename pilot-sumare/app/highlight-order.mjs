// Interleave only demonstration records, retaining real records and featured tiers.
export function alternateDemoCards(rows){
 const groups=new Map();
 for(const row of rows){if(!row.is_fictitious)continue;const key=row.presentation_group??Boolean(row.is_featured);if(!groups.has(key))groups.set(key,{withImage:[],withoutImage:[],ordered:[],cursor:0});const g=groups.get(key);(row.logo_data||(row.show_card_image&&row.photo_data)?g.withImage:g.withoutImage).push(row);}
 for(const g of groups.values())for(let i=0;i<Math.max(g.withImage.length,g.withoutImage.length);i++){if(g.withImage[i])g.ordered.push(g.withImage[i]);if(g.withoutImage[i])g.ordered.push(g.withoutImage[i]);}
 return rows.map(row=>{if(!row.is_fictitious)return row;const g=groups.get(row.presentation_group??Boolean(row.is_featured));return g.ordered[g.cursor++];});
}
