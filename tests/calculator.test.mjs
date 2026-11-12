import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, parseMoney, parsePercent, summarizeDays, nextDay, convertProfitBasis, parseDayCount, tradingDayProgress, projectTradingDayProgress, daysAtCurrentBest } from '../src/calculator.js';
import { plans, exampleFor, targetFor, planById, dayRuleFor } from '../src/presets.js';

test('a 35% rule rounds required profit upward to the first qualifying cent', () => {
  const r = calculate({ total: 280000, best: 120000, ruleBps: 3500 });
  assert.equal(r.required, 342858);
  assert.equal(r.remaining, 62858);
  assert.equal(r.meets, false);
  assert.equal(calculate({ total: 342857, best: 120000, ruleBps: 3500 }).meets, false);
  assert.equal(calculate({ total: 342858, best: 120000, ruleBps: 3500 }).meets, true);
});
test('exact thresholds pass; rounded percentages never determine compliance', () => {
  assert.equal(calculate({ total: 300000, best: 165000, ruleBps: 5500 }).meets, true);
  const r = calculate({ total: 300000, best: 165001, ruleBps: 5500 });
  assert.equal(r.ratio.toFixed(2), '55.00');
  assert.equal(r.meets, false);
});
test('losses remain in the denominator and never reset the best day', () => {
  const d = summarizeDays(['1200', '-900', '300']);
  assert.equal(d.net, 60000);
  assert.equal(d.best, 120000);
  assert.equal(calculate({ total: d.net, best: d.best, ruleBps: 3500 }).ratio, 200);
});
test('zero and negative profit are not marked consistent', () => {
  for (const total of [0, -50000]) {
    const r = calculate({ total, best: 10000, ruleBps: 5000 });
    assert.equal(r.meets, false);
    assert.equal(r.ratio, null);
    assert.equal(r.remaining, 20000 - total);
  }
});
test('legacy positive-day denominator and net evaluation target stay separate', () => {
  const d = summarizeDays(['6000', '-2000', '4000', '2000'], 'positive');
  assert.equal(d.denominator, 1200000);
  assert.equal(d.net, 1000000);
  assert.equal(calculate({ total: d.denominator, best: d.best, net: d.net, target: 1200000, ruleBps: 5000 }).remaining, 200000);
});
test('profit target can remain outstanding after consistency is met', () => {
  const r = calculate({ total: 200000, best: 90000, ruleBps: 5500, target: 300000 });
  assert.equal(r.meets, true);
  assert.equal(r.targetMet, false);
  assert.equal(r.remaining, 100000);
});
test('next-day preview updates the best day if a future profit exceeds it', () => {
  const r = nextDay({ total: 280000, best: 120000, amount: 200000, ruleBps: 3500 });
  assert.equal(r.best, 200000);
  assert.equal(r.required, 571429);
  assert.equal(r.meets, false);
});
test('money inputs reject missing, nonfinite, overprecision and unsafe values', () => {
  for (const v of ['', ' ', '1.001', 'Infinity', 'NaN', '1e5', null, undefined, '99999999999999']) assert.equal(parseMoney(v), null);
  assert.equal(parseMoney('-0.10'), -10);
  assert.equal(parseMoney('1234.56'), 123456);
  assert.equal(parsePercent('0'), null);
  assert.equal(parsePercent('100.01'), null);
  assert.equal(parsePercent('35'), 3500);
});
test('invalid or empty journal entries do not silently become zero', () => {
  assert.ok(summarizeDays(['10', '']).error);
  assert.deepEqual(summarizeDays([]), { net: 0, positive: 0, best: 0, denominator: 0, count: 0 });
});
test('plans with no consistency rule do not require a consistency recovery', () => {
  const r = calculate({ total: 10000, best: 10000, ruleBps: null });
  assert.equal(r.noRule, true);
  assert.equal(r.meets, true);
  assert.equal(r.remaining, 0);
});
test('every preset and size produces a valid example with the proper target', () => {
  for (const plan of plans) for (const size of plan.sizes) {
    const r = calculate(exampleFor(plan, size));
    assert.equal(r.error, undefined, `${plan.id} ${size}`);
    assert.equal(r.target, targetFor(plan, size));
    if (plan.id === 'topstep-combine') assert.equal(plan.rule, 5500);
  }
});

test('switching legacy positive-day inputs to a current net rule cannot create a false pass', () => {
  const converted = convertProfitBasis({ total: '5000', net: '4000' }, 'positive', 'net');
  const result = calculate({ total: parseMoney(converted.total), net: parseMoney(converted.net), best: 250000, ruleBps: 5000, target: 500000 });
  assert.equal(result.ratio, 62.5);
  assert.equal(result.meets, false);
  assert.equal(result.remaining, 100000);
});
test('switching net inputs to a positive-day rule preserves net and asks for the missing total', () => {
  const converted = convertProfitBasis({ total: '1000', net: '2800' }, 'net', 'positive');
  assert.equal(converted.net, '1000');
  assert.equal(converted.total, '');
  assert.equal(parseMoney(converted.total), null);
});

test('least trading days round up the reciprocal of the consistency limit', () => {
  for (const [ruleBps, count] of [[5500, 2], [5000, 2], [4000, 3], [3500, 3], [3000, 4], [2500, 4], [2000, 5], [10000, 1]]) {
    assert.equal(tradingDayProgress({ ruleBps }).minimumTotalDays, count);
  }
});
test('a firm minimum can exceed the mathematical minimum', () => {
  const p = tradingDayProgress({ ruleBps: 3500, firmMinimum: 5, winningThreshold: 15000, completedDays: 5, qualifyingDays: 4 });
  assert.equal(p.consistencyMinimum, 3);
  assert.equal(p.minimumTotalDays, 5);
  assert.equal(p.additionalDays, 1);
});
test('journal counts all sessions but only wins strictly above the required threshold', () => {
  const p = tradingDayProgress({ ruleBps: 3500, firmMinimum: 5, winningThreshold: 15000, days: ['150', '150.01', '0', '-100', '200'] });
  assert.equal(p.completedDays, 5);
  assert.equal(p.qualifyingDays, 2);
  assert.equal(p.additionalDays, 3);
});
test('winning-day thresholds follow the selected account size', () => {
  const plan = planById('tradeify-growth');
  for (const [size, threshold] of [[25000, 10000], [50000, 15000], [100000, 20000], [150000, 25000]]) {
    assert.equal(dayRuleFor(plan, size).winningThreshold, threshold);
  }
});
test('missing day counts remain unknown and zero is an explicit count', () => {
  assert.equal(tradingDayProgress({ ruleBps: 5000, firmMinimum: 3 }).additionalDays, null);
  assert.equal(tradingDayProgress({ ruleBps: 5000, firmMinimum: 3, completedDays: 0 }).additionalDays, 3);
  assert.equal(parseDayCount(''), null);
  assert.equal(parseDayCount('0'), 0);
  for (const value of ['2.5', '-1', '1e2', '10001', 'Infinity']) assert.equal(parseDayCount(value), null);
});
test('inconsistent counts and incomplete journals cannot produce a day-check pass', () => {
  assert.ok(tradingDayProgress({ firmMinimum: 5, completedDays: 2, qualifyingDays: 3 }).error);
  assert.ok(tradingDayProgress({ days: ['100', ''] }).error);
  assert.ok(tradingDayProgress({ completedDays: 2.5 }).error);
});
test('unknown firm rules remain separate from consistency-derived bounds', () => {
  const p = tradingDayProgress({ ruleBps: 2000, completedDays: 2 });
  assert.equal(p.firmMinimumKnown, false);
  assert.equal(p.minimumTotalDays, 5);
  assert.equal(p.additionalDays, 3);
  const noRule = tradingDayProgress({ ruleBps: null });
  assert.equal(noRule.minimumTotalDays, null);
});
test('additional-day estimate combines profit recovery with the firm day requirement', () => {
  const result = calculate({ total: 280000, best: 120000, ruleBps: 3500 });
  const progress = tradingDayProgress({ ruleBps: 3500, firmMinimum: 5, winningThreshold: 15000, completedDays: 5, qualifyingDays: 2 });
  assert.equal(daysAtCurrentBest(result, progress), 3);
  assert.equal(daysAtCurrentBest(result, { ...progress, additionalDays: null }), null);
});
test('a winning threshold above the best day makes the capped estimate unavailable', () => {
  const result = calculate({ total: 30000, best: 10000, ruleBps: 3500 });
  const progress = tradingDayProgress({ ruleBps: 3500, firmMinimum: 5, winningThreshold: 15000, completedDays: 3, qualifyingDays: 0 });
  assert.equal(daysAtCurrentBest(result, progress), null);
});
test('a hypothetical new day can complete the last qualifying day', () => {
  const before = tradingDayProgress({ ruleBps: 3500, firmMinimum: 5, winningThreshold: 15000, days: ['450', '1200', '-200', '550', '800'] });
  const after = tradingDayProgress({ ruleBps: 3500, firmMinimum: 5, winningThreshold: 15000, days: ['450', '1200', '-200', '550', '800', '500'] });
  assert.equal(before.additionalDays, 1);
  assert.equal(after.additionalDays, 0);
});

test('claimed qualifying wins cannot pass when the best day never exceeds the threshold', () => {
  const progress = tradingDayProgress({ ruleBps: 3500, firmMinimum: 5, winningThreshold: 15000, completedDays: 5, qualifyingDays: 5, best: 10000, total: 30000 });
  assert.ok(progress.error);
  assert.equal(daysAtCurrentBest(calculate({ total: 30000, best: 10000, ruleBps: 3500 }), progress), null);
});
test('summary counts cannot claim more profit than the best day times trading sessions', () => {
  assert.ok(tradingDayProgress({ ruleBps: 5000, completedDays: 2, best: 10000, total: 30000 }).error);
  assert.ok(tradingDayProgress({ ruleBps: 5000, completedDays: 0, best: 10000, total: -10000 }).error);
});
test('completed day counts cannot make an empty consistency result pass', () => {
  const result = calculate({ total: 0, best: 0, ruleBps: 4000 });
  const progress = tradingDayProgress({ ruleBps: 4000, firmMinimum: 3, completedDays: 3 });
  assert.equal(progress.additionalDays, 0);
  assert.equal(result.meets, false);
  assert.equal(daysAtCurrentBest(result, progress), null);
});

test('a hypothetical day cannot erase an invalid original winning-day count', () => {
  const invalid = { ruleBps: 3500, firmMinimum: 5, winningThreshold: 15000, completedDays: 4, qualifyingDays: 5, best: 100000, total: 300000 };
  for (const amount of [0, 20000]) assert.ok(projectTradingDayProgress(invalid, amount).error);
});
test('projected winning days use the new best day after crossing the qualification threshold', () => {
  const before = { ruleBps: 3500, firmMinimum: 5, winningThreshold: 15000, completedDays: 1, qualifyingDays: 0, best: 10000, total: 10000 };
  const after = projectTradingDayProgress(before, 16000);
  assert.equal(after.error, undefined);
  assert.equal(after.completedDays, 2);
  assert.equal(after.qualifyingDays, 1);
  assert.equal(after.additionalDays, 4);
});
test('a journal scenario preserves unknown counts through derivation and uses strict win boundaries', () => {
  const options = { ruleBps: 3500, firmMinimum: 5, winningThreshold: 15000, best: 20000, total: 20000, days: ['200'] };
  assert.equal(projectTradingDayProgress(options, 15000).qualifyingDays, 1);
  assert.equal(projectTradingDayProgress(options, 15001).qualifyingDays, 2);
  assert.equal(projectTradingDayProgress({ ruleBps: 5000, firmMinimum: 2 }, 10000).additionalDays, null);
});
