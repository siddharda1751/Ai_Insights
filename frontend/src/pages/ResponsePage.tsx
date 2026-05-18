import { Link } from 'react-router-dom'

export default function ResponsePage() {
  return (
    <div className="hero-bg" style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>

        <div className="glass-card" style={{ padding: '56px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Ambient glow */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(34,197,94,0.04), transparent)', pointerEvents: 'none' }} />

          {/* Success icon */}
          <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 28px' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(34,197,94,0.2)',
              animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
            }} />
            <div style={{
              position: 'relative', width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 16px 40px rgba(34,197,94,0.35)',
            }}>
              <svg width="36" height="36" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-1px', marginBottom: 12 }}>
            You're all set!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Your submission was received. Our AI pipeline is now researching your
            company and generating a personalized business audit.
          </p>

          {/* Email callout */}
          <div style={{
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 14, padding: '20px 24px', marginBottom: 32,
            display: 'flex', alignItems: 'flex-start', gap: 16, textAlign: 'left',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
            }}>
              <svg width="18" height="18" fill="none" stroke="#60a5fa" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Check your email in a few minutes</p>
              <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
                Your personalized PDF audit report will be delivered directly to your inbox. No login required.
              </p>
            </div>
          </div>

          {/* Pipeline steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 36 }}>
            {[
              'Scraping & enriching your company data',
              'Generating AI insights with Gemini',
              'Building your professional PDF report',
              'Sending report to your email',
            ].map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                </div>
                <span style={{ color: '#64748b', fontSize: 14 }}>{step}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/" style={{
              flex: 1, minWidth: 120, padding: '12px 20px', textAlign: 'center',
              fontSize: 14, fontWeight: 500, color: '#94a3b8', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Back to Home
            </Link>
            <Link to="/form" className="btn-primary" style={{ flex: 1, minWidth: 120, padding: '12px 20px', fontSize: 14 }}>
              Submit Another
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#1e293b', fontSize: 12, marginTop: 20 }}>
          Powered by Gemini AI · Fully automated · Takes ~2–5 minutes
        </p>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
