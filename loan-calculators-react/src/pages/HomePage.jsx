import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../styles/home.css'

function ComingSoonModal({ title, onClose }) {
  return (
    <div className="hp-modal-overlay" onClick={onClose}>
      <div className="hp-modal" onClick={e => e.stopPropagation()}>
        <div className="hp-modal-ico">🚀</div>
        <h3>{title}</h3>
        <p>This calculator is under development and will be available soon.</p>
        <span className="hp-modal-badge">Coming Soon</span>
        <button className="hp-modal-btn" onClick={onClose}>Got it</button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [modal, setModal] = useState(null)

  const services = [
    {
      icon: '🏠',
      title: 'Mortgage Calculator',
      desc: 'Term loan & secured overdraft — income, CIBIL-linked ROI, LTV, and multi-applicant eligibility.',
      to: '/mortgage',
      active: true,
      accent: '#1b4332',
      accentLight: '#f0fdf4',
      accentMid: '#d1fae5',
    },
    {
      icon: '🚗',
      title: 'Vehicle Loan',
      desc: 'Two- and four-wheeler eligibility with campaign ROI, margins, and combined applicant capacity.',
      to: '/vehicle-loan',
      active: true,
      accent: '#1a3a5c',
      accentLight: '#eff6ff',
      accentMid: '#dbeafe',
    },
    {
      icon: '🏡',
      title: 'Home Loan Calculator',
      desc: 'Calculate your home loan eligibility, EMI breakdown, and optimal repayment tenure.',
      to: null,
      active: false,
    },
    {
      icon: '🏢',
      title: 'Home Loan Plus',
      desc: 'Enhanced home loan with top-up facility, balance transfer options, and flexi repayment.',
      to: null,
      active: false,
    },
  ]

  return (
    <div className="hp-page">
      {modal && <ComingSoonModal title={modal} onClose={() => setModal(null)} />}

      {/* Nav */}
      <nav className="hp-nav">
        <div className="hp-nav-inner">
          <div className="hp-brand">
            <div className="hp-brand-icon">₹</div>
            <span className="hp-brand-text">Eligibility Calculators</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hp-hero">
        <div className="hp-hero-inner">
          <div className="hp-hero-badge">Free Tools</div>
          <h1>Check Your Loan<br />Eligibility Instantly</h1>
          <p>
            Get accurate loan eligibility, EMI estimates, and repayment tenure
            calculations — powered by actual banking rules and formulas.
          </p>
          <div className="hp-hero-metrics">
            <div className="hp-metric">
              <div className="hp-metric-value">4</div>
              <div className="hp-metric-label">Calculators</div>
            </div>
            <div className="hp-metric-sep" />
            <div className="hp-metric">
              <div className="hp-metric-value">100%</div>
              <div className="hp-metric-label">Bank Accurate</div>
            </div>
            <div className="hp-metric-sep" />
            <div className="hp-metric">
              <div className="hp-metric-value">0</div>
              <div className="hp-metric-label">Cost to You</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <main className="hp-main">
        <div className="hp-section-label">Available Calculators</div>
        <div className="hp-grid">
          {services.map((svc, i) =>
            svc.active ? (
              <Link className="hp-card" to={svc.to} key={i} style={{ '--accent': svc.accent, '--accent-light': svc.accentLight, '--accent-mid': svc.accentMid }}>
                <div className="hp-card-icon-wrap">
                  <div className="hp-card-ico">{svc.icon}</div>
                  <div className="hp-card-status">
                    <span className="hp-status-dot live" />
                    Live
                  </div>
                </div>
                <h2>{svc.title}</h2>
                <p>{svc.desc}</p>
                <div className="hp-card-footer">
                  <span className="hp-card-cta">
                    Open Calculator
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </span>
                </div>
              </Link>
            ) : (
              <div className="hp-card hp-card-soon" key={i} onClick={() => setModal(svc.title)}>
                <div className="hp-card-icon-wrap">
                  <div className="hp-card-ico muted">{svc.icon}</div>
                  <span className="hp-soon-pill">Coming Soon</span>
                </div>
                <h2>{svc.title}</h2>
                <p>{svc.desc}</p>
              </div>
            )
          )}
        </div>

        {/* Trust Section */}
        <div className="hp-trust">
          <div className="hp-trust-item">
            <div className="hp-trust-ico">🔒</div>
            <div>
              <div className="hp-trust-title">No Data Stored</div>
              <div className="hp-trust-desc">All calculations happen in your browser</div>
            </div>
          </div>
          <div className="hp-trust-item">
            <div className="hp-trust-ico">⚡</div>
            <div>
              <div className="hp-trust-title">Instant Results</div>
              <div className="hp-trust-desc">Real-time eligibility as you type</div>
            </div>
          </div>
          <div className="hp-trust-item">
            <div className="hp-trust-ico">🏦</div>
            <div>
              <div className="hp-trust-title">Bank-Grade Rules</div>
              <div className="hp-trust-desc">Uses actual circular-based formulas</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="hp-footer">
        Calculators are indicative only. Final sanction subject to bank discretion.
      </footer>
    </div>
  )
}
