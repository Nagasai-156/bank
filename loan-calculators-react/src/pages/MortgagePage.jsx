import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fmt, fmtExact } from '../utils/mortgageFormat.js'
import {
  computeMortgage,
  calcAge,
  isValidDMY,
  normDOBValue,
} from '../utils/mortgageEngine.js'
import '../styles/mortgage.css'

function newApplicant(id, isMain) {
  return {
    id,
    name: '',
    dob: '',
    prof: 'salaried',
    grossSalary: '',
    ay2526: '',
    ay2425: '',
    ay2324: '',
    tax2526: '',
    tax2425: '',
    tax2324: '',
    agriIncome: '',
    existingEmi: '',
    otherOutgoes: '',
    cibil: '',
    isMain,
  }
}

export default function MortgagePage() {
  const idRef = useRef(1)
  const [facility, setFacility] = useState('TL')
  const [step, setStep] = useState(0)
  const [applicants, setApplicants] = useState(() => [newApplicant(1, true)])
  const [propNRV, setPropNRV] = useState(5000000)
  const [propAge, setPropAge] = useState(5)
  const [propResidual, setPropResidual] = useState(45)
  const [showResult, setShowResult] = useState(false)
  const resRef = useRef(null)

  const M = useMemo(
    () =>
      computeMortgage({
        facility,
        applicants,
        propNRV: Number(propNRV) || 0,
        propAge: Number(propAge) || 0,
        propResidual: Number(propResidual) || 0,
      }),
    [facility, applicants, propNRV, propAge, propResidual],
  )

  function patchApplicant(id, patch) {
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  function addApplicant() {
    const id = ++idRef.current
    setApplicants((prev) => [...prev, newApplicant(id, false)])
  }

  function removeApplicant(id) {
    setApplicants((prev) => prev.filter((a) => a.id !== id))
  }

  function runCalc() {
    setShowResult(true)
    setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const roi = M.roi * 100
  const stepLabels = ['Loan Setup', 'Applicants', 'Property']

  return (
    <div className="mc-page">
      {/* Nav */}
      <nav className="mc-nav">
        <div className="mc-nav-inner">
          <Link to="/" className="mc-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </Link>
          <div className="mc-nav-title">Mortgage Calculator</div>
        </div>
      </nav>

      <div className="mc-container">
        {/* Progress Steps */}
        <div className="mc-progress">
          {stepLabels.map((label, n) => (
            <button
              key={label}
              type="button"
              className={'mc-step' + (step === n ? ' active' : '') + (n < step ? ' done' : '')}
              onClick={() => setStep(n)}
            >
              <span className="mc-step-num">{n < step ? '✓' : n + 1}</span>
              <span className="mc-step-label">{label}</span>
            </button>
          ))}
          <div className="mc-progress-bar">
            <div className="mc-progress-fill" style={{ width: `${(step / (stepLabels.length - 1)) * 100}%` }} />
          </div>
        </div>

        {/* Step 0 — Loan Setup */}
        {step === 0 && (
          <div className="mc-section mc-fade">
            <div className="mc-card">
              <h2 className="mc-card-title">Select Facility Type</h2>
              <p className="mc-card-desc">Choose the type of mortgage facility you need</p>
              <div className="mc-toggle-group">
                <button
                  type="button"
                  className={'mc-toggle' + (facility === 'TL' ? ' active' : '')}
                  onClick={() => setFacility('TL')}
                >
                  <div className="mc-toggle-icon">📄</div>
                  <div className="mc-toggle-content">
                    <div className="mc-toggle-title">Term Loan (TL)</div>
                    <div className="mc-toggle-sub">Fixed EMIs | LTV up to 60%</div>
                  </div>
                  <div className="mc-toggle-check">{facility === 'TL' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}</div>
                </button>
                <button
                  type="button"
                  className={'mc-toggle' + (facility === 'SOD' ? ' active' : '')}
                  onClick={() => setFacility('SOD')}
                >
                  <div className="mc-toggle-icon">🔄</div>
                  <div className="mc-toggle-content">
                    <div className="mc-toggle-title">Secured Overdraft (SOD)</div>
                    <div className="mc-toggle-sub">Flexible draw | LTV up to 50%</div>
                  </div>
                  <div className="mc-toggle-check">{facility === 'SOD' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}</div>
                </button>
              </div>
            </div>
            <div className="mc-nav-buttons">
              <div />
              <button type="button" className="mc-btn-next" onClick={() => setStep(1)}>
                Next: Applicants
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — Applicants */}
        {step === 1 && (
          <div className="mc-section mc-fade">
            {applicants.map((a, idx) => {
              const ageInfo = a.dob && isValidDMY(a.dob) ? calcAge(a.dob) : null
              return (
                <div key={a.id} className="mc-card">
                  <div className="mc-card-header">
                    <div className="mc-card-header-left">
                      <span className="mc-applicant-badge">{idx + 1}</span>
                      <div>
                        <h2 className="mc-card-title" style={{ marginBottom: 0 }}>
                          {idx === 0 ? 'Primary Applicant' : `Co-Applicant ${idx}`}
                        </h2>
                        {a.name && <p className="mc-card-name">{a.name}</p>}
                      </div>
                    </div>
                    {idx > 0 && (
                      <button type="button" className="mc-btn-remove" onClick={() => removeApplicant(a.id)}>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mc-form-section">
                    <div className="mc-form-title">Personal Details</div>
                    <div className="mc-form-grid-3">
                      <div className="mc-field">
                        <label>Full Name</label>
                        <input type="text" placeholder="Enter full name" value={a.name} onChange={(e) => patchApplicant(a.id, { name: e.target.value })} />
                      </div>
                      <div className="mc-field">
                        <label>Date of Birth</label>
                        <input
                          type="text"
                          value={a.dob}
                          maxLength={10}
                          placeholder="DD-MM-YYYY"
                          onChange={(e) => patchApplicant(a.id, { dob: e.target.value })}
                          onBlur={(e) => patchApplicant(a.id, { dob: normDOBValue(e.target.value) })}
                        />
                        {ageInfo ? (
                          <span className="mc-hint success">Age: {ageInfo.yrs} yrs {ageInfo.mo} mo</span>
                        ) : a.dob && a.dob.length >= 8 ? (
                          <span className="mc-hint error">Invalid date format</span>
                        ) : (
                          <span className="mc-hint">e.g. 15-06-1985</span>
                        )}
                      </div>
                      <div className="mc-field">
                        <label>CIBIL Score</label>
                        <input type="number" value={a.cibil} min={-1} max={900} placeholder="e.g. 750" onChange={(e) => patchApplicant(a.id, { cibil: e.target.value })} />
                        <span className="mc-hint">Min 650. New-to-credit = -1</span>
                      </div>
                    </div>
                  </div>

                  <div className="mc-form-section">
                    <div className="mc-form-title">Profession</div>
                    <div className="mc-prof-grid">
                      {[
                        { k: 'salaried', ico: '👔', lbl: 'Salaried', sub: 'Salary / Pension' },
                        { k: 'business', ico: '🏢', lbl: 'Business', sub: 'ITR-based income' },
                        { k: 'agriculture', ico: '🌾', lbl: 'Agriculture', sub: 'Tahsildar Certificate' },
                      ].map((p) => (
                        <button
                          key={p.k}
                          type="button"
                          className={'mc-prof-btn' + (a.prof === p.k ? ' active' : '')}
                          onClick={() => patchApplicant(a.id, { prof: p.k })}
                        >
                          <span className="mc-prof-ico">{p.ico}</span>
                          <span className="mc-prof-lbl">{p.lbl}</span>
                          <span className="mc-prof-sub">{p.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {a.prof === 'salaried' && (
                    <div className="mc-form-section">
                      <div className="mc-form-title">Income Details</div>
                      <div className="mc-form-grid-2">
                        <div className="mc-field">
                          <label>Last Month Gross Salary</label>
                          <div className="mc-input-group">
                            <span className="mc-input-prefix">₹</span>
                            <input type="number" value={a.grossSalary} step={1000} onChange={(e) => patchApplicant(a.id, { grossSalary: e.target.value })} />
                          </div>
                          <span className="mc-hint">Gross before deductions (annualised ×12)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {a.prof === 'business' && (
                    <div className="mc-form-section">
                      <div className="mc-form-title">Business Income (3 Assessment Years)</div>
                      <div className="mc-itr-table">
                        <div className="mc-itr-header">
                          <div>Assessment Year</div>
                          <div>Gross Income (₹)</div>
                          <div>Income Tax (₹)</div>
                        </div>
                        {[
                          { lbl: 'AY 2025-26', g: 'ay2526', t: 'tax2526' },
                          { lbl: 'AY 2024-25', g: 'ay2425', t: 'tax2425' },
                          { lbl: 'AY 2023-24', g: 'ay2324', t: 'tax2324' },
                        ].map((row) => (
                          <div key={row.lbl} className="mc-itr-row">
                            <div className="mc-itr-label">{row.lbl}</div>
                            <div className="mc-input-group">
                              <span className="mc-input-prefix">₹</span>
                              <input type="number" value={a[row.g]} step={10000} onChange={(e) => patchApplicant(a.id, { [row.g]: e.target.value })} />
                            </div>
                            <div className="mc-input-group">
                              <span className="mc-input-prefix">₹</span>
                              <input type="number" value={a[row.t]} step={5000} onChange={(e) => patchApplicant(a.id, { [row.t]: e.target.value })} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mc-info-box">Variation &gt;25% across years → average of 3 AYs used. Otherwise latest AY used.</div>
                    </div>
                  )}

                  {a.prof === 'agriculture' && (
                    <div className="mc-form-section">
                      <div className="mc-form-title">Agriculture Income</div>
                      <div className="mc-form-grid-2">
                        <div className="mc-field">
                          <label>Annual Income (Tahsildar Certificate)</label>
                          <div className="mc-input-group">
                            <span className="mc-input-prefix">₹</span>
                            <input type="number" value={a.agriIncome} step={10000} onChange={(e) => patchApplicant(a.id, { agriIncome: e.target.value })} />
                          </div>
                          <span className="mc-hint">Annual agricultural income certified</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mc-form-section">
                    <div className="mc-form-title">Existing Liabilities</div>
                    <div className="mc-form-grid-2">
                      <div className="mc-field">
                        <label>Existing EMIs / month</label>
                        <div className="mc-input-group">
                          <span className="mc-input-prefix">₹</span>
                          <input type="number" value={a.existingEmi} step={1000} onChange={(e) => patchApplicant(a.id, { existingEmi: e.target.value })} />
                        </div>
                        <span className="mc-hint">All existing loan EMIs as per CIBIL</span>
                      </div>
                      {a.prof === 'salaried' && (
                        <div className="mc-field">
                          <label>Monthly Salary Deductions</label>
                          <div className="mc-input-group">
                            <span className="mc-input-prefix">₹</span>
                            <input type="number" value={a.otherOutgoes} step={500} onChange={(e) => patchApplicant(a.id, { otherOutgoes: e.target.value })} />
                          </div>
                          <span className="mc-hint">PF, LIC, professional tax etc.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <button type="button" className="mc-btn-add" onClick={addApplicant}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Add Co-Applicant
            </button>
            <div className="mc-nav-buttons">
              <button type="button" className="mc-btn-back" onClick={() => setStep(0)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back
              </button>
              <button type="button" className="mc-btn-next" onClick={() => setStep(2)}>
                Next: Property
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Property */}
        {step === 2 && (
          <div className="mc-section mc-fade">
            <div className="mc-card">
              <h2 className="mc-card-title">Property Details</h2>
              <p className="mc-card-desc">Enter the details of the property being mortgaged</p>
              <div className="mc-form-grid-3">
                <div className="mc-field">
                  <label>Net Realisable Value (NRV)</label>
                  <div className="mc-input-group">
                    <span className="mc-input-prefix">₹</span>
                    <input type="number" value={propNRV} step={100000} onChange={(e) => setPropNRV(e.target.value)} />
                  </div>
                  <span className="mc-hint">As per approved valuer</span>
                </div>
                <div className="mc-field">
                  <label>Age of Property (Years)</label>
                  <input type="number" value={propAge} min={0} max={80} onChange={(e) => setPropAge(e.target.value)} />
                  <span className="mc-hint">Affects sanctioning authority</span>
                </div>
                <div className="mc-field">
                  <label>Residual Life (Years)</label>
                  <input type="number" value={propResidual} min={0} max={100} onChange={(e) => setPropResidual(e.target.value)} />
                  <span className="mc-hint">Loan ends 5 yrs before residual life</span>
                </div>
              </div>
            </div>
            <div className="mc-nav-buttons">
              <button type="button" className="mc-btn-back" onClick={() => setStep(1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back
              </button>
              <button type="button" className="mc-btn-primary" onClick={runCalc}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                Check Eligibility
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {showResult && (
          <div className="mc-result mc-fade" ref={resRef}>
            <div className="mc-result-header">
              <h2>Eligibility Result</h2>
              {M.okEligible ? (
                <span className="mc-badge ok">Eligible</span>
              ) : (
                <span className="mc-badge no">Not Eligible</span>
              )}
            </div>

            <div className="mc-result-hero">
              <div className="mc-result-label">Maximum Eligible Loan</div>
              <div className="mc-result-amount">{M.okEligible ? fmtExact(M.finalLoan) : '₹ —'}</div>
              <div className="mc-result-sub">
                {M.okEligible
                  ? `${M.tenureDisplay} @ ${roi.toFixed(2)}% p.a.  |  ` +
                    (M.isTL ? `EMI ${fmtExact(M.emi)}/mo` : `Limit ↓ ${fmtExact(M.monthlyRed)}/mo`)
                  : 'Income or property value insufficient for the requested facility'}
              </div>
            </div>

            <div className="mc-result-grid">
              <div className="mc-result-card">
                <div className="mc-result-card-label">{M.isTL ? 'Monthly EMI' : 'Monthly Limit ↓'}</div>
                <div className="mc-result-card-value">{M.finalLoan > 0 ? fmtExact(M.isTL ? M.emi : M.monthlyRed) : '—'}</div>
                <div className="mc-result-card-sub">{M.isTL ? `${M.n} EMIs` : 'fixed monthly reduction'}</div>
              </div>
              <div className="mc-result-card">
                <div className="mc-result-card-label">Interest Rate</div>
                <div className="mc-result-card-value">{roi.toFixed(2)}%</div>
                <div className="mc-result-card-sub">per annum (CIBIL-linked)</div>
              </div>
              <div className="mc-result-card">
                <div className="mc-result-card-label">Total Interest</div>
                <div className="mc-result-card-value">{M.finalLoan > 0 ? fmtExact(M.isTL ? M.totalInt : M.totalIntSOD) : '—'}</div>
                <div className="mc-result-card-sub">
                  {M.finalLoan > 0
                    ? `${((M.isTL ? M.totalInt : M.totalIntSOD) / (M.finalLoan || 1) * 100).toFixed(2)}% of principal`
                    : '—'}
                </div>
              </div>
              <div className="mc-result-card">
                <div className="mc-result-card-label">Repayment Term</div>
                <div className="mc-result-card-value">{M.maxTenureYrs} yrs{M.maxTenureMo > 0 ? ` ${M.maxTenureMo} mo` : ''}</div>
                <div className="mc-result-card-sub">= {M.n} months</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="mc-footer">
        This calculator is indicative only. Final sanction subject to bank's discretion and full compliance.
      </footer>
    </div>
  )
}
