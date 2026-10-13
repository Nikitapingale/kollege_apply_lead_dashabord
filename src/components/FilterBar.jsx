import React from 'react'
import { uniq, DIMS, EMPTY_FILTERS, MONTH_LABEL } from '../lib/analytics'

const OPTIONS = { s: uniq('s'), st: uniq('st'), m: uniq('m'), q: uniq('q'), dg: uniq('dg'), dv: uniq('dv') }

export default function FilterBar({ filters, setFilters, keys = ['s', 'st', 'm', 'q', 'dg', 'dv'] }) {
  const active = Object.entries(filters).filter(([, v]) => v)
  const label = (k, v) => (k === 'm' ? MONTH_LABEL[v] + ' 2025' : v)
  return <div className="card" style={{ padding: '12px 18px' }}>
    <div className="filters">
      {keys.map(k => <label key={k}>{DIMS[k]}
        <select value={filters[k]} onChange={e => setFilters({ ...filters, [k]: e.target.value })}>
          <option value="">All</option>
          {OPTIONS[k].map(v => <option key={v} value={v}>{label(k, v)}</option>)}
        </select></label>)}
      {active.length > 0 && <button className="reset" onClick={() => setFilters(EMPTY_FILTERS)}>Reset filters</button>}
    </div>
    {active.length > 0 && <div className="chips" style={{ marginTop: 10 }}>{active.map(([k, v]) => <span className="chip" key={k}>{DIMS[k]}: {label(k, v)}<button onClick={() => setFilters({ ...filters, [k]: '' })}>×</button></span>)}</div>}
  </div>
}
