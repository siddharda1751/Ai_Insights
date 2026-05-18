import { useState } from 'react'
import axios from 'axios'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: '#e2e8f0',
  padding: '12px 16px',
  fontSize: 14,
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#94a3b8',
  marginBottom: 8,
}

export default function LeadForm({ onSuccess }: { onSuccess: (leadId: string) => void }) {
  const [formData, setFormData] = useState({
    name: '', email: '', companyName: '',
    companyWebsite: '', industry: '', companySize: '', phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await axios.post('http://localhost:5000/api/leads', formData)
      onSuccess(response.data.leadId)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.')
      setLoading(false)
    }
  }

  const getInputStyle = (name: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focused === name ? '#60a5fa' : 'rgba(255,255,255,0.1)',
    background: focused === name ? 'rgba(96,165,250,0.06)' : 'rgba(255,255,255,0.05)',
    boxShadow: focused === name ? '0 0 0 3px rgba(96,165,250,0.12)' : 'none',
  })

  const focusProps = (name: string) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(''),
  })

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#fca5a5', padding: '12px 16px', borderRadius: 10, fontSize: 14,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>Full Name <span style={{ color: '#f87171' }}>*</span></label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required
            placeholder="John Doe" style={getInputStyle('name')} {...focusProps('name')} />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>Email Address <span style={{ color: '#f87171' }}>*</span></label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required
            placeholder="john@example.com" style={getInputStyle('email')} {...focusProps('email')} />
        </div>

        {/* Company Name */}
        <div>
          <label style={labelStyle}>Company Name <span style={{ color: '#f87171' }}>*</span></label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required
            placeholder="Acme Inc." style={getInputStyle('companyName')} {...focusProps('companyName')} />
        </div>

        {/* Website */}
        <div>
          <label style={labelStyle}>Company Website <span style={{ color: '#f87171' }}>*</span></label>
          <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} required
            placeholder="https://example.com" style={getInputStyle('companyWebsite')} {...focusProps('companyWebsite')} />
        </div>

        {/* Industry */}
        <div>
          <label style={labelStyle}>Industry <span style={{ color: '#f87171' }}>*</span></label>
          <select name="industry" value={formData.industry} onChange={handleChange} required
            style={{ ...getInputStyle('industry'), appearance: 'none', cursor: 'pointer' }} {...focusProps('industry')}>
            <option value="" style={{ background: '#0f1520' }}>Select an industry</option>
            {['Finance','Consulting','SaaS','Retail','Healthcare','Technology','Manufacturing','E-Commerce','Other'].map(o => (
              <option key={o} value={o.toLowerCase().replace('-', '')} style={{ background: '#0f1520' }}>{o}</option>
            ))}
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label style={labelStyle}>Company Size <span style={{ color: '#f87171' }}>*</span></label>
          <select name="companySize" value={formData.companySize} onChange={handleChange} required
            style={{ ...getInputStyle('companySize'), appearance: 'none', cursor: 'pointer' }} {...focusProps('companySize')}>
            <option value="" style={{ background: '#0f1520' }}>Select company size</option>
            {[['1-50','1–50 employees'],['51-200','51–200 employees'],['201-1000','201–1,000 employees'],['1000+','1,000+ employees']].map(([v, l]) => (
              <option key={v} value={v} style={{ background: '#0f1520' }}>{l}</option>
            ))}
          </select>
        </div>

        {/* Phone — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Phone Number <span style={{ color: '#334155', fontSize: 12 }}>(Optional)</span></label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
            placeholder="+1 (555) 123-4567" style={getInputStyle('phone')} {...focusProps('phone')} />
        </div>
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} className="btn-primary"
        style={{
          width: '100%', padding: '14px 24px', fontSize: 15,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
          transform: 'none',
        }}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="white" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Submitting...
          </span>
        ) : 'Submit'}
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, select::placeholder { color: rgba(148,163,184,0.45); }
      `}</style>
    </form>
  )
}
