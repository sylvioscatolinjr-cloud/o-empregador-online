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
 const affiliate=ok(await db.from('portal_affiliates').select('code').eq('user_id',user.id).single()),valid=Number(ok(await db.rpc('portal_affiliate_count',args))),claims=ok(await db.from('portal_affiliate_claims').select('id,milestone,status,created_at').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).order('created_at',{ascending:false}));
 res.status(200).json({code:affiliate.code,url:env.APP_ORIGIN+'/conta.html?ref='+affiliate.code,valid,nextGoal:(claims.length+1)*1000,canClaim:valid>=(claims.length+1)*1000,claims,role:member.role});return true;
}
