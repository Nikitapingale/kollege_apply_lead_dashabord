import raw from '../data/leads.json'

// ---- decode dictionary-encoded rows into plain objects (once) ----
const C = raw.cols
const D = raw.dict
export const LEADS = raw.rows.map(r => {
  const o = {}
  C.forEach((k, i) => { o[k] = D[k] ? D[k][r[i]] : r[i] })
  return o
})
// field keys: s source, st state, c city, m month, d date, q qualification, dg degree,
// di discipline, p program, dv device, v verified, f form, pa paid, su submitted, e enrolled, da days to last activity

export const MONTH_LABEL = { '2025-03': 'Mar', '2025-04': 'Apr', '2025-05': 'May', '2025-06': 'Jun', '2025-07': 'Jul', '2025-08': 'Aug' }
export const uniq = (key, rows = LEADS) => [...new Set(rows.map(r => r[key]))].sort()

export const DIMS = {
  s: 'Source', st: 'State', c: 'City', m: 'Month', q: 'Qualification', dg: 'Degree', di: 'Discipline', p: 'Program', dv: 'Device'
}

export const EMPTY_FILTERS = { s: '', st: '', m: '', q: '', dg: '', dv: '' }

export function applyFilters(rows, f) {
  return rows.filter(r => (!f.s || r.s === f.s) && (!f.st || r.st === f.st) && (!f.m || r.m === f.m) && (!f.q || r.q === f.q) && (!f.dg || r.dg === f.dg) && (!f.dv || r.dv === f.dv))
}

export function totals(rows) {
  const t = { leads: rows.length, verified: 0, forms: 0, paid: 0, submitted: 0, enrolled: 0 }
  for (const r of rows) { t.verified += r.v; t.forms += r.f; t.paid += r.pa; t.submitted += r.su; t.enrolled += r.e }
  return withRates(t)
}
function withRates(t) {
  const pct = (a, b) => (b ? (a / b) * 100 : 0)
  t.verifiedPct = pct(t.verified, t.leads)
  t.formPct = pct(t.forms, t.leads)
  t.vToForm = pct(t.forms, t.verified)
  t.formToPaid = pct(t.paid, t.forms)
  t.paidToSub = pct(t.submitted, t.paid)
  t.enrolPct = pct(t.enrolled, t.leads)
  t.formToEnrol = pct(t.enrolled, t.forms)
  return t
}

// group rows by a key, return array of totals with 'name'
export function groupBy(rows, key, { minLeads = 0, sort = 'leads', limit } = {}) {
  const map = new Map()
  for (const r of rows) {
    const k = r[key]
    let t = map.get(k)
    if (!t) { t = { name: k, leads: 0, verified: 0, forms: 0, paid: 0, submitted: 0, enrolled: 0 }; map.set(k, t) }
    t.leads++; t.verified += r.v; t.forms += r.f; t.paid += r.pa; t.submitted += r.su; t.enrolled += r.e
  }
  let out = [...map.values()].map(withRates).filter(t => t.leads >= minLeads)
  const total = rows.length || 1
  out.forEach(t => { t.share = (t.leads / total) * 100 })
  if (sort === 'name') out.sort((a, b) => (a.name > b.name ? 1 : -1))
  else out.sort((a, b) => b[sort] - a[sort])
  return limit ? out.slice(0, limit) : out
}

export function monthly(rows) {
  return groupBy(rows, 'm', { sort: 'name' }).map(t => ({ ...t, label: MONTH_LABEL[t.name] || t.name }))
}

export function engagementBuckets(rows) {
  const def = [['Same day', 0, 0], ['1 day', 1, 1], ['2-7 days', 2, 7], ['8-30 days', 8, 30], ['31-90 days', 31, 90], ['90+ days', 91, 9999]]
  return def.map(([name, lo, hi]) => {
    const sub = rows.filter(r => r.da >= lo && r.da <= hi)
    return { name, ...totals(sub) }
  })
}

export function weekly(rows) {
  const map = new Map()
  for (const r of rows) {
    const d = new Date(r.d + 'T00:00:00')
    const day = (d.getDay() + 6) % 7 // Monday=0
    d.setDate(d.getDate() - day)
    const k = d.toISOString().slice(0, 10)
    let t = map.get(k); if (!t) { t = { name: k, leads: 0, forms: 0, enrolled: 0 }; map.set(k, t) }
    t.leads++; t.forms += r.f; t.enrolled += r.e
  }
  return [...map.values()].sort((a, b) => (a.name > b.name ? 1 : -1)).map(t => ({ ...t, label: new Date(t.name).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), formPct: t.leads ? (t.forms / t.leads) * 100 : 0 }))
}

export function dataQuality(rows) {
  const n = rows.length || 1
  const cnt = fn => rows.filter(fn).length
  const dupKey = new Map(); for (const r of rows) { const k = r.c + '|' + r.st; dupKey.set(k, (dupKey.get(k) || 0) + 1) }
  return [
    { issue: 'Course / Specialization / Campus columns blank in source', count: rows.length, fix: 'Repair CRM field mapping on API payload; Degree/Program used as proxy' },
    { issue: 'Mobile unverified', count: cnt(r => !r.v), fix: 'OTP retry + WhatsApp verification within 1 hour' },
    { issue: 'Program not captured', count: cnt(r => r.p === 'Program Not Available'), fix: 'Make program mandatory and student-chosen' },
    { issue: 'Qualification not captured', count: cnt(r => r.q === 'Not captured'), fix: 'Mandatory field on widget / API' },
    { issue: 'City not captured', count: cnt(r => r.c === 'City Not Available'), fix: 'Pin-code based city lookup' },
    { issue: 'Device not captured (API leads)', count: cnt(r => r.dv === 'Not captured (API)'), fix: 'Ask partners to pass device / UTM in payload' },
    { issue: 'No activity logged after creation day', count: cnt(r => r.da === 0), fix: 'Mandatory call disposition in CRM' },
    { issue: 'Enrolled without submitted-application flag', count: cnt(r => r.e && !r.su), fix: 'Enforce stage order in CRM' },
  ].map(x => ({ ...x, pct: (x.count / n) * 100 }))
}

export const fmtN = n => (n ?? 0).toLocaleString('en-IN')
export const fmtP = (n, d = 1) => `${(n ?? 0).toFixed(d)}%`
