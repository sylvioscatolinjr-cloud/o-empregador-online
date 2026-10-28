// Prices are in integer cents. A tier supplied by a client is never proof of
// entitlement: callers must obtain the verified current tier on the server.
const BASE_PRICES = Object.freeze({
  learner: Object.freeze({7: 990, 15: 1990, 30: 2990}),
  recruiter: Object.freeze({7: 2990, 15: 5990, 30: 9990}),
  school_staff: Object.freeze({7: 2990, 15: 5990, 30: 9990}),
});
const DISCOUNTS = Object.freeze([0, 10, 15, 20, 25]);
const KINDS = Object.freeze({learner: ['candidate'], recruiter: ['job'], school_staff: ['course', 'training']});

export const HIGHLIGHT_TERMS = '2026-10-26-highlight-v1';
export const HIGHLIGHT_DURATIONS = Object.freeze([7, 15, 30]);

export function quoteHighlight({role, kind, days, verifiedTier}) {
  if (!Object.hasOwn(BASE_PRICES, role) || !KINDS[role].includes(kind) ||
      !Number.isInteger(days) || !HIGHLIGHT_DURATIONS.includes(days) ||
      !Number.isInteger(verifiedTier) || verifiedTier < 0 || verifiedTier >= DISCOUNTS.length) {
    throw new Error('Destaque inválido.');
  }
  const baseCents = BASE_PRICES[role][days];
  const discountPercent = DISCOUNTS[verifiedTier];
  // Round the final price to the nearest cent; a half-cent rounds up.
  const cents = Math.floor((baseCents * (100 - discountPercent) + 50) / 100);
  return Object.freeze({role, kind, days, tier: verifiedTier, discountPercent,
    baseCents, discountCents: baseCents - cents, cents, termsVersion: HIGHLIGHT_TERMS});
}
