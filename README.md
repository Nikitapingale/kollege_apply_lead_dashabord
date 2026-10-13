# Lead Intelligence Dashboard (College 1)

React + Vite dashboard built on the College 1 lead dump (31,314 leads, Mar-Aug 2025).

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173

Login: `kollegeapply` / `kollegeapply@1234`

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. In Vercel: New Project -> import the repo. Framework preset: Vite. Build command `npm run build`, output `dist`.
3. Deploy. `vercel.json` already handles client-side routing.

## Structure
- `src/data/leads.json` - lead-level data (dictionary-encoded to keep it small)
- `src/lib/analytics.js` - decoding, filtering and all aggregations
- `src/pages/*` - Overview, Funnel, Sources, Geography, Courses, Engagement, Insights, Data Quality
- `src/components/*` - KPI cards, filter bar, tables, chart wrappers
