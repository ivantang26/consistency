import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, restoreState, withExample } from '../src/state.js';
import { planById } from '../src/presets.js';
import { calculate, parseMoney } from '../src/calculator.js';

test('a fresh calculator has no example profit, day counts, or journal rows', () => {
  const state = createInitialState();
  for (const key of ['total', 'best', 'net', 'tradingDays', 'qualifyingDays', 'scenario']) assert.equal(state[key], '');
  assert.deepEqual(state.days, []);
  assert.equal(state.demoSummary, false);
});
test('saved synthetic four-day examples do not become a starting calculation', () => {
  const state = restoreState({ plan: 'mffu-eod', size: 50000, total: '3000', best: '1500', net: '3000',
    tradingDays: '4', qualifyingDays: '4', days: [{ pnl: '1500' }, { pnl: '500' }, { pnl: '500' }, { pnl: '500' }],
    demoSummary: true, demoJournal: true });
  assert.equal(state.plan, 'mffu-eod');
  for (const key of ['total', 'best', 'tradingDays', 'qualifyingDays']) assert.equal(state[key], '');
  assert.deepEqual(state.days, []);
});
test('saved user-entered figures and actual day counts are preserved', () => {
  const stored = { plan: 'tradeify-growth', size: 50000, total: '2800', best: '1200', net: '2800',
    tradingDays: '5', qualifyingDays: '4', days: [{ pnl: '450' }, { pnl: '1200' }], demoSummary: false, demoJournal: false };
  const restored = restoreState(stored);
  for (const key of ['total', 'best', 'net', 'tradingDays', 'qualifyingDays']) assert.equal(restored[key], stored[key]);
  assert.deepEqual(restored.days, stored.days);
  assert.notEqual(restored.days, stored.days);
});
test('loading an example fills profit figures without inventing completed sessions', () => {
  const state = withExample(createInitialState(), planById('mffu-eod'), 50000);
  assert.equal(state.total, '3000');
  assert.equal(state.best, '1500');
  assert.equal(state.tradingDays, '');
  assert.equal(state.qualifyingDays, '');
  assert.deepEqual(state.days, []);
});
test('removing the custom selector migrates a saved profitable-only calculation to its net amount', () => {
  const state = restoreState({ plan: 'custom', size: 50000, customBasis: 'positive', total: '5000', net: '4000', best: '2500' });
  assert.equal(state.total, '4000');
  assert.equal('customBasis' in state, false);
  assert.equal(calculate({ total: parseMoney(state.total), best: parseMoney(state.best), ruleBps: 5000 }).ratio, 62.5);
});
test('firm-specific legacy calculations keep the entered profitable-day total and net profit', () => {
  const state = restoreState({ plan: 'ftmo-legacy', size: 50000, total: '5000', net: '4000', best: '2500', demoSummary: false });
  assert.equal(state.total, '5000');
  assert.equal(state.net, '4000');
});
