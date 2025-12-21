import { useState } from 'react'
import { Link } from 'react-router-dom'
import './HousingLoan.css'

function HousingLoan() {
    const [formData, setFormData] = useState({
        age: '',
        employmentType: 'Salaried',
        grossMonthlyIncome: '',
        existingEMI: '',
        cibilScore: '',
        purpose: 'Purchase',
        propertyLocation: 'Urban',
        propertyValue: '',
        tenureRequired: '',
        coApplicantIncome: ''
    })

    const [result, setResult] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Get ROI based on CIBIL score
    const getROI = (cibil) => {
        if (cibil >= 800) return 8.00
        if (cibil >= 750) return 8.25
        if (cibil >= 700) return 8.50
        if (cibil >= 650) return 9.00
        return 9.50
    }

    // Get sustenance percentage based on annual income
    const getSustenanceRate = (annualIncome) => {
        if (annualIncome <= 300000) return 0.45
        if (annualIncome <= 500000) return 0.40
        if (annualIncome <= 800000) return 0.35
        if (annualIncome <= 1200000) return 0.30
        return Math.min(0.25, 200000 / (annualIncome / 12)) // 25% or ₹2L/month, whichever is lower
    }

    // Get LTV based on loan amount
    const getLTV = (loanAmount) => {
        if (loanAmount <= 3000000) return 0.90
        if (loanAmount <= 7500000) return 0.80
        return 0.75
    }

    // Calculate EMI per lakh
    const calculateEMIPerLakh = (roi, tenureYears) => {
        const monthlyRate = roi / 12 / 100
        const tenureMonths = tenureYears * 12
        const emi = (100000 * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1)
        return emi
    }

    const calculate = (e) => {
        e.preventDefault()

        const age = Number(formData.age)
        const monthlyIncome = Number(formData.grossMonthlyIncome)
        const coIncome = Number(formData.coApplicantIncome) || 0
        const existingEMI = Number(formData.existingEMI) || 0
        const cibil = Number(formData.cibilScore)
        const propertyValue = Number(formData.propertyValue)
        const tenureRequired = Number(formData.tenureRequired)
        const purpose = formData.purpose
        const location = formData.propertyLocation

        // STEP 1: Age Eligibility
        const ageAtLoanEnd = age + tenureRequired
        if (age < 18) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Age Below Minimum",
                reason: "Minimum age requirement is 18 years."
            })
            return
        }

        if (ageAtLoanEnd > 75) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Age Exceeds Limit",
                reason: `Age at loan end will be ${ageAtLoanEnd} years. Maximum allowed is 75 years. Please reduce tenure.`
            })
            return
        }

        // STEP 2: Tenure Validation
        let maxTenure = 30
        if (purpose === 'Repairs' || purpose === 'Renovation') {
            maxTenure = 15
        }

        if (tenureRequired > maxTenure) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Tenure Exceeds Maximum",
                reason: `Maximum tenure for ${purpose} is ${maxTenure} years. You requested ${tenureRequired} years.`
            })
            return
        }

        // STEP 3: Scheme Cap Based on Location
        const schemeCap = location === 'Urban' || location === 'Semi-urban' ? 5000000 : 3500000

        // STEP 4: Calculate ROI
        const roi = getROI(cibil)

        // STEP 5: Calculate Total Income
        const totalMonthlyIncome = monthlyIncome + coIncome
        const annualIncome = totalMonthlyIncome * 12

        // STEP 6: Calculate Sustenance
        const sustenanceRate = getSustenanceRate(annualIncome)
        const sustenanceAmount = annualIncome * sustenanceRate

        // STEP 7: Calculate Available Income for EMI
        const availableForEMI = annualIncome - existingEMI * 12 - sustenanceAmount

        if (availableForEMI <= 0) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Insufficient Income",
                reason: `After sustenance (${(sustenanceRate * 100).toFixed(0)}%) and existing EMIs, no income is available for new EMI.`
            })
            return
        }

        const maxMonthlyEMI = availableForEMI / 12

        // STEP 8: Calculate EMI per Lakh
        const emiPerLakh = calculateEMIPerLakh(roi, tenureRequired)

        // STEP 9: Calculate Repayment-Based Loan
        const repaymentBasedLoan = (maxMonthlyEMI / emiPerLakh) * 100000

        // STEP 10: Calculate LTV-Based Loan
        // We need to iterate to find the right loan amount that satisfies LTV
        let ltvBasedLoan = propertyValue * 0.90 // Start with highest LTV
        const actualLTV = getLTV(ltvBasedLoan)
        ltvBasedLoan = propertyValue * actualLTV

        // STEP 11: Final Eligible Loan
        const eligibleLoan = Math.min(repaymentBasedLoan, ltvBasedLoan, schemeCap)

        // Calculate actual LTV for final loan
        const finalLTV = (eligibleLoan / propertyValue) * 100
        const marginRequired = propertyValue - eligibleLoan
        const marginPercentage = (marginRequired / propertyValue) * 100

        // Calculate actual EMI
        const actualEMI = (eligibleLoan / 100000) * emiPerLakh
        const totalInterest = (actualEMI * tenureRequired * 12) - eligibleLoan
        const totalPayable = eligibleLoan + totalInterest

        // STEP 12: Final Output
        setResult({
            eligible: true,
            message: "✅ ELIGIBLE for Housing Loan",
            details: {
                eligibleLoan: eligibleLoan,
                repaymentBasedLoan: repaymentBasedLoan,
                ltvBasedLoan: ltvBasedLoan,
                schemeCap: schemeCap,
                limitingFactor: eligibleLoan === repaymentBasedLoan ? 'Repayment Capacity' :
                    eligibleLoan === ltvBasedLoan ? 'LTV Limit' : 'Scheme Cap',
                roi: roi,
                roiFixed: "Fixed for first 5 years",
                tenure: tenureRequired,
                maxTenure: maxTenure,
                emi: actualEMI,
                totalInterest: totalInterest,
                totalPayable: totalPayable,
                ltvPercentage: finalLTV,
                marginRequired: marginRequired,
                marginPercentage: marginPercentage,
                sustenanceAmount: sustenanceAmount,
                sustenancePercentage: sustenanceRate * 100,
                availableForEMI: maxMonthlyEMI,
                emiPerLakh: emiPerLakh
            }
        })
    }

    return (
        <div className="housing-loan-page">
            <div className="page-header">
                <Link to="/" className="back-button">← Back to Services</Link>
            </div>

            <div className="app">
                <div className="calculator-container">
                    <div className="header">
                        <div className="header-icon">🏠</div>
                        <h1 className="title">Housing Loan Calculator</h1>
                        <p className="subtitle">Based on Circular No. 186 - APGB Home Loans (Fixed ROI)</p>
                    </div>

                    <form onSubmit={calculate}>
                        <div className="form-grid">
                            {/* Applicant Details */}
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">👤</span>
                                    Age (years)
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter your age"
                                    min="18"
                                    max="75"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">💼</span>
                                    Employment Type
                                </label>
                                <select
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="Salaried">Salaried</option>
                                    <option value="Self-employed">Self-employed</option>
                                    <option value="Pension">Pension</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">💰</span>
                                    Gross Monthly Income (₹)
                                </label>
                                <input
                                    type="number"
                                    name="grossMonthlyIncome"
                                    value={formData.grossMonthlyIncome}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter monthly income"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">👥</span>
                                    Co-Applicant Income (₹/month)
                                </label>
                                <input
                                    type="number"
                                    name="coApplicantIncome"
                                    value={formData.coApplicantIncome}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Optional - if any"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">💳</span>
                                    Existing EMI (₹/month)
                                </label>
                                <input
                                    type="number"
                                    name="existingEMI"
                                    value={formData.existingEMI}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Total existing EMIs"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📊</span>
                                    CIBIL Score
                                </label>
                                <input
                                    type="number"
                                    name="cibilScore"
                                    value={formData.cibilScore}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter CIBIL score"
                                    min="300"
                                    max="900"
                                    required
                                />
                            </div>

                            {/* Loan Details */}
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">🎯</span>
                                    Loan Purpose
                                </label>
                                <select
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="Purchase">Purchase of House/Flat</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Plot+Construction">Plot + Construction</option>
                                    <option value="Extension">Extension/Additional Floor</option>
                                    <option value="Repairs">Repairs</option>
                                    <option value="Renovation">Renovation</option>
                                    <option value="Takeover">Takeover of Existing Loan</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📍</span>
                                    Property Location
                                </label>
                                <select
                                    name="propertyLocation"
                                    value={formData.propertyLocation}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="Urban">Urban</option>
                                    <option value="Semi-urban">Semi-urban</option>
                                    <option value="Rural">Rural</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">🏘️</span>
                                    Property Value (₹)
                                </label>
                                <input
                                    type="number"
                                    name="propertyValue"
                                    value={formData.propertyValue}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Net Realizable Value"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📅</span>
                                    Tenure Required (years)
                                </label>
                                <input
                                    type="number"
                                    name="tenureRequired"
                                    value={formData.tenureRequired}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Loan tenure in years"
                                    min="1"
                                    max="30"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="calculate-btn">
                            Calculate Eligibility
                        </button>
                    </form>

                    {result && (
                        <div className={`result-container ${result.eligible ? 'result-success' : 'result-error'}`}>
                            <div className="result-header">
                                <span className="result-icon">{result.eligible ? '✅' : '❌'}</span>
                                <span>{result.message}</span>
                            </div>

                            {!result.eligible ? (
                                <p className="result-message">{result.reason}</p>
                            ) : (
                                <div className="result-details">
                                    <div className="result-item highlight-box">
                                        <span className="result-label">Eligible Loan Amount</span>
                                        <span className="result-value highlight">
                                            ₹{result.details.eligibleLoan.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Limiting Factor</span>
                                        <span className="result-value">{result.details.limitingFactor}</span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Repayment Capacity Based</span>
                                        <span className="result-value">
                                            ₹{result.details.repaymentBasedLoan.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">LTV Based Loan</span>
                                        <span className="result-value">
                                            ₹{result.details.ltvBasedLoan.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Scheme Cap ({formData.propertyLocation})</span>
                                        <span className="result-value">
                                            ₹{result.details.schemeCap.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Rate of Interest</span>
                                        <span className="result-value">{result.details.roi}% p.a</span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">ROI Status</span>
                                        <span className="result-value">{result.details.roiFixed}</span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Loan Tenure</span>
                                        <span className="result-value">
                                            {result.details.tenure} years (Max: {result.details.maxTenure} years)
                                        </span>
                                    </div>

                                    <div className="result-item highlight-box">
                                        <span className="result-label">Monthly EMI</span>
                                        <span className="result-value highlight">
                                            ₹{result.details.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / month
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">EMI per Lakh</span>
                                        <span className="result-value">
                                            ₹{result.details.emiPerLakh.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Total Interest</span>
                                        <span className="result-value">
                                            ₹{result.details.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Total Payable Amount</span>
                                        <span className="result-value">
                                            ₹{result.details.totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">LTV Percentage</span>
                                        <span className="result-value">
                                            {result.details.ltvPercentage.toFixed(2)}%
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Margin Required</span>
                                        <span className="result-value">
                                            ₹{result.details.marginRequired.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            ({result.details.marginPercentage.toFixed(2)}%)
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Sustenance Amount (Annual)</span>
                                        <span className="result-value">
                                            ₹{result.details.sustenanceAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            ({result.details.sustenancePercentage.toFixed(0)}%)
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Available for EMI</span>
                                        <span className="result-value">
                                            ₹{result.details.availableForEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / month
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="footer">
                        <p>© 2024 Housing Loan Calculator | Based on Circular No. 186 - APGB Home Loans</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            All calculations follow the official circular guidelines
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HousingLoan
