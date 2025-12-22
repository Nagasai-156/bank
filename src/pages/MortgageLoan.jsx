import { useState } from 'react'
import { Link } from 'react-router-dom'
import './MortgageLoan.css'

function MortgageLoan() {
    const [formData, setFormData] = useState({
        // Applicant Details
        applicantCategory: 'Salaried',
        residentType: 'Resident',
        dob: '',
        cibilScore: '',
        facilityType: 'Term Loan',

        // Property Details
        propertyType: 'Residential',
        propertyOwnership: 'Applicant',
        propertyLocation: 'Urban',
        propertyNRV: '',
        propertyAge: '',
        propertyResidualLife: '',

        // Loan Purpose & Request
        loanPurpose: 'Personal needs',
        requestedAmount: '',

        // Income Details - Salaried
        grossMonthlySalary: '',
        annualTaxPaid: '',

        // Income Details - Self-Employed/Professional
        avgAnnualIncome: '',
        annualTaxPaidSE: '',
        itrFiled3Years: 'YES',

        // Existing Obligations
        existingEMIs: '',
        otherObligations: ''
    })

    const [result, setResult] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // EMI per lakh lookup table
    const getEMIPerLakh = (roi, tenureYears) => {
        const monthlyRate = roi / 1200
        const months = tenureYears * 12
        const emiPerLakh = (100000 * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1)
        return emiPerLakh
    }

    const calculateAge = (dob) => {
        if (!dob) return 0
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const getSustenance = (annualIncome) => {
        if (annualIncome <= 300000) return 0.45
        if (annualIncome <= 500000) return 0.40
        if (annualIncome <= 800000) return 0.35
        if (annualIncome <= 1200000) return 0.30
        return 0.25 // >12L
    }

    const getROI = (cibil) => {
        if (cibil >= 750) return 11.00
        if (cibil >= 700) return 11.25
        return 11.75
    }

    const calculate = (e) => {
        e.preventDefault()

        // ========== HARD VALIDATIONS ==========

        // Check 1: Age validation
        const age = calculateAge(formData.dob)
        if (age < 21) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Age Below Minimum",
                reason: `Applicant age (${age}) must be at least 21 years as per Circular 178.`
            })
            return
        }

        // Check 2: Agriculturist NOT allowed
        if (formData.applicantCategory === 'Agriculturist') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Agriculturists Not Permitted",
                reason: "Mortgage Loan is not available for agriculturists as per Circular 178."
            })
            return
        }

        // Check 3: CIBIL minimum 650
        const cibil = Number(formData.cibilScore)
        if (cibil < 650) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - CIBIL Below Minimum",
                reason: `CIBIL score (${cibil}) must be at least 650 as per Circular 178.`
            })
            return
        }

        // Check 4: Property ownership validation
        if (formData.propertyOwnership === 'Third Party') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Property Not Owned",
                reason: "Property must be owned by applicant or co-applicant as per Circular 178."
            })
            return
        }

        // Check 5: Loan amount range
        const requestedAmount = Number(formData.requestedAmount)
        if (requestedAmount < 300000) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Amount Below Minimum",
                reason: "Minimum loan amount is ₹3,00,000 as per Circular 178."
            })
            return
        }

        if (requestedAmount > 50000000) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Amount Exceeds Maximum",
                reason: "Maximum loan amount is ₹5,00,00,000 as per Circular 178."
            })
            return
        }

        // Check 6: ITR validation for Self-Employed/Professional
        if ((formData.applicantCategory === 'Self-Employed' ||
            formData.applicantCategory === 'Professional') &&
            formData.itrFiled3Years !== 'YES') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - ITR Not Filed",
                reason: "ITR for last 3 years is mandatory for self-employed/professional applicants as per Circular 178."
            })
            return
        }

        // ========== INCOME & EMI CAPACITY ==========

        let netMonthlyIncome = 0
        let annualIncome = 0

        if (formData.applicantCategory === 'Salaried') {
            const grossSalary = Number(formData.grossMonthlySalary)
            const annualTax = Number(formData.annualTaxPaid)
            annualIncome = (grossSalary * 12) - annualTax
            netMonthlyIncome = annualIncome / 12
        } else {
            // Self-Employed / Professional
            const avgIncome = Number(formData.avgAnnualIncome)
            const annualTax = Number(formData.annualTaxPaidSE)
            annualIncome = avgIncome - annualTax
            netMonthlyIncome = annualIncome / 12
        }

        // Sustenance calculation
        const sustenanceRate = getSustenance(annualIncome)
        const monthlySustenance = netMonthlyIncome * sustenanceRate

        // Cap sustenance for >12L annual income
        const maxSustenance = annualIncome > 1200000 ? 100000 : monthlySustenance

        // Available EMI
        const existingEMIs = Number(formData.existingEMIs) || 0
        const otherObligations = Number(formData.otherObligations) || 0
        const availableEMI = netMonthlyIncome - Math.min(monthlySustenance, maxSustenance) - existingEMIs - otherObligations

        // Check 7: EMI capacity
        if (availableEMI <= 0) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - No EMI Capacity",
                reason: `After sustenance (₹${Math.round(Math.min(monthlySustenance, maxSustenance)).toLocaleString('en-IN')}) and existing obligations (₹${(existingEMIs + otherObligations).toLocaleString('en-IN')}), there is no surplus for loan EMI.`
            })
            return
        }

        // ========== TENURE CALCULATION ==========

        let maxTenureYears = 0

        if (formData.facilityType === 'Term Loan') {
            const ageAtMaturity = 70 - age
            const residualLife = Number(formData.propertyResidualLife)
            const residualLifeTenure = residualLife - 5

            maxTenureYears = Math.min(15, ageAtMaturity, residualLifeTenure)

            // Check 8: Age at maturity
            if (maxTenureYears <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Age Constraint",
                    reason: `Age at loan maturity would exceed 70 years. Current age: ${age}, Max tenure possible: ${maxTenureYears} years.`
                })
                return
            }

            // Check 9: Residual life constraint
            if (residualLifeTenure <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Property Life Insufficient",
                    reason: `Property residual life (${residualLife} years) must be at least 5 years more than loan tenure.`
                })
                return
            }
        } else {
            // Overdraft - annual review
            maxTenureYears = 1 // For EMI calculation purpose
        }

        // ========== ROI & EMI-BASED ELIGIBILITY ==========

        const roi = getROI(cibil)
        const emiPerLakh = formData.facilityType === 'Term Loan'
            ? getEMIPerLakh(roi, maxTenureYears)
            : 0 // Overdraft doesn't have EMI

        let emiBasedEligibility = 0

        if (formData.facilityType === 'Term Loan') {
            emiBasedEligibility = (availableEMI / emiPerLakh) * 100000
        } else {
            // Overdraft - use interest servicing capacity
            const monthlyInterest = roi / 1200
            // Assuming borrower can service interest from available income
            emiBasedEligibility = availableEMI / monthlyInterest
        }

        // ========== LTV CALCULATION ==========

        const nrv = Number(formData.propertyNRV)
        const ltvRate = formData.facilityType === 'Term Loan' ? 0.60 : 0.50
        const ltvLimit = nrv * ltvRate

        // ========== FINAL ELIGIBLE LOAN ==========

        const eligibleLoan = Math.min(
            emiBasedEligibility,
            ltvLimit,
            requestedAmount,
            50000000 // Max ₹5 Cr
        )

        // Check 10: Final amount below minimum
        if (eligibleLoan < 300000) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Eligible Amount Below Minimum",
                reason: `Maximum eligible loan amount is ₹${(eligibleLoan / 100000).toFixed(2)}L, which is below the minimum requirement of ₹3L.`
            })
            return
        }

        // SUCCESS - Calculate EMI
        const finalEMI = formData.facilityType === 'Term Loan'
            ? (eligibleLoan / 100000) * emiPerLakh
            : 0

        const monthlyInterest = formData.facilityType === 'Overdraft'
            ? (eligibleLoan * roi / 1200)
            : 0

        setResult({
            eligible: true,
            message: "✅ ELIGIBLE FOR MORTGAGE LOAN",
            details: {
                eligibleLoan: Math.floor(eligibleLoan),
                requestedAmount,
                roi,
                tenure: maxTenureYears,
                emi: Math.round(finalEMI),
                monthlyInterest: Math.round(monthlyInterest),
                facilityType: formData.facilityType,
                ltvRate: ltvRate * 100,
                ltvLimit,
                nrv,
                netMonthlyIncome: Math.round(netMonthlyIncome),
                sustenance: Math.round(Math.min(monthlySustenance, maxSustenance)),
                availableEMI: Math.round(availableEMI),
                existingObligations: existingEMIs + otherObligations,
                emiBasedEligibility: Math.floor(emiBasedEligibility),
                restrictingFactor: eligibleLoan === emiBasedEligibility ? 'EMI Capacity' :
                    eligibleLoan === ltvLimit ? 'LTV Limit' :
                        eligibleLoan === requestedAmount ? 'Requested Amount' : 'Scheme Maximum'
            }
        })
    }

    return (
        <div className="mortgage-loan-container">
            <div className="page-header">
                <Link to="/" style={{ position: 'absolute', left: '24px', color: 'white', textDecoration: 'none' }}>
                    ← Back to Home
                </Link>
                <h1 className="header-title">
                    🏦 APGB Mortgage Loan Eligibility Calculator
                </h1>
                <p className="header-subtitle">
                    Circular No.178 dated 29-08-2025 | Term Loan & Overdraft Facility
                </p>
            </div>

            <form className="loan-form" onSubmit={calculate}>
                {/* Applicant Details */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">👤</span>
                        <h3 className="section-title">Applicant Details</h3>
                    </div>

                    <div className="form-grid-3">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💼</span>
                                Applicant Category
                            </label>
                            <select
                                name="applicantCategory"
                                value={formData.applicantCategory}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="Salaried">Salaried</option>
                                <option value="Self-Employed">Self-Employed / Business</option>
                                <option value="Professional">Professional</option>
                                <option value="Agriculturist">Agriculturist (Not Eligible)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🌍</span>
                                Resident Type
                            </label>
                            <select
                                name="residentType"
                                value={formData.residentType}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="Resident">Resident</option>
                                <option value="NRI">NRI</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📅</span>
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                            <span className="helper-text">Age: 21-70 years</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📈</span>
                                CIBIL Score
                            </label>
                            <input
                                type="number"
                                name="cibilScore"
                                value={formData.cibilScore}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., 750"
                                min="300"
                                max="900"
                                required
                            />
                            <span className="helper-text">Minimum: 650</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🏦</span>
                                Facility Type
                            </label>
                            <select
                                name="facilityType"
                                value={formData.facilityType}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="Term Loan">Term Loan (TL)</option>
                                <option value="Overdraft">Secured Overdraft (POD/SOD)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Property Details */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">🏠</span>
                        <h3 className="section-title">Property Details</h3>
                    </div>

                    <div className="form-grid-3">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🏢</span>
                                Property Type
                            </label>
                            <select
                                name="propertyType"
                                value={formData.propertyType}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Industrial">Industrial</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">👥</span>
                                Property Ownership
                            </label>
                            <select
                                name="propertyOwnership"
                                value={formData.propertyOwnership}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="Applicant">Applicant</option>
                                <option value="Co-applicant">Co-applicant</option>
                                <option value="Third Party">Third Party (Not Eligible)</option>
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
                                <option value="Semi-Urban">Semi-Urban</option>
                                <option value="Rural">Rural</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💎</span>
                                Net Realizable Value (₹)
                            </label>
                            <input
                                type="number"
                                name="propertyNRV"
                                value={formData.propertyNRV}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Property NRV"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🏚️</span>
                                Property Age (Years)
                            </label>
                            <input
                                type="number"
                                name="propertyAge"
                                value={formData.propertyAge}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Age of property"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">⏳</span>
                                Residual Life (Years)
                            </label>
                            <input
                                type="number"
                                name="propertyResidualLife"
                                value={formData.propertyResidualLife}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Remaining life"
                                min="5"
                                required
                            />
                            <span className="helper-text">Must be ≥ (tenure + 5 years)</span>
                        </div>
                    </div>
                </div>

                {/* Loan Purpose & Request */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">🎯</span>
                        <h3 className="section-title">Loan Purpose & Request</h3>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📝</span>
                                Loan Purpose
                            </label>
                            <select
                                name="loanPurpose"
                                value={formData.loanPurpose}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="Personal needs">Personal needs</option>
                                <option value="Medical expenses">Medical expenses</option>
                                <option value="Higher education">Higher education</option>
                                <option value="House renovation">House renovation</option>
                                <option value="Travel / unforeseen expenses">Travel / unforeseen expenses</option>
                                <option value="Liquidity support">Liquidity support (OD only)</option>
                            </select>
                            <span className="helper-text" style={{ color: '#0369a1' }}>
                                Business expansion, working capital, and speculative purposes NOT allowed
                            </span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💵</span>
                                Requested Loan Amount (₹)
                            </label>
                            <input
                                type="number"
                                name="requestedAmount"
                                value={formData.requestedAmount}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Amount required"
                                min="300000"
                                max="50000000"
                                required
                            />
                            <span className="helper-text">Min: ₹3L | Max: ₹5 Cr</span>
                        </div>
                    </div>
                </div>

                {/* Income Details */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">💰</span>
                        <h3 className="section-title">Income Details</h3>
                    </div>

                    {formData.applicantCategory === 'Salaried' ? (
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">💵</span>
                                    Gross Monthly Salary (₹)
                                </label>
                                <input
                                    type="number"
                                    name="grossMonthlySalary"
                                    value={formData.grossMonthlySalary}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Before deductions"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📊</span>
                                    Annual Tax Paid (₹)
                                </label>
                                <input
                                    type="number"
                                    name="annualTaxPaid"
                                    value={formData.annualTaxPaid}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Total tax per year"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="form-grid-3">
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📈</span>
                                    Average Annual Income (₹)
                                </label>
                                <input
                                    type="number"
                                    name="avgAnnualIncome"
                                    value={formData.avgAnnualIncome}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Last 3 years average"
                                    min="0"
                                    required
                                />
                                <span className="helper-text">Average of last 3 years</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📊</span>
                                    Annual Tax Paid (₹)
                                </label>
                                <input
                                    type="number"
                                    name="annualTaxPaidSE"
                                    value={formData.annualTaxPaidSE}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Total tax per year"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📄</span>
                                    ITR Filed (Last 3 Years)?
                                </label>
                                <select
                                    name="itrFiled3Years"
                                    value={formData.itrFiled3Years}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="YES">YES - Filed for 3 years</option>
                                    <option value="NO">NO - Not filed</option>
                                </select>
                                <span className="helper-text" style={{ color: '#ef4444', fontWeight: '600' }}>
                                    ⚠️ Mandatory as per Circular 178
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Existing Obligations */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">💳</span>
                        <h3 className="section-title">Existing Obligations</h3>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📉</span>
                                Existing EMIs (₹/month)
                            </label>
                            <input
                                type="number"
                                name="existingEMIs"
                                value={formData.existingEMIs}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Monthly EMI commitment"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💸</span>
                                Other Obligations (₹/month)
                            </label>
                            <input
                                type="number"
                                name="otherObligations"
                                value={formData.otherObligations}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Other recurring payments"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className="calculate-btn">
                    Calculate Eligibility ✨
                </button>
            </form>

            {/* Results */}
            {result && (
                <div className={result.eligible ? "result-card-premium" : "result-card"}>
                    <div className={result.eligible ? "result-header-premium" : "result-header error"}>
                        <div className="result-header-icon">
                            {result.eligible ? '✅' : '❌'}
                        </div>
                        <div>{result.message}</div>
                    </div>

                    {!result.eligible ? (
                        <div className="result-body">
                            <div className="rejection-reason">
                                <strong>Reason:</strong> {result.reason}
                            </div>
                        </div>
                    ) : (
                        <div className="result-body">
                            {/* Eligible Amount */}
                            <div className="max-loan-box">
                                <div className="max-loan-label">Maximum Eligible Loan Amount</div>
                                <div className="max-loan-value">
                                    ₹{(result.details.eligibleLoan / 100000).toFixed(2)} L
                                </div>
                            </div>

                            {/* Key Stats */}
                            <div className="stats-row">
                                <div className="stat-box">
                                    <div className="stat-label">ROI</div>
                                    <div className="stat-value">{result.details.roi.toFixed(2)}%</div>
                                    <div className="stat-sub">Based on CIBIL</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-label">{result.details.facilityType === 'Term Loan' ? 'Monthly EMI' : 'Monthly Interest'}</div>
                                    <div className="stat-value">
                                        ₹{result.details.facilityType === 'Term Loan'
                                            ? result.details.emi.toLocaleString('en-IN')
                                            : result.details.monthlyInterest.toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-label">Tenure</div>
                                    <div className="stat-value">
                                        {result.details.facilityType === 'Term Loan'
                                            ? `${result.details.tenure} Years`
                                            : 'Annual Review'}
                                    </div>
                                </div>
                            </div>

                            {/* LTV Analysis */}
                            <div className="breakdown-section">
                                <h4 className="breakdown-title">🏠 LTV Analysis</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Property NRV</span>
                                        <span>₹{(result.details.nrv / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>LTV Rate ({result.details.facilityType})</span>
                                        <span>{result.details.ltvRate}%</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Maximum by LTV</span>
                                        <span>₹{(result.details.ltvLimit / 100000).toFixed(2)} L</span>
                                    </div>
                                </div>
                            </div>

                            {/* Income & EMI Capacity */}
                            <div className="breakdown-section">
                                <h4 className="breakdown-title">💰 Income & EMI Analysis</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Net Monthly Income</span>
                                        <span>₹{result.details.netMonthlyIncome.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Less: Sustenance</span>
                                        <span>-₹{result.details.sustenance.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Less: Existing Obligations</span>
                                        <span>-₹{result.details.existingObligations.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row" style={{ background: '#d1fae5', fontWeight: 'bold' }}>
                                        <span>Available EMI Capacity</span>
                                        <span>₹{result.details.availableEMI.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Max Loan by EMI Capacity</span>
                                        <span>₹{(result.details.emiBasedEligibility / 100000).toFixed(2)} L</span>
                                    </div>
                                </div>
                            </div>

                            {/* Final Determination */}
                            <div className="breakdown-section">
                                <h4 className="breakdown-title">📊 Final Determination</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Requested Amount</span>
                                        <span>₹{(result.details.requestedAmount / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>EMI-Based Eligibility</span>
                                        <span>₹{(result.details.emiBasedEligibility / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>LTV-Based Limit</span>
                                        <span>₹{(result.details.ltvLimit / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row" style={{ background: '#dbeafe', fontWeight: 'bold' }}>
                                        <span>Restricting Factor</span>
                                        <span>{result.details.restrictingFactor}</span>
                                    </div>
                                    <div className="breakdown-row" style={{ background: '#fef3c7', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        <span>Final Eligible Amount</span>
                                        <span>₹{(result.details.eligibleLoan / 100000).toFixed(2)} L</span>
                                    </div>
                                </div>
                            </div>

                            {/* Important Notes */}
                            <div style={{ marginTop: '25px', padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                                <h4 style={{ marginTop: 0, color: '#92400e' }}>📌 Important Notes</h4>
                                <ul style={{ marginLeft: '20px', color: '#78350f', fontSize: '0.9rem', lineHeight: '1.8' }}>
                                    <li>Moratorium NOT permitted as per Circular 178</li>
                                    <li>Property must be SARFAESI-compliant</li>
                                    <li>Open plots and agricultural land NOT eligible</li>
                                    {result.details.facilityType === 'Overdraft' && (
                                        <li>Overdraft subject to annual review</li>
                                    )}
                                    <li>Final sanction subject to property valuation and legal verification</li>
                                </ul>
                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <small style={{ color: '#adb5bd', fontSize: '0.7em' }}>
                                    * Calculations as per APGB Circular No. 178 dated 29-08-2025
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default MortgageLoan
