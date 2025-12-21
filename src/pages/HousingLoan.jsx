import { useState } from 'react'
import { Link } from 'react-router-dom'
import './HousingLoan.css'

function HousingLoan() {
    const [formData, setFormData] = useState({
        // Applicant Mode
        applicantType: 'Single',

        // Applicant 1 Details
        dob1: '',
        employmentType1: 'Salaried',
        grossSalary1: '',
        taxDeduction1: '',
        otherDeductions1: '',
        cibilScore1: '',
        cibilClean1: 'YES',

        // Applicant 2 Details (for Joint)
        dob2: '',
        employmentType2: 'Salaried',
        grossSalary2: '',
        taxDeduction2: '',
        otherDeductions2: '',
        cibilScore2: '',
        cibilClean2: 'YES',

        // Common Details
        existingEMI: '',

        // Loan Details
        loanPurpose: 'Purchase',

        // Property Details
        propertyType: 'Flat',
        propertyLocation: 'Urban',
        propertyAge: '',
        saleAgreementValue: '',
        realizableValue: '',
        pendingWorks: ''
    })

    const [result, setResult] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Calculate age from DOB
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

    // Get ROI based on CIBIL
    const getROI = (cibil) => {
        if (cibil >= 750) return 7.75
        if (cibil >= 700) return 8.25
        if (cibil >= 650) return 8.75
        return 9.50
    }

    // Get sustenance percentage
    const getSustenanceRate = (annualIncome) => {
        if (annualIncome <= 300000) return 0.45
        if (annualIncome <= 500000) return 0.40
        if (annualIncome <= 800000) return 0.35
        if (annualIncome <= 1200000) return 0.30
        // Above 12L: Lower of 25% or ₹20,000/month
        const twentyKPerMonth = 20000
        const twentyFivePercent = annualIncome * 0.25 / 12
        return Math.min(twentyFivePercent, twentyKPerMonth) / (annualIncome / 12)
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

    // Get max exit age
    const getMaxExitAge = (employmentType) => {
        if (employmentType === 'Salaried') return 60
        return 75 // Salaried+Pension, Business, Agriculture
    }

    const calculate = (e) => {
        e.preventDefault()

        const applicantType = formData.applicantType
        const age1 = calculateAge(formData.dob1)
        const cibilClean1 = formData.cibilClean1
        const cibil1 = Number(formData.cibilScore1)

        // HARD CHECK 1: CIBIL Clean Status for Applicant 1
        if (cibilClean1 !== 'YES') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - CIBIL Adverse",
                reason: "Applicant has adverse CIBIL history (overdues/NPA/write-off/OTS). Loan cannot be processed."
            })
            return
        }

        // For Joint Applicants
        if (applicantType === 'Joint') {
            const age2 = calculateAge(formData.dob2)
            const cibilClean2 = formData.cibilClean2

            // HARD CHECK 2: Both applicants must have clean CIBIL
            if (cibilClean2 !== 'YES') {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Co-Applicant CIBIL Adverse",
                    reason: "Co-applicant has adverse CIBIL history. Joint loan cannot be processed."
                })
                return
            }

            // Determine elder applicant for exit age check
            const elderAge = Math.max(age1, age2)
            const elderEmployment = age1 >= age2 ? formData.employmentType1 : formData.employmentType2
            const maxExitAge = getMaxExitAge(elderEmployment)

            // Assume max tenure 30 years for calculation
            const exitAge = elderAge + 30

            if (exitAge > maxExitAge) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Exit Age Exceeds Limit",
                    reason: `Elder applicant's exit age (${exitAge}) exceeds maximum allowed (${maxExitAge}) for ${elderEmployment} category.`
                })
                return
            }

            // Calculate income for both applicants
            const grossSalary1 = Number(formData.grossSalary1) || 0
            const taxDeduction1 = Number(formData.taxDeduction1) || 0
            const otherDeductions1 = Number(formData.otherDeductions1) || 0
            const netIncome1 = grossSalary1 - taxDeduction1 - otherDeductions1

            const grossSalary2 = Number(formData.grossSalary2) || 0
            const taxDeduction2 = Number(formData.taxDeduction2) || 0
            const otherDeductions2 = Number(formData.otherDeductions2) || 0
            const netIncome2 = grossSalary2 - taxDeduction2 - otherDeductions2

            // Joint EMI Calculation: 65% of each applicant's net income
            const eligibleEMI1 = netIncome1 * 0.65
            const eligibleEMI2 = netIncome2 * 0.65
            const totalEligibleEMI = eligibleEMI1 + eligibleEMI2

            const existingEMI = Number(formData.existingEMI) || 0
            const availableEMI = totalEligibleEMI - existingEMI

            if (availableEMI <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Insufficient Repayment Capacity",
                    reason: `After deducting existing EMIs (₹${existingEMI.toLocaleString('en-IN')}), no surplus available for new EMI.`
                })
                return
            }

            // Calculate loan as per EMI
            const avgCibil = (cibil1 + Number(formData.cibilScore2)) / 2
            const roi = getROI(avgCibil)
            const emiPerLakh = calculateEMIPerLakh(roi, 30) // Assume 30 years
            const loanAsPerEMI = (availableEMI / emiPerLakh) * 100000

            // Calculate project cost
            const saleValue = Number(formData.saleAgreementValue) || 0
            const realizableValue = Number(formData.realizableValue) || 0
            const pendingWorks = Number(formData.pendingWorks) || 0
            const projectCost = Math.min(saleValue, realizableValue) + pendingWorks

            // Calculate loan as per LTV
            let loanAsPerLTV = projectCost * 0.90 // Start with highest
            const actualLTV = getLTV(loanAsPerLTV)
            loanAsPerLTV = projectCost * actualLTV

            // Purpose-specific cap
            let purposeCap = Infinity
            if (formData.loanPurpose === 'Repairs' || formData.loanPurpose === 'Renovation') {
                purposeCap = 3000000 // ₹30 Lakhs
            }

            // Final eligible loan
            const eligibleLoan = Math.min(loanAsPerEMI, loanAsPerLTV, purposeCap)

            // Calculate actual EMI
            const actualEMI = (eligibleLoan / 100000) * emiPerLakh
            const maxTenure = 30
            const totalInterest = (actualEMI * maxTenure * 12) - eligibleLoan
            const totalPayable = eligibleLoan + totalInterest

            setResult({
                eligible: true,
                message: "✅ ELIGIBLE for Housing Loan (Joint Application)",
                details: {
                    eligibleLoan: eligibleLoan,
                    loanAsPerEMI: loanAsPerEMI,
                    loanAsPerLTV: loanAsPerLTV,
                    limitingFactor: eligibleLoan === loanAsPerEMI ? 'Joint EMI Capacity' :
                        eligibleLoan === loanAsPerLTV ? 'LTV Limit' : 'Purpose Cap',
                    roi: roi,
                    maxPermissibleEMI: availableEMI,
                    maxPermissibleTenure: maxTenure,
                    actualEMI: actualEMI,
                    totalInterest: totalInterest,
                    totalPayable: totalPayable,
                    projectCost: projectCost,
                    ltvPercentage: (eligibleLoan / projectCost) * 100,
                    marginRequired: projectCost - eligibleLoan,
                    applicant1EMI: eligibleEMI1,
                    applicant2EMI: eligibleEMI2,
                    totalEligibleEMI: totalEligibleEMI,
                    existingEMI: existingEMI
                }
            })

        } else {
            // SINGLE APPLICANT LOGIC
            const maxExitAge = getMaxExitAge(formData.employmentType1)
            const exitAge = age1 + 30 // Assume 30 years tenure

            if (exitAge > maxExitAge) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Exit Age Exceeds Limit",
                    reason: `Exit age (${exitAge}) exceeds maximum allowed (${maxExitAge}) for ${formData.employmentType1} category.`
                })
                return
            }

            // Calculate net income
            const grossSalary = Number(formData.grossSalary1) || 0
            const taxDeduction = Number(formData.taxDeduction1) || 0
            const otherDeductions = Number(formData.otherDeductions1) || 0
            const netMonthlyIncome = grossSalary - taxDeduction - otherDeductions
            const annualIncome = netMonthlyIncome * 12

            // Calculate sustenance
            const sustenanceRate = getSustenanceRate(annualIncome)
            const sustenanceAmount = netMonthlyIncome * sustenanceRate

            // Calculate surplus EMI
            const existingEMI = Number(formData.existingEMI) || 0
            const surplusEMI = netMonthlyIncome - existingEMI - sustenanceAmount

            if (surplusEMI <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Insufficient Repayment Capacity",
                    reason: `After sustenance (${(sustenanceRate * 100).toFixed(0)}%) and existing EMIs, no surplus available for new EMI.`
                })
                return
            }

            // Calculate loan as per EMI
            const roi = getROI(cibil1)
            const emiPerLakh = calculateEMIPerLakh(roi, 30)
            const loanAsPerEMI = (surplusEMI / emiPerLakh) * 100000

            // Calculate project cost
            const saleValue = Number(formData.saleAgreementValue) || 0
            const realizableValue = Number(formData.realizableValue) || 0
            const pendingWorks = Number(formData.pendingWorks) || 0
            const projectCost = Math.min(saleValue, realizableValue) + pendingWorks

            // Calculate loan as per LTV
            let loanAsPerLTV = projectCost * 0.90
            const actualLTV = getLTV(loanAsPerLTV)
            loanAsPerLTV = projectCost * actualLTV

            // Purpose-specific cap
            let purposeCap = Infinity
            if (formData.loanPurpose === 'Repairs' || formData.loanPurpose === 'Renovation') {
                purposeCap = 3000000
            }

            // Final eligible loan
            const eligibleLoan = Math.min(loanAsPerEMI, loanAsPerLTV, purposeCap)

            // Calculate actual EMI
            const actualEMI = (eligibleLoan / 100000) * emiPerLakh
            const maxTenure = 30
            const totalInterest = (actualEMI * maxTenure * 12) - eligibleLoan
            const totalPayable = eligibleLoan + totalInterest

            setResult({
                eligible: true,
                message: "✅ ELIGIBLE for Housing Loan",
                details: {
                    eligibleLoan: eligibleLoan,
                    loanAsPerEMI: loanAsPerEMI,
                    loanAsPerLTV: loanAsPerLTV,
                    limitingFactor: eligibleLoan === loanAsPerEMI ? 'EMI Capacity' :
                        eligibleLoan === loanAsPerLTV ? 'LTV Limit' : 'Purpose Cap',
                    roi: roi,
                    maxPermissibleEMI: surplusEMI,
                    maxPermissibleTenure: maxTenure,
                    actualEMI: actualEMI,
                    totalInterest: totalInterest,
                    totalPayable: totalPayable,
                    projectCost: projectCost,
                    ltvPercentage: (eligibleLoan / projectCost) * 100,
                    marginRequired: projectCost - eligibleLoan,
                    sustenanceAmount: sustenanceAmount,
                    sustenancePercentage: sustenanceRate * 100,
                    netMonthlyIncome: netMonthlyIncome
                }
            })
        }
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
                        <h1 className="title">APGB Home Loan Eligibility Calculator</h1>
                        <p className="subtitle">CPC-Style Eligibility Check | Circular No. 186/2025</p>
                    </div>

                    <form onSubmit={calculate}>
                        {/* Applicant Type Selection */}
                        <div className="section-header">
                            <h3>📋 Application Type</h3>
                        </div>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">
                                    <span className="label-icon">👥</span>
                                    Applicant Type
                                </label>
                                <select
                                    name="applicantType"
                                    value={formData.applicantType}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="Single">Single Applicant</option>
                                    <option value="Joint">Joint Applicants (2 persons)</option>
                                </select>
                            </div>
                        </div>

                        {/* Applicant 1 Details */}
                        <div className="section-header">
                            <h3>👤 {formData.applicantType === 'Joint' ? 'Applicant 1 Details' : 'Applicant Details'}</h3>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📅</span>
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dob1"
                                    value={formData.dob1}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                                {formData.dob1 && (
                                    <small className="helper-text">Age: {calculateAge(formData.dob1)} years</small>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">💼</span>
                                    Employment Type
                                </label>
                                <select
                                    name="employmentType1"
                                    value={formData.employmentType1}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="Salaried">Salaried</option>
                                    <option value="Business">Business</option>
                                    <option value="Agriculture">Agriculture</option>
                                    <option value="Salaried+Pension">Salaried + Pension</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">💰</span>
                                    Gross Monthly Salary (₹)
                                </label>
                                <input
                                    type="number"
                                    name="grossSalary1"
                                    value={formData.grossSalary1}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter gross salary"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📉</span>
                                    Monthly Tax Deduction (₹)
                                </label>
                                <input
                                    type="number"
                                    name="taxDeduction1"
                                    value={formData.taxDeduction1}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Tax deducted"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📊</span>
                                    Other Monthly Deductions (₹)
                                </label>
                                <input
                                    type="number"
                                    name="otherDeductions1"
                                    value={formData.otherDeductions1}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="PF, insurance, etc."
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📈</span>
                                    CIBIL Score
                                </label>
                                <input
                                    type="number"
                                    name="cibilScore1"
                                    value={formData.cibilScore1}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter CIBIL score"
                                    min="300"
                                    max="900"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">✅</span>
                                    CIBIL Clean Status
                                </label>
                                <select
                                    name="cibilClean1"
                                    value={formData.cibilClean1}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="YES">YES - No overdues/NPA/Write-off</option>
                                    <option value="NO">NO - Has adverse history</option>
                                </select>
                            </div>
                        </div>

                        {/* Applicant 2 Details (Only for Joint) */}
                        {formData.applicantType === 'Joint' && (
                            <>
                                <div className="section-header">
                                    <h3>👤 Applicant 2 Details</h3>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <span className="label-icon">📅</span>
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            name="dob2"
                                            value={formData.dob2}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        />
                                        {formData.dob2 && (
                                            <small className="helper-text">Age: {calculateAge(formData.dob2)} years</small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <span className="label-icon">💼</span>
                                            Employment Type
                                        </label>
                                        <select
                                            name="employmentType2"
                                            value={formData.employmentType2}
                                            onChange={handleChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="Salaried">Salaried</option>
                                            <option value="Business">Business</option>
                                            <option value="Agriculture">Agriculture</option>
                                            <option value="Salaried+Pension">Salaried + Pension</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <span className="label-icon">💰</span>
                                            Gross Monthly Salary (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="grossSalary2"
                                            value={formData.grossSalary2}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter gross salary"
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <span className="label-icon">📉</span>
                                            Monthly Tax Deduction (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="taxDeduction2"
                                            value={formData.taxDeduction2}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Tax deducted"
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <span className="label-icon">📊</span>
                                            Other Monthly Deductions (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="otherDeductions2"
                                            value={formData.otherDeductions2}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="PF, insurance, etc."
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <span className="label-icon">📈</span>
                                            CIBIL Score
                                        </label>
                                        <input
                                            type="number"
                                            name="cibilScore2"
                                            value={formData.cibilScore2}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter CIBIL score"
                                            min="300"
                                            max="900"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <span className="label-icon">✅</span>
                                            CIBIL Clean Status
                                        </label>
                                        <select
                                            name="cibilClean2"
                                            value={formData.cibilClean2}
                                            onChange={handleChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="YES">YES - No overdues/NPA/Write-off</option>
                                            <option value="NO">NO - Has adverse history</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Common Credit Details */}
                        <div className="section-header">
                            <h3>💳 Credit Details</h3>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">💸</span>
                                    Existing Monthly EMI (₹)
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
                        </div>

                        {/* Loan Details */}
                        <div className="section-header">
                            <h3>🎯 Loan Details</h3>
                        </div>
                        <div className="form-grid">
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
                                    <option value="Purchase">Purchase</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Plot+Construction">Plot + Construction</option>
                                    <option value="Repairs">Repairs</option>
                                    <option value="Renovation">Renovation</option>
                                    <option value="Takeover">Takeover</option>
                                </select>
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="section-header">
                            <h3>🏘️ Property Details</h3>
                        </div>
                        <div className="form-grid">
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
                                    <option value="Flat">Residential Flat</option>
                                    <option value="Building">Residential Building</option>
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
                                    <span className="label-icon">⏱️</span>
                                    Age of Property (Years)
                                </label>
                                <input
                                    type="number"
                                    name="propertyAge"
                                    value={formData.propertyAge}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Property age"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📄</span>
                                    Sale Agreement Value (₹)
                                </label>
                                <input
                                    type="number"
                                    name="saleAgreementValue"
                                    value={formData.saleAgreementValue}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="As per agreement"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">💎</span>
                                    Realizable Value (₹)
                                </label>
                                <input
                                    type="number"
                                    name="realizableValue"
                                    value={formData.realizableValue}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Valuer estimate"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">🔨</span>
                                    Cost of Pending Works (₹)
                                </label>
                                <input
                                    type="number"
                                    name="pendingWorks"
                                    value={formData.pendingWorks}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="If any"
                                    min="0"
                                />
                            </div>
                        </div>

                        <button type="submit" className="calculate-btn">
                            Check Eligibility
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
                                        <span className="result-label">Maximum Eligible Loan Amount</span>
                                        <span className="result-value highlight">
                                            ₹{result.details.eligibleLoan.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Limiting Factor</span>
                                        <span className="result-value">{result.details.limitingFactor}</span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Loan as per EMI Capacity</span>
                                        <span className="result-value">
                                            ₹{result.details.loanAsPerEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Loan as per LTV</span>
                                        <span className="result-value">
                                            ₹{result.details.loanAsPerLTV.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Applicable ROI</span>
                                        <span className="result-value">{result.details.roi}% p.a</span>
                                    </div>

                                    <div className="result-item highlight-box">
                                        <span className="result-label">Maximum Permissible EMI</span>
                                        <span className="result-value highlight">
                                            ₹{result.details.maxPermissibleEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / month
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Maximum Permissible Tenure</span>
                                        <span className="result-value">{result.details.maxPermissibleTenure} years</span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Actual EMI (if full loan taken)</span>
                                        <span className="result-value">
                                            ₹{result.details.actualEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / month
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
                                        <span className="result-label">Project Cost</span>
                                        <span className="result-value">
                                            ₹{result.details.projectCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
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
                                        </span>
                                    </div>

                                    {formData.applicantType === 'Joint' && (
                                        <>
                                            <div className="result-item">
                                                <span className="result-label">Applicant 1 Eligible EMI (65%)</span>
                                                <span className="result-value">
                                                    ₹{result.details.applicant1EMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>

                                            <div className="result-item">
                                                <span className="result-label">Applicant 2 Eligible EMI (65%)</span>
                                                <span className="result-value">
                                                    ₹{result.details.applicant2EMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>

                                            <div className="result-item">
                                                <span className="result-label">Total Eligible EMI (Combined)</span>
                                                <span className="result-value">
                                                    ₹{result.details.totalEligibleEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {formData.applicantType === 'Single' && result.details.sustenanceAmount && (
                                        <>
                                            <div className="result-item">
                                                <span className="result-label">Sustenance Amount</span>
                                                <span className="result-value">
                                                    ₹{result.details.sustenanceAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                    ({result.details.sustenancePercentage.toFixed(0)}%)
                                                </span>
                                            </div>

                                            <div className="result-item">
                                                <span className="result-label">Net Monthly Income</span>
                                                <span className="result-value">
                                                    ₹{result.details.netMonthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="footer">
                        <p>© 2024 APGB Home Loan Eligibility Calculator | CPC-Style Logic</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            Based on Circular No. 186/2025 | For eligibility check only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HousingLoan
