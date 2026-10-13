import React, { useState, useMemo } from 'react'
import { fmtN, fmtP } from '../lib/analytics'

export function Kpi({ label, value, hint, tone }) {
  return <div className={`card kpi ${tone || ''}`}><div className="lbl">{label}</div><div className="val">{value}</div>{hint && <div className="hint">{hint}</div>}</div>
}

export function Card({ title, sub, children, right, style }) {
  return <div className="card" style={style}>
    {(title || right) && <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: sub ? 0 : 10 }}><div><h3>{title}</h3>{sub && <p className="sub">{sub}</p>}</div>{right}</div>}
    {children}
  </div>
}

export function SoWhat({ children }) { return <div className="sowhat"><b>So what</b><span>{children}</span></div> }

export const COLS = {
  leads: { label: 'Leads', fmt: fmtN },
  share: { label: 'Share', fmt: v => fmtP(v, 1) },
  verified: { label: 'Verified', fmt: fmtN },
  verifiedPct: { label: 'Verified %', fmt: v => fmtP(v, 1) },
  forms: { label: 'Forms', fmt: fmtN },
  formPct: { label: 'Form rate', fmt: v => fmtP(v, 2) },
  paid: { label: 'Paid', fmt: fmtN },
  submitted: { label: 'Submitted', fmt: fmtN },
  enrolled: { label: 'Enrolled', fmt: fmtN },
  enrolPct: { label: 'Lead→Enrol', fmt: v => fmtP(v, 2) },
  formToEnrol: { label: 'Form→Enrol', fmt: v => fmtP(v, 1) },
}

export function DataTable({ rows, nameLabel = 'Name', cols = ['leads', 'share', 'verifiedPct', 'forms', 'formPct', 'enrolled', 'enrolPct'], onRowClick, selected, barCol = 'leads', maxHeight = 440, extra }) {
  const [sort, setSort] = useState({ key: 'leads', dir: -1 })
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const av = a[sort.key], bv = b[sort.key]
    if (typeof av === 'string') return av.localeCompare(bv) * sort.dir
    return (av - bv) * sort.dir
  }), [rows, sort])
  const max = Math.max(...rows.map(r => r[barCol] || 0), 1)
  const th = (key, label, num = true) => <th className={num ? 'num' : ''} onClick={() => setSort(s => ({ key, dir: s.key === key ? -s.dir : -1 }))}>{label}{sort.key === key ? (sort.dir < 0 ? ' ▼' : ' ▲') : ''}</th>
  if (!rows.length) return <div className="empty">No rows for the current filters.</div>
  return <div className="tblwrap" style={{ maxHeight }}><table className="tbl">
    <thead><tr>{th('name', nameLabel, false)}{cols.map(c => th(c, COLS[c].label))}{extra && <th>{extra.label}</th>}</tr></thead>
    <tbody>{sorted.map(r => <tr key={r.name} className={(onRowClick ? 'click ' : '') + (selected === r.name ? 'sel' : '')} onClick={() => onRowClick && onRowClick(r)}>
      <td><span className="bar" style={{ width: Math.max(2, (r[barCol] / max) * 70) }} />{r.name}</td>
      {cols.map(c => <td key={c} className="num">{COLS[c].fmt(r[c])}</td>)}
      {extra && <td>{extra.render(r)}</td>}
    </tr>)}</tbody>
  </table></div>
}

export function Verdict({ r, avgForm, avgEnrol }) {
  if (r.leads < 100) return <span className="tag info">Small sample</span>
  if (r.enrolPct >= avgEnrol * 1.5 || r.formPct >= avgForm * 2) return <span className="tag good">Scale / test</span>
  if (r.leads >= 300 && r.enrolled === 0) return <span className="tag bad">Zero yield</span>
  if (r.formPct < avgForm * 0.7) return <span className="tag mid">Below average</span>
  return <span className="tag info">On par</span>
}
