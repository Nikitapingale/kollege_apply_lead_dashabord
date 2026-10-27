import React from 'react'
import { NavLink } from 'react-router-dom'

const NAV = [
  ['/', '▦', 'Overview'], ['/funnel', '⇣', 'Funnel'], ['/sources', '◈', 'Source quality'], ['/geography', '◎', 'Geography'],
  ['/courses', '▤', 'Courses'], ['/engagement', '◷', 'Engagement'], ['/insights', '★', 'Insights & observations'], ['/data-quality', '⚠', 'Data quality'],
]
export default function Layout({ title, subtitle, children }) {
  return <div className="shell">
    <aside className="side">
      <div className="brand"><div className="dot">K</div><div><b>Lead Intelligence</b><span>College 1 · Mar–Aug 2025</span></div></div>
      <nav className="nav">{NAV.map(([to, ic, l]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}><span className="ic">{ic}</span>{l}</NavLink>)}</nav>
      <div className="foot">31,314 leads · 90 enrolments</div>
    </aside>
    <div className="main">
      <header className="topbar"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div><div className="crumb">Data: College 1 CRM dump · 7 Mar – 12 Aug 2025</div></header>
      <div className="content">{children}</div>
    </div>
  </div>
}
