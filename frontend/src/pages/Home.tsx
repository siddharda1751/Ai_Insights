import { Link } from 'react-router-dom'

const steps = [
  { n: '01', title: 'Submit Details', desc: 'Fill in your company info — takes under 60 seconds.', icon: '✏️' },
  { n: '02', title: 'AI Research', desc: 'Gemini AI enriches your data from public sources.', icon: '🤖' },
  { n: '03', title: 'Report Generated', desc: 'A branded PDF audit is compiled with tailored insights.', icon: '📄' },
  { n: '04', title: 'Delivered to Inbox', desc: 'Your personalized report lands in your email instantly.', icon: '📬' },
]

const features = [
  { icon: '⚡', title: 'Under 5 Minutes', desc: 'Full pipeline from submit to email delivery. No human in the loop.' },
  { icon: '🎯', title: 'Hyper-Personalized', desc: 'Every report is uniquely generated for your company — not templated.' },
  { icon: '🤖', title: 'Gemini AI Powered', desc: "Google's Gemini Flash analyzes your company and crafts contextual insights." },
  { icon: '📄', title: 'Professional PDF', desc: 'Beautifully designed audit report, ready to share with stakeholders.' },
  { icon: '🔄', title: 'Zero Manual Work', desc: 'Scrape → AI → PDF → Email. Fully async, fully automated.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Your data is only used to generate your report and is never shared.' },
]

const reportItems = [
  'Company Overview & Context',
  'Target Audience Analysis',
  'Industry Trends & Market Position',
  'Identified Business Pain Points',
  'AI Automation Opportunities',
  'Strategic Recommendations',
  'Competitive Landscape Snapshot',
]

export default function Home() {
  return (
    <div className="hero-bg" style={{ width: '100%' }}>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ width: '100%', paddingTop: 96, paddingBottom: 80 }}>
        <div className="section-container" style={{ textAlign: 'center' }}>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 100,
            border: '1px solid rgba(96,165,250,0.3)',
            background: 'rgba(96,165,250,0.08)',
            color: '#93c5fd', fontSize: 13, fontWeight: 500, marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Fully automated · AI-powered · Instant delivery
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 72px)',
            fontWeight: 900, color: 'white',
            lineHeight: 1.1, letterSpacing: '-2px',
            marginBottom: 24,
          }}>
            Turn leads into<br />
            <span className="gradient-text">personalized insights</span>
          </h1>

          <p style={{
            fontSize: 18, color: '#94a3b8', lineHeight: 1.7,
            maxWidth: 520, margin: '0 auto 40px',
          }}>
            Submit your company. Get a professional AI-generated business audit
            delivered to your inbox — automatically, in minutes.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/form" className="btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
              Generate My Report →
            </Link>
            <a href="#how-it-works" style={{
              padding: '14px 32px', fontSize: 16, fontWeight: 500,
              color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 64, marginTop: 64, flexWrap: 'wrap' }}>
            {[['< 5 min', 'Report delivery'], ['100%', 'Automated'], ['AI-first', 'Architecture']].map(([stat, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 4 }}>{stat}</div>
                <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ width: '100%', padding: '96px 0' }}>
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, color: '#60a5fa', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>The Process</p>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {steps.map((s) => (
              <div key={s.n} className="glass-card" style={{ padding: 28 }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: '#334155', fontWeight: 700, fontFamily: 'monospace', marginBottom: 8 }}>{s.n}</div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── What's in the Report ─────────────────────────────────────────── */}
      <section style={{ width: '100%', padding: '96px 0' }}>
        <div className="section-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>The Output</p>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: 'white', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 20 }}>
                What's inside<br />your report
              </h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 32, fontSize: 15 }}>
                Every report is uniquely crafted by Gemini AI using data scraped from your company's public presence. No templates. No generic copy.
              </p>
              <Link to="/form" className="btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
                Get My Report →
              </Link>
            </div>
            <div className="glass-card" style={{ padding: 32 }}>
              {reportItems.map((item, i) => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 0',
                  borderBottom: i < reportItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section style={{ width: '100%', padding: '96px 0' }}>
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, color: '#f472b6', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Why InsightAI</p>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>Built for speed.<br />Designed for impact.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} className="glass-card" style={{ padding: 28, transition: 'transform 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section style={{ width: '100%', padding: '48px 0 96px' }}>
        <div className="section-container">
          <div className="glass-card" style={{
            padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08), rgba(244,114,182,0.05))',
          }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: '-1px' }}>
              Ready to automate your outreach?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px', fontSize: 16 }}>
              Submit once. Get a professional AI-generated business audit delivered in minutes.
            </p>
            <Link to="/form" className="btn-primary" style={{ padding: '16px 40px', fontSize: 16 }}>
              Start Now — It's Free →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
