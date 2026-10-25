// Aggregate business indicators for the owner panel. Reads only counts and amounts; never returns
// user identifiers, e-mails, documents or AI content.
const LIMIT=10000,CHUNK=200;
const inPeriod=(value,start,end)=>{const t=Date.parse(value);return Number.isFinite(t)&&t>=Date.parse(start)&&t<Date.parse(end);};
const profiles=['Candidato','Empresa','Instituição de Ensino'];

export function businessMetrics({orders=[],payments=[],topupOrders=[],topupPayments=[],usage=[],lines=[],images=[],start,end}){
 const active=orders.filter(o=>o.status==='active');
 const byProfile=Object.fromEntries(profiles.map(p=>[p,{1:0,2:0,3:0,4:0,total:0}]));
 for(const o of active){const row=byProfile[o.profile_type];if(!row)continue;row[o.tier]=(row[o.tier]||0)+1;row.total++;}
 const mrrCents=Math.round(active.reduce((sum,o)=>sum+o.cents/(o.months||1),0));
 const paid=payments.filter(p=>p.eligible&&inPeriod(p.checked_at,start,end));
 const paidTopups=topupPayments.filter(p=>p.eligible&&inPeriod(p.checked_at,start,end));
 const subscriptionCents=paid.reduce((s,p)=>s+p.cents,0),topupCents=paidTopups.reduce((s,p)=>s+p.cents,0);
 const charged=new Set(usage.filter(u=>!u.refunded_at).map(u=>u.request_id));
 const aiSpentCents=lines.filter(l=>charged.has(l.request_id)).reduce((s,l)=>s+l.cents,0);
 const realImages=images.filter(i=>!i.owner_testing&&i.status==='completed');
 return {
  subscribers:{active:active.length,byProfile,mrrCents},
  revenue:{subscriptionCents,topupCents,totalCents:subscriptionCents+topupCents,subscriptionPayments:paid.length,topupPayments:paidTopups.length},
  newSubscriptions:orders.filter(o=>inPeriod(o.created_at,start,end)&&['active','canceled','expired'].includes(o.status)).length,
  cancellations:orders.filter(o=>inPeriod(o.canceled_at||o.cancel_requested_at,start,end)).length,
  ai:{runs:charged.size,refunded:usage.length-charged.size,spentCents:aiSpentCents,images:realImages.length,imageCents:realImages.reduce((s,i)=>s+i.cents,0)},
  truncated:[orders,payments,topupOrders,topupPayments,usage,images].some(rows=>rows.length>=LIMIT)
 };
}

async function rows(query){const r=await query.limit(LIMIT);if(r.error)throw Error();return r.data||[];}
async function byIds(db,table,columns,key,ids){
 const out=[];for(let i=0;i<ids.length;i+=CHUNK){const r=await db.from(table).select(columns).in(key,ids.slice(i,i+CHUNK));if(r.error)throw Error();out.push(...(r.data||[]));}return out;
}

export async function loadBusinessMetrics(db,cohort,period){
 const [orders,topupOrders,usage,images]=await Promise.all([
  rows(db.from('billing_live_orders').select('id,profile_type,tier,cents,months,status,created_at,canceled_at,cancel_requested_at').eq('cohort_id',cohort)),
  rows(db.from('portal_ai_topup_orders').select('id,cents,status,created_at').eq('cohort_id',cohort)),
  rows(db.from('portal_ai_wallet_usage').select('request_id,created_at,refunded_at').eq('cohort_id',cohort).gte('created_at',period.start).lt('created_at',period.end)),
  rows(db.from('portal_ai_image_jobs').select('status,cents,owner_testing,created_at').eq('cohort_id',cohort).gte('created_at',period.start).lt('created_at',period.end))
 ]);
 const [payments,topupPayments,lines]=await Promise.all([
  byIds(db,'billing_live_payments','order_id,cents,eligible,checked_at','order_id',orders.map(o=>o.id)),
  byIds(db,'portal_ai_topup_payments','order_id,cents,eligible,checked_at','order_id',topupOrders.map(o=>o.id)),
  byIds(db,'portal_ai_wallet_lines','request_id,cents','request_id',usage.map(u=>u.request_id))
 ]);
 return businessMetrics({orders,payments,topupOrders,topupPayments,usage,lines,images,start:period.start,end:period.end});
}
