export const CHECKED_ON = '2026-11-12';
const targets = { 25000: 1500, 50000: 3000, 100000: 6000, 150000: 9000 };
const futuresSizes = [25000, 50000, 100000, 150000];
const topstepSizes = [50000, 100000, 150000];
const ftmoSizes = [10000, 25000, 50000, 100000, 200000];
export const firms = [
  { id: 'tradeify', name: 'Tradeify', icon: '/assets/firms/tradeify.png', market: 'Futures' },
  { id: 'topstep', name: 'Topstep', icon: '/assets/firms/topstep.png', market: 'Futures' },
  { id: 'mffu', name: 'My Funded Futures', icon: '/assets/firms/mffu.png', market: 'Futures', previewPlan: 'mffu-eod' },
  { id: 'ftmo', name: 'FTMO', icon: '/assets/firms/ftmo.png', market: 'Forex / CFDs' },
  { id: 'apex', name: 'Apex Trader Funding', icon: '/assets/firms/apex.jpg', market: 'Futures' },
  { id: 'tpt', name: 'Take Profit Trader', icon: '/assets/firms/tpt.png', market: 'Futures' },
  { id: 'earn2trade', name: 'Earn2Trade', icon: '/assets/firms/earn2trade.png', market: 'Futures' },
  { id: 'alpha', name: 'Alpha Futures', icon: '/assets/firms/alpha.png', market: 'Futures' },
  { id: 'custom', name: 'Custom rule', market: 'Your settings' }
];

const tradeifyRule = 'https://help.tradeify.co/en/articles/10468320-rules-consistency-rule';
const selectRule = 'https://help.tradeify.co/en/articles/12853921-select-evaluation-accounts';
const topstepRule = 'https://help.topstep.com/en/articles/8284208-consistency-at-topstep';
const mffuRule = 'https://help.myfundedfutures.com/en/articles/11802636-traders-evaluation-simplified';
const ftmoRule = 'https://ftmo.com/en/trading-objectives/';
const growthDayRule = 'https://help.tradeify.co/en/articles/11083796-growth-funded-account-payout-policy';
const apexEodRule = 'https://apextraderfunding.com/help-center/eod-trailing-drawdown-accounts/eod-payouts/';
const apexIntradayRule = 'https://apextraderfunding.com/help-center/uncategorized/intraday-trailing-drawdown-payouts/';
const tptRule = 'https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15170316538013-Rule-5-Be-Consistent';
const earn2tradeRule = 'https://help.earn2trade.com/en/articles/3849975-what-is-the-maintain-consistency-rule';
const alphaRule = 'https://help.alpha-futures.com/en/articles/9492048-consistency-rule';
const alphaTerms = 'https://alpha-futures.com/terms-and-conditions';

// A null minimum is deliberately unknown, not a claim that a firm has no rule.
const dayRules = {
  'tradeify-growth': { minimum: 5, winningThresholds: { 25000: 100, 50000: 150, 100000: 200, 150000: 250 }, source: growthDayRule },
  'tradeify-select': { minimum: 3, source: selectRule },
  'tradeify-select-addon': { minimum: 2, source: selectRule },
  'topstep-combine': { minimum: 2, source: topstepRule },
  'topstep-xfa': { minimum: 3, source: topstepRule },
  'mffu-intraday': { minimum: 2, source: mffuRule },
  'mffu-eod': { minimum: 4, source: mffuRule },
  'apex-eod': { minimum: 5, winningThresholds: { 25000: 100, 50000: 250, 100000: 300, 150000: 350 }, winningInclusive: true, source: apexEodRule },
  'apex-intraday': { minimum: 5, winningThresholds: { 25000: 100, 50000: 200, 100000: 250, 150000: 300 }, winningInclusive: true, source: apexIntradayRule },
  'tpt-test': { minimum: 3, source: tptRule },
  'earn2trade-gauntlet': { minimum: 0, source: 'https://www.earn2trade.com/gauntlet-mini' },
  'earn2trade-tcp': { minimum: 0, source: 'https://www.earn2trade.com/trader-career-path' },
  'alpha-standard': { minimum: 2, source: alphaTerms },
  'alpha-advanced': { minimum: 2, source: alphaTerms }
};

export function dayRuleFor(plan, size) {
  const rule = dayRules[plan.id];
  return { firmMinimum: rule?.minimum ?? null, winningThreshold: rule?.winningThresholds?.[size] === undefined ? null : Math.round(rule.winningThresholds[size] * 100), winningInclusive: rule?.winningInclusive ?? false, source: rule?.source || null };
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
  { id: 'apex-eod', firm: 'apex', name: 'EOD PA · Payout window', short: 'EOD PA', stage: 'Sim funded', rule: 5000, exclusive: true, sizes: futuresSizes, basis: 'net', source: apexEodRule,
    note: 'Current EOD Performance Accounts, not legacy accounts. Use net profit since the last approved payout, or account inception. This follows the payout policy’s strictly-below-50% wording; a general help example accepts exactly 50%, so confirm that boundary in your dashboard. Five qualifying wins are required. Safety nets, minimum balances, and payout limits are separate.' },
  { id: 'apex-intraday', firm: 'apex', name: 'Intraday PA · Payout window', short: 'Intraday PA', stage: 'Sim funded', rule: 5000, exclusive: true, sizes: futuresSizes, basis: 'net', source: apexIntradayRule,
    note: 'Current Intraday Performance Accounts, not legacy accounts. Use net profit since the last approved payout, or account inception. This follows the payout policy’s strictly-below-50% wording; a general help example accepts exactly 50%, so confirm that boundary in your dashboard. Qualifying-win thresholds differ from EOD. Safety nets, minimum balances, and payout limits are separate.' },
  { id: 'tpt-test', firm: 'tpt', name: 'Test · Evaluation', short: 'Test', stage: 'Evaluation', rule: 5000, exclusive: true, sizes: [25000, 50000, 75000, 100000, 150000], targets: { ...targets, 75000: 4500 }, basis: 'net', source: tptRule,
    targetSource: 'https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15169070804125-Rule-1-Hit-Your-Profit-Target',
    note: 'Test accounts only. Best-day net P&L must be strictly below 50% of total net profit, with at least 3 active trading days. Exactly 50% is not sufficient. PRO and PRO+ stages have different requirements.' },
  { id: 'earn2trade-gauntlet', firm: 'earn2trade', name: 'Gauntlet Mini · Evaluation', short: 'Gauntlet Mini', stage: 'Evaluation', rule: 3000, sizes: [50000, 100000, 150000, 200000], targets: { 50000: 3000, 100000: 6000, 150000: 9000, 200000: 11000 }, basis: 'net', source: earn2tradeRule,
    targetSource: 'https://www.earn2trade.com/gauntlet-mini',
    note: 'Evaluation only: no single day may exceed 30% of total profit. Current product pages list no separate day minimum; the percentage implies at least 4 profitable days. LiveSim and Live accounts do not use this consistency rule. Check your own evaluation terms for legacy requirements.' },
  { id: 'earn2trade-tcp', firm: 'earn2trade', name: 'Trader Career Path · Evaluation', short: 'Trader Career Path', stage: 'Evaluation', rule: 3000, sizes: [25000, 50000, 100000], targets: { 25000: 1750, 50000: 3000, 100000: 6000 }, basis: 'net', source: earn2tradeRule,
    targetSource: 'https://www.earn2trade.com/trader-career-path',
    note: 'Evaluation only, not funded career progression. No day may exceed 30% of total profit. The 25K target is $1,750. Current product pages list no separate day minimum; funded withdrawal rules are separate.' },
  { id: 'alpha-standard', firm: 'alpha', name: 'Standard · Evaluation', short: 'Standard', stage: 'Evaluation', rule: 5000, sizes: topstepSizes, targets, basis: 'net', source: alphaRule,
    note: 'Standard evaluation: best day may be 50% or less of net profit, with a 6% profit target and 2-day minimum. Qualified Standard accounts have a different 40% payout rule; this preset does not apply to that stage.' },
  { id: 'alpha-advanced', firm: 'alpha', name: 'Advanced · Evaluation', short: 'Advanced', stage: 'Evaluation', rule: 4000, sizes: topstepSizes, targets: { 50000: 4000, 100000: 8000, 150000: 12000 }, basis: 'net', source: alphaRule,
    note: 'Advanced evaluation: best day may be 40% or less of net profit, with an 8% profit target. The firm minimum is 2 days, but 40% consistency requires at least 3 profitable days. Advanced Qualified accounts do not use this consistency rule.' },
  { id: 'custom', firm: 'custom', name: 'Your own consistency rule', short: 'Custom', stage: 'Custom', rule: 3000, sizes: futuresSizes, basis: 'net', source: null,
    note: 'Enter the best-day percentage in your account agreement. This calculator supports best-day percentage rules. It does not model lot-size, risk, or other consistency definitions.' }
];

export function planById(id) { return plans.find(p => p.id === id) || plans[0]; }
export function targetFor(plan, size) { return Math.round((plan.targets?.[size] || 0) * 100); }
export function exampleFor(plan, size) {
  const goal = targetFor(plan, size) || Math.round(size * .06 * 100);
  // Synthetic journal scaled to an illustrative goal; the largest day is 50%.
  const best = Math.round(goal * .5);
  return { total: goal, best, target: targetFor(plan, size), ruleBps: plan.rule, exclusive: plan.exclusive ?? false };
}
