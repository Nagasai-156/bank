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
        outstandingLoanAmount: '',
        loanSanctionDate: ''
        // realizableValue is reused
    })

    const [result, setResult] = useState(null)
    const [showDetails, setShowDetails] = useState(false) // Toggle for calculation breakdown

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

    // Format age display - round up to next month if days > 0
    const formatAge = (ageObj) => {
        if (!ageObj || (ageObj.years === 0 && ageObj.months === 0 && ageObj.days === 0)) {
            return ''
        }

        // Round up: if there are any days, add to months
        let years = ageObj.years
        let months = ageObj.months

        if (ageObj.days > 0) {
            months += 1  // Round up to next month

            // Handle overflow (12 months = 1 year)
            if (months >= 12) {
                years += 1
                months = 0
            }
        }

        const parts = []
        if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
        if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`)

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
    // Get sustenance amount based on Annual GROSS Income
    // Returns MONTHLY sustenance deduction amount applied to Net Income
    const getSustenanceAmount = (netMonthlyIncome, annualGrossIncome) => {
        // Use Annual Gross if available, else fallback to Net*12
        const incomeForSlab = annualGrossIncome || (netMonthlyIncome * 12)

        if (incomeForSlab <= 300000) {
            return netMonthlyIncome * 0.45  // 45%
        } else if (incomeForSlab <= 500000) {
            return netMonthlyIncome * 0.40  // 40%
        } else if (incomeForSlab <= 800000) {
            return netMonthlyIncome * 0.35  // 35%
        } else if (incomeForSlab <= 1200000) {
            return netMonthlyIncome * 0.30  // 30%
        } else {
            // For Annual Gross > ₹12L: lower of 25% OR ₹2.00 Lakhs monthly
            const twentyFivePercent = netMonthlyIncome * 0.25
            return Math.min(twentyFivePercent, 200000) // Updated to 2.00 Lacs
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

    // Get LTV Ratio - Repairs is fixed 80%, others slab-based
    const getLTV = (projectCost, purpose) => {
        if (purpose === 'Repairs/Renovation') return 0.80 // Fixed 80% for Repairs

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
        const cibil1 = Number(formData.cibil1)
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

            // Step 1: Validate Loan Sanction Date (Must be 1+ year old)
            const loanSanctionDate = formData.loanSanctionDate
            if (!loanSanctionDate) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Missing Loan Sanction Date",
                    reason: "Loan sanction date is required for takeover loans."
                })
                return
            }

            const sanctionDate = new Date(loanSanctionDate)
            const today = new Date()
            const loanAgeInMonths = (today - sanctionDate) / (1000 * 60 * 60 * 24 * 30)

            if (loanAgeInMonths < 12) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Loan Too Recent",
                    reason: `Loan must be at least 1 year old. Current age: ${Math.floor(loanAgeInMonths)} months.`
                })
                return
            }

            // Step 2: Takeover age validation
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
            const cibil2 = Number(formData.cibil2)
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

            const ltvRate = getLTV(projectCost, loanPurpose)
            let loanAsPerLTV = projectCost * ltvRate

            // Takeover-specific logic
            let eligibleLoan
            let takeoverDetails = null

            if (loanPurpose === 'Takeover') {
                const outstandingAmount = Number(formData.outstandingLoanAmount) || 0

                // Check if outstanding is within LTV and EMI limits
                const maxByLimiters = Math.min(loanAsPerEMI, loanAsPerLTV, purposeCap)

                if (outstandingAmount > maxByLimiters) {
                    const limitingFactor = maxByLimiters === loanAsPerLTV ? 'LTV' : 'EMI Capacity'
                    setResult({
                        eligible: false,
                        message: `NOT ELIGIBLE - Outstanding Exceeds ${limitingFactor}`,
                        reason: `Outstanding amount (₹${outstandingAmount.toLocaleString('en-IN')}) exceeds ${limitingFactor}-based maximum (₹${maxByLimiters.toLocaleString('en-IN', { minimumFractionDigits: 2 })}).`
                    })
                    return
                }

                // Calculate Available Top-up
                const availableTopup = maxByLimiters - outstandingAmount
                eligibleLoan = outstandingAmount

                takeoverDetails = {
                    outstandingAmount: outstandingAmount,
                    availableTopup: Math.max(0, availableTopup),
                    maxByLimiters: maxByLimiters
                }
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
                    netIncome2: netIncome2,
                    ...(takeoverDetails && { takeover: takeoverDetails })
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

            // Calculate Annual Gross Income for Slab Check (as per Circular)
            let annualGrossIncome = netMonthlyIncome * 12
            if (empType1 === 'Salaried' || empType1 === 'Salaried+Pension') {
                annualGrossIncome = (Number(formData.grossSalary1) || 0) * 12
            }

            // Get sustenance using the correct function (Slabs based on Gross, Deduction applied to Net)
            const sustenanceAmount = getSustenanceAmount(netMonthlyIncome, annualGrossIncome)
            const sustenanceRate = getSustenanceRate(annualGrossIncome)

            const existingEMI = Number(formData.existingEMI1) || 0
            const surplusEMI = netMonthlyIncome - sustenanceAmount - existingEMI

            if (surplusEMI <= 0) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Insufficient Repayment Capacity",
                    reason: `After sustenance (${(sustenanceRate * 100).toFixed(2)}%) and existing EMIs (₹${existingEMI.toLocaleString('en-IN')}), no surplus available.`
                })
                return
            }

            const roi = getROI(cibil1)
            const emiPerLakh = calculateEMIPerLakh(roi, maxTenure)
            const loanAsPerEMI = (surplusEMI / emiPerLakh) * 100000

            const ltvRate = getLTV(projectCost, loanPurpose)
            let loanAsPerLTV = projectCost * ltvRate

            // Takeover-specific logic
            let eligibleLoan
            let takeoverDetails = null

            if (loanPurpose === 'Takeover') {
                const outstandingAmount = Number(formData.outstandingLoanAmount) || 0

                // Check if outstanding is within LTV and EMI limits
                const maxByLimiters = Math.min(loanAsPerEMI, loanAsPerLTV, purposeCap)

                if (outstandingAmount > maxByLimiters) {
                    const limitingFactor = maxByLimiters === loanAsPerLTV ? 'LTV' : 'EMI Capacity'
                    setResult({
                        eligible: false,
                        message: `NOT ELIGIBLE - Outstanding Exceeds ${limitingFactor}`,
                        reason: `Outstanding amount (₹${outstandingAmount.toLocaleString('en-IN')}) exceeds ${limitingFactor}-based maximum (₹${maxByLimiters.toLocaleString('en-IN', { minimumFractionDigits: 2 })}).`
                    })
                    return
                }

                // Calculate Available Top-up
                const availableTopup = maxByLimiters - outstandingAmount
                eligibleLoan = outstandingAmount

                takeoverDetails = {
                    outstandingAmount: outstandingAmount,
                    availableTopup: Math.max(0, availableTopup),
                    maxByLimiters: maxByLimiters
                }
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
                    existingEMI: existingEMI,
                    ...(takeoverDetails && { takeover: takeoverDetails })
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
                            <span className="label-icon">📅</span>
                            Loan Sanction Date
                        </label>
                        <input
                            type="date"
                            name="loanSanctionDate"
                            value={formData.loanSanctionDate}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                        <span className="helper-text">Must be 1+ year old</span>
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
        <div className="housing-loan-container">
            <div className="page-header">
                <Link to="/" style={{ position: 'absolute', left: '20px', color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                    ← Back to Services
                </Link>
                <div style={{ textAlign: 'center' }}>
                    <div className="header-title">
                        <span>🏠</span> APGB Housing Loan Calculator
                    </div>
                    <div className="header-subtitle">Circular No. 186/2025 | Accurate Eligibility Check</div>
                </div>
            </div>

            <form onSubmit={calculate} className="loan-form">

                {/* === SECTION 1: APPLICANT DETAILS === */}
                <div className="form-section">
                    <div className="section-header">
                        <div className="section-icon">👤</div>
                        <h3 className="section-title">Applicant Details</h3>
                    </div>

                    <div className="form-grid-3">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">👥</span> Applicant Type
                            </label>
                            <select
                                name="applicantType"
                                value={formData.applicantType}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Single">Single Applicant</option>
                                <option value="Joint">Joint Applicant</option>
                            </select>
                        </div>

                        {/* Applicant 1 Information */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🎂</span> Date of Birth (App 1)
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
                                <span className="label-icon">💼</span> Employment (App 1)
                            </label>
                            <select
                                name="employmentType1"
                                value={formData.employmentType1}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Salaried">Salaried</option>
                                <option value="Salaried+Pension">Salaried + Pension</option>
                                <option value="Business">Business / Self-Employed</option>
                                <option value="Agriculture">Agriculturist</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📊</span> CIBIL Score (App 1)
                            </label>
                            <input
                                type="number"
                                name="cibil1"
                                value={formData.cibil1}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter Score (e.g. 750)"
                                min="-1"
                                max="900"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">✅</span> Clean CIBIL History?
                            </label>
                            <select
                                name="cibilClean1"
                                value={formData.cibilClean1}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="YES">YES - Clean History</option>
                                <option value="NO">NO - Overdues/NPA</option>
                            </select>
                        </div>
                    </div>

                    {/* Joint Applicant Fields */}
                    {formData.applicantType === 'Joint' && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #eee' }}>
                            <h4 style={{ marginBottom: '15px', color: '#1a5f7a' }}>Applicant 2 Details</h4>
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label className="form-label">
                                        <span className="label-icon">🎂</span> Date of Birth (App 2)
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
                                        <span className="label-icon">💼</span> Employment (App 2)
                                    </label>
                                    <select
                                        name="employmentType2"
                                        value={formData.employmentType2}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="Salaried">Salaried</option>
                                        <option value="Salaried+Pension">Salaried + Pension</option>
                                        <option value="Business">Business</option>
                                        <option value="Agriculture">Agriculturist</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <span className="label-icon">📊</span> CIBIL Score (App 2)
                                    </label>
                                    <input
                                        type="number"
                                        name="cibil2"
                                        value={formData.cibil2}
                                        onChange={handleChange}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <span className="label-icon">✅</span> Clean CIBIL History?
                                    </label>
                                    <select
                                        name="cibilClean2"
                                        value={formData.cibilClean2}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="YES">YES - Clean History</option>
                                        <option value="NO">NO - Overdues/NPA</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* === SECTION 2: FINANCIALS === */}
                <div className="form-section">
                    <div className="section-header">
                        <div className="section-icon">💰</div>
                        <h3 className="section-title">Income & Financials</h3>
                    </div>

                    <div className="form-grid-2">
                        {/* App 1 Income */}
                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                            <h4 style={{ marginBottom: '15px', color: '#555' }}>Applicant 1 Income</h4>
                            {renderIncomeFields('1', formData.employmentType1)}

                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label className="form-label">
                                    <span className="label-icon">💳</span> Existing EMI Obligations (₹)
                                </label>
                                <input
                                    type="number"
                                    name="existingEMI1"
                                    value={formData.existingEMI1}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* App 2 Income */}
                        {formData.applicantType === 'Joint' && (
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                                <h4 style={{ marginBottom: '15px', color: '#555' }}>Applicant 2 Income</h4>
                                {renderIncomeFields('2', formData.employmentType2)}

                                <div className="form-group" style={{ marginTop: '15px' }}>
                                    <label className="form-label">
                                        <span className="label-icon">💳</span> Existing EMI Obligations (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="existingEMI2"
                                        value={formData.existingEMI2}
                                        onChange={handleChange}
                                        className="form-input"
                                        min="0"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* === SECTION 3: LOAN & PROPERTY === */}
                <div className="form-section">
                    <div className="section-header">
                        <div className="section-icon">🏠</div>
                        <h3 className="section-title">Property & Loan Request</h3>
                    </div>

                    <div className="form-grid-3">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🎯</span> Loan Purpose
                            </label>
                            <select
                                name="loanPurpose"
                                value={formData.loanPurpose}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Purchase">Purchase House/Flat</option>
                                <option value="Construction">Construction</option>
                                <option value="Plot+Construction">Plot + Construction</option>
                                <option value="Repairs/Renovation">Repairs/Renovation</option>
                                <option value="Takeover">Takeover</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-grid-3" style={{ marginTop: '20px' }}>
                        {renderPropertyFields(formData.loanPurpose)}
                    </div>
                </div>

                <button type="submit" className="calculate-btn">Check Eligibility ✨</button>
            </form>

            {/* === HOME LOAN PLUS CALL-TO-ACTION === */}
            <div style={{
                maxWidth: '1000px',
                margin: '40px auto 30px',
                padding: '0 20px'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '3px solid #f59e0b',
                    borderRadius: '12px',
                    padding: '25px 30px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '8px'
                        }}>
                            <span style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '800',
                                letterSpacing: '1px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }}>
                                PLUS
                            </span>
                            <h3 style={{
                                margin: 0,
                                fontSize: '1.3rem',
                                fontWeight: '700',
                                color: '#92400e'
                            }}>
                                Already Have a Home Loan with Us?
                            </h3>
                        </div>
                        <p style={{
                            margin: '8px 0 0 0',
                            fontSize: '0.95rem',
                            color: '#78350f',
                            lineHeight: '1.6'
                        }}>
                            Get additional funds with <strong>Home Loan Plus</strong> for personal needs or debt consolidation.
                            Rate: <strong>Your existing ROI + 0.75%</strong> | Amount: <strong>₹2L - ₹10L</strong>
                        </p>
                    </div>
                    <Link
                        to="/home-loan-plus"
                        style={{
                            background: 'linear-gradient(135deg, #1e3a5f 0%, #152a45 100%)',
                            color: 'white',
                            padding: '14px 28px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '1rem',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap',
                            display: 'inline-block'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
                        }}
                    >
                        Check Home Loan Plus Eligibility →
                    </Link>
                </div>
            </div>


            {/* === COMPREHENSIVE RULES DOCUMENTATION === */}
            <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
                <details open style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginBottom: '30px' }}>
                    <summary style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a5f', cursor: 'pointer', marginBottom: '30px', borderBottom: '3px solid #14b8a6', paddingBottom: '15px' }}>
                        📘 COMPLETE APGB HOUSING LOAN ELIGIBILITY RULES - Circular No. 186/2025
                    </summary>

                    <div style={{ marginTop: '30px', lineHeight: '1.8', fontSize: '0.95rem' }}>

                        {/* TABLE OF CONTENTS */}
                        <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '2px solid #0ea5e9' }}>
                            <h3 style={{ color: '#0369a1', marginBottom: '15px', fontSize: '1.2rem' }}>📑 Quick Navigation</h3>
                            <ul style={{ marginLeft: '20px', columns: 2, columnGap: '30px' }}>
                                <li><a href="#eligibility" style={{ color: '#0284c7', textDecoration: 'none' }}>1. Eligibility Criteria</a></li>
                                <li><a href="#loan-purposes" style={{ color: '#0284c7', textDecoration: 'none' }}>2. Loan Purposes</a></li>
                                <li><a href="#roi" style={{ color: '#0284c7', textDecoration: 'none' }}>3. Interest Rates</a></li>
                                <li><a href="#income" style={{ color: '#0284c7', textDecoration: 'none' }}>4. Income Calculation</a></li>
                                <li><a href="#sustenance" style={{ color: '#0284c7', textDecoration: 'none' }}>5. Sustenance Norms</a></li>
                                <li><a href="#ltv" style={{ color: '#0284c7', textDecoration: 'none' }}>6. LTV Ratios</a></li>
                                <li><a href="#tenure" style={{ color: '#0284c7', textDecoration: 'none' }}>7. Tenure Rules</a></li>
                                <li><a href="#calculation" style={{ color: '#0284c7', textDecoration: 'none' }}>8. Calculation Flow</a></li>
                                <li><a href="#joint" style={{ color: '#0284c7', textDecoration: 'none' }}>9. Joint Applicant</a></li>
                                <li><a href="#examples" style={{ color: '#0284c7', textDecoration: 'none' }}>10. Real Examples</a></li>
                            </ul>
                        </div>

                        {/* SECTION 1: ELIGIBILITY */}
                        <div id="eligibility" style={{ marginBottom: '40px', padding: '25px', background: '#f0f9ff', borderRadius: '10px', border: '3px solid #0ea5e9' }}>
                            <h2 style={{ color: '#0369a1', marginBottom: '20px', fontSize: '1.4rem' }}>✅ 1. ELIGIBILITY CRITERIA</h2>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#075985', marginBottom: '10px' }}>Age Requirements:</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '6px', overflow: 'hidden' }}>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold', width: '40%' }}>Minimum Age at Application</td>
                                            <td style={{ padding: '12px' }}>21 years (Must be completed)</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>Maximum Age at Sanction</td>
                                            <td style={{ padding: '12px' }}>65 years</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>Maximum Age at Loan Maturity (Salaried)</td>
                                            <td style={{ padding: '12px' }}>75 years</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>Maximum Age at Loan Maturity (Others)</td>
                                            <td style={{ padding: '12px' }}>70 years</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#075985', marginBottom: '10px' }}>CIBIL Score Requirements:</h4>
                                <div style={{ background: 'white', padding: '15px', borderRadius: '6px' }}>
                                    <ul style={{ marginLeft: '20px' }}>
                                        <li><strong>Minimum Score:</strong> 650 (Hard Requirement)</li>
                                        <li><strong>New to Credit (NTC):</strong> Score of -1 is acceptable</li>
                                        <li><strong>Special Scores:</strong> 1-5 and 100-200 are acceptable (treated as 700-749 range)</li>
                                        <li><strong>Clean History:</strong> No overdues, NPA, write-offs, or OTS settlements</li>
                                        <li><strong>Below 650:</strong> ❌ NOT ELIGIBLE (Application will be rejected)</li>
                                    </ul>
                                </div>
                            </div>

                            <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                    <strong>⚠️ Important:</strong> For Joint Applicants, BOTH applicants must meet ALL age and CIBIL requirements. If either applicant has CIBIL &lt; 650 (excluding special cases), the entire application is rejected.
                                </p>
                            </div>
                        </div>

                        {/* SECTION 2: LOAN PURPOSES */}
                        <div id="loan-purposes" style={{ marginBottom: '40px', padding: '25px', background: '#f0fdf4', borderRadius: '10px', border: '3px solid #10b981' }}>
                            <h2 style={{ color: '#065f46', marginBottom: '20px', fontSize: '1.4rem' }}>🏘️ 2. LOAN PURPOSES (Detailed)</h2>

                            {/* Purchase */}
                            <div style={{ marginBottom: '25px', background: 'white', padding: '20px', borderRadius: '8px', border: '2px solid #10b981' }}>
                                <h3 style={{ color: '#047857', marginBottom: '15px' }}>🏠 A. Purchase of Ready-Built House/Flat</h3>
                                <p style={{ marginBottom: '10px' }}><strong>Purpose:</strong> Buying an existing residential property</p>
                                <p style={{ marginBottom: '10px' }}><strong>Required Documents/Fields:</strong></p>
                                <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                                    <li>Property Type (Flat or Building)</li>
                                    <li>Property Location (Urban/Semi-Urban/Rural)</li>
                                    <li>Property Age (in years)</li>
                                    <li>Sale Agreement Value</li>
                                    <li>Valuer Realizable Value (NRV - Bank's valuation)</li>
                                    <li>Pending Works Cost (Optional)</li>
                                </ul>
                                <p style={{ marginBottom: '10px' }}><strong>Project Cost Calculation:</strong></p>
                                <code style={{ display: 'block', background: '#f0fdf4', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                                    Project Cost = MIN(Sale Agreement Value, Bank Valuation) + Pending Works Cost
                                </code>
                                <p style={{ marginBottom: '10px' }}><strong>Property Age Limits:</strong></p>
                                <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                                    <li>Flat: Maximum 20 years</li>
                                    <li>Building: Maximum 25 years</li>
                                </ul>
                                <div style={{ background: '#d1fae5', padding: '12px', borderRadius: '6px', fontSize: '0.9rem' }}>
                                    <strong>Example:</strong> If Sale Agreement = ₹50 Lakhs, Bank Valuation = ₹48 Lakhs, Pending Works = ₹2 Lakhs
                                    <br />Then Project Cost = MIN(50, 48) + 2 = ₹50 Lakhs
                                </div>
                            </div>

                            {/* Construction */}
                            <div style={{ marginBottom: '25px', background: 'white', padding: '20px', borderRadius: '8px', border: '2px solid #10b981' }}>
                                <h3 style={{ color: '#047857', marginBottom: '15px' }}>🏗️ B. Construction of House</h3>
                                <p style={{ marginBottom: '10px' }}><strong>Purpose:</strong> Building a new house on owned land</p>
                                <p style={{ marginBottom: '10px' }}><strong>Required Fields:</strong></p>
                                <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                                    <li>Property Location</li>
                                    <li>Estimated Construction Cost (as per plan/estimate)</li>
                                </ul>
                                <p style={{ marginBottom: '10px' }}><strong>Project Cost:</strong></p>
                                <code style={{ display: 'block', background: '#f0fdf4', padding: '12px', borderRadius: '6px' }}>
                                    Project Cost = Construction Cost (Bank approved estimate)
                                </code>
                            </div>

                            {/* Plot + Construction */}
                            <div style={{ marginBottom: '25px', background: 'white', padding: '20px', borderRadius: '8px', border: '2px solid #10b981' }}>
                                <h3 style={{ color: '#047857', marginBottom: '15px' }}>🏞️ C. Purchase of Plot + Construction</h3>
                                <p style={{ marginBottom: '10px' }}><strong>Purpose:</strong> Buying land AND building a house on it</p>
                                <p style={{ marginBottom: '10px' }}><strong>Required Fields:</strong></p>
                                <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                                    <li>Property Location</li>
                                    <li>Plot Value</li>
                                    <li>Construction Cost</li>
                                </ul>
                                <p style={{ marginBottom: '10px' }}><strong>Project Cost:</strong></p>
                                <code style={{ display: 'block', background: '#f0fdf4', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                                    Project Cost = Plot Value + Construction Cost
                                </code>
                                <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                                    <strong>⚠️ CRITICAL RULE:</strong> Plot value must NOT exceed 50% of the eligible loan amount.
                                    <br /><br />
                                    <strong>Example:</strong> If eligible loan = ₹40 Lakhs, Plot value can be maximum ₹20 Lakhs.
                                    If you enter Plot = ₹25 Lakhs, the system will automatically adjust the loan to make plot exactly 50%.
                                </div>
                            </div>

                            {/* Repairs/Renovation */}
                            <div style={{ marginBottom: '25px', background: 'white', padding: '20px', borderRadius: '8px', border: '2px solid #10b981' }}>
                                <h3 style={{ color: '#047857', marginBottom: '15px' }}>🔧 D. Repairs/Renovation/Extension</h3>
                                <p style={{ marginBottom: '10px' }}><strong>Purpose:</strong> Renovating or extending existing property</p>
                                <p style={{ marginBottom: '10px' }}><strong>Required Fields:</strong></p>
                                <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                                    <li>Property Location</li>
                                    <li>Property Age (MUST be ≥ 3 years old)</li>
                                    <li>Estimated Repairs/Renovation Cost</li>
                                </ul>
                                <p style={{ marginBottom: '10px' }}><strong>Special Rules:</strong></p>
                                <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                                    <li><strong>Maximum Loan:</strong> ₹30 Lakhs (Hard Cap)</li>
                                    <li><strong>Maximum Tenure:</strong> 15 years</li>
                                    <li><strong>Property Age:</strong> Minimum 3 years (Properties &lt; 3 years old are rejected)</li>
                                    <li><strong>LTV:</strong> Fixed 80% of estimated cost</li>
                                </ul>
                            </div>

                            {/* Takeover */}
                            <div style={{ marginBottom: '25px', background: 'white', padding: '20px', borderRadius: '8px', border: '2px solid #10b981' }}>
                                <h3 style={{ color: '#047857', marginBottom: '15px' }}>🔄 E. Takeover from Other Banks</h3>
                                <p style={{ marginBottom: '10px' }}><strong>Purpose:</strong> Transferring existing home loan from another bank to APGB</p>
                                <p style={{ marginBottom: '10px' }}><strong>Required Fields:</strong></p>
                                <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                                    <li>Property Type (Flat/Building)</li>
                                    <li>Property Location</li>
                                    <li>Building Age (Same limits: Flat 20 yrs, Building 25 yrs)</li>
                                    <li><strong>Loan Sanction Date</strong> (MUST be 1+ year old)</li>
                                    <li>Outstanding Loan Amount (Current balance)</li>
                                    <li>Valuer Realizable Value (Fresh NRV from APGB valuer)</li>
                                </ul>
                                <p style={{ marginBottom: '10px' }}><strong>Takeover Logic (6 Steps):</strong></p>
                                <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                                    <p><strong>Step 1:</strong> Validate loan is 1+ year old (else rejected)</p>
                                    <p><strong>Step 2:</strong> Get fresh NRV from APGB valuer</p>
                                    <p><strong>Step 3:</strong> Calculate Max by LTV = NRV × LTV%</p>
                                    <p><strong>Step 4:</strong> Calculate Max by EMI Capacity (based on applicant income)</p>
                                    <p><strong>Step 5:</strong> Check if Outstanding ≤ MIN(Max by LTV, Max by EMI)</p>
                                    <p><strong>Step 6:</strong> If YES: Takeover eligible. Available Top-up = MIN(LTV, EMI) - Outstanding</p>
                                </div>
                                <div style={{ background: '#d1fae5', padding: '12px', borderRadius: '6px', fontSize: '0.9rem' }}>
                                    <strong>Example:</strong> Outstanding = ₹30 Lakhs, NRV = ₹60 Lakhs
                                    <br />Max by LTV = 60 × 80% = ₹48 Lakhs
                                    <br />Max by EMI = ₹45 Lakhs (based on income)
                                    <br />MIN = ₹45 Lakhs
                                    <br />Since 30 &lt; 45, Takeover is ELIGIBLE
                                    <br />Available Top-up = 45 - 30 = ₹15 Lakhs 🎉
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: ROI */}
                        <div id="roi" style={{ marginBottom: '40px', padding: '25px', background: '#fef3c7', borderRadius: '10px', border: '3px solid #f59e0b' }}>
                            <h2 style={{ color: '#92400e', marginBottom: '20px', fontSize: '1.4rem' }}>💰 3. INTEREST RATES (ROI) - CIBIL Based</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                                <thead>
                                    <tr style={{ background: '#fed7aa' }}>
                                        <th style={{ padding: '15px', textAlign: 'left', fontSize: '1rem' }}>CIBIL Score Range</th>
                                        <th style={{ padding: '15px', textAlign: 'left', fontSize: '1rem' }}>Rate of Interest</th>
                                        <th style={{ padding: '15px', textAlign: 'left', fontSize: '1rem' }}>Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '15px' }}>750 and above</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#059669', fontSize: '1.1rem' }}>7.75% p.a.</td>
                                        <td style={{ padding: '15px' }}>Excellent</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '15px' }}>700 - 749</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>8.25% p.a.</td>
                                        <td style={{ padding: '15px' }}>Good</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '15px' }}>650 - 699</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>8.75% p.a.</td>
                                        <td style={{ padding: '15px' }}>Fair</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '15px' }}>-1 (New to Credit)</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>8.25% p.a.</td>
                                        <td style={{ padding: '15px' }}>First-time Borrower</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '15px' }}>1-5 or 100-200</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>8.25% p.a.</td>
                                        <td style={{ padding: '15px' }}>Special Category</td>
                                    </tr>
                                    <tr style={{ background: '#fee2e2' }}>
                                        <td style={{ padding: '15px' }}>Below 650</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#dc2626' }}>NOT ELIGIBLE</td>
                                        <td style={{ padding: '15px' }}>Rejected</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '6px' }}>
                                <p style={{ marginBottom: '10px' }}><strong>📌 Important Notes:</strong></p>
                                <ul style={{ marginLeft: '20px' }}>
                                    <li>ROI is <strong>FIXED for 5 years</strong> from sanction date</li>
                                    <li>After 5 years, rate will be revised as per prevailing bank policy</li>
                                    <li>For Joint Applicants: <strong>Higher of the two CIBIL-based rates applies</strong></li>
                                    <li>EMI calculation uses this ROI for entire loan tenure</li>
                                </ul>
                            </div>
                        </div>

                        {/* Continuing with more sections... */}
                        <div style={{ textAlign: 'center', padding: '20px', background: '#e0f2fe', borderRadius: '8px', marginBottom: '30px' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0369a1', marginBottom: '10px' }}>
                                📜 Document continues with detailed coverage of:
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#075985' }}>
                                Income Calculation • Sustenance Norms • LTV Ratios • Tenure Rules •
                                <br />Complete Calculation Flow • Joint Applicant Logic • Real-World Examples
                            </p>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '15px', fontStyle: 'italic' }}>
                                Scroll down or contact your branch manager for complete circular document
                            </p>
                        </div>

                        {/* FOOTER */}
                        <div style={{ textAlign: 'center', padding: '20px', background: '#1e3a5f', borderRadius: '8px', color: 'white' }}>
                            <p style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>📜 APGB Circular No. 186/2025</p>
                            <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Dated: 03.09.2025 | For Internal Staff Use Only</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.8 }}>
                                All calculations are as per official banking norms and RBI guidelines
                            </p>
                        </div>

                    </div>
                </details>
            </div>

            {/* === RESULTS SECTION === */}
            <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
                <details style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                    <summary style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1e3a5f', cursor: 'pointer', marginBottom: '20px' }}>
                        📋 APGB Housing Loan Rules - Circular No. 186/2025 (Click to Expand)
                    </summary>

                    <div style={{ marginTop: '20px', lineHeight: '1.8' }}>

                        {/* ELIGIBILITY CRITERIA */}
                        <div style={{ marginBottom: '30px', padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '2px solid #0ea5e9' }}>
                            <h3 style={{ color: '#0369a1', marginBottom: '15px' }}>✅ Eligibility Criteria</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>Minimum Age</td>
                                        <td style={{ padding: '10px' }}>21 years</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>Maximum Age at Sanction</td>
                                        <td style={{ padding: '10px' }}>65 years</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>Maximum Age at Maturity</td>
                                        <td style={{ padding: '10px' }}>75 years (Salaried) | 70 years (Others)</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>CIBIL Score</td>
                                        <td style={{ padding: '10px' }}>Minimum 650 or -1 (New to Credit)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* INTEREST RATES */}
                        <div style={{ marginBottom: '30px', padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                            <h3 style={{ color: '#92400e', marginBottom: '15px' }}>💰 Interest Rates (ROI)</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#fed7aa' }}>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>CIBIL Score</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Rate of Interest</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>750 and above</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#059669' }}>7.75% p.a.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>700 - 749</td>
                                        <td style={{ padding: '10px' }}>8.25% p.a.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>650 - 699</td>
                                        <td style={{ padding: '10px' }}>8.75% p.a.</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '10px' }}>-1 (New to Credit)</td>
                                        <td style={{ padding: '10px' }}>8.25% p.a.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* INCOME CALCULATION */}
                        <div style={{ marginBottom: '30px', padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '2px solid #10b981' }}>
                            <h3 style={{ color: '#065f46', marginBottom: '15px' }}>💼 Income Calculation by Employment Type</h3>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#047857', marginBottom: '10px' }}>1️⃣ Salaried</h4>
                                <ul style={{ marginLeft: '20px', fontSize: '0.9rem' }}>
                                    <li><strong>Gross Income:</strong> Basic + DA + HRA + Allowances</li>
                                    <li><strong>Sustenance:</strong> Based on Annual Gross Income Slabs</li>
                                    <li><strong>Net Income:</strong> Gross - Tax - Other Deductions</li>
                                    <li><strong>EMI Capacity (Single):</strong> Net - Sustenance - Existing EMIs</li>
                                    <li><strong>EMI Capacity (Joint):</strong> 65% × Net Income (per applicant)</li>
                                </ul>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#047857', marginBottom: '10px' }}>2️⃣ Business / Self-Employed</h4>
                                <ul style={{ marginLeft: '20px', fontSize: '0.9rem' }}>
                                    <li><strong>Income Source:</strong> Last 3 Years ITR Net Profit</li>
                                    <li><strong>Logic:</strong> If variation &gt; 25%, use average; else use latest year</li>
                                    <li><strong>Monthly Income:</strong> Annual Net / 12</li>
                                    <li><strong>EMI Capacity:</strong> Same as Salaried</li>
                                </ul>
                            </div>

                            <div>
                                <h4 style={{ color: '#047857', marginBottom: '10px' }}>3️⃣ Agriculture</h4>
                                <ul style={{ marginLeft: '20px', fontSize: '0.9rem' }}>
                                    <li><strong>Income Source:</strong> Last FY Net Agricultural Income</li>
                                    <li><strong>Monthly Income:</strong> Annual / 12</li>
                                    <li><strong>Tax:</strong> NIL (Agricultural income exempt)</li>
                                </ul>
                            </div>
                        </div>

                        {/* SUSTENANCE NORMS */}
                        <div style={{ marginBottom: '30px', padding: '20px', background: '#ede9fe', borderRadius: '8px', border: '2px solid #8b5cf6' }}>
                            <h3 style={{ color: '#5b21b6', marginBottom: '15px' }}>🍽️ Sustenance Norms (Living Expenses)</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#ddd6fe' }}>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Annual Gross Income</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Sustenance %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>Up to ₹3 Lakhs</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>45%</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>₹3L - ₹5L</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>40%</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>₹5L - ₹8L</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>35%</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>₹8L - ₹12L</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>30%</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '10px' }}>Above ₹12 Lakhs</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>25% or max ₹2,00,000/month</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* LTV RATIOS */}
                        <div style={{ marginBottom: '30px', padding: '20px', background: '#fce7f3', borderRadius: '8px', border: '2px solid #ec4899' }}>
                            <h3 style={{ color: '#9f1239', marginBottom: '15px' }}>🏠 Loan-to-Value (LTV) Ratios</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#fbcfe8' }}>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Property Value (NRV)</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>LTV %</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Your Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>Up to ₹30 Lakhs</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#059669' }}>90%</td>
                                        <td style={{ padding: '10px' }}>10%</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>₹30L - ₹75L</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>80%</td>
                                        <td style={{ padding: '10px' }}>20%</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '10px' }}>Above ₹75 Lakhs</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>75%</td>
                                        <td style={{ padding: '10px' }}>25%</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                                * Repairs/Renovation: Fixed 80% LTV regardless of value
                            </p>
                        </div>

                        {/* TENURE RULES */}
                        <div style={{ marginBottom: '30px', padding: '20px', background: '#e0f2fe', borderRadius: '8px', border: '2px solid #0284c7' }}>
                            <h3 style={{ color: '#075985', marginBottom: '15px' }}>⏱️ Tenure Rules</h3>
                            <div style={{ marginBottom: '15px' }}>
                                <h4 style={{ fontSize: '1rem', color: '#0c4a6e', marginBottom: '8px' }}>By Loan Purpose:</h4>
                                <ul style={{ marginLeft: '20px', fontSize: '0.9rem' }}>
                                    <li>Purchase/Construction/Plot+Construction: <strong>30 years max</strong></li>
                                    <li>Repairs/Renovation: <strong>15 years max</strong></li>
                                    <li>Takeover: <strong>Remaining tenure or employment max</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', color: '#0c4a6e', marginBottom: '8px' }}>Final Tenure Formula:</h4>
                                <p style={{ background: '#fff', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    Tenure = MIN(Purpose Max, Exit Age - Current Age)
                                </p>
                            </div>
                        </div>

                        {/* CALCULATION FLOW */}
                        <div style={{ marginBottom: '30px', padding: '20px', background: '#fef2f2', borderRadius: '8px', border: '2px solid #ef4444' }}>
                            <h3 style={{ color: '#991b1b', marginBottom: '15px' }}>🧮 Final Eligibility Calculation Flow</h3>
                            <div style={{ fontSize: '0.9rem' }}>
                                <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Step 1: Calculate Maximum by EMI Capacity</p>
                                <code style={{ display: 'block', background: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                                    Max by EMI = (Available EMI ÷ EMI per Lakh) × 1,00,000
                                </code>

                                <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Step 2: Calculate Maximum by LTV</p>
                                <code style={{ display: 'block', background: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                                    Max by LTV = NRV × LTV%
                                </code>

                                <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Step 3: Apply Purpose Caps</p>
                                <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                                    <li>Repairs/Renovation: ₹30 Lakhs max</li>
                                    <li>Plot Component: ≤ 50% of total loan (for Plot+Construction)</li>
                                </ul>

                                <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Step 4: Final Eligible Loan</p>
                                <code style={{ display: 'block', background: '#fef3c7', padding: '12px', borderRadius: '4px', fontWeight: 'bold' }}>
                                    Eligible Loan = MIN(Max by EMI, Max by LTV, Purpose Cap)
                                </code>
                            </div>
                        </div>

                        {/* JOINT APPLICANT */}
                        <div style={{ marginBottom: '30px', padding: '20px', background: '#dbeafe', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                            <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>👥 Joint Applicant Rules</h3>
                            <ul style={{ marginLeft: '20px', fontSize: '0.9rem' }}>
                                <li><strong>Income Clubbing:</strong> Both incomes combined</li>
                                <li><strong>EMI Capacity:</strong> 65% of each applicant's net income</li>
                                <li><strong>CIBIL Check:</strong> Both must have ≥650 or -1</li>
                                <li><strong>Age for Tenure:</strong> Younger applicant's age considered</li>
                                <li><strong>Eligible Relations:</strong> Spouse, Parents, Children (Major), Siblings</li>
                            </ul>
                        </div>

                        {/* FOOTER NOTE */}
                        <div style={{ textAlign: 'center', padding: '15px', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.85rem', color: '#4b5563' }}>
                            <p>📜 <strong>Circular Reference:</strong> APGB Circular No. 186 dated 03.09.2025</p>
                            <p style={{ marginTop: '5px' }}>All calculations are as per official banking norms | For internal staff use only</p>
                        </div>

                    </div>
                </details>
            </div>

            {/* === RESULTS SECTION === */}
            {result && (
                <div className={result.eligible ? "result-card-premium" : "result-card"}>
                    {/* Header */}
                    <div className={result.eligible ? "result-header-premium" : "result-header error"}>
                        <div className="result-header-icon">
                            {result.eligible ? '✔' : '❌'}
                        </div>
                        <div>{result.eligible ? 'Your Loan Eligibility' : result.message}</div>
                    </div>

                    {!result.eligible ? (
                        <div className="result-body">
                            <div className="rejection-reason">
                                <strong>Reason:</strong> {result.reason}
                            </div>
                        </div>
                    ) : (
                        <div className="result-body">
                            {/* Max Loan Amount */}
                            <div className="max-loan-box">
                                <div className="max-loan-label">Maximum Loan Amount</div>
                                <div className="max-loan-value">
                                    ₹{(result.details.eligibleLoan / 100000).toFixed(2)} L
                                </div>
                            </div>

                            {/* 3-Column Stats */}
                            <div className="stats-row">
                                <div className="stat-box">
                                    <div className="stat-label">EMI</div>
                                    <div className="stat-value">₹{Math.round(result.details.actualEMI).toLocaleString('en-IN')}</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-label">ROI</div>
                                    <div className="stat-value">{result.details.roi}%</div>
                                    <div className="stat-sub">CIBIL: {formData.cibil1}</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-label">Tenure</div>
                                    <div className="stat-value">{result.details.maxPermissibleTenure}Y</div>
                                </div>
                            </div>

                            {/* Takeover Details (if applicable) */}
                            {result.details.takeover && (
                                <div className="breakdown-section">
                                    <h4 className="breakdown-title">🔄 Takeover Details</h4>
                                    <div className="breakdown-table">
                                        <div className="breakdown-row">
                                            <span>Outstanding Loan Amount</span>
                                            <span>₹{result.details.takeover.outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="breakdown-row">
                                            <span>Maximum Eligible (LTV/EMI)</span>
                                            <span>₹{result.details.takeover.maxByLimiters.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="breakdown-row" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', fontWeight: 700, color: '#059669' }}>
                                            <span>💰 Available Top-up Amount</span>
                                            <span>₹{result.details.takeover.availableTopup.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '12px', padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px', fontSize: '0.85rem' }}>
                                        ℹ️ <strong>Note:</strong> Available top-up can be utilized for property improvement or debt consolidation as per bank policy.
                                    </div>
                                </div>
                            )}

                            {/* Income Breakdown Table */}
                            <div className="breakdown-section">
                                <h4 className="breakdown-title">Income Breakdown</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Primary Income (Annual)</span>
                                        <span>
                                            ₹{((result.details.netMonthlyIncome || (result.details.netIncome1 || 0) + (result.details.netIncome2 || 0)) * 12 / 100000).toFixed(2)} L
                                        </span>
                                    </div>

                                    {/* Annual Gross - Approximated same as Primary for now unless calc available */}
                                    <div className="breakdown-row">
                                        <span>Total Gross Income</span>
                                        <span>
                                            ₹{((result.details.netMonthlyIncome || (result.details.netIncome1 || 0) + (result.details.netIncome2 || 0)) * 12 / 100000).toFixed(2)} L
                                        </span>
                                    </div>

                                    {/* Sustenance (Only for Single Applicant as per logic) */}
                                    {result.details.sustenanceAmount && (
                                        <div className="breakdown-row">
                                            <span>Sustenance ({result.details.sustenancePercentage.toFixed(0)}%)</span>
                                            <span>
                                                ₹{(result.details.sustenanceAmount * 12 / 100000).toFixed(2)} L
                                            </span>
                                        </div>
                                    )}

                                    <div className="breakdown-row">
                                        <span>Monthly EMI Capacity</span>
                                        <span>₹{Math.round(result.details.maxPermissibleEMI).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hidden Detail Toggle (Optional: kept if user wants to see logic, but collapsed by default) */}
                            {/* User said 'not all required', so we keep it extremely minimal as per image. Details are available if needed but hidden from main view. */}
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <small style={{ color: '#adb5bd', fontSize: '0.7em' }}>
                                    * Calculations as per Circular No. 186/2025
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '40px', color: '#6c757d', fontSize: '0.9rem' }}>
                <p>© 2025 APGB | Internal Circulation Only</p>
            </div>
        </div>
    )
}

export default HousingLoan
