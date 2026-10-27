import React, { useMemo, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import FilterBar from './components/FilterBar'
import { LEADS, applyFilters, EMPTY_FILTERS } from './lib/analytics'
import Overview from './pages/Overview'
import Funnel from './pages/Funnel'
import Sources from './pages/Sources'
import Geography from './pages/Geography'
import Courses from './pages/Courses'
import Engagement from './pages/Engagement'
import Insights from './pages/Insights'
import DataQuality from './pages/DataQuality'

const PAGES = {
  '/': ['Overview', 'Dashboard and summary insights', Overview, ['s', 'st', 'm', 'q', 'dg', 'dv']],
  '/funnel': ['Funnel and stage-wise drop-offs', 'Where leads are lost, and who they are', Funnel, ['s', 'st', 'm', 'q', 'dg']],
  '/sources': ['Source quality', 'API vs Widget vs Online, device and qualification profile', Sources, ['st', 'm', 'q', 'dg']],
  '/geography': ['State and city analysis', 'Drill from state to city to leads', Geography, ['s', 'm', 'q', 'dg']],
  '/courses': ['Course analysis', 'Degree, program and discipline', Courses, ['s', 'st', 'm', 'q']],
  '/engagement': ['Engagement and trends', 'Follow-up windows, weekly trend, day-of-week', Engagement, ['s', 'st', 'q', 'dg']],
  '/insights': ['Insights and observations', 'Key findings, recommendations and caveats', Insights, []],
  '/data-quality': ['Data quality', 'What the CRM is hiding from the team', DataQuality, ['s', 'st', 'm']],
}

function Page({ path, filters, setFilters }) {
  const [title, sub, Comp, keys] = PAGES[path]
  const rows = useMemo(() => applyFilters(LEADS, filters), [filters])
  return <Layout title={title} subtitle={sub}>
    {keys.length > 0 && <FilterBar filters={filters} setFilters={setFilters} keys={keys} />}
    <Comp rows={rows} />
  </Layout>
}

export default function App() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  return <Routes>
    {Object.keys(PAGES).map(p => <Route key={p} path={p} element={<Page path={p} filters={filters} setFilters={setFilters} />} />)}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
