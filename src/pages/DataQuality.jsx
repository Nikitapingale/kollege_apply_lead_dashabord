import React, { useMemo } from 'react'
import { Card, SoWhat, Kpi } from '../components/ui'
import { dataQuality, fmtN, fmtP } from '../lib/analytics'

export default function DataQuality({ rows }) {
  const dq = useMemo(() => dataQuality(rows), [rows])
  const complete = rows.length ? (rows.filter(r => r.p !== 'Program Not Available' && r.q !== 'Not captured' && r.c !== 'City Not Available').length / rows.length) * 100 : 0
  return <>
    <div className="grid g4">
      <Kpi label="Completeness score" value={fmtP(complete, 1)} hint="leads with program, qualification and city filled" tone={complete < 80 ? 'red' : 'teal'} />
      <Kpi label="Unverified mobile" value={fmtN(dq[1].count)} hint={fmtP(dq[1].pct) + ' of leads'} />
      <Kpi label="No second touch logged" value={fmtN(dq[6].count)} hint={fmtP(dq[6].pct) + ' of leads'} tone="red" />
      <Kpi label="Program missing" value={fmtN(dq[2].count)} hint={fmtP(dq[2].pct) + ' of leads'} />
    </div>
    <SoWhat>Items 1, 3 and 7 should be fixed before the next monthly review; without them every course-level number is an estimate and "no follow-up" cannot be told apart from "not logged".</SoWhat>
    <Card title="Data quality audit" sub="Issues found while preparing the dump, counted on the current selection.">
      <div className="tblwrap" style={{ maxHeight: 600 }}><table className="tbl"><thead><tr><th>#</th><th>Issue</th><th className="num">Records</th><th className="num">% of leads</th><th>Fix</th></tr></thead>
        <tbody>{dq.map((x, i) => <tr key={i}><td>{i + 1}</td><td style={{ whiteSpace: 'normal' }}>{x.issue}</td><td className="num">{fmtN(x.count)}</td><td className="num">{fmtP(x.pct)}</td><td style={{ whiteSpace: 'normal' }}>{x.fix}</td></tr>)}</tbody></table></div>
    </Card>
    <Card title="Issues found in the raw file (not re-computable here)" sub="Fixed during preparation; listed for completeness.">
      <ul style={{ margin: '0 0 0 18px', lineHeight: 1.7, color: '#4A5568' }}>
        <li><b>Instance Date in two formats:</b> text "MM-DD-YYYY" for days 13-31; Excel dates with day and month swapped for days 1-12 (11,015 rows). Normalised before analysis. Recommend exporting dates as ISO YYYY-MM-DD.</li>
        <li><b>Email verified on 174 of 31,314 leads (0.6%).</b> Email nurture journeys reach almost nobody. Add double opt-in.</li>
        <li><b>1,434 probable duplicates</b> (same name + city). Real dedupe needs phone / email, which the dump does not carry.</li>
        <li><b>38 leads with no country</b>, 20 with no state.</li>
      </ul>
    </Card>
  </>
}
