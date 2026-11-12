import { calculate, summarizeDays, parseMoney, parsePercent, convertProfitBasis, parseDayCount, tradingDayProgress, projectTradingDayProgress, daysAtCurrentBest, money, percent } from './calculator.js';
import { firms, plans, planById, targetFor, exampleFor, dayRuleFor, CHECKED_ON } from './presets.js';

const $ = id => document.getElementById(id);
const paths = {
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h1m3 0h1m3 0h.1M8 15h1m3 0h1m3 0h.1M8 18h1m3 0h1m3 0h.1"/>',
  library: '<path d="M4 4h4v16H4zM11 4h4v16h-4zM17 5l3-1 4 15-3 1z"/>',
  book: '<path d="M12 5v15M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Z"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  external: '<path d="M14 3h7v7m0-7L11 13m-1-9H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-5"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-9v.1"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  warning: '<path d="M12 3 2 20h20L12 3Zm0 6v5m0 3v.1"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-14 4h2m4 0h2m2 0h1"/>',
  sliders: '<path d="M4 7h16M4 17h16M8 4v6m8 4v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  chart: '<path d="M4 3v17h17M8 15V9m5 6V5m5 10v-4"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.info}</svg>`;
const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
function icons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon); }); }
const initialDays = () => ['450', '1200', '-200', '550', '800'].map(pnl => ({ pnl }));
const defaults = () => ({ plan: 'tradeify-growth', size: 50000, mode: 'summary', total: '2800', best: '1200', net: '2800', days: initialDays(), tradingDays: '5', qualifyingDays: '4', customMinimumDays: '0', customRule: '30', customBasis: 'net', customTarget: '0', scenario: '500', demoSummary: true, demoJournal: true });
let state = defaults();
let storageAvailable = true;
try {
  const stored = JSON.parse(localStorage.getItem('consistency-v1') || 'null');
  if (stored && typeof stored === 'object' && plans.some(p => p.id === stored.plan)) {
    for (const key of ['total', 'best', 'net', 'customRule', 'customTarget', 'scenario', 'customMinimumDays']) if (typeof stored[key] === 'string' && stored[key].length < 30) state[key] = stored[key];
    state.plan = stored.plan;
    state.size = planById(state.plan).sizes.includes(stored.size) ? stored.size : planById(state.plan).sizes[0];
    state.mode = stored.mode === 'journal' ? 'journal' : 'summary';
    state.customBasis = stored.customBasis === 'positive' ? 'positive' : 'net';
    state.demoSummary = stored.demoSummary === true;
    state.demoJournal = stored.demoJournal === true;
    // Older saved calculations did not collect counts. Do not invent progress.
    for (const key of ['tradingDays', 'qualifyingDays']) state[key] = typeof stored[key] === 'string' && stored[key].length < 10 ? stored[key] : '';
    if (Array.isArray(stored.days) && stored.days.length <= 100 && stored.days.every(d => d && typeof d.pnl === 'string' && d.pnl.length < 30)) state.days = stored.days;
  }
} catch { storageAvailable = false; }
let lastResult = null;
let lastContext = null;
let undoState = null;
const librarySizes = new Map();

function save() {
  try { localStorage.setItem('consistency-v1', JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; }
  $('save-status').innerHTML = storageAvailable ? '<span class="status-dot"></span>Saved on this device' : 'Storage unavailable · export to keep a copy';
}
function context() {
  const plan = planById(state.plan);
  return { plan, basis: plan.id === 'custom' ? state.customBasis : plan.basis, ruleBps: plan.id === 'custom' ? parsePercent(state.customRule) : plan.rule,
    target: plan.id === 'custom' ? parseMoney(state.customTarget) : targetFor(plan, state.size),
    ...dayRuleFor(plan, state.size), ...(plan.id === 'custom' ? { firmMinimum: parseDayCount(state.customMinimumDays) } : {}) };
}
function dayProgress(ctx = context(), newDay = null) {
  if (ctx.plan.id === 'custom' && ctx.firmMinimum === null) return { error: 'Enter a minimum of 0 to 10,000 whole trading days.' };
  if (ctx.plan.id === 'custom' && ctx.ruleBps === null) return { error: 'Enter a valid consistency percentage to calculate the least days.' };
  if (state.mode === 'journal') {
    const options = { ...ctx, days: state.days };
    return newDay === null ? tradingDayProgress(options) : projectTradingDayProgress(options, newDay, ctx.basis);
  }
  let completedDays = state.tradingDays.trim() === '' ? null : parseDayCount(state.tradingDays);
  let qualifyingDays = ctx.winningThreshold === null || state.qualifyingDays.trim() === '' ? null : parseDayCount(state.qualifyingDays);
  if ((state.tradingDays.trim() !== '' && completedDays === null) || (ctx.winningThreshold !== null && state.qualifyingDays.trim() !== '' && qualifyingDays === null)) {
    return { error: 'Enter whole day counts from 0 to 10,000; leave unknown counts blank.' };
  }
  const options = { ...ctx, completedDays, qualifyingDays };
  return newDay === null ? tradingDayProgress(options) : projectTradingDayProgress(options, newDay, ctx.basis);
}
const dayText = n => n === null ? 'Not recorded' : `${n} ${n === 1 ? 'day' : 'days'}`;
function renderDayInputs() {
  const ctx = context();
  $('custom-minimum-days').value = state.customMinimumDays;
  $('trading-days-input').value = state.tradingDays;
  $('qualifying-days-input').value = state.qualifyingDays;
  $('qualifying-days-field').hidden = ctx.winningThreshold === null;
  $('qualifying-days-help').textContent = ctx.winningThreshold === null ? '' : `Each day must exceed ${money(ctx.winningThreshold, 0)} profit.`;
  const minimum = tradingDayProgress(ctx).minimumTotalDays;
  $('minimum-days-chip').textContent = minimum == null ? 'Day minimum not recorded' : `At least ${dayText(minimum)}`;
}
function syncSummaryDayCounts() {
  const progress = tradingDayProgress({ ...context(), days: state.days });
  if (progress.error) return;
  state.tradingDays = String(progress.completedDays);
  state.qualifyingDays = progress.qualifyingDays === null ? '' : String(progress.qualifyingDays);
}
function reconcileDayCounts(previousRule) {
  const next = context();
  if (next.winningThreshold !== null && previousRule.winningThreshold !== next.winningThreshold) state.qualifyingDays = '';
}
function inputs() {
  const ctx = context();
  if (ctx.plan.id === 'custom' && ctx.ruleBps === null) return { error: 'Enter a consistency limit from 0.01% to 100%.' };
  if (ctx.target === null || ctx.target < 0) return { error: 'Enter a profit goal of $0 or more, with at most two decimal places.' };
  let total, best, net;
  if (state.mode === 'journal') {
    if (state.days.length === 0) return { error: 'Add a trading day to calculate your consistency.' };
    const sum = summarizeDays(state.days, ctx.basis);
    if (sum.error) return sum;
    total = sum.denominator; best = sum.best; net = sum.net;
  } else {
    total = parseMoney(state.total); best = parseMoney(state.best);
    net = ctx.basis === 'positive' ? parseMoney(state.net) : total;
    if ([total, best, net].some(n => n === null)) return { error: 'Enter an amount in every field, with at most two decimal places.' };
    if (best < 0) return { error: 'Best day profit must be $0 or more. Include losses in total profit.' };
  }
  if (ctx.basis === 'positive' && (total < 0 || best > total)) return { error: 'Profitable-day total must be at least as large as your best day.' };
  return { ...ctx, total, best, net };
}

function renderAccount() {
  const plan = planById(state.plan);
  $('firm-select').innerHTML = firms.map(f => `<option value="${f.id}" ${f.id === plan.firm ? 'selected' : ''}>${f.name}</option>`).join('');
  $('plan-select').innerHTML = plans.filter(p => p.firm === plan.firm).map(p => `<option value="${p.id}" ${p.id === plan.id ? 'selected' : ''}>${p.name}</option>`).join('');
  if (!plan.sizes.includes(state.size)) state.size = plan.sizes[0];
  $('size-select').innerHTML = plan.sizes.map(n => `<option value="${n}" ${n === state.size ? 'selected' : ''}>${money(n * 100, 0)}</option>`).join('');
  $('custom-fields').hidden = plan.id !== 'custom';
  $('custom-rule').value = state.customRule;
  $('custom-basis').value = state.customBasis;
  $('custom-target').value = state.customTarget;
  const ctx = context();
  $('rule-chip').textContent = ctx.ruleBps === null ? (plan.id === 'custom' ? 'Enter a custom limit' : 'No consistency rule') : `${ctx.ruleBps / 100}% consistency rule`;
  $('basis-note').textContent = ctx.basis === 'positive' ? 'Best day ÷ profitable days only' : 'Best day ÷ total profit';
  $('source-link').hidden = !plan.source;
  if (plan.source) $('source-link').href = plan.source;
  $('plan-note').textContent = plan.note;
  $('total-label').textContent = ctx.basis === 'positive' ? 'Total from profitable days' : 'Total profit';
  $('total-help').textContent = ctx.basis === 'positive' ? 'Add only the P&L of days that closed with a profit.' : plan.firm === 'tradeify' ? 'Use Tradeify’s consistency P&L, including losses; exclude commissions.' : 'Profit for your current calculation window, including losses.';
  $('net-field').hidden = ctx.basis !== 'positive';
  renderDayInputs();
}

function renderInputMode() {
  const journal = state.mode === 'journal';
  $('summary-mode').setAttribute('aria-pressed', String(!journal));
  $('journal-mode').setAttribute('aria-pressed', String(journal));
  $('summary-inputs').hidden = journal;
  $('journal-inputs').hidden = !journal;
  $('total-input').value = state.total;
  $('best-input').value = state.best;
  $('net-input').value = state.net;
  $('scenario-input').value = state.scenario;
  renderDayInputs();
  renderDemoLabel();
  renderJournal();
}
function renderDemoLabel() {
  const demo = state.mode === 'summary' ? state.demoSummary : state.demoJournal;
  $('demo-label').firstElementChild?.remove();
  $('demo-label').innerHTML = `${icon(demo ? 'info' : 'check')}<span>${demo ? 'Example numbers. Replace them with your own.' : 'Using your figures for this calculation window.'}</span><button class="text-button" id="load-example">Reload example</button>`;
}
function renderJournal(focusIndex) {
  $('journal-rows').innerHTML = state.days.map((d, i) => `<div class="journal-row"><label class="day-name" for="day-${i}">Day ${i + 1}</label><div class="input-wrap"><span class="prefix">$</span><input id="day-${i}" data-day="${i}" type="text" inputmode="decimal" value="${escape(d.pnl)}" aria-label="Day ${i + 1} P&L"></div><button class="icon-button" data-remove="${i}" aria-label="Remove day ${i + 1}">${icon('close')}</button></div>`).join('');
  $('add-day').disabled = state.days.length >= 100;
  if (focusIndex !== undefined) $(`day-${focusIndex}`)?.focus();
}

function renderResult() {
  for (const [id, key] of [['total-input', 'total'], ['best-input', 'best'], ['net-input', 'net'], ['custom-target', 'customTarget']]) {
    const amount = parseMoney(state[key]);
    const invalid = amount === null || (['best', 'customTarget'].includes(key) && amount < 0);
    $(id).setAttribute('aria-invalid', String(invalid));
  }
  $('custom-rule').setAttribute('aria-invalid', String(parsePercent(state.customRule) === null));
  for (const el of $('journal-rows').querySelectorAll('[data-day]')) el.setAttribute('aria-invalid', String(parseMoney(el.value) === null));
  const input = inputs();
  const r = input.error ? input : calculate(input);
  lastContext = input;
  lastResult = r;
  $('input-error').hidden = !r.error;
  $('input-error').textContent = r.error || '';
  $('export-button').disabled = !!r.error;
  if (r.error) {
    $('result-content').innerHTML = `<div class="result-empty">${icon('calculator')}<h2 id="result-heading">A clearer picture starts here.</h2><p>${escape(r.error)}</p></div>`;
    $('math-content').innerHTML = '<p class="field-help">Your formula and profit breakdown will appear when the inputs are complete.</p>';
    $('scenario-result').innerHTML = '<p class="field-help">Complete your performance inputs to explore a new trading day.</p>';
    $('journal-totals').textContent = '';
    renderTradingDays(null, context());
    return;
  }
  const ruleText = r.ruleBps === null ? 'No rule' : `${r.ruleBps / 100}%`;
  const empty = r.best === 0 && r.total <= 0;
  const status = r.noRule ? 'No consistency requirement' : empty ? 'Add your trading profits' : r.meets ? 'Within the limit' : 'Above the limit';
  const badgeClass = r.noRule || empty ? 'neutral' : r.meets ? 'success' : 'warning';
  let message;
  if (r.noRule) message = 'This plan has <strong>no consistency percentage</strong> at this stage. Check the other account requirements separately.';
  else if (empty) message = 'Add your trading results to see your best day’s share of your profit.';
  else if (r.meets) message = `Your best day is <strong>within the ${ruleText} limit.</strong> ${r.targetMet ? 'The consistency calculation is met for these figures.' : `The evaluation target still needs ${money(r.targetRemaining)}.`}`;
  else message = `Your best day makes up <strong>${r.ratio === null ? 'more than your current profit' : percent(r.ratio) + ' of your profit'}.</strong> ${r.total <= 0 ? 'Build a positive profit total to meet the rule.' : `Bring it to ${ruleText} or below by building profit on other days.`}`;
  const ratioNumber = r.noRule ? '—' : r.ratio === null ? '—' : r.ratio > 9999.99 ? '&gt;9,999' : r.ratio.toFixed(2);
  $('result-content').innerHTML = `<div class="result-top"><h2 id="result-heading">Your consistency</h2><span class="badge ${badgeClass}">${icon(r.meets && !r.noRule ? 'check' : r.noRule || empty ? 'info' : 'warning')}${status}</span></div>
    <div class="ratio-number">${ratioNumber}${r.ratio !== null && !r.noRule ? '<small>%</small>' : ''}</div>
    <p class="ratio-description">${r.noRule ? 'Percentage check does not apply to this plan' : 'of your profit came from your best trading day'}</p>
    ${r.noRule ? '' : `<div class="consistency-meter" style="--share:${Math.min(100, r.ratio || 0)}%;--limit:${r.ruleBps / 100}%" role="img" aria-label="Best-day share ${r.ratio === null ? 'not available' : percent(r.ratio)}, limit ${ruleText}"><span class="meter-fill"></span><span class="meter-limit"></span></div><div class="meter-labels"><span>0%</span><span>100%</span></div><div class="meter-legend"><span class="legend-line"></span>${ruleText} consistency limit${r.ratio > 100 ? ' · chart capped at 100%' : ''}</div>`}
    <p class="result-message">${message}</p>
    <div class="remaining-row"><div>${icon('arrow')}Additional profit needed</div><strong class="remaining-amount" id="remaining-amount">${empty && !r.noRule ? '—' : money(r.remaining)}</strong></div>
    <p class="result-foot">${r.remaining > 0 && r.best > 0 ? `Assumes future days do not exceed your ${money(r.best, 0)} best day.` : 'Consistency check only. Other account requirements still apply.'}${input.target > 0 ? ` Evaluation target: ${money(input.target, 0)}.` : ''}</p>`;
  renderMath(r, input);
  renderTradingDays(r, input);
  renderScenario();
  if (state.mode === 'journal') {
    const sum = summarizeDays(state.days, input.basis);
    $('journal-totals').innerHTML = `<span>${state.days.length} trading days</span><span>Net profit <strong>${money(sum.net)}</strong></span>`;
  }
}

function renderTradingDays(result, ctx) {
  const progress = dayProgress(ctx);
  for (const [id, value] of [['trading-days-input', state.tradingDays], ['qualifying-days-input', state.qualifyingDays]]) {
    $(id).setAttribute('aria-invalid', String(value.trim() !== '' && parseDayCount(value) === null));
  }
  $('custom-minimum-days').setAttribute('aria-invalid', String(parseDayCount(state.customMinimumDays) === null));
  if (progress.error) {
    $('trading-days-result').innerHTML = `<h3>Least trading days</h3><p class="input-error" id="day-count-error" role="alert">${escape(progress.error)}</p>`;
    return;
  }
  const winning = ctx.winningThreshold !== null;
  const estimate = daysAtCurrentBest(result, progress);
  const firmDescription = ctx.firmMinimum === null ? 'No separate firm minimum is recorded for this preset.' : ctx.firmMinimum === 0 ? 'No separate firm day minimum is set.' : winning ? `${dayText(ctx.firmMinimum)} with profit above ${money(ctx.winningThreshold, 0)} each, in the current payout window.` : `${dayText(ctx.firmMinimum)} in the current calculation window, with at least one trade per session.`;
  const mathDescription = progress.consistencyMinimum > 0 ? `Consistency alone needs at least ${dayText(progress.consistencyMinimum)} with profit spread across those days.` : 'No day minimum comes from the consistency percentage.';
  const estimateText = estimate === null ? progress.additionalDays === null ? 'Enter completed counts to see how many days remain.' : result && result.best <= (ctx.winningThreshold || 0) && progress.firmRemaining > 0 ? 'More qualifying wins would set a new best day; the capped estimate is unavailable.' : 'Add profit figures to estimate the earliest finish.' : estimate === 0 ? 'The profit, consistency, and recorded day checks are met.' : `At least ${dayText(estimate)} more if future days earn up to ${money(result.best, 0)} each without setting a new best day.`;
  $('trading-days-result').innerHTML = `<h3>Least trading days</h3><dl class="day-count-summary"><div><dt>From the start</dt><dd>${progress.minimumTotalDays === null ? '—' : progress.minimumTotalDays}</dd></div><div><dt>${winning ? 'Qualifying wins' : 'Completed days'}</dt><dd>${progress.countedDays === null ? '—' : progress.countedDays}</dd></div><div><dt>Days still required</dt><dd>${progress.additionalDays === null ? '—' : progress.additionalDays}</dd></div></dl><p id="day-count-error" class="day-rule-description">${firmDescription}<br>${mathDescription}</p><p class="day-estimate">${estimateText}</p>${winning && progress.completedDays !== null ? `<p class="day-rule-description">${dayText(progress.completedDays)} traded in total. Losing and smaller winning days do not count as qualifying wins.</p>` : ''}${ctx.source && ctx.plan.id !== 'custom' ? `<a class="inline-link" href="${ctx.source}" target="_blank" rel="noopener noreferrer">Trading day source ${icon('external')}</a>` : ''}<p class="result-foot">Trading sessions, not calendar days. Other account requirements still apply.</p>`;
}

function renderMath(r, ctx) {
  const ratio = r.ratio === null ? '—' : percent(r.ratio);
  const bestShare = Math.min(100, Math.max(0, r.ratio || 0));
  const rest = Math.max(0, r.total - r.best);
  $('math-content').innerHTML = `<div class="formula-line"><strong>${money(r.best, 0)}</strong><span>÷</span><strong>${money(r.total, 0)}</strong><span>× 100 =</span><strong>${ratio}</strong></div>
    <div class="profit-strip" role="img" aria-label="Best day ${money(r.best)}, other profit ${money(rest)}${r.best > r.total ? '; losses make the best day greater than total profit' : ''}"><span class="profit-best" style="width:${bestShare}%"></span><span class="profit-rest" style="width:${100 - bestShare}%"></span></div>
    <div class="strip-legend"><span><i class="legend-dot"></i>Best day</span><span><i class="legend-dot rest"></i>${ctx.basis === 'positive' ? 'Other profitable days' : r.best > r.total ? 'Total reduced by losses' : 'All other days, net'}</span></div>
    <p class="calculation-detail">${r.noRule ? 'This ratio is informational; no consistency threshold applies.' : r.best === 0 ? 'Enter a positive best day to calculate the required total.' : `Required ${ctx.basis === 'positive' ? 'profitable-day' : 'total'} profit: ${money(r.best, 0)} ÷ ${r.ruleBps / 10000} = <strong>${money(r.required)}</strong>`}${ctx.target > 0 ? `<br>Evaluation net-profit target: <strong>${money(ctx.target, 0)}</strong>` : ''}</p>`;
}
function renderScenario() {
  if (!lastResult || lastResult.error) return;
  const amount = parseMoney(state.scenario);
  if (amount === null) { $('scenario-result').innerHTML = '<p class="input-error">Enter a valid amount with at most two decimal places.</p>'; return; }
  const ctx = lastContext;
  // Under positive-day rules, a losing new day reduces net profit but not the denominator.
  const scenarioTotal = ctx.total + (ctx.basis === 'positive' ? Math.max(0, amount) : amount);
  const r = calculate({ total: scenarioTotal, net: ctx.net + amount, best: Math.max(ctx.best, amount), ruleBps: ctx.ruleBps, target: ctx.target });
  if (r.error) { $('scenario-result').innerHTML = `<p class="input-error">${escape(r.error)}</p>`; return; }
  const progress = dayProgress(ctx, amount);
  const daysNote = progress.error ? progress.error : progress.additionalDays === null ? 'Enter completed day counts to preview day progress.' : `${dayText(progress.additionalDays)} still required by the recorded day checks.`;
  $('scenario-result').innerHTML = `<div class="scenario-values"><div><span>New consistency</span><strong>${r.noRule ? 'No rule' : percent(r.ratio)}</strong></div><div><span>Still needed</span><strong>${money(r.remaining)}</strong></div></div><div class="scenario-outcome">${amount > ctx.best ? `This sets a new best day of ${money(amount)}.` : r.meets ? r.targetMet ? 'The consistency and listed profit checks are met.' : 'Consistency is met; the profit goal remains.' : 'The consistency requirement would still be outstanding.'}<br>${escape(daysNote)}</div>`;
}

function avatar(f) { return `<span class="firm-avatar ${f.color}" aria-hidden="true">${escape(f.initials)}</span>`; }
function renderPreview() {
  const ids = ['tradeify-growth', 'topstep-combine', 'mffu-eod', 'ftmo-current'];
  $('preview-rows').innerHTML = ids.map(id => {
    const p = planById(id), f = firms.find(f => f.id === p.firm);
    const days = tradingDayProgress({ ruleBps: p.rule, ...dayRuleFor(p, 50000) });
    return `<tr><td><div class="firm-cell">${avatar(f)}<div><strong>${f.name}</strong><small>${p.short} · ${p.stage}</small></div></div></td><td>$50,000</td><td>${p.rule / 100}%</td><td>${dayText(days.minimumTotalDays)}${days.winningThreshold !== null ? '<small>Qualifying wins</small>' : ''}</td><td>Total profit</td><td><button class="table-action" data-example="${id}" data-size="50000">Try example ${icon('arrow')}</button></td></tr>`;
  }).join('');
}
function renderLibrary() {
  const search = $('rule-search').value.trim().toLowerCase();
  const filter = $('library-filter').value;
  const shown = plans.filter(p => p.firm !== 'custom' && (filter === 'all' || p.firm === filter) && `${firms.find(f => f.id === p.firm).name} ${p.name} ${p.stage} ${p.basis === 'positive' ? 'legacy positive' : 'net'} ${p.rule === null ? 'no rule' : p.rule / 100}`.toLowerCase().includes(search));
  $('library-count').textContent = `${shown.length} ${shown.length === 1 ? 'plan' : 'plans'} · Change an account size to see a worked example`;
  $('library-content').innerHTML = firms.filter(f => f.id !== 'custom').map(f => {
    const firmPlans = shown.filter(p => p.firm === f.id);
    if (!firmPlans.length) return '';
    return `<section class="library-section"><div class="library-firm-heading">${avatar(f)}<h2>${f.name}</h2><span>${f.market}</span></div><div class="table-container panel"><table class="library-table"><caption class="sr-only">${f.name} plan rules and illustrative examples</caption><thead><tr><th>Plan &amp; stage</th><th>Account</th><th>Rule</th><th>Least days</th><th>Example best day</th><th>Total required</th><th></th></tr></thead><tbody>${firmPlans.map(p => {
      const size = librarySizes.get(p.id) || (p.sizes.includes(50000) ? 50000 : p.sizes[0]);
      const ex = exampleFor(p, size), r = calculate(ex);
      const required = Math.max(r.required, ex.target);
      const dayRule = dayRuleFor(p, size);
      const days = tradingDayProgress({ ruleBps: p.rule, ...dayRule });
      return `<tr><td class="plan-name">${p.short}<small>${p.stage} · ${p.basis === 'positive' ? 'Profitable days only' : 'Total profit'}</small><a class="library-source" href="${p.source}" target="_blank" rel="noopener noreferrer">Official source ${icon('external')}</a></td><td><select aria-label="${escape(f.name + ' ' + p.short)} example account size" data-library-size="${p.id}">${p.sizes.map(n => `<option value="${n}" ${n === size ? 'selected' : ''}>$${n / 1000}K</option>`).join('')}</select></td><td>${p.rule === null ? 'None' : `${p.rule / 100}%`}</td><td>${dayText(days.minimumTotalDays)}<small>${dayRule.winningThreshold !== null ? `Wins above ${money(dayRule.winningThreshold, 0)} each` : dayRule.firmMinimum === null ? 'Consistency lower bound only' : 'Trading sessions'}</small>${dayRule.source && dayRule.source !== p.source ? `<a class="library-source" href="${dayRule.source}" target="_blank" rel="noopener noreferrer">Day requirement ${icon('external')}</a>` : ''}</td><td>${money(ex.best, 0)}<small>Illustrative</small></td><td>${p.rule === null ? 'Not applicable' : money(required)}<small>${ex.target > 0 ? `Target ${money(ex.target, 0)}` : 'Consistency only'}</small></td><td><button class="table-action" data-example="${p.id}" data-size="${size}">Use ${icon('arrow')}</button></td></tr>`;
    }).join('')}</tbody></table></div></section>`;
  }).join('') || '<div class="panel empty-search"><h2>No matching rules</h2><p>Try another firm name, plan, stage, or percentage.</p><button class="button secondary" id="clear-search">Clear filters</button></div>';
}

function loadExample(id = state.plan, size = state.size, intro = false) {
  undoState = structuredClone(state);
  const p = planById(id);
  state.plan = p.id;
  state.size = p.sizes.includes(Number(size)) ? Number(size) : p.sizes[0];
  const ex = exampleFor(p, state.size);
  state.total = intro ? '2800' : String(ex.total / 100);
  state.best = intro ? '1200' : String(ex.best / 100);
  state.net = state.total;
  const rest = parseMoney(state.total) - parseMoney(state.best);
  const portion = Math.floor(rest / 3);
  state.days = intro ? initialDays() : [parseMoney(state.best), portion, portion, rest - portion * 2].map(n => ({ pnl: String(n / 100) }));
  syncSummaryDayCounts();
  state.demoSummary = state.demoJournal = true;
  state.mode = 'summary';
  renderAccount(); renderInputMode(); renderResult(); save();
  if (location.hash !== '#calculator') location.hash = 'calculator';
  showToast('Illustrative example loaded.', true);
}
function showToast(text, undo = false) { $('toast-text').textContent = text; $('undo-button').hidden = !undo; $('toast').hidden = false; }
function reconcileBasis(previousBasis) {
  const nextBasis = context().basis;
  if (previousBasis === nextBasis) return;
  const converted = convertProfitBasis(state, previousBasis, nextBasis);
  state.total = converted.total;
  state.net = converted.net;
  if (nextBasis === 'positive') {
    // A net total cannot tell us the sum of profitable days. Preserve it in
    // the net field and ask for the missing denominator instead of inventing one.
    if (state.mode === 'summary') showToast('This rule needs the total from profitable days. Your net profit is preserved.');
  } else {
    if (state.mode === 'summary') showToast('Now using your net profit, including losing days.');
  }
}
function changePlan(id) {
  const previousBasis = context().basis;
  const previousDayRule = context();
  state.plan = planById(id).id;
  reconcileBasis(previousBasis);
  reconcileDayCounts(previousDayRule);
  renderAccount(); renderInputMode(); renderResult(); save();
}
function route() {
  const hash = location.hash.slice(1);
  const view = ['calculator', 'rules', 'guide'].includes(hash) ? hash : 'calculator';
  for (const id of ['calculator', 'rules', 'guide']) {
    $(`${id}-view`).hidden = id !== view;
    const nav = document.querySelector(`[data-nav="${id}"]`);
    if (id === view) nav.setAttribute('aria-current', 'page'); else nav.removeAttribute('aria-current');
  }
  const titles = { calculator: ['Consistency calculator', 'Know where you stand. Plan your next trading day.'], rules: ['Firm rule library', 'One place to understand the rules behind the numbers.'], guide: ['How consistency works', 'The formula, the details, and the decisions it helps you make.'] };
  $('page-title').textContent = titles[view][0]; $('page-description').textContent = titles[view][1];
  document.title = `${titles[view][0]} — Consistency`;
  $('export-button').hidden = view !== 'calculator';
  if (view === 'rules') renderLibrary();
  window.scrollTo(0, 0);
}

$('firm-select').addEventListener('change', e => changePlan(plans.find(p => p.firm === e.target.value).id));
$('plan-select').addEventListener('change', e => changePlan(e.target.value));
$('size-select').addEventListener('change', e => {
  const previousDayRule = context();
  state.size = Number(e.target.value);
  reconcileDayCounts(previousDayRule);
  renderDayInputs(); renderResult(); save();
});
for (const [id, key] of [['total-input', 'total'], ['best-input', 'best'], ['net-input', 'net'], ['custom-rule', 'customRule'], ['custom-target', 'customTarget']]) {
  $(id).addEventListener('input', e => {
    if (state.demoSummary && ['total', 'best', 'net'].includes(key)) {
      state.tradingDays = ''; state.qualifyingDays = '';
      renderDayInputs();
    }
    state[key] = e.target.value; state.demoSummary = false;
    if (key.startsWith('custom')) {
      const rule = context().ruleBps;
      $('rule-chip').textContent = rule === null ? 'Enter a custom limit' : `${rule / 100}% consistency rule`;
    }
    renderDemoLabel(); renderResult(); save();
  });
}
$('custom-basis').addEventListener('change', e => {
  const previousBasis = context().basis;
  state.customBasis = e.target.value;
  reconcileBasis(previousBasis);
  renderAccount(); renderInputMode(); renderResult(); save();
});
for (const [id, key] of [['trading-days-input', 'tradingDays'], ['qualifying-days-input', 'qualifyingDays'], ['custom-minimum-days', 'customMinimumDays']]) {
  $(id).addEventListener('input', e => {
    state[key] = e.target.value;
    if (key !== 'customMinimumDays') state.demoSummary = false;
    if (key === 'customMinimumDays') renderDayInputs();
    renderDemoLabel(); renderResult(); save();
  });
}
$('summary-mode').addEventListener('click', () => {
  if (state.mode === 'journal') {
    const sum = summarizeDays(state.days, context().basis);
    if (sum.error) { showToast('Complete every journal row before using its summary.'); return; }
    state.total = String(sum.denominator / 100);
    state.best = String(sum.best / 100);
    state.net = String(sum.net / 100);
    syncSummaryDayCounts();
    state.demoSummary = state.demoJournal;
  }
  state.mode = 'summary'; renderInputMode(); renderResult(); save();
});
$('journal-mode').addEventListener('click', () => {
  if (!state.demoSummary && state.demoJournal) {
    state.days = [];
    state.demoJournal = false;
    showToast('Add one row per session to calculate from your journal.');
  }
  state.mode = 'journal'; renderInputMode(); renderResult(); save();
});
$('scenario-input').addEventListener('input', e => { state.scenario = e.target.value; renderScenario(); save(); });
$('journal-rows').addEventListener('input', e => {
  if (!e.target.hasAttribute('data-day')) return;
  state.days[Number(e.target.dataset.day)].pnl = e.target.value;
  state.demoJournal = false; renderDemoLabel(); renderResult(); save();
});
$('journal-rows').addEventListener('click', e => {
  const button = e.target.closest('[data-remove]'); if (!button) return;
  const index = Number(button.dataset.remove);
  state.days.splice(index, 1); state.demoJournal = false;
  renderJournal(Math.min(index, state.days.length - 1)); renderDemoLabel(); renderResult(); save();
});
$('add-day').addEventListener('click', () => {
  if (state.days.length >= 100) return;
  state.days.push({ pnl: '' }); state.demoJournal = false;
  renderJournal(state.days.length - 1); renderDemoLabel(); renderResult(); save();
});
$('reset-button').addEventListener('click', () => {
  undoState = structuredClone(state); state.total = ''; state.best = ''; state.net = ''; state.days = []; state.demoSummary = state.demoJournal = false;
  state.tradingDays = ''; state.qualifyingDays = '';
  renderInputMode(); renderResult(); save(); showToast('Performance inputs cleared.', true);
  if (state.mode === 'summary') $('total-input').focus(); else $('add-day').focus();
});
$('undo-button').addEventListener('click', () => { if (!undoState) return; state = undoState; undoState = null; renderAccount(); renderInputMode(); renderResult(); save(); $('toast').hidden = true; });
$('toast-close').addEventListener('click', () => { $('toast').hidden = true; });
document.addEventListener('click', e => {
  if (e.target.closest('#load-example')) { loadExample(state.plan, state.size, state.plan === 'tradeify-growth' && state.size === 50000); return; }
  if (e.target.closest('#clear-search')) { $('rule-search').value = ''; $('library-filter').value = 'all'; renderLibrary(); return; }
  const button = e.target.closest('[data-example]');
  if (button) loadExample(button.dataset.example, button.dataset.size, button.closest('.worked-example') !== null);
});
$('rule-search').addEventListener('input', renderLibrary);
$('library-filter').addEventListener('change', renderLibrary);
$('library-content').addEventListener('change', e => { if (e.target.dataset.librarySize) { const id = e.target.dataset.librarySize; librarySizes.set(id, Number(e.target.value)); renderLibrary(); document.querySelector(`[data-library-size="${id}"]`)?.focus(); } });
$('export-button').addEventListener('click', () => {
  if (!lastResult || lastResult.error) return;
  const r = lastResult, c = lastContext;
  const rows = [['Consistency calculation', 'Value'], ['Firm', firms.find(f => f.id === c.plan.firm).name], ['Plan', c.plan.name], ['Account size USD', state.size], ['Profit basis', c.basis === 'positive' ? 'Profitable days only' : 'Total profit including losses'], ['Total used USD', (r.total / 100).toFixed(2)], ['Net profit USD', (r.net / 100).toFixed(2)], ['Best day USD', (r.best / 100).toFixed(2)], ['Rule percent', r.ruleBps === null ? 'None' : r.ruleBps / 100], ['Consistency percent', r.ratio === null ? 'Unavailable' : r.ratio.toFixed(6)], ['Consistency met', r.noRule ? 'Not applicable' : r.meets ? 'Yes' : 'No'], ['Evaluation target USD', (r.target / 100).toFixed(2)], ['Additional profit needed USD', (r.remaining / 100).toFixed(2)], ['Official source', c.plan.source || 'Custom settings'], ['Sources checked', CHECKED_ON], ['Scope', 'Consistency and listed profit target only; other account requirements apply.']];
  const progress = dayProgress(c);
  if (progress.error) rows.push(['Day progress validation', progress.error]);
  else rows.push(['Least days from the start', progress.minimumTotalDays ?? 'Not recorded'], ['Firm day minimum', progress.firmMinimum ?? 'Not recorded'], ['Trading days completed', progress.completedDays ?? 'Not entered'], ['Qualifying winning days', progress.qualifyingDays ?? 'Not applicable or not entered'], ['Winning day must exceed USD', c.winningThreshold === null ? 'Not applicable' : (c.winningThreshold / 100).toFixed(2)], ['Day checks still required', progress.additionalDays ?? 'Unknown'], ['Least additional days at current best', daysAtCurrentBest(r, progress) ?? 'Unknown'], ['Day requirement source', c.source || 'Consistency-derived bound or custom settings']);
  if (state.mode === 'journal') state.days.forEach((d, i) => rows.push([`Day ${i + 1} P&L USD`, d.pnl]));
  const csv = '\uFEFF' + rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'consistency-summary.csv'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Your calculation summary has been exported.');
});
window.addEventListener('hashchange', route);
icons();
$('library-filter').insertAdjacentHTML('beforeend', firms.filter(f => f.id !== 'custom').map(f => `<option value="${f.id}">${f.name}</option>`).join(''));
renderAccount(); renderInputMode(); renderPreview(); renderResult(); route(); save();
