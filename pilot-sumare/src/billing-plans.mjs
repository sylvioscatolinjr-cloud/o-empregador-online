import {subscriberBenefits} from './subscriber-benefits.mjs';
export const PLAN_TERMS='2026-10-25-four-tiers-v1';
const legacyPrices=Object.freeze({Candidato:[0,1990,4990,9990],Empresa:[0,9900,59900,299000],'Instituição de Ensino':[0,9900,59900,299000]});
const prices=Object.freeze({Candidato:[0,1990,3990,6990,9990],Empresa:[0,9990,29990,69990,99990],'Instituição de Ensino':[0,9990,29990,69990,99990]});
export const cycles=Object.freeze({MONTHLY:{months:1,discount:0,label:'Mensal'},QUARTERLY:{months:3,discount:10,label:'Trimestral'},SEMIANNUALLY:{months:6,discount:20,label:'Semestral'},YEARLY:{months:12,discount:30,label:'Anual'}});
export function monthlyPlan(profileType,tier,legacy=false){const book=legacy?legacyPrices:prices;if(!Object.hasOwn(book,profileType)||!Number.isInteger(tier)||tier<0||tier>(legacy?3:4))throw Error('Plano inválido.');return Object.freeze({profileType,tier,cents:book[profileType][tier],cycle:'MONTHLY'});}
export function quotePlan(profileType,tier,cycle='MONTHLY',legacy=false){
 const plan=monthlyPlan(profileType,tier,legacy);if(!Object.hasOwn(cycles,cycle))throw Error('Periodicidade inválida.');const c=cycles[cycle],subtotal=plan.cents*c.months,total=Math.round(subtotal*(100-c.discount)/100);
 const benefits=subscriberBenefits(tier), aiCreditCents=Math.round(total*benefits.aiPercent/100);
 return {...plan,cycle,months:c.months,discount:c.discount,subtotal,cents:total,savings:subtotal-total,label:c.label,benefits,aiCreditCents,aiUseCents:100,aiUses:Math.floor(aiCreditCents/100),aiRemainderCents:aiCreditCents%100};
}
export function nextCycleDate(date,months){const d=new Date(date+'T12:00:00Z'),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);}

// Existing contracts retain their original price book. Missing version is supported only
// for older projections; either way the exact amount must match a known server quote.
export function quoteStoredPlan(order){
 const legacy=order.terms_version?order.terms_version!==PLAN_TERMS:order.cents!==quotePlan(order.profile_type,order.tier,order.cycle).cents;
 return quotePlan(order.profile_type,order.tier,order.cycle,legacy);
}
