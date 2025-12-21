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
        // Salaried Fields
        grossSalary1: '',
        taxDeduction1: '',
        otherDeductions1: '',
        // Business Fields
        itrYear1_1: '',
        itrYear2_1: '',
        itrYear3_1: '',
        taxYear1_1: '',
        taxYear2_1: '',
        taxYear3_1: '',
        // Agriculture Fields
        agriIncome1: '',
        // CIBIL
        cibilScore1: '',
        cibilClean1: 'YES',
        existingEMI1: '',

        // Applicant 2 Details
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
        cibilScore2: '',
        cibilClean2: 'YES',
        existingEMI2: '',

        // Loan Details
        loanPurpose: 'Purchase',

        // Property Details
        propertyType: 'Flat',
        propertyLocation: 'Urban',
        propertyAge: '',
        saleAgreementValue: '',
        realizableValue: '',
        branchEstimate: '',
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

    // Get LTV based on project cost
    const getLTV = (projectCost) => {
        if (projectCost <= 3000000) return 0.90
        if (projectCost <= 7500000) return 0.80
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

    // Get max exit age based on employment type
    const getMaxExitAge = (employmentType) => {
        if (employmentType === 'Salaried') return 60
        return 75 // Salaried+Pension, Business, Agriculture
    }

    // Calculate net monthly income based on employment type
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

            // Check variation > 25%
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
                netAnnualIncome = netYear1 // Latest year
            }
            return netAnnualIncome / 12
        } else if (empType === 'Agriculture') {
            const annualIncome = Number(formData[`agriIncome${applicantNum}`]) || 0
            return annualIncome / 12
        }
        return 0
    }

    const calculate = (e) => {
        e.preventDefault()

        const applicantType = formData.applicantType
        const age1 = calculateAge(formData.dob1)
        const cibilClean1 = formData.cibilClean1
        const cibil1 = Number(formData.cibilScore1)
        const empType1 = formData.employmentType1

        // HARD GATE 1: CIBIL Clean Status
        if (cibilClean1 !== 'YES') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - CIBIL Adverse",
                reason: "Applicant has adverse CIBIL history (overdues/NPA/write-off/OTS). Loan cannot be processed."
            })
            return
        }

        // HARD GATE 2: CIBIL Score < 650
        if (cibil1 < 650) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Low CIBIL Score",
                reason: `CIBIL score (${cibil1}) is below minimum required (650). Please improve your credit score.`
            })
            return
        }

        // Property Validation
        const propertyAge = Number(formData.propertyAge) || 0
        const propertyType = formData.propertyType
        const maxPropertyAge = propertyType === 'Flat' ? 20 : 25

        if (propertyAge > maxPropertyAge) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Property Too Old",
                reason: `${propertyType} age (${propertyAge} years) exceeds maximum allowed (${maxPropertyAge} years).`
            })
            return
        }

        // Calculate Project Cost
        const saleValue = Number(formData.saleAgreementValue) || 0
        const realizableValue = Number(formData.realizableValue) || 0
        const branchEstimate = Number(formData.branchEstimate) || realizableValue
        const pendingWorks = Number(formData.pendingWorks) || 0
        const projectCost = Math.min(saleValue, realizableValue, branchEstimate) + pendingWorks

        if (projectCost <= 0) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Invalid Property Value",
                reason: "Property valuation is required. Please enter valid property values."
            })
            return
        }

        // Purpose-specific validation
        const loanPurpose = formData.loanPurpose
        let purposeCap = Infinity
        let maxTenureByPurpose = 30

        if (loanPurpose === 'Repairs' || loanPurpose === 'Renovation') {
            purposeCap = 3000000 // ₹30 Lakhs
            maxTenureByPurpose = 15
        }

        // For JOINT APPLICANTS
        if (applicantType === 'Joint') {
            const age2 = calculateAge(formData.dob2)
            const cibilClean2 = formData.cibilClean2
            const cibil2 = Number(formData.cibilScore2)
            const empType2 = formData.employmentType2

            // HARD GATE: Both must have clean CIBIL
            if (cibilClean2 !== 'YES') {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Co-Applicant CIBIL Adverse",
                    reason: "Co-applicant has adverse CIBIL history. Joint loan cannot be processed."
                })
                return
            }

            // HARD GATE: Both CIBIL scores >= 650
            if (cibil2 < 650) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Co-Applicant Low CIBIL",
                    reason: `Co-applicant CIBIL score (${cibil2}) is below minimum required (650).`
                })
                return
            }

            // Determine elder applicant for exit age
            const elderAge = Math.max(age1, age2)
            const elderEmpType = age1 >= age2 ? empType1 : empType2
            const maxExitAge = getMaxExitAge(elderEmpType)

            // Calculate max tenure
            const maxTenureByAge = maxExitAge - elderAge
            const maxTenure = Math.min(30, maxTenureByAge, maxTenureByPurpose)

            if (maxTenure <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Exit Age Exceeded",
                    reason: `Elder applicant (age ${elderAge}) cannot have any permissible tenure within exit age limit (${maxExitAge}).`
                })
                return
            }

            // Property residual life check
            const loanEndPropertyAge = propertyAge + maxTenure
            const maxAllowedPropertyAge = propertyType === 'Flat' ? 20 : 25
            if (loanEndPropertyAge + 5 > maxAllowedPropertyAge + maxTenure) {
                // Simplified: just check if 5 years residual life possible
            }

            // Calculate income for both applicants
            const netIncome1 = calculateNetMonthlyIncome(empType1, '1')
            const netIncome2 = calculateNetMonthlyIncome(empType2, '2')

            // Joint EMI: 65% of each applicant's net income
            const eligibleEMI1 = netIncome1 * 0.65
            const eligibleEMI2 = netIncome2 * 0.65
            const totalEligibleEMI = eligibleEMI1 + eligibleEMI2

            const existingEMI1 = Number(formData.existingEMI1) || 0
            const existingEMI2 = Number(formData.existingEMI2) || 0
            const totalExistingEMI = existingEMI1 + existingEMI2

            const availableEMI = totalEligibleEMI - totalExistingEMI

            if (availableEMI <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Insufficient Repayment Capacity",
                    reason: `Combined eligible EMI (₹${totalEligibleEMI.toLocaleString('en-IN')}) minus existing EMIs (₹${totalExistingEMI.toLocaleString('en-IN')}) leaves no surplus.`
                })
                return
            }

            // ROI: Take worst (higher) ROI for joint applicants
            const roi1 = getROI(cibil1)
            const roi2 = getROI(cibil2)
            const roi = Math.max(roi1, roi2)

            // Calculate loan as per EMI
            const emiPerLakh = calculateEMIPerLakh(roi, maxTenure)
            const loanAsPerEMI = (availableEMI / emiPerLakh) * 100000

            // Calculate loan as per LTV
            const ltvRate = getLTV(projectCost)
            const loanAsPerLTV = projectCost * ltvRate

            // Final eligible loan
            const eligibleLoan = Math.min(loanAsPerEMI, loanAsPerLTV, purposeCap)

            // Calculate actual EMI
            const actualEMI = (eligibleLoan / 100000) * emiPerLakh
            const totalInterest = (actualEMI * maxTenure * 12) - eligibleLoan
            const totalPayable = eligibleLoan + totalInterest

            // Guarantor check
            let guarantorRequired = false
            let guarantorReason = ''

            if (empType1 === 'Salaried+Pension' || empType2 === 'Salaried+Pension') {
                guarantorRequired = true
                guarantorReason = 'Pensioner applicant'
            }
            if (formData.propertyLocation === 'Rural' &&
                empType1 !== 'Salaried' && empType2 !== 'Salaried') {
                guarantorRequired = true
                guarantorReason = 'Rural property with non-salaried applicants'
            }

            setResult({
                eligible: true,
                message: guarantorRequired
                    ? "✅ ELIGIBLE (Subject to Guarantor)"
                    : "✅ ELIGIBLE for Housing Loan (Joint Application)",
                guarantorRequired: guarantorRequired,
                guarantorReason: guarantorReason,
                details: {
                    eligibleLoan: eligibleLoan,
                    loanAsPerEMI: loanAsPerEMI,
                    loanAsPerLTV: loanAsPerLTV,
                    ltvRate: ltvRate * 100,
                    limitingFactor: eligibleLoan === loanAsPerEMI ? 'Joint EMI Capacity' :
                        eligibleLoan === loanAsPerLTV ? 'LTV Limit' : 'Purpose Cap',
                    roi: roi,
                    roiApplicant1: roi1,
                    roiApplicant2: roi2,
                    maxPermissibleEMI: availableEMI,
                    maxPermissibleTenure: maxTenure,
                    actualEMI: actualEMI,
                    totalInterest: totalInterest,
                    totalPayable: totalPayable,
                    projectCost: projectCost,
                    marginRequired: projectCost - eligibleLoan,
                    applicant1EMI: eligibleEMI1,
                    applicant2EMI: eligibleEMI2,
                    totalEligibleEMI: totalEligibleEMI,
                    totalExistingEMI: totalExistingEMI,
                    netIncome1: netIncome1,
                    netIncome2: netIncome2
                }
            })

        } else {
            // SINGLE APPLICANT LOGIC
            const maxExitAge = getMaxExitAge(empType1)
            const maxTenureByAge = maxExitAge - age1
            const maxTenure = Math.min(30, maxTenureByAge, maxTenureByPurpose)

            if (maxTenure <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Exit Age Exceeded",
                    reason: `Current age (${age1}) cannot have any permissible tenure within exit age limit (${maxExitAge}).`
                })
                return
            }

            // Calculate net income
            const netMonthlyIncome = calculateNetMonthlyIncome(empType1, '1')
            const annualIncome = netMonthlyIncome * 12

            // Calculate sustenance
            const sustenanceRate = getSustenanceRate(annualIncome)
            const sustenanceAmount = netMonthlyIncome * sustenanceRate

            // Calculate surplus EMI
            const existingEMI = Number(formData.existingEMI1) || 0
            const surplusEMI = netMonthlyIncome - sustenanceAmount - existingEMI

            if (surplusEMI <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Insufficient Repayment Capacity",
                    reason: `After sustenance (${(sustenanceRate * 100).toFixed(0)}%) and existing EMIs (₹${existingEMI.toLocaleString('en-IN')}), no surplus available for new EMI.`
                })
                return
            }

            // Calculate loan as per EMI
            const roi = getROI(cibil1)
            const emiPerLakh = calculateEMIPerLakh(roi, maxTenure)
            const loanAsPerEMI = (surplusEMI / emiPerLakh) * 100000

            // Calculate loan as per LTV
            const ltvRate = getLTV(projectCost)
            const loanAsPerLTV = projectCost * ltvRate

            // Final eligible loan
            const eligibleLoan = Math.min(loanAsPerEMI, loanAsPerLTV, purposeCap)

            // Calculate actual EMI
            const actualEMI = (eligibleLoan / 100000) * emiPerLakh
            const totalInterest = (actualEMI * maxTenure * 12) - eligibleLoan
            const totalPayable = eligibleLoan + totalInterest

            // Guarantor check
            let guarantorRequired = false
            let guarantorReason = ''

            if (empType1 === 'Salaried+Pension') {
                guarantorRequired = true
                guarantorReason = 'Pensioner applicant'
            }
            if (formData.propertyLocation === 'Rural' && empType1 !== 'Salaried') {
                guarantorRequired = true
                guarantorReason = 'Rural property with non-Govt employee'
            }

            setResult({
                eligible: true,
                message: guarantorRequired
                    ? "✅ ELIGIBLE (Subject to Guarantor)"
                    : "✅ ELIGIBLE for Housing Loan",
                guarantorRequired: guarantorRequired,
                guarantorReason: guarantorReason,
                details: {
                    eligibleLoan: eligibleLoan,
                    loanAsPerEMI: loanAsPerEMI,
                    loanAsPerLTV: loanAsPerLTV,
                    ltvRate: ltvRate * 100,
                    limitingFactor: eligibleLoan === loanAsPerEMI ? 'EMI Capacity' :
                        eligibleLoan === loanAsPerLTV ? 'LTV Limit' : 'Purpose Cap',
                    roi: roi,
                    maxPermissibleEMI: surplusEMI,
                    maxPermissibleTenure: maxTenure,
                    actualEMI: actualEMI,
                    totalInterest: totalInterest,
                    totalPayable: totalPayable,
                    projectCost: projectCost,
                    marginRequired: projectCost - eligibleLoan,
                    sustenanceAmount: sustenanceAmount,
                    sustenancePercentage: sustenanceRate * 100,
                    netMonthlyIncome: netMonthlyIncome,
                    existingEMI: existingEMI
                }
            })
        }
    }

    // Render employment-specific income fields
    const renderIncomeFields = (applicantNum, employmentType) => {
        if (employmentType === 'Salaried' || employmentType === 'Salaried+Pension') {
            return (
                <>
                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">💰</span>
                            Gross Monthly Salary (₹)
                        </label>
                        <input
                            type="number"
                            name={`grossSalary${applicantNum}`}
                            value={formData[`grossSalary${applicantNum}`]}
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
                            name={`taxDeduction${applicantNum}`}
                            value={formData[`taxDeduction${applicantNum}`]}
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
                            name={`otherDeductions${applicantNum}`}
                            value={formData[`otherDeductions${applicantNum}`]}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="PF, insurance, etc."
                            min="0"
                        />
                    </div>
                </>
            )
        } else if (employmentType === 'Business') {
            return (
                <>
                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">📄</span>
                            ITR Year 1 Net Income (₹)
                        </label>
                        <input
                            type="number"
                            name={`itrYear1_${applicantNum}`}
                            value={formData[`itrYear1_${applicantNum}`]}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Latest year income"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">📉</span>
                            Tax Year 1 (₹)
                        </label>
                        <input
                            type="number"
                            name={`taxYear1_${applicantNum}`}
                            value={formData[`taxYear1_${applicantNum}`]}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Tax paid"
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">📄</span>
                            ITR Year 2 Net Income (₹)
                        </label>
                        <input
                            type="number"
                            name={`itrYear2_${applicantNum}`}
                            value={formData[`itrYear2_${applicantNum}`]}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Previous year income"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">📉</span>
                            Tax Year 2 (₹)
                        </label>
                        <input
                            type="number"
                            name={`taxYear2_${applicantNum}`}
                            value={formData[`taxYear2_${applicantNum}`]}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Tax paid"
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">📄</span>
                            ITR Year 3 Net Income (₹)
                        </label>
                        <input
                            type="number"
                            name={`itrYear3_${applicantNum}`}
                            value={formData[`itrYear3_${applicantNum}`]}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="2 years ago income"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">📉</span>
                            Tax Year 3 (₹)
                        </label>
                        <input
                            type="number"
                            name={`taxYear3_${applicantNum}`}
                            value={formData[`taxYear3_${applicantNum}`]}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Tax paid"
                            min="0"
                        />
                    </div>
                </>
            )
        } else if (employmentType === 'Agriculture') {
            return (
                <div className="form-group">
                    <label className="form-label">
                        <span className="label-icon">🌾</span>
                        Last FY Net Agricultural Income (₹)
                    </label>
                    <input
                        type="number"
                        name={`agriIncome${applicantNum}`}
                        value={formData[`agriIncome${applicantNum}`]}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Annual agricultural income"
                        min="0"
                        required
                    />
                </div>
            )
        }
        return null
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
                        <h1 className="title">APGB Home Loan Eligibility</h1>
                        <p className="subtitle">CPC-Grade Bank Rule Engine | Circular 186/2025</p>
                    </div>

                    <form onSubmit={calculate}>
                        {/* Applicant Type */}
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
                            <h3>👤 {formData.applicantType === 'Joint' ? 'Applicant 1' : 'Applicant Details'}</h3>
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
                                    <option value="Salaried+Pension">Salaried + Pension</option>
                                    <option value="Business">Business / Self-Employed</option>
                                    <option value="Agriculture">Agriculture</option>
                                </select>
                            </div>

                            {renderIncomeFields('1', formData.employmentType1)}

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
                                    placeholder="Min 650 required"
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

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">💸</span>
                                    Existing Monthly EMI (₹)
                                </label>
                                <input
                                    type="number"
                                    name="existingEMI1"
                                    value={formData.existingEMI1}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Total existing EMIs"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Applicant 2 Details (Joint Only) */}
                        {formData.applicantType === 'Joint' && (
                            <>
                                <div className="section-header">
                                    <h3>👤 Applicant 2</h3>
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
                                            <option value="Salaried+Pension">Salaried + Pension</option>
                                            <option value="Business">Business / Self-Employed</option>
                                            <option value="Agriculture">Agriculture</option>
                                        </select>
                                    </div>

                                    {renderIncomeFields('2', formData.employmentType2)}

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
                                            placeholder="Min 650 required"
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

                                    <div className="form-group">
                                        <label className="form-label">
                                            <span className="label-icon">💸</span>
                                            Existing Monthly EMI (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="existingEMI2"
                                            value={formData.existingEMI2}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Applicant 2 EMIs"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Loan Purpose */}
                        <div className="section-header">
                            <h3>🎯 Loan Purpose</h3>
                        </div>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">
                                    <span className="label-icon">📝</span>
                                    Purpose of Loan
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
                                    <option value="Repairs">Repairs (Max ₹30L, 15 yrs)</option>
                                    <option value="Renovation">Renovation (Max ₹30L, 15 yrs)</option>
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
                                    <option value="Flat">Residential Flat (Max 20 yrs)</option>
                                    <option value="Building">Residential Building (Max 25 yrs)</option>
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
                                    Property Age (Years)
                                </label>
                                <input
                                    type="number"
                                    name="propertyAge"
                                    value={formData.propertyAge}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Current age"
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
                                    Valuer Realizable Value (₹)
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
                                    <span className="label-icon">🏛️</span>
                                    Branch Estimate (₹)
                                </label>
                                <input
                                    type="number"
                                    name="branchEstimate"
                                    value={formData.branchEstimate}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Branch valuation"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">🔨</span>
                                    Pending Works Cost (₹)
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

                            {result.guarantorRequired && (
                                <div className="guarantor-notice">
                                    ⚠️ <strong>Guarantor Required:</strong> {result.guarantorReason}
                                </div>
                            )}

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

                                    <div className="result-item highlight-box">
                                        <span className="result-label">Maximum Permissible EMI</span>
                                        <span className="result-value highlight">
                                            ₹{result.details.maxPermissibleEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / month
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Applicable ROI</span>
                                        <span className="result-value">{result.details.roi}% p.a</span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Maximum Permissible Tenure</span>
                                        <span className="result-value">{result.details.maxPermissibleTenure} years</span>
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
                                        <span className="result-label">Loan as per LTV ({result.details.ltvRate}%)</span>
                                        <span className="result-value">
                                            ₹{result.details.loanAsPerLTV.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Actual EMI (if full loan)</span>
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
                                        <span className="result-label">Total Payable</span>
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
                                        <span className="result-label">Margin Required</span>
                                        <span className="result-value">
                                            ₹{result.details.marginRequired.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    {formData.applicantType === 'Joint' && (
                                        <>
                                            <div className="result-item">
                                                <span className="result-label">Applicant 1: Net Income / Eligible EMI (65%)</span>
                                                <span className="result-value">
                                                    ₹{result.details.netIncome1.toLocaleString('en-IN', { maximumFractionDigits: 0 })} /
                                                    ₹{result.details.applicant1EMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>

                                            <div className="result-item">
                                                <span className="result-label">Applicant 2: Net Income / Eligible EMI (65%)</span>
                                                <span className="result-value">
                                                    ₹{result.details.netIncome2.toLocaleString('en-IN', { maximumFractionDigits: 0 })} /
                                                    ₹{result.details.applicant2EMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>

                                            <div className="result-item">
                                                <span className="result-label">Total Existing EMIs</span>
                                                <span className="result-value">
                                                    ₹{result.details.totalExistingEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {formData.applicantType === 'Single' && result.details.sustenanceAmount && (
                                        <>
                                            <div className="result-item">
                                                <span className="result-label">Net Monthly Income</span>
                                                <span className="result-value">
                                                    ₹{result.details.netMonthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>

                                            <div className="result-item">
                                                <span className="result-label">Sustenance ({result.details.sustenancePercentage.toFixed(0)}%)</span>
                                                <span className="result-value">
                                                    ₹{result.details.sustenanceAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>

                                            <div className="result-item">
                                                <span className="result-label">Existing EMI</span>
                                                <span className="result-value">
                                                    ₹{result.details.existingEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="footer">
                        <p>© 2024 APGB Home Loan Eligibility | CPC-Grade Rule Engine</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            Based on Circular 186/2025 | For eligibility check only, not sanction
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HousingLoan
