import {subscriberBenefits} from './subscriber-benefits.mjs';
const prices=Object.freeze({Candidato:[0,1990,4990,9990],Empresa:[0,9900,59900,299000],'Instituição de Ensino':[0,9900,59900,299000]});
export const cycles=Object.freeze({MONTHLY:{months:1,discount:0,label:'Mensal'},QUARTERLY:{months:3,discount:10,label:'Trimestral'},SEMIANNUALLY:{months:6,discount:20,label:'Semestral'},YEARLY:{months:12,discount:30,label:'Anual'}});
export function monthlyPlan(profileType,tier){if(!Object.hasOwn(prices,profileType)||!Number.isInteger(tier)||tier<0||tier>3)throw Error('Plano inválido.');return Object.freeze({profileType,tier,cents:prices[profileType][tier],cycle:'MONTHLY'});}
export function quotePlan(profileType,tier,cycle='MONTHLY'){
 const plan=monthlyPlan(profileType,tier);if(!Object.hasOwn(cycles,cycle))throw Error('Periodicidade inválida.');const c=cycles[cycle],subtotal=plan.cents*c.months,total=Math.round(subtotal*(100-c.discount)/100);
 const benefits=subscriberBenefits(tier), aiCreditCents=Math.round(total*benefits.aiPercent/100);
 return {...plan,cycle,months:c.months,discount:c.discount,subtotal,cents:total,savings:subtotal-total,label:c.label,benefits,aiCreditCents,aiUseCents:100,aiUses:Math.floor(aiCreditCents/100),aiRemainderCents:aiCreditCents%100};
}
export function nextCycleDate(date,months){const d=new Date(date+'T12:00:00Z'),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);}
