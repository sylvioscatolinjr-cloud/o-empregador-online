// Day supplied by Asaas, not the time when OEO rechecks the payment.
export function providerPaidOn(payment){
 for(const value of [payment?.confirmedDate,payment?.paymentDate]){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))continue;
  const date=new Date(value+'T12:00:00Z');if(Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value)return value;
 }
 return null;
}
