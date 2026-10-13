import React, { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, SoWhat, DataTable, Kpi, Verdict } from '../components/ui'
import { HBar, TEAL, AMBER } from '../components/charts'
import { totals, groupBy, fmtN, fmtP } from '../lib/analytics'

export default function Geography({ rows }) {
  const [params, setParams] = useSearchParams()
  const [state, setState] = useState(params.get('state') || '')
  const [city, setCity] = useState('')
  useEffect(() => { if (params.get('state')) setState(params.get('state')) }, [params])
  const t = useMemo(() => totals(rows), [rows])
  const states = useMemo(() => groupBy(rows, 'st'), [rows])
  const stateRows = useMemo(() => (state ? rows.filter(r => r.st === state) : rows), [rows, state])
  const cities = useMemo(() => groupBy(stateRows, 'c'), [stateRows])
  const cityRows = useMemo(() => (city ? stateRows.filter(r => r.c === city) : stateRows), [stateRows, city])
  const zero = useMemo(() => groupBy(rows, 'c').filter(c => c.leads >= 300 && c.enrolled === 0), [rows])
  const top5 = states.slice(0, 5).reduce((a, s) => a + s.share, 0)
  const pick = s => { setState(s === state ? '' : s); setCity(''); setParams(s === state ? {} : { state: s }) }
  const byDeg = useMemo(() => groupBy(cityRows, 'dg', { limit: 8 }), [cityRows])
  const bySrc = useMemo(() => groupBy(cityRows, 's'), [cityRows])
  const byProg = useMemo(() => groupBy(cityRows, 'p', { limit: 10 }), [cityRows])
  return <>
    <div className="grid g4">
      <Kpi label="States / UTs" value={states.length} hint={`top 5 = ${fmtP(top5, 0)} of leads`} />
      <Kpi label="Cities" value={fmtN(cities.length)} hint={state ? `in ${state}` : 'in selection'} />
      <Kpi label="Best big state" value={(states.filter(s => s.leads >= 1000).sort((a, b) => b.enrolPct - a.enrolPct)[0] || {}).name || '-'} hint="highest lead→enrol among 1,000+ leads" tone="teal" />
      <Kpi label="Zero-yield cities" value={zero.length} hint={`${fmtN(zero.reduce((a, c) => a + c.leads, 0))} leads with 300+ each, no enrolment`} tone="red" />
    </div>
    <SoWhat>Verification rate is flat across states (43-52%), so state differences are about intent, not data quality. Delhi and Chandigarh together supply {fmtN(states.filter(s => ['Delhi', 'Chandigarh'].includes(s.name)).reduce((a, s) => a + s.leads, 0))} leads for {fmtN(states.filter(s => ['Delhi', 'Chandigarh'].includes(s.name)).reduce((a, s) => a + s.enrolled, 0))} enrolment. Kerala, Uttarakhand and Tamil Nadu show 3-5x the average form rate on small volume.</SoWhat>
    <div className="grid g2">
      <Card title="States" sub="Click a state to drill into its cities." right={state && <button className="btn" onClick={() => pick(state)}>Clear state</button>}>
        <HBar data={states.slice(0, 12)} height={360} onClick={d => pick(d.name)} selected={state} />
        <DataTable rows={states} nameLabel="State" cols={['leads', 'share', 'verifiedPct', 'formPct', 'enrolled', 'enrolPct']} onRowClick={r => pick(r.name)} selected={state} maxHeight={300} extra={{ label: 'Read', render: r => <Verdict r={r} avgForm={t.formPct} avgEnrol={t.enrolPct} /> }} />
      </Card>
      <Card title={state ? `Cities in ${state}` : 'Cities (all states)'} sub="Click a city to drill through to its leads." right={city && <button className="btn" onClick={() => setCity('')}>Clear city</button>}>
        <HBar data={cities.slice(0, 12)} height={360} color={TEAL} onClick={d => setCity(d.name === city ? '' : d.name)} selected={city} />
        <DataTable rows={cities} nameLabel="City" cols={['leads', 'share', 'formPct', 'enrolled', 'enrolPct']} onRowClick={r => setCity(city === r.name ? '' : r.name)} selected={city} maxHeight={300} extra={{ label: 'Read', render: r => <Verdict r={r} avgForm={t.formPct} avgEnrol={t.enrolPct} /> }} />
      </Card>
    </div>
    <Card title={`Drill-through: ${city || state || 'all geographies'}`} sub={`${fmtN(cityRows.length)} leads · ${fmtN(totals(cityRows).forms)} forms · ${fmtN(totals(cityRows).enrolled)} enrolled`}>
      <div className="grid g3">
        <div><h3>By source</h3><DataTable rows={bySrc} nameLabel="Source" cols={['leads', 'formPct', 'enrolled']} maxHeight={220} /></div>
        <div><h3>By degree</h3><DataTable rows={byDeg} nameLabel="Degree" cols={['leads', 'formPct', 'enrolled']} maxHeight={220} /></div>
        <div><h3>Top programs</h3><DataTable rows={byProg} nameLabel="Program" cols={['leads', 'forms', 'enrolled']} maxHeight={220} /></div>
      </div>
    </Card>
    <Card title="Cities with 300+ leads and zero enrolments" sub="The cut list. Together these are a quarter of the dump.">
      <DataTable rows={zero} nameLabel="City" cols={['leads', 'share', 'verifiedPct', 'forms', 'formPct', 'enrolled']} maxHeight={300} />
    </Card>
  </>
}
