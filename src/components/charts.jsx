import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ComposedChart, Line, Legend, Cell } from 'recharts'
import { fmtN, fmtP } from '../lib/analytics'

export const INK = '#1F2A37', AMBER = '#E0A526', TEAL = '#2A9D8F', RED = '#C0392B', GREY = '#CBD5E0'
const axis = { tick: { fontSize: 11, fill: '#4A5568' }, axisLine: false, tickLine: false }
const tip = { contentStyle: { borderRadius: 8, border: '1px solid #E3E7EC', fontSize: 12 } }

export function HBar({ data, dataKey = 'leads', color = INK, height = 320, fmt = fmtN, onClick, selected, labelWidth = 120 }) {
  return <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout="vertical" margin={{ left: 4, right: 48, top: 4, bottom: 4 }} barCategoryGap={6}>
      <CartesianGrid horizontal={false} stroke="#EEF1F4" />
      <XAxis type="number" hide />
      <YAxis type="category" dataKey="name" width={labelWidth} {...axis} />
      <Tooltip {...tip} formatter={v => fmt(v)} />
      <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} onClick={d => onClick && onClick(d)} cursor={onClick ? 'pointer' : 'default'}>
        {data.map(d => <Cell key={d.name} fill={selected && selected !== d.name ? GREY : color} />)}
        <LabelList dataKey={dataKey} position="right" formatter={fmt} style={{ fontSize: 11, fill: '#1F2A37' }} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
}

export function VBar({ data, dataKey = 'leads', color = INK, height = 280, fmt = fmtN, xKey = 'label', onClick, selected }) {
  return <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ left: 4, right: 8, top: 18, bottom: 4 }}>
      <CartesianGrid vertical={false} stroke="#EEF1F4" />
      <XAxis dataKey={xKey} {...axis} />
      <YAxis hide />
      <Tooltip {...tip} formatter={v => fmt(v)} />
      <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} onClick={d => onClick && onClick(d)} cursor={onClick ? 'pointer' : 'default'}>
        {data.map(d => <Cell key={d[xKey]} fill={selected && selected !== d.name ? GREY : color} />)}
        <LabelList dataKey={dataKey} position="top" formatter={fmt} style={{ fontSize: 11, fill: '#1F2A37' }} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
}

export function Combo({ data, barKey = 'leads', lineKey = 'formPct', height = 300, xKey = 'label', barName = 'Leads', lineName = 'Form rate %' }) {
  return <ResponsiveContainer width="100%" height={height}>
    <ComposedChart data={data} margin={{ left: 4, right: 8, top: 18, bottom: 4 }}>
      <CartesianGrid vertical={false} stroke="#EEF1F4" />
      <XAxis dataKey={xKey} {...axis} />
      <YAxis yAxisId="l" hide />
      <YAxis yAxisId="r" orientation="right" hide />
      <Tooltip {...tip} formatter={(v, n) => (n === lineName ? fmtP(v, 2) : fmtN(v))} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Bar yAxisId="l" dataKey={barKey} name={barName} fill={INK} radius={[4, 4, 0, 0]}><LabelList dataKey={barKey} position="top" formatter={fmtN} style={{ fontSize: 11 }} /></Bar>
      <Line yAxisId="r" dataKey={lineKey} name={lineName} stroke={AMBER} strokeWidth={3} dot={{ r: 4, fill: AMBER }}><LabelList dataKey={lineKey} position="top" formatter={v => fmtP(v, 1)} style={{ fontSize: 11, fill: '#B27F0E' }} /></Line>
    </ComposedChart>
  </ResponsiveContainer>
}

export function GroupedBar({ data, keys, names, colors = [INK, AMBER], height = 300, xKey = 'name', fmt = v => fmtP(v, 1) }) {
  return <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ left: 4, right: 8, top: 18, bottom: 4 }}>
      <CartesianGrid vertical={false} stroke="#EEF1F4" />
      <XAxis dataKey={xKey} {...axis} />
      <YAxis hide />
      <Tooltip {...tip} formatter={v => fmt(v)} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      {keys.map((k, i) => <Bar key={k} dataKey={k} name={names[i]} fill={colors[i]} radius={[4, 4, 0, 0]}><LabelList dataKey={k} position="top" formatter={fmt} style={{ fontSize: 10 }} /></Bar>)}
    </BarChart>
  </ResponsiveContainer>
}
