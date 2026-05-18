import { useNavigate } from 'react-router-dom'
import LeadForm from '../components/LeadForm'

export default function FormPage() {
  const navigate = useNavigate()

  const handleSuccess = (leadId: string) => {
    navigate(`/response/${leadId}`)
  }

  return (
    <div className="hero-bg" style={{ width: '100%', minHeight: '100vh', paddingTop: 64, paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>

        {/* Page header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 100,
            border: '1px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)',
            color: '#c4b5fd', fontSize: 13, fontWeight: 500, marginBottom: 24,
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Powered by Gemini AI
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
            Get Your Free<br />
            <span className="gradient-text">Business Audit</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>
            Submit your details and receive a personalized AI-generated report directly in your inbox — no account required.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: 40, marginBottom: 20 }}>
          <LeadForm onSuccess={handleSuccess} />
        </div>

        {/* What happens next */}
        <div className="glass-card" style={{ padding: 28 }}>
          <p style={{ fontSize: 11, color: '#475569', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
            What happens after you submit
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['🔍', 'We scrape & enrich your company data from public sources'],
              ['🤖', 'Gemini AI generates a tailored business audit for your domain'],
              ['📄', 'A professional PDF report is compiled and formatted'],
              ['📬', 'The report is emailed directly to your inbox within minutes'],
            ].map(([icon, text]) => (
              <div key={text as string} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 18, lineHeight: 1, marginTop: 2 }}>{icon}</span>
                <span style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 20, fontSize: 12, color: '#334155', fontStyle: 'italic' }}>
            Fully automated · No manual review · Completes within 5 minutes
          </p>
        </div>

      </div>
    </div>
  )
}
