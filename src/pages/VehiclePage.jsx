import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fmt, fmtExact } from '../utils/mortgageFormat.js'
import {
  computeVehicle,
  calcAge,
  isValidDMY,
  normDOBValue,
  profLabel,
  sustenancePct,
} from '../utils/vehicleEngine.js'
import '../styles/vehicle.css'

function newApplicant(id, isMain) {
  return {
    id,
    name: '',
    dob: '',
    prof: 'salaried',
    grossSalary: '',
    ay1g: '',
    ay2g: '',
    ay1t: '',
    ay2t: '',
    agriIncome: '',
    existingEmi: '',
    otherOutgoes: '',
    borrowerCat: 'private',
    cibil: '750',
    isMain,
  }
}

export default function VehiclePage() {
  const idRef = useRef(1)
  const [vehType, setVehType] = useState('4W')
  const [step, setStep] = useState(0)
  const [applicants, setApplicants] = useState(() => [newApplicant(1, true)])
  const [onRoadPrice, setOnRoadPrice] = useState(800000)
  const [isEV, setIsEV] = useState('no')
  const [secType, setSecType] = useState('normal')
  const [showResult, setShowResult] = useState(false)
  const resRef = useRef(null)

  const V = useMemo(
    () =>
      computeVehicle({
        vehType,
        applicants,
        onRoadPrice: Number(onRoadPrice) || 0,
        isEV,
        secType,
      }),
    [vehType, applicants, onRoadPrice, isEV, secType],
  )

  function patchApplicant(id, patch) {
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  function addApplicant() {
    if (applicants.length >= 3) {
      window.alert('Maximum 3 applicants (1 main + 2 co-applicants).')
      return
    }
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

  const okShow = V.isEligible && V.finalLoan > 0
  const stepLabels = ['Vehicle & Loan', 'Applicants']

  return (
    <div className="vc-page">
      {/* Nav */}
      <nav className="vc-nav">
        <div className="vc-nav-inner">
          <Link to="/" className="vc-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </Link>
          <div className="vc-nav-title">Vehicle Loan Calculator</div>
        </div>
      </nav>

      <div className="vc-container">
        {/* Progress Steps */}
        <div className="vc-progress">
          {stepLabels.map((label, n) => (
            <button
              key={label}
              type="button"
              className={'vc-step' + (step === n ? ' active' : '') + (n < step ? ' done' : '')}
              onClick={() => setStep(n)}
            >
              <span className="vc-step-num">{n < step ? '✓' : n + 1}</span>
              <span className="vc-step-label">{label}</span>
            </button>
          ))}
          <div className="vc-progress-bar">
            <div className="vc-progress-fill" style={{ width: `${(step / Math.max(stepLabels.length - 1, 1)) * 100}%` }} />
          </div>
        </div>

        {/* Step 0 — Vehicle & Loan */}
        {step === 0 && (
          <div className="vc-section vc-fade">
            <div className="vc-card">
              <h2 className="vc-card-title">Select Vehicle Type</h2>
              <p className="vc-card-desc">Choose the type of vehicle you want to finance</p>
              <div className="vc-toggle-group">
                <button type="button" className={'vc-toggle' + (vehType === '4W' ? ' active' : '')} onClick={() => setVehType('4W')}>
                  <div className="vc-toggle-icon">🚗</div>
                  <div className="vc-toggle-content">
                    <div className="vc-toggle-title">4-Wheeler</div>
                    <div className="vc-toggle-sub">Max 84 months tenure</div>
                  </div>
                  <div className="vc-toggle-check">{vehType === '4W' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}</div>
                </button>
                <button type="button" className={'vc-toggle' + (vehType === '2W' ? ' active' : '')} onClick={() => setVehType('2W')}>
                  <div className="vc-toggle-icon">🏍</div>
                  <div className="vc-toggle-content">
                    <div className="vc-toggle-title">2-Wheeler</div>
                    <div className="vc-toggle-sub">Max 36 months | Max ₹10L</div>
                  </div>
                  <div className="vc-toggle-check">{vehType === '2W' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}</div>
                </button>
              </div>
            </div>

            <div className="vc-card">
              <h2 className="vc-card-title">Vehicle & Loan Details</h2>
              <div className="vc-form-grid-3">
                <div className="vc-field">
                  <label>On-Road Price</label>
                  <div className="vc-input-group">
                    <span className="vc-input-prefix">₹</span>
                    <input type="number" value={onRoadPrice} step={10000} onChange={(e) => setOnRoadPrice(e.target.value)} />
                  </div>
                  <span className="vc-hint">Incl. registration, insurance, road tax</span>
                </div>
                <div className="vc-field">
                  <label>Electric / Hybrid?</label>
                  <select value={isEV} onChange={(e) => setIsEV(e.target.value)}>
                    <option value="no">No (Fuel-based)</option>
                    <option value="yes">Yes (Electric / Hybrid)</option>
                  </select>
                </div>
                <div className="vc-field">
                  <label>Security Type</label>
                  <select value={secType} onChange={(e) => setSecType(e.target.value)}>
                    <option value="normal">Normal (Hypothecation)</option>
                    <option value="td100">100% Term Deposit Cover</option>
                    <option value="neglien">Negative Lien on Property</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="vc-nav-buttons">
              <div />
              <button type="button" className="vc-btn-next" onClick={() => setStep(1)}>
                Next: Applicants
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — Applicants */}
        {step === 1 && (
          <div className="vc-section vc-fade">
            {applicants.map((a, idx) => {
              const ageInfo = a.dob && isValidDMY(a.dob) ? calcAge(a.dob) : null
              return (
                <div key={a.id} className="vc-card">
                  <div className="vc-card-header">
                    <div className="vc-card-header-left">
                      <span className="vc-applicant-badge">{idx + 1}</span>
                      <div>
                        <h2 className="vc-card-title" style={{ marginBottom: 0 }}>
                          {idx === 0 ? 'Primary Applicant' : `Co-Applicant ${idx}`}
                        </h2>
                        {a.name && <p className="vc-card-name">{a.name}</p>}
                      </div>
                    </div>
                    {idx > 0 && (
                      <button type="button" className="vc-btn-remove" onClick={() => removeApplicant(a.id)}>Remove</button>
                    )}
                  </div>

                  <div className="vc-form-section">
                    <div className="vc-form-title">Personal Details</div>
                    <div className="vc-form-grid-3">
                      <div className="vc-field">
                        <label>Full Name</label>
                        <input type="text" placeholder="Enter full name" value={a.name} onChange={(e) => patchApplicant(a.id, { name: e.target.value })} />
                      </div>
                      <div className="vc-field">
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
                          <span className="vc-hint success">Age: {ageInfo.yrs} yrs {ageInfo.mo} mo</span>
                        ) : (
                          <span className="vc-hint">Age auto-calculated</span>
                        )}
                      </div>
                      <div className="vc-field">
                        <label>CIBIL Score</label>
                        <input type="number" value={a.cibil} min={-1} max={900} onChange={(e) => patchApplicant(a.id, { cibil: e.target.value })} />
                        <span className="vc-hint">Min 650. NTC = -1</span>
                      </div>
                    </div>
                  </div>

                  <div className="vc-form-section">
                    <div className="vc-form-title">Profession</div>
                    <div className="vc-prof-grid">
                      {[
                        { k: 'salaried', ico: '👔', lbl: 'Salaried', sub: 'Salary / Pension' },
                        { k: 'business', ico: '🏢', lbl: 'Business', sub: '2yr ITR average' },
                        { k: 'agriculture', ico: '🌾', lbl: 'Agriculture', sub: 'Tahsildar Certificate' },
                      ].map((p) => (
                        <button key={p.k} type="button" className={'vc-prof-btn' + (a.prof === p.k ? ' active' : '')} onClick={() => patchApplicant(a.id, { prof: p.k })}>
                          <span className="vc-prof-ico">{p.ico}</span>
                          <span className="vc-prof-lbl">{p.lbl}</span>
                          <span className="vc-prof-sub">{p.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {a.prof === 'salaried' && (
                    <div className="vc-form-section">
                      <div className="vc-form-title">Income Details</div>
                      <div className="vc-form-grid-2">
                        <div className="vc-field">
                          <label>Last Month Gross Salary</label>
                          <div className="vc-input-group">
                            <span className="vc-input-prefix">₹</span>
                            <input type="number" value={a.grossSalary} step={1000} onChange={(e) => patchApplicant(a.id, { grossSalary: e.target.value })} />
                          </div>
                          <span className="vc-hint">Annualised ×12</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {a.prof === 'business' && (
                    <div className="vc-form-section">
                      <div className="vc-form-title">Business Income (2 Assessment Years)</div>
                      <div className="vc-itr-table">
                        <div className="vc-itr-header">
                          <div>AY</div>
                          <div>Gross Income (₹)</div>
                          <div>Income Tax (₹)</div>
                        </div>
                        {[
                          { lbl: 'AY 2025-26', g: 'ay1g', t: 'ay1t' },
                          { lbl: 'AY 2024-25', g: 'ay2g', t: 'ay2t' },
                        ].map((row) => (
                          <div key={row.lbl} className="vc-itr-row">
                            <div className="vc-itr-label">{row.lbl}</div>
                            <div className="vc-input-group">
                              <span className="vc-input-prefix">₹</span>
                              <input type="number" value={a[row.g]} step={10000} onChange={(e) => patchApplicant(a.id, { [row.g]: e.target.value })} />
                            </div>
                            <div className="vc-input-group">
                              <span className="vc-input-prefix">₹</span>
                              <input type="number" value={a[row.t]} step={5000} onChange={(e) => patchApplicant(a.id, { [row.t]: e.target.value })} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="vc-info-box">Average of both AYs used for gross income and tax.</div>
                    </div>
                  )}

                  {a.prof === 'agriculture' && (
                    <div className="vc-form-section">
                      <div className="vc-form-title">Agriculture Income</div>
                      <div className="vc-form-grid-2">
                        <div className="vc-field">
                          <label>Annual Income (Tahsildar / Form-J)</label>
                          <div className="vc-input-group">
                            <span className="vc-input-prefix">₹</span>
                            <input type="number" value={a.agriIncome} step={10000} onChange={(e) => patchApplicant(a.id, { agriIncome: e.target.value })} />
                          </div>
                          <span className="vc-hint">Min ₹3L/yr for 4-Wheeler</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="vc-form-section">
                    <div className="vc-form-title">{a.prof === 'salaried' ? 'Category & Liabilities' : 'Liabilities'}</div>
                    <div className="vc-form-grid-3">
                      {a.prof === 'salaried' && (
                        <div className="vc-field">
                          <label>Borrower Category</label>
                          <select value={a.borrowerCat} onChange={(e) => patchApplicant(a.id, { borrowerCat: e.target.value })}>
                            <option value="private">Private Employee</option>
                            <option value="govt">Govt / PSU / Pensioner</option>
                          </select>
                          <span className="vc-hint">Govt/PSU: −0.25% ROI</span>
                        </div>
                      )}
                      <div className="vc-field">
                        <label>Existing EMIs / month</label>
                        <div className="vc-input-group">
                          <span className="vc-input-prefix">₹</span>
                          <input type="number" value={a.existingEmi} step={500} onChange={(e) => patchApplicant(a.id, { existingEmi: e.target.value })} />
                        </div>
                      </div>
                      {a.prof === 'salaried' && (
                        <div className="vc-field">
                          <label>Monthly Deductions</label>
                          <div className="vc-input-group">
                            <span className="vc-input-prefix">₹</span>
                            <input type="number" value={a.otherOutgoes} step={500} onChange={(e) => patchApplicant(a.id, { otherOutgoes: e.target.value })} />
                          </div>
                          <span className="vc-hint">PF, LIC, prof. tax</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <button type="button" className="vc-btn-add" onClick={addApplicant}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Add Co-Applicant (max 3)
            </button>
            <div className="vc-nav-buttons">
              <button type="button" className="vc-btn-back" onClick={() => setStep(0)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back
              </button>
              <button type="button" className="vc-btn-primary" onClick={runCalc}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                Check Eligibility
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {showResult && (
          <div className="vc-result vc-fade" ref={resRef}>
            <div className="vc-result-header">
              <h2>Eligibility Result</h2>
              {okShow ? <span className="vc-badge ok">Eligible</span> : <span className="vc-badge no">Not Eligible</span>}
            </div>

            <div className="vc-result-hero">
              <div className="vc-result-label">Maximum Eligible Loan</div>
              <div className="vc-result-amount">{okShow ? fmtExact(V.finalLoan) : '₹ —'}</div>
              <div className="vc-result-sub">
                {okShow
                  ? `ROI ${V.roi.toFixed(2)}% p.a.  |  EMI ${fmtExact(V.emi)}/mo  |  ${V.n} months`
                  : 'Insufficient income or data for the selected vehicle'}
              </div>
            </div>

            <div className="vc-result-grid">
              <div className="vc-result-card">
                <div className="vc-result-card-label">Monthly EMI</div>
                <div className="vc-result-card-value">{V.finalLoan > 0 ? fmtExact(V.emi) : '—'}</div>
                <div className="vc-result-card-sub">{V.n} EMIs</div>
              </div>
              <div className="vc-result-card">
                <div className="vc-result-card-label">Interest Rate</div>
                <div className="vc-result-card-value">{V.roi.toFixed(2)}%</div>
                <div className="vc-result-card-sub">per annum</div>
              </div>
              <div className="vc-result-card">
                <div className="vc-result-card-label">Total Interest</div>
                <div className="vc-result-card-value">{V.finalLoan > 0 ? fmtExact(V.totalInt) : '—'}</div>
                <div className="vc-result-card-sub">{V.finalLoan > 0 ? `${((V.totalInt / (V.finalLoan || 1)) * 100).toFixed(2)}% of principal` : '—'}</div>
              </div>
              <div className="vc-result-card">
                <div className="vc-result-card-label">Tenure</div>
                <div className="vc-result-card-value">{V.nYrs > 0 ? V.nYrs + ' yrs ' : ''}{V.nMo} mo</div>
                <div className="vc-result-card-sub">= {V.n} months</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="vc-footer">
        This calculator is indicative only. Final sanction subject to bank's discretion and full compliance.
      </footer>
    </div>
  )
}
