# Consistency

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Provisional assumption after an unanswered optional stack question: a lightweight static browser application using HTML, CSS, and JavaScript modules; a dependency-free Node development server and Node tests. Hosting remains undecided. Implement in the user's current project folder.

## Users

Prop-firm traders checking how their daily profits measure against different firms' consistency rules.

## Product Purpose

Reduce frustrating manual calculations. Show the best day's share of total profit, whether a selected consistency threshold is met, and the additional profit needed. Include worked examples across firms and account sizes.

## Capabilities and Constraints

- Select a firm, named plan/stage, and account size; account size is not the denominator of a consistency calculation.
- Calculate from either a profit summary or a daily trading journal, including losing days.
- Show the least days implied by consistency and the published minimum recorded for a plan. Track completed sessions and qualifying wins, with account-size thresholds; unknown day requirements remain explicit.
- Estimate additional days at the current best-day profit, under that stated cap; keep this estimate distinct from full payout eligibility.
- Include researched official-source presets and an editable custom rule.
- Mark worked trading data as illustrative. Record source URLs and research dates.
- Distinguish consistency compliance, evaluation profit targets, and full payout eligibility.
- Futures-first is a provisional assumption; an optional audience question is pending. Other rule types can be entered as a custom best-day percentage.
- Local device persistence is a provisional implementation choice; no brokerage integration or server-side storage is requested.

## Evidence on Hand

Official Topstep, My Funded Futures, and Tradeify help-center pages checked on 2026-11-12. Plan-specific sources will be stored alongside presets. Rules can change and must remain inspectable.

## Product Principles

- Make the remaining amount and the formula understandable.
- Keep plan, stage, and account-size distinctions explicit.
- Preserve cents and handle exact thresholds correctly.
- Never equate a consistency check with a funded-account or payout approval.
