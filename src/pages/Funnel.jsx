import React, { useMemo, useState } from 'react'
import { Card, SoWhat, DataTable, Kpi } from '../components/ui'
import { HBar, AMBER, TEAL } from '../components/charts'
import { totals, groupBy, fmtN, fmtP } from '../lib/analytics'

const STAGES = [
  ['Total leads', r => true], ['Verified (mobile OTP)', r => r.v], ['Form initiated', r => r.f], ['Paid application', r => r.pa], ['Submitted application', r => r.su], ['Enrolled', r => r.e],
]
export default function Funnel({ rows }) {
  const [sel, setSel] = useState(1)
  const [dim, setDim] = useState('s')
  const stages = useMemo(() => {
    let prev = rows.length
    return STAGES.map(([name, fn], i) => { const n = rows.filter(fn).length; const o = { name, n, step: i ? (prev ? (n / prev) * 100 : 0) : 100, overall: rows.length ? (n / rows.length) * 100 : 0, lost: i ? prev - n : 0 }; prev = n; return o })
  }, [rows])
  const max = stages[0].n || 1
  const t = useMemo(() => totals(rows), [rows])
  const dropped = useMemo(() => {
    const [, fnPrev] = STAGES[Math.max(sel - 1, 0)]; const [, fn] = STAGES[sel]
    const sub = rows.filter(r => fnPrev(r) && !fn(r))
    return { sub, by: groupBy(sub, dim, { limit: 15 }) }
  }, [rows, sel, dim])
  const uplift = Math.round(t.verified * 0.01 * (t.formToEnrol / 100))
  return <>
    <div className="grid g4">
      <Kpi label="Verified → form" value={fmtP(t.vToForm)} hint="the leak" tone="red" />
      <Kpi label="Form → paid" value={fmtP(t.formToPaid)} hint="healthy" />
      <Kpi label="Paid → submitted" value={fmtP(t.paidToSub)} hint="healthy" />
      <Kpi label="+1 pt verified→form" value={'+' + fmtN(uplift) + ' enrolments'} hint={`≈ ${fmtN(Math.round(t.verified * 0.01))} more forms at current downstream rates`} tone="teal" />
    </div>
    <SoWhat>Every step after form initiation converts at 35-45%. The verified-to-form step is where {fmtN(stages[1].n - stages[2].n)} leads disappear. Click a stage below to see who was lost there.</SoWhat>
    <div className="grid g2">
      <Card title="Lead to enrolment funnel" sub="Click a stage to analyse the drop-off into it.">
        <div className="funnelrow" style={{ cursor: 'default', fontSize: 11, color: '#8A8F98', textTransform: 'uppercase' }}><div>Stage</div><div /><div className="n">Count</div><div className="n">Step %</div><div className="n">Overall %</div></div>
        {stages.map((s, i) => <div key={s.name} className={'funnelrow' + (sel === i ? ' sel' : '')} onClick={() => i && setSel(i)}>
          <div style={{fontSize:12.5}}>{s.name}</div><div><div className="fb" style={{ width: Math.max(0.6, (s.n / max) * 100) + '%', background: i === 2 ? AMBER : i === 5 ? TEAL : undefined }} /></div>
          <div className="n"><b>{fmtN(s.n)}</b></div><div className="n">{i ? fmtP(s.step) : ''}</div><div className="n">{fmtP(s.overall, 2)}</div>
        </div>)}
        <div className="note">Enrolled can exceed submitted: 3 records are flagged enrolled without a submitted flag (CRM does not enforce stage order).</div>
      </Card>
      <Card title={`Lost between "${STAGES[sel - 1][0]}" and "${STAGES[sel][0]}"`} sub={`${fmtN(dropped.sub.length)} leads reached the previous stage but not this one. Break down by:`}
        right={<select value={dim} onChange={e => setDim(e.target.value)} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #E3E7EC' }}>
          <option value="s">Source</option><option value="st">State</option><option value="c">City</option><option value="dg">Degree</option><option value="q">Qualification</option><option value="m">Month</option></select>}>
        <HBar data={dropped.by.slice(0, 10)} dataKey="leads" height={300} />
        <DataTable rows={dropped.by} nameLabel="Segment" cols={['leads', 'share']} maxHeight={200} />
      </Card>
    </div>
  </>
}
