export const CHECKED_ON = '2026-11-12';
const targets = { 25000: 1500, 50000: 3000, 100000: 6000, 150000: 9000 };
const futuresSizes = [25000, 50000, 100000, 150000];
const topstepSizes = [50000, 100000, 150000];
const ftmoSizes = [10000, 25000, 50000, 100000, 200000];
export const firms = [
  { id: 'tradeify', name: 'Tradeify', initials: 'T', market: 'Futures', color: 'blue' },
  { id: 'topstep', name: 'Topstep', initials: 'TS', market: 'Futures', color: 'yellow' },
  { id: 'mffu', name: 'My Funded Futures', initials: 'MF', market: 'Futures', color: 'green' },
  { id: 'ftmo', name: 'FTMO', initials: 'F', market: 'Forex / CFDs', color: 'slate' },
  { id: 'custom', name: 'Custom rule', initials: '+', market: 'Your settings', color: 'purple' }
];

const tradeifyRule = 'https://help.tradeify.co/en/articles/10468320-rules-consistency-rule';
const selectRule = 'https://help.tradeify.co/en/articles/12853921-select-evaluation-accounts';
const topstepRule = 'https://help.topstep.com/en/articles/8284208-consistency-at-topstep';
const mffuRule = 'https://help.myfundedfutures.com/en/articles/11802636-traders-evaluation-simplified';
const ftmoRule = 'https://ftmo.com/en/trading-objectives/';
const growthDayRule = 'https://help.tradeify.co/en/articles/11083796-growth-funded-account-payout-policy';

// A null minimum is deliberately unknown, not a claim that a firm has no rule.
const dayRules = {
  'tradeify-growth': { minimum: 5, winningThresholds: { 25000: 100, 50000: 150, 100000: 200, 150000: 250 }, source: growthDayRule },
  'tradeify-select': { minimum: 3, source: selectRule },
  'tradeify-select-addon': { minimum: 2, source: selectRule },
  'topstep-combine': { minimum: 2, source: topstepRule },
  'topstep-xfa': { minimum: 3, source: topstepRule },
  'mffu-intraday': { minimum: 2, source: mffuRule },
  'mffu-eod': { minimum: 4, source: mffuRule }
};

export function dayRuleFor(plan, size) {
  const rule = dayRules[plan.id];
  return { firmMinimum: rule?.minimum ?? null, winningThreshold: rule?.winningThresholds?.[size] === undefined ? null : Math.round(rule.winningThresholds[size] * 100), source: rule?.source || null };
}

export const plans = [
  { id: 'tradeify-growth', firm: 'tradeify', name: 'Growth · Sim funded', short: 'Growth', stage: 'Sim funded', rule: 3500, sizes: futuresSizes, basis: 'net', source: tradeifyRule,
    note: 'Use the P&L used by Tradeify for consistency; its guidance excludes commissions from this calculation. Start a new window after an approved payout. Other payout requirements still apply.' },
  { id: 'tradeify-select', firm: 'tradeify', name: 'Select · Evaluation', short: 'Select', stage: 'Evaluation', rule: 4000, sizes: futuresSizes, targets, basis: 'net', source: selectRule,
    note: 'Standard 40% option. Older 50K accounts can retain a $2,500 target; use a custom rule for those accounts. Use Tradeify’s consistency P&L basis, which excludes commissions.' },
  { id: 'tradeify-select-addon', firm: 'tradeify', name: 'Select · 50% add-on evaluation', short: 'Select + add-on', stage: 'Evaluation', rule: 5000, sizes: futuresSizes, targets, basis: 'net', source: selectRule,
    note: 'Only for accounts purchased with the 50% add-on. Older account targets may differ. Use Tradeify’s consistency P&L basis, which excludes commissions.' },
  { id: 'tradeify-lightning-1', firm: 'tradeify', name: 'Lightning · First payout', short: 'Lightning · payout 1', stage: 'Sim funded', rule: 2000, sizes: futuresSizes, basis: 'net', source: tradeifyRule,
    note: 'For accounts purchased after 12 Sep 2025, 8 AM ET. Use Tradeify’s commission-excluded consistency P&L. Older accounts keep 20% for every payout.' },
  { id: 'tradeify-lightning-2', firm: 'tradeify', name: 'Lightning · Second payout', short: 'Lightning · payout 2', stage: 'Sim funded', rule: 2500, sizes: futuresSizes, basis: 'net', source: tradeifyRule,
    note: 'For accounts purchased after 12 Sep 2025, 8 AM ET. Older accounts stay at 20%. Use Tradeify’s commission-excluded consistency P&L.' },
  { id: 'tradeify-lightning-3', firm: 'tradeify', name: 'Lightning · Third payout onward', short: 'Lightning · payout 3+', stage: 'Sim funded', rule: 3000, sizes: futuresSizes, basis: 'net', source: tradeifyRule,
    note: 'For accounts purchased after 12 Sep 2025, 8 AM ET. Older accounts stay at 20%. Use Tradeify’s commission-excluded consistency P&L.' },
  { id: 'topstep-combine', firm: 'topstep', name: 'Trading Combine · Evaluation', short: 'Trading Combine', stage: 'Evaluation', rule: 5500, sizes: topstepSizes, targets, basis: 'net', source: topstepRule,
    note: 'The current threshold is 55%, with no rounding buffer. Best-day profit is retained after losses. Additional profit must come from a later trading day if today set the best day.' },
  { id: 'topstep-xfa', firm: 'topstep', name: 'Express Funded · Consistency path', short: 'XFA · Consistency', stage: 'Express funded', rule: 4000, sizes: topstepSizes, basis: 'net', source: topstepRule,
    note: 'Use net profit from the current window. A new window starts the trading day after a payout request; carried balances are excluded. At least three trading days are also required.' },
  { id: 'mffu-intraday', firm: 'mffu', name: 'Rapid Intraday · Evaluation', short: 'Rapid Intraday', stage: 'Evaluation', rule: 5000, sizes: futuresSizes, targets, basis: 'net', source: mffuRule,
    note: '50% applies during evaluation. The Rapid Intraday sim-funded stage has no consistency rule. Use your firm-reported daily P&L for this evaluation.' },
  { id: 'mffu-eod', firm: 'mffu', name: 'Rapid EOD · Evaluation', short: 'Rapid EOD', stage: 'Evaluation', rule: 3000, sizes: [25000, 50000], targets, basis: 'net', source: mffuRule,
    note: '30% applies during evaluation, with at least four trading days. Rapid EOD is a different plan from Rapid Intraday. Use your firm-reported daily P&L.' },
  { id: 'mffu-funded', firm: 'mffu', name: 'Rapid Intraday · Sim funded', short: 'Rapid Intraday', stage: 'Sim funded', rule: null, sizes: futuresSizes, basis: 'net', source: 'https://help.myfundedfutures.com/en/articles/13134709-rapid-plan-50k-a-comprehensive-look',
    note: 'No consistency requirement at this stage. Buffer, minimum payout, drawdown, and other plan requirements still apply. No payout eligibility is calculated here.' },
  { id: 'ftmo-current', firm: 'ftmo', name: '1-Step · Current evaluation', short: '1-Step · Current', stage: 'Evaluation', rule: 5000, sizes: ftmoSizes, targets: Object.fromEntries(ftmoSizes.map(n => [n, n * .1])), basis: 'net', source: ftmoRule,
    note: 'For new orders on or after 12 Oct 2026, and accounts merged on or after that date. Uses total closed P&L including losing days. Check Account MetriX for your applicable rule.' },
  { id: 'ftmo-legacy', firm: 'ftmo', name: '1-Step · Legacy Best Day evaluation', short: '1-Step · Legacy', stage: 'Evaluation', rule: 5000, sizes: ftmoSizes, targets: Object.fromEntries(ftmoSizes.map(n => [n, n * .1])), basis: 'positive', source: ftmoRule,
    note: 'For qualifying orders before 12 Oct 2026 that retain the legacy rule. Consistency uses only profitable days; the 10% evaluation target still uses net profit. Check Account MetriX.' },
  { id: 'custom', firm: 'custom', name: 'Your own consistency rule', short: 'Custom', stage: 'Custom', rule: 3000, sizes: futuresSizes, basis: 'net', source: null,
    note: 'Enter the best-day percentage in your account agreement. This calculator supports best-day percentage rules. It does not model lot-size, risk, or other consistency definitions.' }
];

export function planById(id) { return plans.find(p => p.id === id) || plans[0]; }
export function targetFor(plan, size) { return Math.round((plan.targets?.[size] || 0) * 100); }
export function exampleFor(plan, size) {
  const goal = targetFor(plan, size) || Math.round(size * .06 * 100);
  // Synthetic journal scaled to an illustrative goal; the largest day is 50%.
  const best = Math.round(goal * .5);
  return { total: goal, best, target: targetFor(plan, size), ruleBps: plan.rule };
}
