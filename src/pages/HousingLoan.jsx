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
        itrYear1_1: '',
        itrYear2_1: '',
        itrYear3_1: '',
        taxYear1_1: '',
        taxYear2_1: '',
        taxYear3_1: '',
        agriIncome1: '',
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

        // Loan Purpose
        loanPurpose: 'Purchase',

        // Common Property Fields
        propertyType: 'Flat',
        propertyLocation: 'Urban',
        propertyAge: '',

        // Purchase-specific
        saleAgreementValue: '',
        realizableValue: '',
        pendingWorks: '',

        // Construction-specific
        constructionCost: '',

        // Plot + Construction specific
        plotValue: '',
        // constructionCost is reused

        // Repairs/Renovation specific
        repairsRenovationCost: '',

        // Takeover specific
        outstandingLoanAmount: ''
        // realizableValue is reused
    })

    const [result, setResult] = useState(null)

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

        // Adjust if days are negative
        if (days < 0) {
            months--
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
            days += lastMonth.getDate()
        }

        // Adjust if months are negative
        if (months < 0) {
            years--
            months += 12
        }

        return { years, months, days, totalYears: years }
    }

    // Format age display
    const formatAge = (ageObj) => {
        if (!ageObj || ageObj.years === 0 && ageObj.months === 0 && ageObj.days === 0) {
            return ''
        }

        const parts = []
        if (ageObj.years > 0) parts.push(`${ageObj.years} ${ageObj.years === 1 ? 'year' : 'years'}`)
        if (ageObj.months > 0) parts.push(`${ageObj.months} ${ageObj.months === 1 ? 'month' : 'months'}`)
        if (ageObj.days > 0) parts.push(`${ageObj.days} ${ageObj.days === 1 ? 'day' : 'days'}`)

        return parts.join(', ')
    }

    // Get ROI based on CIBIL
    // As per Circular: NTC (-1), scores 1-5, 100-200 are treated same as 700-749
    const getROI = (cibil) => {
        // Special cases: NTC (-1), 1-5, 100-200 → 8.25%
        if (cibil === -1 || (cibil >= 1 && cibil <= 5) || (cibil >= 100 && cibil <= 200)) {
            return 8.25
        }
        // Standard CIBIL ranges
        if (cibil >= 750) return 7.75
        if (cibil >= 700) return 8.25
        if (cibil >= 650) return 8.75
        return 9.50
    }

    // Get sustenance amount (not percentage) based on annual income
    // Returns MONTHLY sustenance deduction amount
    const getSustenanceAmount = (netMonthlyIncome) => {
        const annualIncome = netMonthlyIncome * 12

        if (annualIncome <= 300000) {
            return netMonthlyIncome * 0.45  // 45%
        } else if (annualIncome <= 500000) {
            return netMonthlyIncome * 0.40  // 40%
        } else if (annualIncome <= 800000) {
            return netMonthlyIncome * 0.35  // 35%
        } else if (annualIncome <= 1200000) {
            return netMonthlyIncome * 0.30  // 30%
        } else {
            // For income > ₹12L: lower of 25% OR ₹20,000
            const twentyFivePercent = netMonthlyIncome * 0.25
            return Math.min(twentyFivePercent, 20000)
        }
    }

    // Get sustenance percentage for display
    const getSustenanceRate = (annualIncome) => {
        if (annualIncome <= 300000) return 0.45
        if (annualIncome <= 500000) return 0.40
        if (annualIncome <= 800000) return 0.35
        if (annualIncome <= 1200000) return 0.30
        return 0.25  // Max 25% for >12L
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

    // Get max exit age
    const getMaxExitAge = (employmentType) => {
        if (employmentType === 'Salaried') return 60
        return 75
    }

    // Calculate net monthly income
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
            const annualIncome = Number(formData[`agriIncome${applicantNum}`]) || 0
            return annualIncome / 12
        }
        return 0
    }

    const calculate = (e) => {
        e.preventDefault()

        const applicantType = formData.applicantType
        const age1 = calculateAge(formData.dob1).totalYears
        const cibilClean1 = formData.cibilClean1
        const cibil1 = Number(formData.cibilScore1)
        const empType1 = formData.employmentType1
        const loanPurpose = formData.loanPurpose

        // HARD GATE: CIBIL Clean Status
        if (cibilClean1 !== 'YES') {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - CIBIL Adverse",
                reason: "Applicant has adverse CIBIL history (overdues/NPA/write-off/OTS)."
            })
            return
        }

        // HARD GATE: CIBIL Score check
        // Special cases: NTC (-1), 1-5, 100-200 are allowed at 8.25% ROI
        const isSpecialCIBIL = (score) => {
            return score === -1 || (score >= 1 && score <= 5) || (score >= 100 && score <= 200)
        }

        if (cibil1 < 650 && !isSpecialCIBIL(cibil1)) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Low CIBIL Score",
                reason: `CIBIL score (${cibil1}) is below minimum required (650). Note: NTC (-1), 1-5, 100-200 are exceptions.`
            })
            return
        }

        // Calculate Project Cost based on purpose
        let projectCost = 0
        const propertyAge = Number(formData.propertyAge) || 0

        if (loanPurpose === 'Purchase') {
            const saleValue = Number(formData.saleAgreementValue) || 0
            const realizableValue = Number(formData.realizableValue) || 0
            const pendingWorks = Number(formData.pendingWorks) || 0
            projectCost = Math.min(saleValue, realizableValue) + pendingWorks

            // Property age validation for Purchase
            const propertyType = formData.propertyType
            const maxPropertyAge = propertyType === 'Flat' ? 20 : 25
            if (propertyAge > maxPropertyAge) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Property Too Old",
                    reason: `${propertyType} age (${propertyAge} years) exceeds maximum (${maxPropertyAge} years).`
                })
                return
            }
        } else if (loanPurpose === 'Construction') {
            projectCost = Number(formData.constructionCost) || 0
        } else if (loanPurpose === 'Plot+Construction') {
            const plotValue = Number(formData.plotValue) || 0
            const constructionCost = Number(formData.constructionCost) || 0
            projectCost = plotValue + constructionCost
        } else if (loanPurpose === 'Repairs/Renovation') {
            projectCost = Number(formData.repairsRenovationCost) || 0

            // Property must be ≥ 3 years old
            if (propertyAge < 3) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Property Too New",
                    reason: "For repairs/renovation, property must be at least 3 years old."
                })
                return
            }
        } else if (loanPurpose === 'Takeover') {
            projectCost = Number(formData.realizableValue) || 0

            // Takeover age validation
            const propertyType = formData.propertyType
            const maxPropertyAge = propertyType === 'Flat' ? 20 : 25
            if (propertyAge > maxPropertyAge) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Property Too Old",
                    reason: `${propertyType} age (${propertyAge} years) exceeds maximum (${maxPropertyAge} years).`
                })
                return
            }
        }

        if (projectCost <= 0) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Invalid Property Value",
                reason: "Property cost must be greater than zero."
            })
            return
        }

        // Purpose-specific caps
        let purposeCap = Infinity
        let maxTenureByPurpose = 30

        if (loanPurpose === 'Repairs/Renovation') {
            purposeCap = 3000000 // ₹30 Lakhs
            maxTenureByPurpose = 15
        }

        // FOR JOINT APPLICANTS
        if (applicantType === 'Joint') {
            const age2 = calculateAge(formData.dob2).totalYears
            const cibilClean2 = formData.cibilClean2
            const cibil2 = Number(formData.cibilScore2)
            const empType2 = formData.employmentType2

            if (cibilClean2 !== 'YES') {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Co-Applicant CIBIL Adverse",
                    reason: "Co-applicant has adverse CIBIL history."
                })
                return
            }

            if (cibil2 < 650 && !isSpecialCIBIL(cibil2)) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Co-Applicant Low CIBIL",
                    reason: `Co-applicant CIBIL score (${cibil2}) is below minimum (650). Note: NTC (-1), 1-5, 100-200 are exceptions.`
                })
                return
            }

            const elderAge = Math.max(age1, age2)
            const elderEmpType = age1 >= age2 ? empType1 : empType2
            const maxExitAge = getMaxExitAge(elderEmpType)
            const maxTenureByAge = maxExitAge - elderAge
            const maxTenure = Math.min(30, maxTenureByAge, maxTenureByPurpose)

            if (maxTenure <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Exit Age Exceeded",
                    reason: `Elder applicant (age ${elderAge}) exceeds exit age limit (${maxExitAge}).`
                })
                return
            }

            const netIncome1 = calculateNetMonthlyIncome(empType1, '1')
            const netIncome2 = calculateNetMonthlyIncome(empType2, '2')

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

            const roi1 = getROI(cibil1)
            const roi2 = getROI(cibil2)
            const roi = Math.max(roi1, roi2)

            const emiPerLakh = calculateEMIPerLakh(roi, maxTenure)
            const loanAsPerEMI = (availableEMI / emiPerLakh) * 100000

            const ltvRate = getLTV(projectCost)
            let loanAsPerLTV = projectCost * ltvRate

            // Takeover-specific logic
            let eligibleLoan
            if (loanPurpose === 'Takeover') {
                const outstandingAmount = Number(formData.outstandingLoanAmount) || 0
                eligibleLoan = Math.min(loanAsPerEMI, loanAsPerLTV, outstandingAmount, purposeCap)
            } else {
                eligibleLoan = Math.min(loanAsPerEMI, loanAsPerLTV, purposeCap)
            }

            // Plot + Construction: Plot ≤ 50% check
            if (loanPurpose === 'Plot+Construction') {
                const plotValue = Number(formData.plotValue) || 0
                const plotPercentage = (plotValue / eligibleLoan) * 100
                if (plotPercentage > 50) {
                    eligibleLoan = plotValue / 0.50 // Adjust to make plot exactly 50%
                }
            }

            const actualEMI = (eligibleLoan / 100000) * emiPerLakh
            const totalInterest = (actualEMI * maxTenure * 12) - eligibleLoan
            const totalPayable = eligibleLoan + totalInterest

            let guarantorRequired = false
            let guarantorReason = ''

            if (empType1 === 'Salaried+Pension' || empType2 === 'Salaried+Pension') {
                guarantorRequired = true
                guarantorReason = 'Pensioner applicant'
            }
            if (formData.propertyLocation === 'Rural' && empType1 !== 'Salaried' && empType2 !== 'Salaried') {
                guarantorRequired = true
                guarantorReason = 'Rural property with non-salaried applicants'
            }

            setResult({
                eligible: true,
                message: guarantorRequired ? "✅ ELIGIBLE (Subject to Guarantor)" : "✅ ELIGIBLE (Joint Application)",
                guarantorRequired: guarantorRequired,
                guarantorReason: guarantorReason,
                details: {
                    eligibleLoan: eligibleLoan,
                    loanAsPerEMI: loanAsPerEMI,
                    loanAsPerLTV: loanAsPerLTV,
                    ltvRate: ltvRate * 100,
                    limitingFactor: eligibleLoan === loanAsPerEMI ? 'Joint EMI Capacity' :
                        eligibleLoan === loanAsPerLTV ? 'LTV Limit' : 'Purpose/Outstanding Cap',
                    roi: roi,
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
            // SINGLE APPLICANT
            const maxExitAge = getMaxExitAge(empType1)
            const maxTenureByAge = maxExitAge - age1
            const maxTenure = Math.min(30, maxTenureByAge, maxTenureByPurpose)

            if (maxTenure <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Exit Age Exceeded",
                    reason: `Current age (${age1}) exceeds permissible tenure within exit age limit (${maxExitAge}).`
                })
                return
            }

            const netMonthlyIncome = calculateNetMonthlyIncome(empType1, '1')
            const annualIncome = netMonthlyIncome * 12

            // Get sustenance using the correct function
            const sustenanceAmount = getSustenanceAmount(netMonthlyIncome)
            const sustenanceRate = getSustenanceRate(annualIncome)

            const existingEMI = Number(formData.existingEMI1) || 0
            const surplusEMI = netMonthlyIncome - sustenanceAmount - existingEMI

            if (surplusEMI <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Insufficient Repayment Capacity",
                    reason: `After sustenance (${(sustenanceRate * 100).toFixed(0)}%) and existing EMIs (₹${existingEMI.toLocaleString('en-IN')}), no surplus available.`
                })
                return
            }

            const roi = getROI(cibil1)
            const emiPerLakh = calculateEMIPerLakh(roi, maxTenure)
            const loanAsPerEMI = (surplusEMI / emiPerLakh) * 100000

            const ltvRate = getLTV(projectCost)
            let loanAsPerLTV = projectCost * ltvRate

            // Takeover-specific logic
            let eligibleLoan
            if (loanPurpose === 'Takeover') {
                const outstandingAmount = Number(formData.outstandingLoanAmount) || 0
                eligibleLoan = Math.min(loanAsPerEMI, loanAsPerLTV, outstandingAmount, purposeCap)
            } else {
                eligibleLoan = Math.min(loanAsPerEMI, loanAsPerLTV, purposeCap)
            }

            // Plot + Construction: Plot ≤ 50% check
            if (loanPurpose === 'Plot+Construction') {
                const plotValue = Number(formData.plotValue) || 0
                const plotPercentage = (plotValue / eligibleLoan) * 100
                if (plotPercentage > 50) {
                    eligibleLoan = plotValue / 0.50
                }
            }

            const actualEMI = (eligibleLoan / 100000) * emiPerLakh
            const totalInterest = (actualEMI * maxTenure * 12) - eligibleLoan
            const totalPayable = eligibleLoan + totalInterest

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
                message: guarantorRequired ? "✅ ELIGIBLE (Subject to Guarantor)" : "✅ ELIGIBLE for Housing Loan",
                guarantorRequired: guarantorRequired,
                guarantorReason: guarantorReason,
                details: {
                    eligibleLoan: eligibleLoan,
                    loanAsPerEMI: loanAsPerEMI,
                    loanAsPerLTV: loanAsPerLTV,
                    ltvRate: ltvRate * 100,
                    limitingFactor: eligibleLoan === loanAsPerEMI ? 'EMI Capacity' :
                        eligibleLoan === loanAsPerLTV ? 'LTV Limit' : 'Purpose/Outstanding Cap',
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
                            placeholder="Latest year"
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
                            placeholder="Previous year"
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
                            placeholder="2 years ago"
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

    // Render purpose-specific property fields
    const renderPropertyFields = () => {
        const purpose = formData.loanPurpose

        if (purpose === 'Purchase') {
            return (
                <>
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
                            <span className="label-icon">🔨</span>
                            Pending Works Cost (₹)
                        </label>
                        <input
                            type="number"
                            name="pendingWorks"
                            value={formData.pendingWorks}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Optional"
                            min="0"
                        />
                    </div>
                </>
            )
        } else if (purpose === 'Construction') {
            return (
                <>
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
                            <span className="label-icon">🏗️</span>
                            Estimated Construction Cost (₹)
                        </label>
                        <input
                            type="number"
                            name="constructionCost"
                            value={formData.constructionCost}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Engineer/valuer estimate"
                            min="0"
                            required
                        />
                    </div>
                </>
            )
        } else if (purpose === 'Plot+Construction') {
            return (
                <>
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
                            <span className="label-icon">📜</span>
                            Sale Agreement Value - Plot (₹)
                        </label>
                        <input
                            type="number"
                            name="plotValue"
                            value={formData.plotValue}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Plot purchase value"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">🏗️</span>
                            Estimated Construction Cost (₹)
                        </label>
                        <input
                            type="number"
                            name="constructionCost"
                            value={formData.constructionCost}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Construction estimate"
                            min="0"
                            required
                        />
                    </div>
                </>
            )
        } else if (purpose === 'Repairs/Renovation') {
            return (
                <>
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
                            <span className="label-icon">🔧</span>
                            Estimated Repairs/Renovation Cost (₹)
                        </label>
                        <input
                            type="number"
                            name="repairsRenovationCost"
                            value={formData.repairsRenovationCost}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Repair cost estimate"
                            min="0"
                            required
                        />
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
                            placeholder="Must be ≥ 3 years"
                            min="3"
                            required
                        />
                    </div>
                </>
            )
        } else if (purpose === 'Takeover') {
            return (
                <>
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
                            <span className="label-icon">📊</span>
                            Outstanding Loan Amount (₹)
                        </label>
                        <input
                            type="number"
                            name="outstandingLoanAmount"
                            value={formData.outstandingLoanAmount}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Current outstanding"
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
                </>
            )
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
                        <h1 className="title">APGB Home Loan Eligibility</h1>
                        <p className="subtitle">CPC-Grade | Circular 186/2025</p>
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

                        {/* Applicant 1 */}
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
                                    <small className="helper-text">Age: {formatAge(calculateAge(formData.dob1))}</small>
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
                                    placeholder="Min 650 (or -1/1-5/100-200)"
                                    min="-1"
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

                        {/* Applicant 2 (Joint Only) */}
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
                                            <small className="helper-text">Age: {formatAge(calculateAge(formData.dob2))}</small>
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
                                            placeholder="Min 650 (or -1/1-5/100-200)"
                                            min="-1"
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
                                    <option value="Repairs/Renovation">Repairs / Renovation (Max ₹30L, 15 yrs)</option>
                                    <option value="Takeover">Takeover</option>
                                </select>
                            </div>
                        </div>

                        {/* Property Details - PURPOSE-SPECIFIC */}
                        <div className="section-header">
                            <h3>🏘️ Property Details</h3>
                        </div>
                        <div className="form-grid">
                            {renderPropertyFields()}
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
                                        <span className="result-label">Maximum Eligible Loan</span>
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
                                        <span className="result-label">Loan as per LTV ({result.details.ltvRate.toFixed(0)}%)</span>
                                        <span className="result-value">
                                            ₹{result.details.loanAsPerLTV.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Actual EMI</span>
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
                                                <span className="result-label">Applicant 1: Net Income / EMI (65%)</span>
                                                <span className="result-value">
                                                    ₹{result.details.netIncome1.toLocaleString('en-IN', { maximumFractionDigits: 0 })} /
                                                    ₹{result.details.applicant1EMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>

                                            <div className="result-item">
                                                <span className="result-label">Applicant 2: Net Income / EMI (65%)</span>
                                                <span className="result-value">
                                                    ₹{result.details.netIncome2.toLocaleString('en-IN', { maximumFractionDigits: 0 })} /
                                                    ₹{result.details.applicant2EMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
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
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="footer">
                        <p>© 2024 APGB Home Loan | CPC-Grade Circular 186/2025</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            100% Circular-Compliant | For eligibility check only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HousingLoan
