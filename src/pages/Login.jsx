import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/auth'

export default function Login() {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('')
  const nav = useNavigate()
  const submit = e => { e.preventDefault(); if (login(u, p)) nav('/'); else setErr('Invalid user ID or password.') }
  return <div className="login">
    <div className="left">
      <div className="brand" style={{ padding: 0 }}><div className="dot">K</div><div><b>Lead Intelligence</b><span>KollegeApply · College 1</span></div></div>
      <h2>31,314 leads. 90 enrolments.<br />Where the funnel leaks.</h2>
      <p>Interactive view of the College 1 admissions lead dump: funnel, source quality, geography, course mix, engagement and the recommendations that follow from them.</p>
      <div className="stats"><div><b>0.29%</b><span>lead to enrol</span></div><div><b>96%</b><span>verified leads never open a form</span></div><div><b>59%</b><span>of enrolments from 1.6% of leads</span></div></div>
    </div>
    <div className="right">
      <form onSubmit={submit}>
        <h3>Sign in</h3><p>Use the access credentials shared with you.</p>
        <label>User ID<input value={u} onChange={e => setU(e.target.value)} autoFocus autoComplete="username" placeholder="user id" /></label>
        <label>Password<input type="password" value={p} onChange={e => setP(e.target.value)} autoComplete="current-password" placeholder="password" /></label>
        {err && <div className="err">{err}</div>}
        <button type="submit">Open dashboard</button>
      </form>
    </div>
  </div>
}
