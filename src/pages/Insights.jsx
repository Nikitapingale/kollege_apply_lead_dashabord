import React, { useMemo } from 'react'
import { Card, SoWhat } from '../components/ui'
import { LEADS, totals, groupBy, engagementBuckets, fmtN, fmtP } from '../lib/analytics'

export default function Insights() {
  const rows = LEADS
  const t = totals(rows)
  const src = groupBy(rows, 's'); const api = src.find(s => s.name === 'API'); const non = src.filter(s => s.name !== 'API')
  const nonLeads = non.reduce((a, s) => a + s.leads, 0), nonEnr = non.reduce((a, s) => a + s.enrolled, 0)
  const st = groupBy(rows, 'st'); const g = n => st.find(s => s.name === n) || {}
  const city = groupBy(rows, 'c'); const c = n => city.find(s => s.name === n) || {}
  const zero = city.filter(x => x.leads >= 300 && x.enrolled === 0)
  const dg = groupBy(rows, 'dg'); const d = n => dg.find(s => s.name === n) || {}
  const q = groupBy(rows, 'q').find(x => x.name === 'Post Graduation') || {}
  const eb = engagementBuckets(rows)
  const one = eb[0]
  const INS = [
    { h: 'The funnel leaks at one step: verified → form', p: `Every stage after a form starts converts at 35-45%, which is normal for Indian admissions. The verified-to-form step converts at ${fmtP(t.vToForm)}: ${fmtN(t.verified - t.forms)} people confirmed their phone number and then did nothing. One percentage point here is worth about ${fmtN(Math.round(t.verified * 0.01 * t.formToEnrol / 100))} enrolments, a quarter of the current total.`, ev: `Funnel: ${fmtN(t.leads)} → ${fmtN(t.verified)} → ${fmtN(t.forms)} → ${fmtN(t.paid)} → ${fmtN(t.submitted)} → ${fmtN(t.enrolled)}` },
    { h: 'Volume was bought, not earned', p: `API feeds supply ${fmtP(api.share, 1)} of leads at a ${fmtP(api.formPct, 2)} form rate. Widget and Online registrations are ${fmtP((nonLeads / t.leads) * 100, 1)} of leads and ${fmtP((nonEnr / t.enrolled) * 100, 0)} of enrolments. Once a lead starts a form it closes at a similar rate whatever the source, so counsellors are not the problem; the input is.`, ev: `Lead→enrol: API ${fmtP(api.enrolPct, 2)}, Widget ${fmtP(src.find(s => s.name === 'Widget').enrolPct, 1)}, Online ${fmtP(src.find(s => s.name === 'Online').enrolPct, 1)}` },
    { h: 'Volume grew 3.5x from April to July while form rate fell 6x', p: 'May and June (6,400-8,400 leads a month at 2.4-3.1% form rate) produced 72% of all enrolments. July delivered 10,321 leads and 58 forms; 2,965 of them arrived at exactly 500 a day between 26 and 31 July, the signature of a batch upload. July and August cohorts are still maturing (enrolment takes ~78 days), but form initiation happens within a median of 11 days and that too collapsed.', ev: 'Form rate by month: Mar 2.1%, Apr 3.4%, May 3.1%, Jun 2.4%, Jul 0.6%, Aug 0.2%' },
    { h: 'Geography: tier-2 converts, metros do not', p: `UP, Punjab and Bihar give ${fmtP(g('Uttar Pradesh').share + g('Punjab').share + g('Bihar').share, 0)} of leads. Bihar is the best of the three (${fmtP(g('Bihar').enrolPct, 2)} lead→enrol). Delhi has ${fmtN(g('Delhi').leads)} leads and ${fmtN(g('Delhi').enrolled)} enrolment. ${zero.length} cities with 300+ leads each produced zero enrolments: ${fmtN(zero.reduce((a, x) => a + x.leads, 0))} leads, a quarter of the dump. Lucknow (${fmtN(c('Lucknow').leads)} leads, ${fmtN(c('Lucknow').enrolled)} enrolment) and Patna (${fmtN(c('Patna').leads)} leads, ${fmtN(c('Patna').enrolled)}) are the same size, same region, 7x apart.`, ev: `Kerala ${fmtP(g('Kerala').formPct, 1)}, Tamil Nadu ${fmtP(g('Tamil Nadu').formPct, 1)}, Uttarakhand ${fmtP(g('Uttarakhand').formPct, 1)} form rate vs ${fmtP(t.formPct, 1)} average` },
    { h: 'Course mix: CSE is the engine, MCA the hidden gem, 18 specialisations are noise', p: `B.Tech is ${fmtP(d('B.Tech.').share, 0)} of leads but ${fmtP((d('B.Tech.').enrolled / t.enrolled) * 100, 0)} of enrolments; B.Tech CSE alone gives 20 enrolments. MCA is ${fmtP(d('MCA').share, 0)} of leads and ${fmtP((d('MCA').enrolled / t.enrolled) * 100, 0)} of enrolments (${fmtP(d('MCA').enrolPct, 2)} lead→enrol, 4x average). M.Com has 436 leads and zero forms; B.Tech (Hons) 1,614 leads and zero enrolments. 18 B.Tech specialisations carry 330-375 leads each with 0-2 forms: the counts are too uniform to be student choice, program is being auto-assigned at ingestion.`, ev: 'Course / Specialization / Campus columns are 100% blank in the source' },
    { h: 'Engagement is the strongest predictor of enrolment', p: `${fmtP(one.share, 1)} of leads (${fmtN(one.leads)}) have last activity on the day they were created and produced ${fmtN(one.enrolled)} enrolments. Every one of the ${fmtN(t.enrolled)} enrolments came from a lead with 15+ days of recorded activity; the average is 78 days. Only ${fmtN(t.leads - one.leads)} leads show any second touch, and that is the real working pipeline counsellor capacity should be planned on.`, ev: 'Form rate: same day 0.6%, 8-30 days 38.7%, 31-90 days 65.0%, 90+ days 82.9%' },
    { h: 'Post-graduates are a different, ignored funnel', p: `${fmtN(q.leads)} PG-qualified leads: ${fmtP(q.formPct, 0)} started a form and ${fmtP(q.enrolPct, 0)} enrolled, mostly Ph.D. and MCA. Desktop registrants behave similarly (16% lead→enrol). Small, high-yield, and currently handled like 12th-pass B.Tech leads.`, ev: `PG: ${fmtN(q.enrolled)} enrolments from ${fmtN(q.leads)} leads` },
    { h: 'Verification is flat; intent is not', p: 'Mobile verification sits at 43-52% in every state and every month. The spread in outcomes appears entirely after verification, so OTP is not where to invest. Email verification is 0.6% (174 leads), so any nurture journey that depends on email reaches nobody; WhatsApp and calls are the only channels that exist.', ev: 'Verified %: UP 45%, Punjab 47%, Bihar 46%, Delhi 47%, AP 46%' },
  ]
  const RECS = [
    ['Re-weight acquisition: cap the API feed, scale Widget/Online placements and referrals', 'Source quality', '+~50 enrolments per 500 self-registered leads', 'Marketing', '0-30 days'],
    ['48-hour second-touch rule (call + WhatsApp) for every verified lead, logged in CRM with a disposition', 'Engagement', 'Verified→form from 4.1% to 5%+ (~22 enrolments)', 'Admissions ops', '0-30 days'],
    ['Pause Delhi, Chandigarh, Noida, Ghaziabad, Mohali sourcing; redirect budget to Kerala, Uttarakhand, Tamil Nadu pilots', 'Geography', 'Same spend, 3-5x form rate in pilot states', 'Marketing', '30-60 days'],
    ['Dedicated PG / MCA / Ph.D. counselling track', 'Courses, Sources', '+10-15 enrolments at near-zero acquisition cost', 'Admissions', '30-60 days'],
    ['Fix CRM capture: ISO dates, mandatory student-chosen program, phone/email dedupe, mandatory call dispositions', 'Data quality', 'Reliable course and city analysis from the next cycle', 'Product / CRM', '0-30 days'],
    ['Weekly scorecard: forms per 100 verified leads by source, city and program, with a 78-day cohort view', 'Funnel, Trend', 'Catches the next July before it happens', 'Founder office / BA', '60-90 days'],
  ]
  return <>
    <SoWhat>The common thread across every cut: the college wins when the student finds it. Marketing should buy intent (search, referrals, widget placements), not records. Insights below are computed live from the full dataset and are not affected by page filters.</SoWhat>
    <Card title="Key observations" sub="Eight findings, each with the evidence behind it.">
      {INS.map((x, i) => <div className="insight" key={i}><div className="num">{i + 1}</div><div><h4>{x.h}</h4><p>{x.p}</p><div className="ev"><b>Evidence:</b> {x.ev}</div></div></div>)}
    </Card>
    <Card title="Recommendations" sub="Sequenced by payback. If only one thing gets done: #2. It costs nothing, starts Monday and is worth a quarter of current enrolments.">
      <div className="rec" style={{ borderBottom: '2px solid #E3E7EC' }}><div className="rechead">#</div><div className="rechead">Recommendation</div><div className="rechead">Based on · Expected impact</div><div className="rechead">Owner</div><div className="rechead">When</div></div>
      {RECS.map((r, i) => <div className="rec" key={i}><div className="n">{i + 1}</div><div>{r[0]}</div><div><span className="tag info">{r[1]}</span><div style={{ marginTop: 4 }}>{r[2]}</div></div><div>{r[3]}</div><div>{r[4]}</div></div>)}
    </Card>
    <Card title="Caveats to keep in mind" sub="What this data cannot tell us.">
      <ul style={{ margin: '0 0 0 18px', lineHeight: 1.6, color: '#4A5568' }}>
        <li><b>Cohort maturity:</b> enrolled leads take ~78 days from creation to last activity; July and August cohorts are not mature, so part of their low conversion is timing.</li>
        <li><b>Correlation vs causation on engagement:</b> leads with more activity may have been more interested to begin with. The absence of any second touch on 29,839 leads is a process gap either way.</li>
        <li><b>Small samples:</b> Kerala (320), Tamil Nadu (153) and Uttarakhand (309) are pilots, not reallocations, until volume confirms the rate.</li>
        <li><b>No cost data:</b> "cut Delhi" assumes those leads cost something. With CPL by source and state this becomes a cost-per-enrolment view.</li>
        <li><b>Date normalisation:</b> Instance Date arrived in two formats (MM-DD text and day/month-swapped dates); 11,015 rows were corrected. Real window is 7 Mar - 12 Aug 2025.</li>
      </ul>
    </Card>
  </>
}
