import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, tradingDayProgress, projectTradingDayProgress, nextDay, daysAtCurrentBest } from '../src/calculator.js';
import { firms, plans, planById, dayRuleFor, exampleFor, targetFor } from '../src/presets.js';

test('below-50 rules reject equality and accept the first additional cent', () => {
  for (const id of ['apex-eod', 'apex-intraday', 'tpt-test']) {
    const example = exampleFor(planById(id), 50000);
    const result = calculate(example);
    assert.equal(result.ratio, 50, id);
    assert.equal(result.meets, false, id);
    assert.equal(result.required, 300001, id);
    assert.equal(result.consistencyRemaining, 1, id);
    assert.equal(calculate({ ...example, total: 300001 }).meets, true, id);
  }
  assert.equal(calculate(exampleFor(planById('alpha-standard'), 50000)).meets, true);
});

test('strict rounding adds a cent only when the division lands exactly on a cent', () => {
  const exact = calculate({ total: 0, best: 10000, ruleBps: 5000, exclusive: true, target: 300000 });
  assert.equal(exact.required, 20001);
  assert.equal(exact.bestDayAtTarget, 149999);
  const fractional = calculate({ total: 0, best: 10000, ruleBps: 3000, exclusive: true });
  assert.equal(fractional.required, 33334);
  assert.equal(calculate({ total: 33333, best: 10000, ruleBps: 3000, exclusive: true }).meets, false);
  assert.equal(calculate({ total: 33334, best: 10000, ruleBps: 3000, exclusive: true }).meets, true);
});

test('strict thresholds also apply to next-day calculations and minimum days', () => {
  const input = { total: 200000, best: 150000, amount: 100000, ruleBps: 5000, exclusive: true };
  assert.equal(nextDay(input).meets, false);
  assert.equal(nextDay({ ...input, amount: 100001 }).meets, true);
  assert.equal(tradingDayProgress({ ruleBps: 5000, exclusive: true }).consistencyMinimum, 3);
  assert.equal(tradingDayProgress({ ruleBps: 4000, exclusive: true }).consistencyMinimum, 3);
  assert.equal(tradingDayProgress({ ruleBps: 2000, exclusive: true }).consistencyMinimum, 6);
});

test('Apex counts wins at its minimum while Tradeify still requires exceeding it', () => {
  const eod = dayRuleFor(planById('apex-eod'), 50000);
  const progress = tradingDayProgress({ ...eod, ruleBps: 5000, exclusive: true, days: ['250', '249.99', '250.01', '0', '-1'] });
  assert.equal(progress.completedDays, 5);
  assert.equal(progress.qualifyingDays, 2);
  assert.equal(progress.additionalDays, 3);
  assert.equal(dayRuleFor(planById('apex-intraday'), 50000).winningThreshold, 20000);
  const growth = dayRuleFor(planById('tradeify-growth'), 50000);
  assert.equal(tradingDayProgress({ ...growth, days: ['150', '150.01'] }).qualifyingDays, 1);
});

test('an exact minimum win can finish an Apex day requirement without setting a new best', () => {
  const options = { ...dayRuleFor(planById('apex-eod'), 50000), ruleBps: 5000, exclusive: true,
    completedDays: 4, qualifyingDays: 4, best: 25000, total: 100000 };
  const progress = tradingDayProgress(options);
  const result = calculate(options);
  assert.equal(daysAtCurrentBest(result, progress), 1);
  const after = projectTradingDayProgress(options, 25000);
  assert.equal(after.qualifyingDays, 5);
  assert.equal(after.additionalDays, 0);
  assert.equal(projectTradingDayProgress({ ...options, days: ['250', '250', '250', '250'] }, 25000).qualifyingDays, 5);
});

test('summary counts cannot claim qualifying wins below an inclusive daily minimum', () => {
  const options = { ...dayRuleFor(planById('apex-eod'), 50000), ruleBps: 5000, exclusive: true, completedDays: 5, qualifyingDays: 5 };
  assert.ok(tradingDayProgress({ ...options, best: 24999 }).error);
  assert.equal(tradingDayProgress({ ...options, best: 25000 }).error, undefined);
});

test('new plan targets and day rules stay specific to size and stage', () => {
  assert.equal(targetFor(planById('tpt-test'), 75000), 450000);
  assert.equal(dayRuleFor(planById('tpt-test'), 75000).firmMinimum, 3);
  assert.equal(targetFor(planById('earn2trade-tcp'), 25000), 175000);
  assert.equal(targetFor(planById('earn2trade-gauntlet'), 200000), 1100000);
  assert.equal(dayRuleFor(planById('earn2trade-gauntlet'), 50000).firmMinimum, 0);
  assert.equal(targetFor(planById('alpha-standard'), 100000), 600000);
  assert.equal(targetFor(planById('alpha-advanced'), 100000), 800000);
  const advanced = planById('alpha-advanced');
  assert.equal(tradingDayProgress({ ruleBps: advanced.rule, ...dayRuleFor(advanced, 100000) }).minimumTotalDays, 3);
});

test('all published firms have local icons, sourced presets and valid size examples', () => {
  const published = firms.filter(f => f.id !== 'custom');
  assert.equal(published.length, 8);
  assert.equal(plans.filter(p => p.firm !== 'custom').length, 20);
  for (const firm of published) {
    assert.ok(firm.icon.startsWith('/assets/firms/'), firm.id);
    const selected = plans.filter(p => p.firm === firm.id);
    assert.ok(selected.length > 0, firm.id);
    for (const plan of selected) {
      assert.ok(plan.source.startsWith('https://'), plan.id);
      for (const size of plan.sizes) {
        const result = calculate(exampleFor(plan, size));
        assert.equal(result.error, undefined, `${plan.id} ${size}`);
        assert.equal(tradingDayProgress({ ruleBps: plan.rule, exclusive: plan.exclusive ?? false, ...dayRuleFor(plan, size) }).error, undefined);
      }
    }
  }
});
