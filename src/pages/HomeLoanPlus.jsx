import { useState } from 'react'
import { Link } from 'react-router-dom'
import './HomeLoanPlus.css'

function HomeLoanPlus() {
    const [formData, setFormData] = useState({
        // Existing Home Loan Details
        existingLoanSanctionDate: '',
        existingLoanOriginalAmount: '',
        existingLoanOutstanding: '',
        existingLoanEMI: '',
        existingLoanROI: '',
        existingLoanTenure: '', // in years
        existingLoanCompletedMonths: '',
        anyEMIOverdue: 'NO',

        // Property Details
        propertyLocation: 'Urban',
        propertyType: 'Residential', // NEW: Required for rejection logic
        propertyNRV: '',
        buildingAge: '',
        buildingResidualLife: '',

        // Loan Request
        loanPurpose: 'Personal',
        requestedAmount: '',

        // Applicant Details (reuse Home Loan structure)
        applicantType: 'Single',
        dob1: '',
        employmentType1: 'Salaried',
        grossSalary1: '',
        taxDeduction1: '',
        otherDeductions1: '',
        itrYear1_1: '',
        itrYear2_1: '',
        itrYear3_1: '',
        taxYear1_1: '',
        taxYear2_1: '',
        taxYear3_1: '',
        agriIncome1: '',
        itrFiledLast2Years1: 'YES', // NEW: For non-salaried (Circular 187)
        cibil1: '',
        cibilClean1: 'YES',
        otherEMI1: '', // EMIs OTHER than existing Home Loan

        // Joint Applicant
        dob2: '',
        employmentType2: 'Salaried',
        grossSalary2: '',
        taxDeduction2: '',
        otherDeductions2: '',
        itrYear1_2: '',
        itrYear2_2: '',
        itrYear3_2: '',
        taxYear1_2: '',
        taxYear2_2: '',
        taxYear3_2: '',
        agriIncome2: '',
        cibil2: '',
        cibilClean2: 'YES',
        otherEMI2: ''
    })

    const [result, setResult] = useState(null)
    const [showDetails, setShowDetails] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Calculate exact age from DOB
    const calculateAge = (dob) => {
        if (!dob) return { years: 0, months: 0, days: 0, totalYears: 0 }

        const today = new Date()
        const birthDate = new Date(dob)

        let years = today.getFullYear() - birthDate.getFullYear()
        let months = today.getMonth() - birthDate.getMonth()
        let days = today.getDate() - birthDate.getDate()

        if (days < 0) {
            months--
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
            days += lastMonth.getDate()
        }

        if (months < 0) {
            years--
            months += 12
        }

        const totalYears = years + (months / 12)

        return { years, months, days, totalYears }
    }

    // Get ROI for Home Loan Plus (Base ROI + 0.75%)
    const getHomeLoanPlusROI = (existingROI) => {
        return existingROI + 0.75
    }

    // Get sustenance amount (reused from Circular 186)
    const getSustenanceAmount = (netMonthlyIncome, annualGrossIncome) => {
        const incomeForSlab = annualGrossIncome || (netMonthlyIncome * 12)

        if (incomeForSlab <= 300000) {
            return netMonthlyIncome * 0.45
        } else if (incomeForSlab <= 500000) {
            return netMonthlyIncome * 0.40
        } else if (incomeForSlab <= 800000) {
            return netMonthlyIncome * 0.35
        } else if (incomeForSlab <= 1200000) {
            return netMonthlyIncome * 0.30
        } else {
            const twentyFivePercent = netMonthlyIncome * 0.25
            return Math.min(twentyFivePercent, 200000)
        }
    }

    // Get LTV based on TOTAL exposure (existing + new)
    const getLTV = (totalExposure) => {
        if (totalExposure <= 3000000) return 0.90
        if (totalExposure <= 7500000) return 0.80
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

    // Calculate net monthly income (same logic as Circular 186)
    const calculateNetMonthlyIncome = (empType, applicantNum) => {
        if (empType === 'Salaried' || empType === 'Salaried+Pension') {
            const gross = Number(formData[`grossSalary${applicantNum}`]) || 0
            const tax = Number(formData[`taxDeduction${applicantNum}`]) || 0
            const other = Number(formData[`otherDeductions${applicantNum}`]) || 0
            return gross - tax - other
        } else if (empType === 'Business') {
            const year1 = Number(formData[`itrYear1_${applicantNum}`]) || 0
            const year2 = Number(formData[`itrYear2_${applicantNum}`]) || 0
            const year3 = Number(formData[`itrYear3_${applicantNum}`]) || 0
            const tax1 = Number(formData[`taxYear1_${applicantNum}`]) || 0
            const tax2 = Number(formData[`taxYear2_${applicantNum}`]) || 0
            const tax3 = Number(formData[`taxYear3_${applicantNum}`]) || 0

            const netYear1 = year1 - tax1
            const netYear2 = year2 - tax2
            const netYear3 = year3 - tax3

            const avg = (netYear1 + netYear2 + netYear3) / 3
            const maxVariation = Math.max(
                Math.abs(netYear1 - avg) / avg,
                Math.abs(netYear2 - avg) / avg,
                Math.abs(netYear3 - avg) / avg
            )

            let netAnnualIncome
            if (maxVariation > 0.25) {
                netAnnualIncome = avg
            } else {
                netAnnualIncome = netYear1
            }
            return netAnnualIncome / 12
        } else if (empType === 'Agriculture') {
            const agriIncome = Number(formData[`agriIncome${applicantNum}`]) || 0
            return agriIncome / 12
        }
        return 0
    }

    // Check if CIBIL score is special case
    const isSpecialCIBIL = (score) => {
        return score === -1 || (score >= 1 && score <= 5) || (score >= 100 && score <= 200)
    }

    const calculate = (e) => {
        e.preventDefault()

        const applicantType = formData.applicantType

        // ========== PRE-CONDITION CHECKS ==========

        // Check 1: Existing Home Loan exists (sanction date must be provided)
        if (!formData.existingLoanSanctionDate) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Missing Existing Loan Details",
                reason: "You must have an existing APGB Home Loan to apply for Home Loan Plus. Please provide the loan sanction date."
            })
            return
        }

        // Check 2: Minimum 12 months repayment track
        const sanctionDate = new Date(formData.existingLoanSanctionDate)
        const today = new Date()
        const loanAgeMonths = (today - sanctionDate) / (1000 * 60 * 60 * 24 * 30)

        if (loanAgeMonths < 12) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Insufficient Repayment History",
                reason: `Existing loan must run for at least 12 months. Current: ${Math.floor(loanAgeMonths)} months.`
            })
            return
        }

        // Check 3: No EMI overdue > 30 days
        if (formData.anyEMIOverdue === 'YES') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - EMI Overdue",
                reason: "No EMI should be overdue by more than 30 days in the last 12 months."
            })
            return
        }

        // Check 4: Property must be fully constructed and residential
        if (formData.propertyType === 'Commercial') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Commercial Property",
                reason: "Home Loan Plus is not available for commercial properties. Only residential properties are eligible as per Circular 187."
            })
            return
        }

        if (formData.propertyType === 'Under Construction') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Under-Construction Property",
                reason: "Home Loan Plus is not available for under-construction properties. Property must be fully constructed as per Circular 187."
            })
            return
        }

        // Check 5: Validate loan purpose
        if (formData.loanPurpose !== 'Personal' && formData.loanPurpose !== 'Debt Consolidation') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Invalid Purpose",
                reason: "Home Loan Plus is only for Personal needs or Debt consolidation."
            })
            return
        }

        // Check 5: Validate requested amount
        const requestedAmount = Number(formData.requestedAmount) || 0
        const MIN_AMOUNT = 200000 // ₹2 Lakhs

        const location = formData.propertyLocation
        const MAX_AMOUNT = (location === 'Rural') ? 1000000 : 750000 // ₹10L for Rural, ₹7.5L for Urban/Semi-urban

        if (requestedAmount < MIN_AMOUNT) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Amount Too Low",
                reason: `Minimum loan amount is ₹2.00 Lakhs. Requested: ₹${(requestedAmount / 100000).toFixed(2)} Lakhs.`
            })
            return
        }

        if (requestedAmount > MAX_AMOUNT) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Amount Exceeds Limit",
                reason: `Maximum loan amount for ${location} area is ₹${(MAX_AMOUNT / 100000).toFixed(2)} Lakhs. Requested: ₹${(requestedAmount / 100000).toFixed(2)} Lakhs.`
            })
            return
        }

        // ========== APPLICANT VALIDATION ==========

        const age1 = calculateAge(formData.dob1).totalYears
        const cibilClean1 = formData.cibilClean1
        const cibil1 = Number(formData.cibil1)
        const empType1 = formData.employmentType1

        if (age1 < 21 || age1 > 65) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Age Outside Range",
                reason: `Applicant age (${age1.toFixed(1)} years) must be between 21 and 65.`
            })
            return
        }

        if (cibilClean1 !== 'YES') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - CIBIL Adverse",
                reason: "CIBIL history must be clean (no overdues/NPA/write-off/OTS)."
            })
            return
        }

        if (cibil1 < 650 && !isSpecialCIBIL(cibil1)) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - CIBIL Too Low",
                reason: `CIBIL score (${cibil1}) is below minimum (650). Note: NTC (-1), 1-5, 100-200 are exceptions.`
            })
            return
        }

        // Check ITR for non-salaried (Business / Agriculture)
        if ((empType1 === 'Business' || empType1 === 'Agriculture') && formData.itrFiledLast2Years1 !== 'YES') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - ITR Not Filed",
                reason: "For Business/Self-Employed/Agriculture applicants, ITR must be filed for the last 2 years with minimum 6 months gap as per Circular 187."
            })
            return
        }

        // ========== TENURE CALCULATION (CO-TERMINUS) ==========

        const existingLoanTenure = Number(formData.existingLoanTenure) || 0
        const completedMonths = Number(formData.existingLoanCompletedMonths) || 0
        const remainingMonthsExistingHL = (existingLoanTenure * 12) - completedMonths

        if (remainingMonthsExistingHL <= 0) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Existing Loan Matured",
                reason: "Existing Home Loan has already matured or is about to mature."
            })
            return
        }

        const maxByScheme = 20 * 12 // 20 years
        const maxByAge = (70 - age1) * 12
        const buildingResidualLife = Number(formData.buildingResidualLife) || 50
        const maxByBuildingLife = (buildingResidualLife - 5) * 12

        const maxTenureMonths = Math.min(
            remainingMonthsExistingHL, // CO-TERMINUS - Most critical
            maxByScheme,
            maxByAge,
            maxByBuildingLife
        )

        if (maxTenureMonths <= 0) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - No Valid Tenure",
                reason: "Existing Home Loan matures too soon or age/building life constraints prevent minimum tenure."
            })
            return
        }

        const tenureYears = maxTenureMonths / 12

        // ========== ROI CALCULATION ==========

        const existingLoanROI = Number(formData.existingLoanROI) || 0
        const homeLoanPlusROI = getHomeLoanPlusROI(existingLoanROI)

        // ========== EMI CAPACITY CALCULATION ==========

        const netIncome1 = calculateNetMonthlyIncome(empType1, '1')
        const annualGross1 = empType1 === 'Salaried' || empType1 === 'Salaried+Pension' ?
            (Number(formData.grossSalary1) || 0) * 12 : netIncome1 * 12

        const sustenance = getSustenanceAmount(netIncome1, annualGross1)

        const existingHomeLoanEMI = Number(formData.existingLoanEMI) || 0
        const otherEMI1 = Number(formData.otherEMI1) || 0
        const totalExistingEMI = existingHomeLoanEMI + otherEMI1

        const netSurplus = netIncome1 - sustenance - totalExistingEMI

        if (netSurplus <= 0) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - No EMI Capacity",
                reason: `After deducting sustenance (₹${Math.round(sustenance).toLocaleString('en-IN')}) and existing EMIs (₹${totalExistingEMI.toLocaleString('en-IN')} including Home Loan EMI), no surplus remains.`
            })
            return
        }

        const emiPerLakh = calculateEMIPerLakh(homeLoanPlusROI, tenureYears)
        const maxLoanByEMI = (netSurplus / emiPerLakh) * 100000

        // ========== LTV CALCULATION (ON TOTAL EXPOSURE) ==========

        const propertyNRV = Number(formData.propertyNRV) || 0
        const existingOutstanding = Number(formData.existingLoanOutstanding) || 0

        if (propertyNRV <= 0) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Invalid Property Value",
                reason: "Property NRV must be greater than zero."
            })
            return
        }

        // Calculate total housing exposure
        const totalExposure = existingOutstanding + requestedAmount
        const ltvRate = getLTV(totalExposure)
        const maxAllowedByLTV = propertyNRV * ltvRate

        if (totalExposure > maxAllowedByLTV) {
            const maxHomeLoanPlus = maxAllowedByLTV - existingOutstanding

            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - LTV Limit Exceeded",
                reason: `Total exposure (₹${(totalExposure / 100000).toFixed(2)}L) exceeds ${(ltvRate * 100)}% LTV on NRV (₹${(propertyNRV / 100000).toFixed(2)}L). Maximum Home Loan Plus: ₹${Math.max(0, maxHomeLoanPlus / 100000).toFixed(2)}L.`
            })
            return
        }

        // ========== FINAL ELIGIBLE AMOUNT ==========

        const eligibleLoan = Math.min(
            maxLoanByEMI,
            requestedAmount,
            MAX_AMOUNT
        )

        if (eligibleLoan < MIN_AMOUNT) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Insufficient Eligibility",
                reason: `Maximum eligible amount (₹${(eligibleLoan / 100000).toFixed(2)}L) is below minimum requirement of ₹2.00L.`
            })
            return
        }

        // ========== CALCULATE EMI AND OTHER DETAILS ==========

        const newEMI = (eligibleLoan / 100000) * emiPerLakh
        const totalMonthlyCommitment = existingHomeLoanEMI + otherEMI1 + newEMI
        const totalInterest = (newEMI * maxTenureMonths) - eligibleLoan
        const totalPayable = eligibleLoan + totalInterest

        // ========== SUCCESS RESULT ==========

        setResult({
            eligible: true,
            message: "✅ HOME LOAN PLUS ELIGIBLE",
            details: {
                eligibleLoan: eligibleLoan,
                roi: homeLoanPlusROI,
                tenure: tenureYears,
                tenureMonths: maxTenureMonths,
                newEMI: newEMI,
                existingHomeLoanEMI: existingHomeLoanEMI,
                otherEMI: otherEMI1,
                totalMonthlyCommitment: totalMonthlyCommitment,
                totalInterest: totalInterest,
                totalPayable: totalPayable,

                // LTV Analysis
                propertyNRV: propertyNRV,
                existingOutstanding: existingOutstanding,
                totalExposure: totalExposure,
                ltvRate: ltvRate * 100,
                maxAllowedByLTV: maxAllowedByLTV,

                // Income analysis
                netIncome: netIncome1,
                sustenance: sustenance,
                remainingSurplus: netIncome1 - sustenance - totalMonthlyCommitment,

                // Other
                maxLoanByEMI: maxLoanByEMI,
                limitingFactor: eligibleLoan === maxLoanByEMI ? 'EMI Capacity' :
                    eligibleLoan === requestedAmount ? 'Requested Amount' : 'Scheme Maximum',
                remainingTenureExistingHL: remainingMonthsExistingHL,
                processingCharges: eligibleLoan * 0.005 // 0.50%
            }
        })
    }

    return (
        <div className="homeloan-plus-container">
            <div className="page-header">
                <div className="header-overlay"></div>
                <Link to="/services" className="back-link">← Back to Services</Link>
                <h1 className="page-title">
                    <span className="plus-badge">PLUS</span> Home Loan Plus Calculator
                </h1>
                <p className="page-subtitle">Additional loan for existing APGB Home Loan customers</p>
                <div className="header-badge">Circular No. 187 dated 03.09.2025</div>
            </div>

            <form onSubmit={calculate} className="loan-form">
                {/* Existing Home Loan Section */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">🏦</span>
                        <h3 className="section-title">Existing Home Loan Details</h3>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📅</span>
                                Sanction Date
                            </label>
                            <input
                                type="date"
                                name="existingLoanSanctionDate"
                                value={formData.existingLoanSanctionDate}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                            <span className="helper-text">Must be 12+ months old</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💰</span>
                                Original Loan Amount (₹)
                            </label>
                            <input
                                type="number"
                                name="existingLoanOriginalAmount"
                                value={formData.existingLoanOriginalAmount}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Sanctioned amount"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📊</span>
                                Outstanding Amount (₹)
                            </label>
                            <input
                                type="number"
                                name="existingLoanOutstanding"
                                value={formData.existingLoanOutstanding}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Current outstanding"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💳</span>
                                Monthly EMI (₹)
                            </label>
                            <input
                                type="number"
                                name="existingLoanEMI"
                                value={formData.existingLoanEMI}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Current EMI"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📈</span>
                                Rate of Interest (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="existingLoanROI"
                                value={formData.existingLoanROI}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., 8.25"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">⏳</span>
                                Original Tenure (Years)
                            </label>
                            <input
                                type="number"
                                name="existingLoanTenure"
                                value={formData.existingLoanTenure}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., 20"
                                min="1"
                                max="30"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">✅</span>
                                Months Completed
                            </label>
                            <input
                                type="number"
                                name="existingLoanCompletedMonths"
                                value={formData.existingLoanCompletedMonths}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., 24"
                                min="12"
                                required
                            />
                            <span className="helper-text">Must be ≥ 12 months</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">⏰</span>
                                Remaining Tenure (Calculated)
                            </label>
                            <input
                                type="text"
                                value={(() => {
                                    const totalMonths = (Number(formData.existingLoanTenure) || 0) * 12
                                    const completed = Number(formData.existingLoanCompletedMonths) || 0
                                    const remaining = totalMonths - completed
                                    const years = Math.floor(remaining / 12)
                                    const months = remaining % 12
                                    return remaining > 0 ? `${years} years ${months} months` : 'N/A'
                                })()}
                                className="form-input"
                                readOnly
                                style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                            />
                            <span className="helper-text" style={{ color: '#f59e0b', fontWeight: '600' }}>
                                Home Loan Plus must finish before this (Co-terminus rule)
                            </span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">⚠️</span>
                                Any EMI Overdue &gt; 30 Days?
                            </label>
                            <select
                                name="anyEMIOverdue"
                                value={formData.anyEMIOverdue}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="NO">No - Clean record</option>
                                <option value="YES">Yes - Have overdue</option>
                            </select>
                        </div>
                    </div>
                </div>


                {/* Property Details Section */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">🏠</span>
                        <h3 className="section-title">Property Details</h3>
                    </div>

                    <div className="form-grid-2">
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
                                <option value="Residential">Residential - Self Occupied</option>
                                <option value="Residential Rented">Residential - Rented</option>
                                <option value="Commercial">Commercial (Not Eligible)</option>
                                <option value="Under Construction">Under Construction (Not Eligible)</option>
                            </select>
                            <span className="helper-text">Only residential properties are eligible</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💎</span>
                                Current Property NRV (₹)
                            </label>
                            <input
                                type="number"
                                name="propertyNRV"
                                value={formData.propertyNRV}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Bank valuation"
                                min="0"
                                required
                            />
                            <span className="helper-text">Net Realizable Value as per latest valuation</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">⏱️</span>
                                Building Age (Years)
                            </label>
                            <input
                                type="number"
                                name="buildingAge"
                                value={formData.buildingAge}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Current age"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🏗️</span>
                                Building Residual Life (Years)
                            </label>
                            <input
                                type="number"
                                name="buildingResidualLife"
                                value={formData.buildingResidualLife}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Remaining life"
                                min="5"
                                required
                            />
                            <span className="helper-text">Minimum 5 years after loan tenure</span>
                        </div>
                    </div>

                    <div className="info-box" style={{ marginTop: '15px', padding: '12px', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #0ea5e9' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#0369a1' }}>
                            ℹ️ <strong>Note:</strong> Property must be fully constructed and residential. Commercial or under-construction properties are not eligible for Home Loan Plus.
                        </p>
                    </div>
                </div>

                {/* Loan Request Section */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">💰</span>
                        <h3 className="section-title">Loan Request Details</h3>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🎯</span>
                                Purpose of Home Loan Plus
                            </label>
                            <select
                                name="loanPurpose"
                                value={formData.loanPurpose}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="Personal">Personal Needs</option>
                                <option value="Debt Consolidation">Debt Consolidation</option>
                            </select>
                            <span className="helper-text" style={{ color: '#0369a1', fontWeight: '500' }}>
                                Top-up loan for personal needs or debt consolidation only. Speculative use not permitted (Circular 187)
                            </span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💵</span>
                                Requested Amount (₹)
                            </label>
                            <input
                                type="number"
                                name="requestedAmount"
                                value={formData.requestedAmount}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter amount"
                                min="200000"
                                max={formData.propertyLocation === 'Rural' ? "1000000" : "750000"}
                                required
                            />
                            <span className="helper-text">
                                Min: ₹2.00L | Max: ₹{formData.propertyLocation === 'Rural' ? '10.00L' : '7.50L'} ({formData.propertyLocation})
                            </span>
                        </div>
                    </div>

                    <div className="info-box" style={{ marginTop: '15px', padding: '12px', background: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e' }}>
                            ⚠️ <strong>Important:</strong> The tenure for this loan will be co-terminus with your existing Home Loan (must finish before or along with it). ROI will be your existing Home Loan rate + 0.75%.
                        </p>
                    </div>
                </div>

                {/* Applicant Details Section */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">👤</span>
                        <h3 className="section-title">Applicant Details</h3>
                    </div>

                    <div className="form-grid-2">
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
                                <option value="Salaried+Pension">Salaried + Pension</option>
                                <option value="Business">Business / Self-Employed</option>
                                <option value="Agriculture">Agriculture</option>
                            </select>
                        </div>
                    </div>

                    {/* Salaried Fields */}
                    {(formData.employmentType1 === 'Salaried' || formData.employmentType1 === 'Salaried+Pension') && (
                        <div className="form-grid-3" style={{ marginTop: '15px' }}>
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
                                    placeholder="Before deductions"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📊</span>
                                    Tax Deduction (₹/month)
                                </label>
                                <input
                                    type="number"
                                    name="taxDeduction1"
                                    value={formData.taxDeduction1}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Monthly tax"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">➖</span>
                                    Other Deductions (₹/month)
                                </label>
                                <input
                                    type="number"
                                    name="otherDeductions1"
                                    value={formData.otherDeductions1}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="PF, etc."
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Business Fields */}
                    {formData.employmentType1 === 'Business' && (
                        <>
                            <h4 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1rem', color: '#1e3a5f' }}>Last 3 Years ITR</h4>
                            <div className="form-grid-3" style={{ marginTop: '10px' }}>
                                <div className="form-group">
                                    <label className="form-label">Year 1 Net Profit (₹)</label>
                                    <input type="number" name="itrYear1_1" value={formData.itrYear1_1} onChange={handleChange}
                                        className="form-input" placeholder="Latest year" min="0" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year 2 Net Profit (₹)</label>
                                    <input type="number" name="itrYear2_1" value={formData.itrYear2_1} onChange={handleChange}
                                        className="form-input" placeholder="Previous year" min="0" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year 3 Net Profit (₹)</label>
                                    <input type="number" name="itrYear3_1" value={formData.itrYear3_1} onChange={handleChange}
                                        className="form-input" placeholder="2 years ago" min="0" required />
                                </div>
                            </div>

                            <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1rem', color: '#1e3a5f' }}>Tax Paid (Last 3 Years)</h4>
                            <div className="form-grid-3" style={{ marginTop: '10px' }}>
                                <div className="form-group">
                                    <label className="form-label">Year 1 Tax (₹)</label>
                                    <input type="number" name="taxYear1_1" value={formData.taxYear1_1} onChange={handleChange}
                                        className="form-input" placeholder="Latest year" min="0" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year 2 Tax (₹)</label>
                                    <input type="number" name="taxYear2_1" value={formData.taxYear2_1} onChange={handleChange}
                                        className="form-input" placeholder="Previous year" min="0" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year 3 Tax (₹)</label>
                                    <input type="number" name="taxYear3_1" value={formData.taxYear3_1} onChange={handleChange}
                                        className="form-input" placeholder="2 years ago" min="0" required />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Agriculture Fields */}
                    {formData.employmentType1 === 'Agriculture' && (
                        <div className="form-grid-2" style={{ marginTop: '15px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">🌾</span>
                                    Annual Agricultural Income (₹)
                                </label>
                                <input
                                    type="number"
                                    name="agriIncome1"
                                    value={formData.agriIncome1}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Last FY income"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* ITR Filed Validation for Non-Salaried (Business/Agriculture) */}
                    {(formData.employmentType1 === 'Business' || formData.employmentType1 === 'Agriculture') && (
                        <div className="form-grid-2" style={{ marginTop: '20px', padding: '15px', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📄</span>
                                    ITR Filed for Last 2 Years?
                                </label>
                                <select
                                    name="itrFiledLast2Years1"
                                    value={formData.itrFiledLast2Years1}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="YES">YES - Filed for last 2 years</option>
                                    <option value="NO">NO - Not filed</option>
                                </select>
                                <span className="helper-text" style={{ color: '#ef4444', fontWeight: '600' }}>
                                    ⚠️ Mandatory as per Circular 187 (Min 6 months gap between filings)
                                </span>
                            </div>
                        </div>
                    )}

                    {/* CIBIL and Other EMI */}
                    <div className="form-grid-3" style={{ marginTop: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📈</span>
                                CIBIL Score
                            </label>
                            <input
                                type="number"
                                name="cibil1"
                                value={formData.cibil1}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., 750"
                                min="-1"
                                max="900"
                                required
                            />
                            <span className="helper-text">Min: 650 or -1 (NTC)</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">✔️</span>
                                CIBIL Clean Status
                            </label>
                            <select
                                name="cibilClean1"
                                value={formData.cibilClean1}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="YES">YES - Clean</option>
                                <option value="NO">NO - Has issues</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💳</span>
                                Other Existing EMIs (₹/month)
                            </label>
                            <input
                                type="number"
                                name="otherEMI1"
                                value={formData.otherEMI1}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Other than Home Loan"
                                min="0"
                            />
                            <span className="helper-text">Excluding existing Home Loan EMI</span>
                        </div>
                    </div>
                </div>

                <button type="submit" className="calculate-btn">Check Eligibility ✨</button>
            </form>

            {/* Results Section */}
            {result && (
                <div className={result.eligible ? "result-card-premium" : "result-card"}>
                    <div className={result.eligible ? "result-header-premium" : "result-header error"}>
                        <div className="result-header-icon">
                            {result.eligible ? '✔' : '❌'}
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
                                <div className="max-loan-label">Maximum Eligible Amount</div>
                                <div className="max-loan-value">
                                    ₹{(result.details.eligibleLoan / 100000).toFixed(2)} L
                                </div>
                            </div>

                            {/* Key Stats */}
                            <div className="stats-row">
                                <div className="stat-box">
                                    <div className="stat-label">New EMI</div>
                                    <div className="stat-value">₹{Math.round(result.details.newEMI).toLocaleString('en-IN')}</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-label">ROI</div>
                                    <div className="stat-value">{result.details.roi.toFixed(2)}%</div>
                                    <div className="stat-sub">Base + 0.75%</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-label">Tenure</div>
                                    <div className="stat-value">{result.details.tenure.toFixed(1)}Y</div>
                                    <div className="stat-sub">Co-terminus</div>
                                </div>
                            </div>

                            {/* Combined EMI Breakdown */}
                            <div className="breakdown-section">
                                <h4 className="breakdown-title">💳 Combined EMI Breakdown</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Existing Home Loan EMI</span>
                                        <span>₹{result.details.existingHomeLoanEMI.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>New Home Loan Plus EMI</span>
                                        <span>₹{Math.round(result.details.newEMI).toLocaleString('en-IN')}</span>
                                    </div>
                                    {result.details.otherEMI > 0 && (
                                        <div className="breakdown-row">
                                            <span>Other Existing EMIs</span>
                                            <span>₹{result.details.otherEMI.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="breakdown-row" style={{ background: '#fef3c7', fontWeight: 'bold', fontSize: '1.05rem' }}>
                                        <span>Total Monthly Commitment</span>
                                        <span>₹{Math.round(result.details.totalMonthlyCommitment).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* LTV Analysis */}
                            <div className="breakdown-section">
                                <h4 className="breakdown-title">🏠 LTV Analysis</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Property NRV</span>
                                        <span>₹{(result.details.propertyNRV / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Existing HL Outstanding</span>
                                        <span>₹{(result.details.existingOutstanding / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Home Loan Plus</span>
                                        <span>₹{(result.details.eligibleLoan / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row" style={{ background: '#dbeafe' }}>
                                        <span>Total Housing Exposure</span>
                                        <span>₹{(result.details.totalExposure / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row" style={{ color: '#059669', fontWeight: 'bold' }}>
                                        <span>LTV Ratio</span>
                                        <span>{result.details.ltvRate.toFixed(1)}% (within limit)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Income vs EMI */}
                            <div className="breakdown-section">
                                <h4 className="breakdown-title">💰 Income vs EMI</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Net Monthly Income</span>
                                        <span>₹{Math.round(result.details.netIncome).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Less: Sustenance</span>
                                        <span>-₹{Math.round(result.details.sustenance).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Less: Total EMI</span>
                                        <span>-₹{Math.round(result.details.totalMonthlyCommitment).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row" style={{ background: result.details.remainingSurplus > 0 ? '#d1fae5' : '#fee2e2', fontWeight: 'bold' }}>
                                        <span>Remaining Surplus</span>
                                        <span>₹{Math.round(result.details.remainingSurplus).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Important Notes */}
                            <div style={{ marginTop: '25px', padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                                <h4 style={{ marginTop: 0, color: '#92400e' }}>📌 Important Notes</h4>
                                <ul style={{ marginLeft: '20px', color: '#78350f', fontSize: '0.9rem', lineHeight: '1.8' }}>
                                    <li>EMI starts from next month (No moratorium allowed)</li>
                                    <li>This loan will mature along with your existing Home Loan (co-terminus)</li>
                                    <li>Remaining tenure of existing HL: {Math.floor(result.details.remainingTenureExistingHL / 12)} years {result.details.remainingTenureExistingHL % 12} months</li>
                                    <li>Processing charges: ₹{(result.details.processingCharges).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (0.50% + GST)</li>
                                    <li>All co-applicants from existing Home Loan must join</li>
                                </ul>
                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <small style={{ color: '#adb5bd', fontSize: '0.7em' }}>
                                    * Calculations as per Circular No. 187/2025 (Extension of Circular 186)
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default HomeLoanPlus
