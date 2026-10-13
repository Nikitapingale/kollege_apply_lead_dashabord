import React, { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, SoWhat, DataTable, Kpi, Verdict } from '../components/ui'
import { HBar, GroupedBar, TEAL, AMBER } from '../components/charts'
import { totals, groupBy, fmtN, fmtP } from '../lib/analytics'

export default function Courses({ rows }) {
  const [params] = useSearchParams()
  const [deg, setDeg] = useState(params.get('degree') || '')
  useEffect(() => { if (params.get('degree')) setDeg(params.get('degree')) }, [params])
  const t = useMemo(() => totals(rows), [rows])
  const degs = useMemo(() => groupBy(rows, 'dg'), [rows])
  const disc = useMemo(() => groupBy(rows, 'di', { limit: 15 }), [rows])
  const degRows = useMemo(() => (deg ? rows.filter(r => r.dg === deg) : rows), [rows, deg])
  const progs = useMemo(() => groupBy(degRows, 'p'), [degRows])
  const byEnrol = useMemo(() => groupBy(rows, 'p', { sort: 'enrolled', limit: 12 }), [rows])
  const dead = useMemo(() => groupBy(rows, 'p').filter(p => p.leads >= 300 && p.forms <= 2), [rows])
  const shares = degs.slice(0, 8).map(d => ({ name: d.name, leadShare: d.share, enrolShare: t.enrolled ? (d.enrolled / t.enrolled) * 100 : 0 }))
  const best = degs.filter(d => d.leads >= 300).sort((a, b) => b.enrolPct - a.enrolPct)[0]
  return <>
    <div className="grid g4">
      <Kpi label="Degrees" value={degs.length} hint="distinct degree values" />
      <Kpi label="Programs" value={fmtN(groupBy(rows, 'p').length)} hint="distinct program values" />
      <Kpi label="Best degree (300+ leads)" value={best?.name || '-'} hint={best ? `${fmtP(best.enrolPct, 2)} lead→enrol, ${fmtN(best.enrolled)} enrolled` : ''} tone="teal" />
      <Kpi label="Noise programs" value={dead.length} hint={`300+ leads each, ≤2 forms: ${fmtN(dead.reduce((a, p) => a + p.leads, 0))} leads`} tone="red" />
    </div>
    <SoWhat>Course, Specialization and Campus are blank in the source, so Degree / Discipline / Program are used instead. 18 B.Tech specialisations carry 330-375 leads each with 0-2 forms: near-identical counts suggest program is auto-assigned at ingestion for API leads, not chosen by the student.</SoWhat>
    <div className="grid g2">
      <Card title="Share of leads vs share of enrolments by degree" sub="Degrees whose enrolment share exceeds lead share are over-delivering (MCA), under-delivering ones are inflated by low-intent leads (B.Tech).">
        <GroupedBar data={shares} keys={['leadShare', 'enrolShare']} names={['Share of leads %', 'Share of enrolments %']} />
      </Card>
      <Card title="Degrees" sub="Click a degree to drill into its programs." right={deg && <button className="btn" onClick={() => setDeg('')}>Clear</button>}>
        <DataTable rows={degs} nameLabel="Degree" cols={['leads', 'share', 'formPct', 'enrolled', 'enrolPct', 'formToEnrol']} onRowClick={r => setDeg(deg === r.name ? '' : r.name)} selected={deg} maxHeight={330} extra={{ label: 'Read', render: r => <Verdict r={r} avgForm={t.formPct} avgEnrol={t.enrolPct} /> }} />
      </Card>
    </div>
    <div className="grid g2">
      <Card title={deg ? `Programs under ${deg}` : 'Programs (all degrees)'} sub={`${fmtN(progs.length)} programs · ${fmtN(degRows.length)} leads`}>
        <DataTable rows={progs} nameLabel="Program" cols={['leads', 'share', 'formPct', 'paid', 'enrolled', 'enrolPct']} maxHeight={420} />
      </Card>
      <Card title="Programs ranked by enrolments" sub="Where the 90 enrolments actually come from.">
        <HBar data={byEnrol} dataKey="enrolled" color={TEAL} height={420} labelWidth={230} />
      </Card>
    </div>
    <div className="grid g2">
      <Card title="Discipline interested in" sub="Top 15 by leads.">
        <DataTable rows={disc} nameLabel="Discipline" cols={['leads', 'share', 'formPct', 'enrolled', 'enrolPct']} maxHeight={360} />
      </Card>
      <Card title="Noise programs: 300+ leads, 2 or fewer forms" sub="Stop paying for these until program tagging is fixed.">
        <DataTable rows={dead} nameLabel="Program" cols={['leads', 'verifiedPct', 'forms', 'enrolled']} maxHeight={360} />
      </Card>
    </div>
  </>
}
