// Money is calculated in integer cents. Rule percentages are basis points.
export function parseMoney(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const normalized = String(value).trim();
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const negative = normalized.startsWith('-');
  const [whole, fraction = ''] = normalized.replace('-', '').split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents <= 100_000_000_000 ? (negative ? -cents : cents) : null;
}

export function parsePercent(value) {
  const n = parseMoney(value);
  return n !== null && n > 0 && n <= 10000 ? n : null;
}

export function parseDayCount(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) return null;
  const count = Number(text);
  return Number.isSafeInteger(count) && count <= 10000 ? count : null;
}

const qualifiesAsWin = (amount, threshold, inclusive) => inclusive ? amount >= threshold : amount > threshold;

export function tradingDayProgress({ ruleBps = null, exclusive = false, firmMinimum = null, winningThreshold = null, winningInclusive = false,
  completedDays = null, qualifyingDays = null, days = null, best = null, total = null } = {}) {
  const validCount = n => n === null || (Number.isInteger(n) && n >= 0 && n <= 10000);
  if (!validCount(firmMinimum) || !validCount(completedDays) || !validCount(qualifyingDays) ||
    (ruleBps !== null && (!Number.isInteger(ruleBps) || ruleBps < 1 || ruleBps > 10000)) ||
    (winningThreshold !== null && (!Number.isSafeInteger(winningThreshold) || winningThreshold < 0)) ||
    typeof exclusive !== 'boolean' || typeof winningInclusive !== 'boolean') {
    return { error: 'Enter whole trading-day counts between 0 and 10,000.' };
  }
  if (days !== null) {
    if (!Array.isArray(days) || days.length > 10000) return { error: 'Enter a valid trading journal.' };
    const amounts = days.map(day => parseMoney(typeof day === 'object' && day !== null ? day.pnl : day));
    if (amounts.some(n => n === null)) return { error: 'Complete every journal row to count your trading days.' };
    completedDays = amounts.length;
    qualifyingDays = winningThreshold === null ? null : amounts.filter(n => qualifiesAsWin(n, winningThreshold, winningInclusive)).length;
  }
  if (qualifyingDays !== null && completedDays !== null && qualifyingDays > completedDays) {
    return { error: 'Qualifying winning days cannot exceed total trading days.' };
  }
  if (best !== null && (!Number.isSafeInteger(best) || best < 0)) return { error: 'Enter a valid best-day profit before checking completed days.' };
  if (qualifyingDays > 0 && winningThreshold !== null && best !== null && !qualifiesAsWin(best, winningThreshold, winningInclusive)) {
    return { error: 'Your best day is below the qualifying-win requirement. Check the winning-day count or best-day profit.' };
  }
  if (completedDays !== null && best !== null && total !== null && total > best * completedDays) {
    return { error: 'Total profit is too high for this best day and completed-day count. Check those inputs.' };
  }
  if (completedDays === 0 && best > 0) return { error: 'A positive best day requires at least one completed trading day.' };
  const consistencyMinimum = ruleBps === null ? 0 : exclusive ? Math.floor(10000 / ruleBps) + 1 : Math.ceil(10000 / ruleBps);
  const minimumTotalDays = consistencyMinimum === 0 && firmMinimum === null ? null : Math.max(consistencyMinimum, firmMinimum || 0);
  const countedDays = winningThreshold === null ? completedDays : qualifyingDays;
  const firmRemaining = firmMinimum === null || firmMinimum === 0 ? 0 : countedDays === null ? null : Math.max(0, firmMinimum - countedDays);
  const consistencyRemaining = consistencyMinimum === 0 ? 0 : completedDays === null ? null : Math.max(0, consistencyMinimum - completedDays);
  const additionalDays = firmRemaining === null || consistencyRemaining === null ? null : Math.max(firmRemaining, consistencyRemaining);
  return { consistencyMinimum, firmMinimum, minimumTotalDays, winningThreshold, winningInclusive, completedDays, qualifyingDays,
    countedDays, firmRemaining, consistencyRemaining, additionalDays, firmMinimumKnown: firmMinimum !== null };
}

export function daysAtCurrentBest(result, progress) {
  if (!result || result.error || !progress || progress.error || progress.additionalDays === null) return null;
  if (!result.meets && result.remaining === 0) return null;
  // More qualifying wins cannot fit beneath the current best if it is too small.
  if (progress.firmRemaining > 0 && progress.winningThreshold !== null && !qualifiesAsWin(result.best, progress.winningThreshold, progress.winningInclusive)) return null;
  if (result.remaining > 0 && result.best <= 0) return null;
  return Math.max(progress.additionalDays, result.remaining === 0 ? 0 : Math.ceil(result.remaining / result.best));
}

export function projectTradingDayProgress(options, amount, basis = 'net') {
  const original = tradingDayProgress(options);
  if (original.error) return original;
  if (!Number.isSafeInteger(amount)) return { error: 'Enter a valid hypothetical daily profit.' };
  const projected = {
    ...options,
    best: options.best == null ? null : Math.max(options.best, amount),
    total: options.total == null ? null : options.total + (basis === 'positive' ? Math.max(0, amount) : amount)
  };
  if (options.days != null) return tradingDayProgress({ ...projected, days: [...options.days, { pnl: String(amount / 100) }] });
  return tradingDayProgress({
    ...projected,
    completedDays: original.completedDays === null ? null : original.completedDays + 1,
    qualifyingDays: original.qualifyingDays === null ? null : original.qualifyingDays + (qualifiesAsWin(amount, options.winningThreshold, options.winningInclusive) ? 1 : 0)
  });
}

export function convertProfitBasis({ total, net }, previousBasis, nextBasis) {
  if (previousBasis === nextBasis) return { total, net };
  // The profitable-day sum cannot be reconstructed from a net total.
  if (nextBasis === 'positive') return { total: '', net: total };
  return { total: net, net };
}

export function summarizeDays(days, basis = 'net') {
  let net = 0;
  let positive = 0;
  let best = 0;
  for (const day of days) {
    const cents = parseMoney(typeof day === 'object' ? day.pnl : day);
    if (cents === null) return { error: 'Enter a valid P&L for every day, using at most two decimal places.' };
    net += cents;
    positive += Math.max(cents, 0);
    best = Math.max(best, cents);
  }
  if (!Number.isSafeInteger(net) || !Number.isSafeInteger(positive) || positive > 100_000_000_000) {
    return { error: 'The journal total is too large. Use a shorter calculation window.' };
  }
  return { net, positive, best, denominator: basis === 'positive' ? positive : net, count: days.length };
}

export function calculate({ total, best, ruleBps, exclusive = false, target = 0, net = total }) {
  if (![total, best, target, net].every(Number.isSafeInteger) || best < 0 || target < 0 ||
    [total, best, target, net].some(n => Math.abs(n) > 100_000_000_000) ||
    (ruleBps !== null && (!Number.isInteger(ruleBps) || ruleBps <= 0 || ruleBps > 10000)) || typeof exclusive !== 'boolean') {
    return { error: 'Enter valid amounts and a rule between 0.01% and 100%.' };
  }
  if (total > 0 && best === 0) return { error: 'A positive profit total needs a best day greater than $0.' };
  if (net > total) return { error: 'Net profit cannot exceed the profit used for consistency.' };
  const noRule = ruleBps === null;
  const ratio = total > 0 && best > 0 ? best / total * 100 : null;
  const required = noRule || best === 0 ? 0 : exclusive ? Math.floor(best * 10000 / ruleBps) + 1 : Math.ceil(best * 10000 / ruleBps);
  // Compare integers rather than the rounded percentage shown in the UI.
  const meets = noRule || (best > 0 && total > 0 && (exclusive ? best * 10000 < total * ruleBps : best * 10000 <= total * ruleBps));
  const consistencyRemaining = noRule ? 0 : Math.max(0, required - total);
  const targetRemaining = Math.max(0, target - net);
  const remaining = Math.max(consistencyRemaining, targetRemaining);
  const targetMet = target === 0 || net >= target;
  const needed = Math.max(required, total + targetRemaining);
  const bestDayAtTarget = noRule ? null : Math.max(0, exclusive ? Math.ceil(target * ruleBps / 10000) - 1 : Math.floor(target * ruleBps / 10000));
  const remainingDays = best > 0 ? Math.ceil(remaining / best) : null;
  return { noRule, ratio, meets, required, remaining, consistencyRemaining, targetRemaining,
    targetMet, needed, bestDayAtTarget, remainingDays, total, best, net, target, ruleBps, exclusive };
}

export function nextDay({ total, best, net = total, amount, ruleBps, exclusive = false, target = 0 }) {
  return calculate({ total: total + amount, net: net + amount, best: Math.max(best, amount), ruleBps, exclusive, target });
}

export function money(cents, digits = 2) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: 2 }).format(cents / 100);
}

export function percent(value) {
  if (value === null) return '—';
  const shown = value.toFixed(2);
  return `${shown}%`;
}
