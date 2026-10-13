import React, { useMemo, useState } from 'react'
import { Card, SoWhat, DataTable, Kpi } from '../components/ui'
import { VBar, Combo, TEAL, AMBER } from '../components/charts'
import { totals, engagementBuckets, weekly, groupBy, fmtN, fmtP } from '../lib/analytics'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export default function Engagement({ rows }) {
  const [sel, setSel] = useState('')
  const buckets = useMemo(() => engagementBuckets(rows), [rows])
  const wk = useMemo(() => weekly(rows), [rows])
  const enrolled = rows.filter(r => r.e)
  const avgDays = enrolled.length ? enrolled.reduce((a, r) => a + r.da, 0) / enrolled.length : 0
  const oneTouch = rows.filter(r => r.da === 0).length
  const dow = useMemo(() => { const m = {}; rows.forEach(r => { const d = new Date(r.d + 'T00:00:00').getDay(); const k = DOW[(d + 6) % 7]; m[k] = m[k] || { name: k, label: k, leads: 0, forms: 0 }; m[k].leads++; m[k].forms += r.f }); return DOW.map(k => m[k] || { name: k, label: k, leads: 0, forms: 0 }).map(x => ({ ...x, formPct: x.leads ? (x.forms / x.leads) * 100 : 0 })) }, [rows])
  const subRows = useMemo(() => { const b = buckets.find(x => x.name === sel); if (!b) return rows; const def = { 'Same day': [0, 0], '1 day': [1, 1], '2-7 days': [2, 7], '8-30 days': [8, 30], '31-90 days': [31, 90], '90+ days': [91, 9999] }[sel]; return rows.filter(r => r.da >= def[0] && r.da <= def[1]) }, [rows, sel, buckets])
  const subSrc = useMemo(() => groupBy(subRows, 's'), [subRows])
  const subSt = useMemo(() => groupBy(subRows, 'st', { limit: 8 }), [subRows])
  return <>
    <div className="grid g4">
      <Kpi label="One-touch leads" value={fmtN(oneTouch)} hint={fmtP(rows.length ? (oneTouch / rows.length) * 100 : 0) + ' have no activity after creation day'} tone="red" />
      <Kpi label="Working pipeline" value={fmtN(rows.length - oneTouch)} hint="leads with any activity beyond day 0" />
      <Kpi label="Avg days to enrol" value={avgDays.toFixed(0)} hint="creation to last activity, enrolled leads" tone="teal" />
      <Kpi label="Enrolments from one-touch leads" value={fmtN(rows.filter(r => r.e && r.da === 0).length)} hint="every enrolment needed 15+ days of engagement" />
    </div>
    <SoWhat>Form rate rises monotonically with days of engagement. Either follow-ups are not happening for API leads or they are happening off-CRM. A 48-hour second touch (call + WhatsApp) for every verified lead is the single cheapest lever in this data.</SoWhat>
    <div className="grid g2">
      <Card title="Form rate by engagement window" sub="Days between lead creation and last recorded activity. Click a bar to drill down.">
        <VBar data={buckets.map(b => ({ ...b, label: b.name }))} dataKey="formPct" color={TEAL} fmt={v => fmtP(v, 1)} onClick={d => setSel(sel === d.name ? '' : d.name)} selected={sel} />
        <DataTable rows={buckets} nameLabel="Window" cols={['leads', 'share', 'forms', 'formPct', 'enrolled', 'enrolPct']} onRowClick={r => setSel(sel === r.name ? '' : r.name)} selected={sel} maxHeight={240} />
      </Card>
      <Card title={sel ? `Who is in "${sel}"` : 'Who is in each window (select a bar)'} sub={`${fmtN(subRows.length)} leads`}>
        <h3>By source</h3><DataTable rows={subSrc} nameLabel="Source" cols={['leads', 'share', 'formPct', 'enrolled']} maxHeight={160} />
        <h3 style={{ marginTop: 12 }}>Top states</h3><DataTable rows={subSt} nameLabel="State" cols={['leads', 'share', 'formPct', 'enrolled']} maxHeight={220} />
      </Card>
    </div>
    <div className="grid g2">
      <Card title="Weekly leads and form rate" sub="Late-July spike at 500 leads/day looks like a batch feed.">
        <Combo data={wk} height={280} />
      </Card>
      <Card title="Day of week" sub="Leads by creation weekday and form rate. No strong weekday effect; Monday leads are slightly better.">
        <Combo data={dow} height={280} />
      </Card>
    </div>
  </>
}
