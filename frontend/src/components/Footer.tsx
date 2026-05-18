import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#080c14', width: '100%' }}>
      <div className="section-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 28, paddingBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>InsightAI</span>
        </Link>
        <p style={{ color: '#1e293b', fontSize: 12 }}>
          Automated lead intelligence · Powered by Gemini AI
        </p>
      </div>
    </footer>
  )
}
