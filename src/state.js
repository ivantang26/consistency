import { plans, planById, exampleFor } from './presets.js';
import { convertProfitBasis } from './calculator.js';

export function createInitialState() {
  return { plan: 'tradeify-growth', size: 50000, mode: 'summary', total: '', best: '', net: '',
    days: [], tradingDays: '', qualifyingDays: '', customMinimumDays: '0', customRule: '30',
    customTarget: '0', scenario: '', demoSummary: false, demoJournal: false };
}

export function restoreState(stored) {
  const state = createInitialState();
  if (!stored || typeof stored !== 'object' || !plans.some(p => p.id === stored.plan)) return state;
  state.plan = stored.plan;
  const plan = planById(state.plan);
  state.size = plan.sizes.includes(stored.size) ? stored.size : plan.sizes[0];
  state.mode = stored.mode === 'journal' ? 'journal' : 'summary';
  for (const key of ['total', 'best', 'net', 'customRule', 'customTarget', 'scenario', 'customMinimumDays']) {
    if (typeof stored[key] === 'string' && stored[key].length < 30) state[key] = stored[key];
  }
  for (const key of ['tradingDays', 'qualifyingDays']) {
    if (typeof stored[key] === 'string' && stored[key].length < 10) state[key] = stored[key];
  }
  if (Array.isArray(stored.days) && stored.days.length <= 100 && stored.days.every(d => d && typeof d.pnl === 'string' && d.pnl.length < 30)) {
    state.days = stored.days.map(day => ({ pnl: day.pnl }));
  }
  // Previously saved examples are not evidence of completed trading sessions.
  if (stored.demoSummary === true) {
    state.total = ''; state.best = ''; state.net = '';
    state.tradingDays = ''; state.qualifyingDays = ''; state.scenario = '';
  }
  if (stored.demoJournal === true) state.days = [];
  // Custom rules now use net profit. Preserve the entered net amount when
  // migrating a saved custom calculation that previously excluded losing days.
  if (state.plan === 'custom' && stored.customBasis === 'positive') {
    Object.assign(state, convertProfitBasis(state, 'positive', 'net'));
  }
  return state;
}

export function withExample(state, plan, size, intro = false) {
  const accountSize = plan.sizes.includes(Number(size)) ? Number(size) : plan.sizes[0];
  const example = exampleFor(plan, accountSize);
  const total = intro ? '2800' : String(example.total / 100);
  return { ...state, plan: plan.id, size: accountSize, mode: 'summary', total,
    best: intro ? '1200' : String(example.best / 100), net: total,
    days: [], tradingDays: '', qualifyingDays: '', demoSummary: true, demoJournal: false };
}
