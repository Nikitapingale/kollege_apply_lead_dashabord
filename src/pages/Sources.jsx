import React, { useMemo, useState } from 'react'
import { Card, SoWhat, DataTable, Kpi } from '../components/ui'
import { HBar, Combo, GroupedBar, AMBER, TEAL } from '../components/charts'
import { totals, groupBy, monthly, fmtN, fmtP } from '../lib/analytics'

export default function Sources({ rows }) {
  const [sel, setSel] = useState('')
  const src = useMemo(() => groupBy(rows, 's'), [rows])
  const dev = useMemo(() => groupBy(rows, 'dv'), [rows])
  const qual = useMemo(() => groupBy(rows, 'q'), [rows])
  const t = useMemo(() => totals(rows), [rows])
  const sub = useMemo(() => (sel ? rows.filter(r => r.s === sel) : rows), [rows, sel])
  const subMon = useMemo(() => monthly(sub), [sub])
  const subStates = useMemo(() => groupBy(sub, 'st', { limit: 10 }), [sub])
  const subDeg = useMemo(() => groupBy(sub, 'dg', { limit: 10 }), [sub])
  const shares = src.map(s => ({ name: s.name, leadShare: s.share, enrolShare: t.enrolled ? (s.enrolled / t.enrolled) * 100 : 0, formShare: t.forms ? (s.forms / t.forms) * 100 : 0 }))
  const nonApi = src.filter(s => s.name !== 'API')
  const need = nonApi.length && src.find(s => s.name === 'API')?.enrolPct ? Math.round((nonApi.reduce((a, s) => a + s.enrolled, 0)) / (src.find(s => s.name === 'API').enrolPct / 100)) : 0
  return <>
    <div className="grid g3">{src.map(s => <Kpi key={s.name} label={s.name} value={fmtP(s.formPct, 1) + ' form rate'} hint={`${fmtN(s.leads)} leads · ${fmtN(s.enrolled)} enrolled · ${fmtP(s.enrolPct, 2)} lead→enrol`} tone={s.name === 'API' ? '' : s.name === 'Widget' ? 'amber' : 'teal'} />)}</div>
    <SoWhat>Form-to-enrol is similar for every source ({src.map(s => `${s.name} ${fmtP(s.formToEnrol, 0)}`).join(', ')}), so counsellors close at the same rate regardless of origin. The gap is intent before the form. Matching the non-API enrolments through API alone would need roughly {fmtN(need)} more API leads.</SoWhat>
    <div className="grid g2">
      <Card title="Share of leads vs share of forms vs share of enrolments" sub="A source whose enrolment share exceeds its lead share is over-delivering.">
        <GroupedBar data={shares} keys={['leadShare', 'formShare', 'enrolShare']} names={['Share of leads', 'Share of forms', 'Share of enrolments']} colors={['#1F2A37', AMBER, TEAL]} />
      </Card>
      <Card title="Source funnel table" sub="Click a source to drill down (trend, states, degrees for that source).">
        <DataTable rows={src} nameLabel="Source" cols={['leads', 'share', 'verifiedPct', 'forms', 'formPct', 'paid', 'enrolled', 'enrolPct', 'formToEnrol']} onRowClick={r => setSel(sel === r.name ? '' : r.name)} selected={sel} maxHeight={200} />
        <h3 style={{ marginTop: 14 }}>By registration device</h3>
        <DataTable rows={dev} nameLabel="Device" cols={['leads', 'verifiedPct', 'formPct', 'enrolled', 'enrolPct']} maxHeight={200} />
      </Card>
    </div>
    <Card title={sel ? `Drill-down: ${sel}` : 'Drill-down: all sources (select a source above)'} sub="Monthly trend, top states and degrees for the selected source.">
      <div className="grid g3">
        <div><h3>Monthly</h3><Combo data={subMon} height={260} /></div>
        <div><h3>Top states</h3><HBar data={subStates} height={260} /></div>
        <div><h3>Top degrees</h3><HBar data={subDeg} height={260} color={TEAL} /></div>
      </div>
    </Card>
    <Card title="Lead profile by qualification level" sub="Post-graduates are tiny in volume and the highest-yield segment in the file.">
      <DataTable rows={qual} nameLabel="Qualification" cols={['leads', 'share', 'verifiedPct', 'forms', 'formPct', 'enrolled', 'enrolPct', 'formToEnrol']} maxHeight={260} />
    </Card>
  </>
}
