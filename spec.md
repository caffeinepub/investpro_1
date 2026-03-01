# InvestPro

## Current State
- 4 investment plans: Mini (₹500), Starter (₹1,000), Silver (₹5,000), Gold (₹10,000)
- Plans page renders 4 cards in a 4-column grid with emerald-green/purple dark theme
- investmentStore.ts has INVESTMENT_PLANS typed as "mini" | "starter" | "silver" | "gold"
- Plan cards have icon, badge, features list, pricing, CTA button
- index.css uses OKLCH emerald+purple dark palette

## Requested Changes (Diff)

### Add
- 5 new investment plans: Diamond (₹25,000, ₹4,125/day), Platinum (₹50,000, ₹8,250/day), Elite (₹1,00,000, ₹16,500/day), VIP (₹2,50,000, ₹41,250/day), Royal (₹5,00,000, ₹82,500/day)
- Each new plan has a unique vivid gradient background on the card (not just a border color - full card background gradient)
- Existing 4 plans also get distinct attractive gradient backgrounds
- New theme: more vibrant, premium feel - rich dark backgrounds with colorful gradient accents per plan

### Modify
- investmentStore.ts: extend INVESTMENT_PLANS with 5 new plan IDs
- investmentStore.ts: update Investment planId type to include new plan IDs
- Plans.tsx: add PLAN_META for 5 new plans, update grid to handle 9 plans (responsive)
- Plans.tsx: each plan card has a unique gradient background (inline gradient style or tailwind)
- index.css: add new gradient utility classes for plan backgrounds (rose, violet, cyan, orange, indigo, etc.)
- Overall theme: richer, more vivid colors throughout - premium dark theme with colorful accents

### Remove
- Nothing removed

## Implementation Plan
1. Update investmentStore.ts: add 5 new plan objects, extend planId union type
2. Update Plans.tsx: add PLAN_META for all 9 plans with unique gradient backgrounds per card
3. Update index.css: add plan-specific gradient CSS classes and enhance overall theme vibrancy
4. Ensure Plans page grid is responsive (2 cols on mobile, 3 on tablet, 4-5 on desktop)
5. Make each plan card visually distinct with its own color story (gradient bg, border, icon color, badge)
