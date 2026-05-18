import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const { pathname } = useLocation()

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(8,12,20,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      width: '100%',
    }}>
      <nav className="section-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', paddingBottom: '16px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>
            <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>
            Insight<span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/" style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none',
            color: pathname === '/' ? 'white' : '#94a3b8',
            background: pathname === '/' ? 'rgba(255,255,255,0.08)' : 'transparent',
            transition: 'all 0.15s',
          }}>
            Home
          </Link>
          <Link to="/form" className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>
            Get Report →
          </Link>
        </div>
      </nav>
    </header>
  )
}
