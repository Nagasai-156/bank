import { useState } from 'react'
import { Link } from 'react-router-dom'
import './RideEasyLoan.css'

function RideEasyLoan() {
    const [formData, setFormData] = useState({
        // Vehicle Details
        vehicleType: '2W',
        vehicleCondition: 'New',
        intendedUse: 'Personal',
        onRoadPrice: '',
        accessories: '',
        extendedWarranty: '',
        tcs: '',
        isEV: 'NO',
        isHybrid: 'NO',

        // Applicant Details
        dob: '',
        employmentType: 'Salaried',
        isGovtPSU: 'NO',
        cibilScore: '',

        // Income Details - Salaried
        grossMonthlySalary: '',
        annualTaxPaid: '',

        // Income Details - Self-Employed/Professional
        avgAnnualIncome: '',
        annualTaxPaidSE: '',
        itrFiled: 'NO',

        // Income Details - Agriculturist
        annualAgriIncome: '',

        // Loan Details
        requestedLoan: '',
        cashMargin: '',
        requestedTenure: '',

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

    const getSustenance = (grossAnnualIncome, cibil) => {
        const isCibilHigh = cibil >= 700

        // Circular 55 Sustenance Table
        if (grossAnnualIncome <= 300000) {
            return isCibilHigh ? 0.40 : 0.45
        }
        if (grossAnnualIncome <= 500000) {
            return isCibilHigh ? 0.35 : 0.40
        }
        if (grossAnnualIncome <= 800000) {
            return isCibilHigh ? 0.30 : 0.35
        }
        if (grossAnnualIncome <= 1200000) {
            return isCibilHigh ? 0.25 : 0.30
        }
        // > 12L
        return isCibilHigh ? 0.20 : 0.25
    }

    const getROI = (vehicleType, cibil, isGovtPSU, isEV, isHybrid) => {
        let baseROI = 0

        // Base ROI by vehicle type and CIBIL
        if (vehicleType === '2W') {
            if (cibil >= 750) baseROI = 8.75
            else if (cibil >= 700) baseROI = 9.00
            else if (cibil >= 650) baseROI = 9.25
            else baseROI = 9.50
        } else { // 4W
            if (cibil >= 750) baseROI = 9.00
            else if (cibil >= 700) baseROI = 9.25
            else if (cibil >= 650) baseROI = 9.50
            else baseROI = 9.75
        }

        // Govt/PSU concession: -0.25%
        if (isGovtPSU === 'YES') {
            baseROI -= 0.25
        }

        // EV/Hybrid concession: -0.50%
        if (isEV === 'YES' || isHybrid === 'YES') {
            baseROI -= 0.50
        }

        // Never go below minimum
        const minROI = vehicleType === '2W' ? 8.25 : 8.50
        return Math.max(baseROI, minROI)
    }

    const getEMIPerLakh = (roi, tenureMonths) => {
        const monthlyRate = roi / 1200
        const emiPerLakh = (100000 * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1)
        return emiPerLakh
    }

    const calculate = (e) => {
        e.preventDefault()

        // ===== LAYER 1: FAIL-FAST VALIDATIONS =====

        // Check 1: Used/Taxi vehicle
        if (formData.vehicleCondition === 'Used') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Used Vehicle",
                reason: "Ride Easy loan is available only for new vehicles as per Circular 55."
            })
            return
        }

        if (formData.intendedUse === 'Taxi' || formData.intendedUse === 'Transport') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Commercial Use",
                reason: "Taxi and transport vehicles are not eligible under Ride Easy scheme."
            })
            return
        }

        // Check 2: Age validations
        const age = calculateAge(formData.dob)
        if (age < 18) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Age Below Minimum",
                reason: `Applicant age (${age}) must be at least 18 years.`
            })
            return
        }

        const requestedTenure = Number(formData.requestedTenure) || 0
        const ageAtLoanEnd = age + Math.floor(requestedTenure / 12)

        if (ageAtLoanEnd > 70) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Age Exceeds Maximum",
                reason: `Age at loan maturity (${ageAtLoanEnd}) exceeds maximum 70 years.`
            })
            return
        }

        // Salaried retirement check
        if (formData.employmentType === 'Salaried' && ageAtLoanEnd > 60) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Exceeds Retirement Age",
                reason: "For salaried employees, loan must be repaid before age 60 (retirement)."
            })
            return
        }

        // Check 3: CIBIL minimum
        const cibil = Number(formData.cibilScore)
        const minCIBIL = 650
        if (cibil < minCIBIL) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - CIBIL Below Minimum",
                reason: `Minimum CIBIL score required is ${minCIBIL}. Current score: ${cibil}`
            })
            return
        }

        // Check 4: ITR check for self-employed
        if ((formData.employmentType === 'Self-Employed' ||
            formData.employmentType === 'Professional') &&
            formData.itrFiled !== 'YES') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - ITR Not Filed",
                reason: "Minimum 2 years ITR filing required for self-employed/professional applicants."
            })
            return
        }

        // Check 5: Agriculturist income minimums
        if (formData.employmentType === 'Agriculturist') {
            const agriIncome = Number(formData.annualAgriIncome)
            const minIncome = formData.vehicleType === '2W' ? 300000 : 500000
            if (agriIncome < minIncome) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Insufficient Income",
                    reason: `${formData.vehicleType === '2W' ? '2-Wheeler' : '4-Wheeler'} requires minimum annual income of ₹${(minIncome / 100000).toFixed(0)}L for agriculturists.`
                })
                return
            }
        }

        // ===== LAYER 2: CALCULATION ENGINE =====

        // STEP 1: Eligible Vehicle Cost
        const onRoadPrice = Number(formData.onRoadPrice) || 0
        const accessories = Number(formData.accessories) || 0
        const warranty = Number(formData.extendedWarranty) || 0
        const tcs = Number(formData.tcs) || 0

        const eligibleCost = onRoadPrice - accessories - warranty - tcs

        // STEP 2: Margin Rule
        const marginRate = formData.vehicleType === '2W' ? 0.25 : 0.10
        const loanAllowedByMargin = eligibleCost * (1 - marginRate)

        // Cash margin verification
        const cashMargin = Number(formData.cashMargin) || 0
        const maxCashMargin = Math.min(eligibleCost * 0.10, 50000)

        if (cashMargin > maxCashMargin) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Cash Margin Exceeds Limit",
                reason: `Cash margin cannot exceed ₹${maxCashMargin.toLocaleString('en-IN')} (10% of cost or ₹50,000, whichever is lower).`
            })
            return
        }

        // STEP 3: Net Monthly Income
        let grossAnnualIncome = 0
        let netAnnualIncome = 0

        if (formData.employmentType === 'Salaried') {
            const grossSalary = Number(formData.grossMonthlySalary) || 0
            const annualTax = Number(formData.annualTaxPaid) || 0
            grossAnnualIncome = grossSalary * 12
            netAnnualIncome = grossAnnualIncome - annualTax
        } else if (formData.employmentType === 'Agriculturist') {
            grossAnnualIncome = Number(formData.annualAgriIncome) || 0
            netAnnualIncome = grossAnnualIncome // No tax for agri
        } else {
            // Self-employed/Professional
            grossAnnualIncome = Number(formData.avgAnnualIncome) || 0
            const annualTax = Number(formData.annualTaxPaidSE) || 0
            netAnnualIncome = grossAnnualIncome - annualTax
        }

        const netMonthlyIncome = netAnnualIncome / 12

        // STEP 4: Sustenance
        const sustenanceRate = getSustenance(grossAnnualIncome, cibil)
        const monthlySustenance = netMonthlyIncome * sustenanceRate

        // STEP 5: EMI Capacity
        const existingEMIs = Number(formData.existingEMIs) || 0
        const otherObligations = Number(formData.otherObligations) || 0
        const availableEMI = netMonthlyIncome - monthlySustenance - existingEMIs - otherObligations

        if (availableEMI <= 0) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - No EMI Capacity",
                reason: `After sustenance (₹${Math.round(monthlySustenance).toLocaleString('en-IN')}) and existing obligations (₹${(existingEMIs + otherObligations).toLocaleString('en-IN')}), no surplus available for loan EMI.`
            })
            return
        }

        // STEP 6: ROI Determination
        const roi = getROI(
            formData.vehicleType,
            cibil,
            formData.isGovtPSU,
            formData.isEV,
            formData.isHybrid
        )

        // STEP 7: Tenure restrictions
        const maxTenureByVehicle = formData.vehicleType === '2W' ? 36 : 84
        const maxTenureByAge = (70 - age) * 12
        const maxTenureBySalary = formData.employmentType === 'Salaried' ? (60 - age) * 12 : 999
        const maxTenure = Math.min(requestedTenure, maxTenureByVehicle, maxTenureByAge, maxTenureBySalary)

        // STEP 8: EMI-based eligibility
        const emiPerLakh = getEMIPerLakh(roi, maxTenure)
        const emiBasedEligibility = (availableEMI / emiPerLakh) * 100000

        // STEP 9: FINAL ELIGIBLE LOAN
        const requestedLoan = Number(formData.requestedLoan) || 0
        const approvedLoan = Math.min(
            emiBasedEligibility,
            loanAllowedByMargin,
            requestedLoan
        )

        // Check minimum loan
        if (approvedLoan < 20000) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Loan Amount Too Low",
                reason: `Maximum eligible loan (₹${Math.round(approvedLoan).toLocaleString('en-IN')}) is below minimum requirement of ₹20,000.`
            })
            return
        }

        // Calculate final EMI
        const finalEMI = (approvedLoan / 100000) * emiPerLakh

        // Determine restricting factor
        let restrictingFactor = 'Requested Amount'
        if (approvedLoan === emiBasedEligibility && approvedLoan < requestedLoan) {
            restrictingFactor = 'EMI Capacity'
        } else if (approvedLoan === loanAllowedByMargin && approvedLoan < requestedLoan) {
            restrictingFactor = 'Margin Norms'
        }

        // ===== LAYER 3: DECISION & MESSAGING =====

        setResult({
            eligible: true,
            message: "✅ ELIGIBLE FOR RIDE EASY VEHICLE LOAN",
            details: {
                approvedLoan: Math.floor(approvedLoan),
                requestedLoan,
                roi,
                tenure: maxTenure,
                emi: Math.round(finalEMI),
                vehicleType: formData.vehicleType,

                // Vehicle cost breakdown
                eligibleCost,
                marginRate: marginRate * 100,
                loanAllowedByMargin,

                // Income breakdown
                grossAnnualIncome,
                netMonthlyIncome: Math.round(netMonthlyIncome),
                sustenanceRate: sustenanceRate * 100,
                sustenance: Math.round(monthlySustenance),
                availableEMI: Math.round(availableEMI),
                existingObligations: existingEMIs + otherObligations,

                // Eligibility breakdown
                emiBasedEligibility: Math.floor(emiBasedEligibility),
                restrictingFactor,

                // Concessions
                isGovtPSU: formData.isGovtPSU === 'YES',
                isEVOrHybrid: formData.isEV === 'YES' || formData.isHybrid === 'YES'
            }
        })
    }

    return (
        <div className="ride-easy-loan-container">
            <div className="page-header">
                <Link to="/" style={{ position: 'absolute', left: '24px', color: 'white', textDecoration: 'none' }}>
                    ← Back to Home
                </Link>
                <h1 className="header-title">
                    🚗 APGB Ride Easy Vehicle Loan
                </h1>
                <p className="header-subtitle">
                    Circular No.55 | 2-Wheeler & 4-Wheeler Financing for Public
                </p>
            </div>

            <form className="loan-form" onSubmit={calculate}>
                {/* Vehicle Details */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">🚗</span>
                        <h3 className="section-title">Vehicle Details</h3>
                    </div>

                    <div className="form-grid-3">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🏍️</span>
                                Vehicle Type
                            </label>
                            <select
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="2W">2-Wheeler</option>
                                <option value="4W">4-Wheeler</option>
                            </select>
                            <span className="helper-text">
                                {formData.vehicleType === '2W' ? 'Max tenure: 36 months' : 'Max tenure: 84 months'}
                            </span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">✨</span>
                                Vehicle Condition
                            </label>
                            <select
                                name="vehicleCondition"
                                value={formData.vehicleCondition}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="New">New</option>
                                <option value="Used">Used (Not Eligible)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🎯</span>
                                Intended Use
                            </label>
                            <select
                                name="intendedUse"
                                value={formData.intendedUse}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="Personal">Personal Use</option>
                                <option value="Taxi">Taxi (Not Eligible)</option>
                                <option value="Transport">Transport (Not Eligible)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💵</span>
                                On-Road Price (₹)
                            </label>
                            <input
                                type="number"
                                name="onRoadPrice"
                                value={formData.onRoadPrice}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Ex-showroom + RTO + Insurance"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🎁</span>
                                Accessories (₹)
                            </label>
                            <input
                                type="number"
                                name="accessories"
                                value={formData.accessories}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Additional accessories"
                                min="0"
                            />
                            <span className="helper-text">Not financed</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🛡️</span>
                                Extended Warranty (₹)
                            </label>
                            <input
                                type="number"
                                name="extendedWarranty"
                                value={formData.extendedWarranty}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Extended warranty cost"
                                min="0"
                            />
                            <span className="helper-text">Not financed</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📊</span>
                                TCS (₹)
                            </label>
                            <input
                                type="number"
                                name="tcs"
                                value={formData.tcs}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Tax Collected at Source"
                                min="0"
                            />
                            <span className="helper-text">Not financed</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">⚡</span>
                                Electric Vehicle?
                            </label>
                            <select
                                name="isEV"
                                value={formData.isEV}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="NO">NO</option>
                                <option value="YES">YES (-0.50% ROI)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🔋</span>
                                Hybrid Vehicle?
                            </label>
                            <select
                                name="isHybrid"
                                value={formData.isHybrid}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="NO">NO</option>
                                <option value="YES">YES (-0.50% ROI)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applicant Details */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">👤</span>
                        <h3 className="section-title">Applicant Details</h3>
                    </div>

                    <div className="form-grid-3">
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
                            <span className="helper-text">Age: 18-70 years</span>
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
                                <option value="Self-Employed">Self-Employed / Business</option>
                                <option value="Professional">Professional</option>
                                <option value="Agriculturist">Agriculturist</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🏢</span>
                                Govt/PSU Employee?
                            </label>
                            <select
                                name="isGovtPSU"
                                value={formData.isGovtPSU}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="NO">NO</option>
                                <option value="YES">YES (-0.25% ROI)</option>
                            </select>
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
                    </div>
                </div>

                {/* Income Details */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">💰</span>
                        <h3 className="section-title">Income Details</h3>
                    </div>

                    {formData.employmentType === 'Salaried' && (
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
                                />
                            </div>
                        </div>
                    )}

                    {formData.employmentType === 'Agriculturist' && (
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">🌾</span>
                                    Annual Agricultural Income (₹)
                                </label>
                                <input
                                    type="number"
                                    name="annualAgriIncome"
                                    value={formData.annualAgriIncome}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Last financial year "
                                    min="0"
                                    required
                                />
                                <span className="helper-text" style={{ color: '#ef4444' }}>
                                    Min: ₹3L for 2W, ₹5L for 4W
                                </span>
                            </div>
                        </div>
                    )}

                    {(formData.employmentType === 'Self-Employed' || formData.employmentType === 'Professional') && (
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
                                    placeholder="Average of last 2 years"
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
                                    name="annualTaxPaidSE"
                                    value={formData.annualTaxPaidSE}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Total tax per year"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📄</span>
                                    ITR Filed (Last 2 Years)?
                                </label>
                                <select
                                    name="itrFiled"
                                    value={formData.itrFiled}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="NO">NO - Not filed</option>
                                    <option value="YES">YES - Filed for 2 years</option>
                                </select>
                                <span className="helper-text" style={{ color: '#ef4444', fontWeight: '600' }}>
                                    ⚠️ Mandatory as per Circular 55
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loan Details */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">💳</span>
                        <h3 className="section-title">Loan Details</h3>
                    </div>

                    <div className="form-grid-3">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💵</span>
                                Requested Loan Amount (₹)
                            </label>
                            <input
                                type="number"
                                name="requestedLoan"
                                value={formData.requestedLoan}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Amount needed"
                                min="20000"
                                required
                            />
                            <span className="helper-text">Minimum: ₹20,000</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💰</span>
                                Cash Margin (₹)
                            </label>
                            <input
                                type="number"
                                name="cashMargin"
                                value={formData.cashMargin}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Your contribution"
                                min="0"
                                required
                            />
                            <span className="helper-text">
                                Max: 10% of cost or ₹50,000
                            </span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📅</span>
                                Requested Tenure (Months)
                            </label>
                            <input
                                type="number"
                                name="requestedTenure"
                                value={formData.requestedTenure}
                                onChange={handleChange}
                                className="form-input"
                                placeholder={formData.vehicleType === '2W' ? 'Max: 36' : 'Max: 84'}
                                min="6"
                                max={formData.vehicleType === '2W' ? 36 : 84}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Existing Obligations */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">📉</span>
                        <h3 className="section-title">Existing Obligations</h3>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💳</span>
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
                            {/* Approved Amount */}
                            <div className="max-loan-box">
                                <div className="max-loan-label">Approved Loan Amount</div>
                                <div className="max-loan-value">
                                    ₹{(result.details.approvedLoan / 100000).toFixed(2)} L
                                </div>
                                {result.details.approvedLoan < result.details.requestedLoan && (
                                    <div style={{ fontSize: '0.9rem', color: '#f59e0b', marginTop: '8px' }}>
                                        Requested: ₹{(result.details.requestedLoan / 100000).toFixed(2)} L (Restricted)
                                    </div>
                                )}
                            </div>

                            {/* Key Stats */}
                            <div className="stats-row">
                                <div className="stat-box">
                                    <div className="stat-label">ROI</div>
                                    <div className="stat-value">{result.details.roi.toFixed(2)}%</div>
                                    {(result.details.isGovtPSU || result.details.isEVOrHybrid) && (
                                        <div className="stat-sub" style={{ color: '#10b981' }}>With concessions</div>
                                    )}
                                </div>
                                <div className="stat-box">
                                    <div className="stat-label">Monthly EMI</div>
                                    <div className="stat-value">₹{result.details.emi.toLocaleString('en-IN')}</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-label">Tenure</div>
                                    <div className="stat-value">{result.details.tenure} Months</div>
                                    <div className="stat-sub">{(result.details.tenure / 12).toFixed(1)} Years</div>
                                </div>
                            </div>

                            {/* Vehicle Cost Breakdown */}
                            <div className="breakdown-section">
                                <h4 className="breakdown-title">🚗 Vehicle Cost & Margin</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Eligible Vehicle Cost</span>
                                        <span>₹{(result.details.eligibleCost / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Margin Rate ({result.details.vehicleType})</span>
                                        <span>{result.details.marginRate}%</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Max by Margin</span>
                                        <span>₹{(result.details.loanAllowedByMargin / 100000).toFixed(2)} L</span>
                                    </div>
                                </div>
                            </div>

                            {/* Income & EMI Analysis */}
                            <div className="breakdown-section">
                                <h4 className="breakdown-title">💰 Income & EMI Analysis</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Gross Annual Income</span>
                                        <span>₹{(result.details.grossAnnualIncome / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Net Monthly Income</span>
                                        <span>₹{result.details.netMonthlyIncome.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Sustenance ({result.details.sustenanceRate}%)</span>
                                        <span>-₹{result.details.sustenance.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Existing Obligations</span>
                                        <span>-₹{result.details.existingObligations.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row" style={{ background: '#d1fae5', fontWeight: 'bold' }}>
                                        <span>Available EMI Capacity</span>
                                        <span>₹{result.details.availableEMI.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Max Loan by EMI</span>
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
                                        <span>₹{(result.details.requestedLoan / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>EMI-Based Eligibility</span>
                                        <span>₹{(result.details.emiBasedEligibility / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Margin-Based Limit</span>
                                        <span>₹{(result.details.loanAllowedByMargin / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row" style={{ background: '#dbeafe', fontWeight: 'bold' }}>
                                        <span>Restricting Factor</span>
                                        <span>{result.details.restrictingFactor}</span>
                                    </div>
                                    <div className="breakdown-row" style={{ background: '#fef3c7', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        <span>Final Approved Amount</span>
                                        <span>₹{(result.details.approvedLoan / 100000).toFixed(2)} L</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <small style={{ color: '#adb5bd', fontSize: '0.7em' }}>
                                    * Calculations as per APGB Circular No. 55 - Ride Easy Vehicle Loan
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default RideEasyLoan
