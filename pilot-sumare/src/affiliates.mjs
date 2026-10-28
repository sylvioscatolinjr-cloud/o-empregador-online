// Regra de 28/10/2026: candidatos recebem R$ 200 a cada 200 pagamentos trimestrais válidos; empresas e
// instituições, equipamento de até R$ 4.000 a cada 1.000. Pagamentos contam 30 dias após a confirmação.
export const affiliateGoal=role=>role==='learner'?200:1000;
// Resgates sem a coluna goal são da regra anterior (1.000).
export function affiliateProgress(claims=[],role){const used=claims.reduce((sum,c)=>sum+(Number(c.goal)||1000),0);return {used,nextGoal:used+affiliateGoal(role)};}
const ok=r=>{if(r.error)throw Error('Não foi possível conferir a indicação ou o resgate. Atualize a página e confira sua situação antes de repetir.');return r.data;};
export async function affiliateAction({req,res,db,user,member,env}){
 const action=req.method==='GET'?req.query?.action:req.body?.action;if(!['affiliates','affiliate-claim'].includes(action))return false;
 if(member.is_fictitious||!['learner','recruiter','school_staff'].includes(member.role))return res.status(403).json({error:'Programa disponível para candidatos, empresas e instituições.'}),true;
 const args={p_user:user.id,p_cohort:env.PILOT_COHORT_ID};
 if(action==='affiliate-claim'){
  if(req.method!=='POST'||req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site'||!req.headers['content-type']?.startsWith('application/json'))return res.status(403).json({error:'Solicitação inválida.'}),true;
  if(!Number.isInteger(req.body?.milestone)||req.body.milestone<1)return res.status(400).json({error:'Marco inválido.'}),true;
  try{const id=ok(await db.rpc('portal_affiliate_claim',{...args,p_email:user.email,p_milestone:req.body.milestone}));res.status(200).json({id,message:'Solicitação recebida. Nossa equipe entrará em contato para combinar o recebimento. Nenhum Pix foi enviado automaticamente.'});}catch(e){res.status(409).json({error:e.message});}return true;
 }
 ok(await db.from('portal_affiliates').upsert({user_id:user.id,cohort_id:env.PILOT_COHORT_ID},{onConflict:'user_id',ignoreDuplicates:true}));
 const affiliate=ok(await db.from('portal_affiliates').select('code').eq('user_id',user.id).single()),valid=Number(ok(await db.rpc('portal_affiliate_count',args))),claims=ok(await db.from('portal_affiliate_claims').select('*').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).order('created_at',{ascending:false}));
 let pending=0;try{pending=Number(ok(await db.rpc('portal_affiliate_payments',{...args,p_matured:false})));}catch{}
 const {nextGoal}=affiliateProgress(claims,member.role);
 res.status(200).json({code:affiliate.code,url:env.APP_ORIGIN+'/conta.html?cadastro=1&ref='+affiliate.code,valid,pending,nextGoal,canClaim:valid>=nextGoal,claims:claims.map(({id,milestone,status,created_at,prize_cents})=>({id,milestone,status,created_at,prize_cents})),role:member.role});return true;
}
