import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Kpi, Card, SoWhat, DataTable, Verdict } from '../components/ui'
import { HBar, Combo, VBar, AMBER, TEAL } from '../components/charts'
import { totals, groupBy, monthly, fmtN, fmtP } from '../lib/analytics'

export default function Overview({ rows }) {
  const nav = useNavigate()
  const t = useMemo(() => totals(rows), [rows])
  const src = useMemo(() => groupBy(rows, 's'), [rows])
  const states = useMemo(() => groupBy(rows, 'st', { limit: 10 }), [rows])
  const degs = useMemo(() => groupBy(rows, 'dg', { limit: 8 }), [rows])
  const mon = useMemo(() => monthly(rows), [rows])
  const nonApi = src.filter(s => s.name !== 'API').reduce((a, s) => ({ leads: a.leads + s.leads, enrolled: a.enrolled + s.enrolled }), { leads: 0, enrolled: 0 })
  return <>
    <div className="grid g6">
      <Kpi label="Leads" value={fmtN(t.leads)} hint="in current selection" />
      <Kpi label="Verified" value={fmtN(t.verified)} hint={fmtP(t.verifiedPct) + ' of leads'} />
      <Kpi label="Forms initiated" value={fmtN(t.forms)} hint={fmtP(t.vToForm) + ' of verified'} tone="amber" />
      <Kpi label="Paid applications" value={fmtN(t.paid)} hint={fmtP(t.formToPaid) + ' of forms'} />
      <Kpi label="Enrolled" value={fmtN(t.enrolled)} hint={fmtP(t.enrolPct, 2) + ' lead to enrol'} tone="teal" />
      <Kpi label="Form → Enrol" value={fmtP(t.formToEnrol)} hint="closing rate once a form starts" />
    </div>
    <SoWhat>{fmtP(100 - t.vToForm, 0)} of verified leads never start an application form. Self-registered (Widget + Online) leads are {fmtP(t.leads ? (nonApi.leads / t.leads) * 100 : 0)} of leads and {fmtP(t.enrolled ? (nonApi.enrolled / t.enrolled) * 100 : 0, 0)} of enrolments.</SoWhat>
    <div className="grid g2">
      <Card title="Leads and form rate by month" sub="Volume peaked in July while form rate collapsed. Jul/Aug cohorts are not yet mature (avg 78 days to enrol).">
        <Combo data={mon} />
      </Card>
      <Card title="Form rate by source" sub="Forms initiated per 100 leads. Click a bar to open Source quality.">
        <VBar data={src.map(s => ({ ...s, label: s.name }))} dataKey="formPct" color={AMBER} fmt={v => fmtP(v, 1)} onClick={() => nav('/sources')} />
        <div className="grid g3" style={{ marginTop: 8 }}>{src.map(s => <div key={s.name} className="kpi" style={{ padding: '6px 0' }}><div className="lbl">{s.name}</div><div style={{ fontWeight: 700 }}>{fmtN(s.leads)} leads · {fmtN(s.enrolled)} enrolled</div><div className="hint">{fmtP(s.enrolPct, 2)} lead to enrol</div></div>)}</div>
      </Card>
    </div>
    <div className="grid g2">
      <Card title="Top 10 states by leads" sub="Click a state to drill into its cities.">
        <HBar data={states} onClick={d => nav('/geography?state=' + encodeURIComponent(d.name))} />
      </Card>
      <Card title="Top degrees: leads vs enrolments" sub="Click to open course analysis.">
        <DataTable rows={degs} nameLabel="Degree" cols={['leads', 'share', 'formPct', 'enrolled', 'enrolPct']} onRowClick={r => nav('/courses?degree=' + encodeURIComponent(r.name))} maxHeight={330} extra={{ label: 'Read', render: r => <Verdict r={r} avgForm={t.formPct} avgEnrol={t.enrolPct} /> }} />
      </Card>
    </div>
  </>
}
