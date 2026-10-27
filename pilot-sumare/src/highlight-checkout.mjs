import {liveId} from './billing-live.mjs';
import {providerPaidOn} from './payment-date.mjs';
import {HIGHLIGHT_TERMS, quoteHighlight} from './highlight-pricing.mjs';

// The stored quote is checked against the price book before requesting checkout.
export function highlightCheckoutBody(order, origin, methods) {
  const quote = quoteHighlight({role: order.role, kind: order.kind, days: order.days, verifiedTier: order.tier});
  if (order.terms_version !== HIGHLIGHT_TERMS || order.cents !== quote.cents ||
      typeof order.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(order.id)) throw Error('Pedido de destaque inválido.');
  const u = new URL(origin);
  if (u.origin !== origin || u.protocol !== 'https:') throw Error('Origem inválida.');
  if (!Array.isArray(methods) || !methods.includes('CREDIT_CARD') || methods.some(x => !['CREDIT_CARD', 'PIX'].includes(x))) throw Error('Meio de pagamento inválido.');
  const type = {candidate: 'currículo', job: 'vaga', course: 'curso', training: 'treinamento'}[order.kind];
  return {billingTypes: methods, chargeTypes: ['DETACHED'], minutesToExpire: 60,
    externalReference: order.id,
    callback: {successUrl: origin + '/destaques.html?retorno=sucesso', cancelUrl: origin + '/destaques.html?retorno=cancelado', expiredUrl: origin + '/destaques.html?retorno=expirado'},
    items: [{name: 'Destaque OEO', description: `Destaque de ${type} por ${order.days} dias, sem renovação automática.`, quantity: 1, value: quote.cents / 100}]};
}

export function highlightPayment(payment, order, checkedAt = new Date().toISOString()) {
  liveId(payment?.id, 'pay_');
  if (!order.checkout_id || payment.checkoutSession !== order.checkout_id || payment.subscription || payment.installment) throw Error('Pagamento incompatível com o destaque.');
  const value = Number(payment.value), cents = Math.round(value * 100);
  if (!Number.isFinite(value) || !Number.isSafeInteger(cents) || Math.abs(value * 100 - cents) > 0.00001 || cents !== order.cents) throw Error('Valor de destaque incompatível.');
  const refunded = Array.isArray(payment.refunds) && payment.refunds.some(r => !['CANCELLED', 'REFUSED', 'DENIED'].includes(r.status));
  return {id: payment.id, checkout_id: order.checkout_id, cents, status: String(payment.status).slice(0, 80),
    eligible: ['CONFIRMED', 'RECEIVED'].includes(payment.status) && !payment.deleted && !payment.chargeback && !refunded,
    provider_paid_on: providerPaidOn(payment), checked_at: checkedAt};
}
