import { useState } from 'react'
import { Link } from 'react-router-dom'
import './VehicleLoan.css'

function VehicleLoan() {
    const [formData, setFormData] = useState({
        age: '',
        confirmed: 'YES',
        service: '',
        cadre: 'Workmen',
        gross: '',
        nth: '',
        housing: 'NO',
        cost: '',
        vehType: '4W',
        condition: 'NEW',
        existingLoanClosed: 'YES',
        liabilitiesRegular: 'YES',
        acrFiled: 'YES',
        vehicleAge: ''
    })

    const [result, setResult] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const calculate = (e) => {
        e.preventDefault()

        const age = Number(formData.age)
        const confirmed = formData.confirmed
        const service = Number(formData.service)
        const cadre = formData.cadre
        const gross = Number(formData.gross)
        const nth = Number(formData.nth)
        const housing = formData.housing
        const cost = Number(formData.cost)
        const vehType = formData.vehType
        const condition = formData.condition
        const existingLoanClosed = formData.existingLoanClosed
        const liabilitiesRegular = formData.liabilitiesRegular
        const acrFiled = formData.acrFiled
        const vehicleAge = Number(formData.vehicleAge) || 0

        // STEP 1: ELIGIBILITY CHECKS
        if (confirmed !== "YES") {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Must be a Confirmed Employee",
                reason: "Only confirmed employees are eligible for vehicle loans as per Circular No. 347-2022-BC-STF."
            })
            return
        }

        if (service < 2) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Insufficient Years of Service",
                reason: `You need at least 2 years of service. Current service: ${service} year(s).`
            })
            return
        }

        if (age >= 60) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Age Limit Exceeded",
                reason: "Employees aged 60 years or above are not eligible for vehicle loans."
            })
            return
        }

        if (existingLoanClosed !== "YES") {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Existing Vehicle Loan Not Closed",
                reason: "You must close your existing vehicle loan before applying for a new one."
            })
            return
        }

        if (liabilitiesRegular !== "YES") {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Irregular Liabilities",
                reason: "All existing liabilities must be regular to be eligible for a new loan."
            })
            return
        }

        if (acrFiled !== "YES") {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - ACR/Assets Not Filed",
                reason: "Annual Confidential Report (ACR) and Asset declaration must be submitted."
            })
            return
        }

        // STEP 2: NTH CHECK
        const nthRequired = housing === "YES" ? gross * 0.30 : gross * 0.40

        if (nth < nthRequired) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Net Take Home Insufficient",
                reason: `Your Net Take Home (₹${nth.toLocaleString('en-IN')}) is below the required amount of ₹${nthRequired.toLocaleString('en-IN', { maximumFractionDigits: 0 })}. ${housing === "YES" ? "With housing loan, NTH must be ≥ 30% of gross salary." : "NTH must be ≥ 40% of gross salary."}`
            })
            return
        }

        // STEP 3: VEHICLE TYPE RULES
        if (vehType === "2W") {
            if (condition === "USED") {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Used Two Wheelers Not Allowed",
                    reason: "As per circular, only NEW two-wheelers are eligible for loans. Used two-wheelers are not permitted."
                })
                return
            }
        }

        if (vehType === "4W" && condition === "USED") {
            if (vehicleAge > 5) {
                setResult({
                    eligible: false,
                    message: "NOT ELIGIBLE - Used Vehicle Too Old",
                    reason: `Used four-wheelers must be ≤ 5 years old. Current vehicle age: ${vehicleAge} years.`
                })
                return
            }
        }

        // STEP 4: CADRE-WISE MAX LOAN LIMIT
        let cadreMaxLoan = 0

        if (vehType === "4W") {
            if (cadre === "Workmen") {
                cadreMaxLoan = 800000
            } else if (["Scale1", "Scale2", "Scale3"].includes(cadre)) {
                cadreMaxLoan = 1200000
            } else {
                cadreMaxLoan = 1500000
            }
        } else {
            cadreMaxLoan = 200000
        }

        // STEP 5: % OF VEHICLE COST RULE
        const costPercentage = condition === "NEW" ? 0.95 : 0.80
        const eligibleByCost = cost * costPercentage

        // STEP 6: FINAL LOAN AMOUNT
        const finalLoan = Math.min(cadreMaxLoan, eligibleByCost)
        const marginAmount = cost - finalLoan

        // STEP 7: TENURE RULES
        let maxTenure = vehType === "4W" ? 200 : 84
        const monthsToRetirement = (60 - age) * 12
        const actualTenure = Math.min(maxTenure, monthsToRetirement)

        if (actualTenure <= 0) {
            setResult({
                eligible: false,
                message: "NOT ELIGIBLE - Insufficient Time to Retirement",
                reason: "Loan tenure cannot extend beyond age 60. You don't have sufficient time for loan repayment."
            })
            return
        }

        // STEP 8: EMI CALCULATION
        const roi = 0.07
        const totalInterest = finalLoan * roi * (actualTenure / 12)
        const totalPayable = finalLoan + totalInterest
        const emi = totalPayable / actualTenure

        // STEP 9: FINAL OUTPUT
        setResult({
            eligible: true,
            message: "✅ ELIGIBLE for Staff Vehicle Loan",
            details: {
                finalLoan: finalLoan,
                cadreMaxLoan: cadreMaxLoan,
                eligibleByCost: eligibleByCost,
                marginAmount: marginAmount,
                roi: "7% p.a (Simple Interest)",
                tenure: actualTenure,
                maxTenure: maxTenure,
                emi: emi,
                totalInterest: totalInterest,
                totalPayable: totalPayable,
                nthRequired: nthRequired,
                nthActual: nth,
                costPercentage: (costPercentage * 100) + "%"
            }
        })
    }

    return (
        <div className="vehicle-loan-container">
            <div className="page-header">
                <Link to="/" style={{ position: 'absolute', left: '24px', color: 'white', textDecoration: 'none' }}>
                    ← Back to Home
                </Link>
                <h1 className="header-title">
                    🚗 Staff Vehicle Loan Calculator
                </h1>
                <p className="header-subtitle">
                    Circular No. 347-2022-BC-STF | For Confirmed Employees
                </p>
            </div>

            <form className="loan-form" onSubmit={calculate}>
                {/* Employee Details */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">👤</span>
                        <h3 className="section-title">Employee Details</h3>
                    </div>

                    <div className="form-grid-3">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📅</span>
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
                                max="59"
                                required
                            />
                            <span className="helper-text">Age: 18-59 years</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">✓</span>
                                Confirmed Employee
                            </label>
                            <select
                                name="confirmed"
                                value={formData.confirmed}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🎯</span>
                                Years of Service
                            </label>
                            <input
                                type="number"
                                name="service"
                                value={formData.service}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Years in service"
                                min="0"
                                step="0.1"
                                required
                            />
                            <span className="helper-text">Minimum: 2 years</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">👔</span>
                                Cadre
                            </label>
                            <select
                                name="cadre"
                                value={formData.cadre}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="Workmen">Workmen</option>
                                <option value="Scale1">Officer Scale I</option>
                                <option value="Scale2">Officer Scale II</option>
                                <option value="Scale3">Officer Scale III</option>
                                <option value="Scale4">Officer Scale IV</option>
                                <option value="Scale5">Officer Scale V</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💰</span>
                                Gross Salary (₹)
                            </label>
                            <input
                                type="number"
                                name="gross"
                                value={formData.gross}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter gross salary"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💵</span>
                                Net Take Home (₹)
                            </label>
                            <input
                                type="number"
                                name="nth"
                                value={formData.nth}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter net take home"
                                min="0"
                                required
                            />
                            <span className="helper-text">After all deductions</span>
                        </div>
                    </div>
                </div>

                {/* Loan Status */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">📊</span>
                        <h3 className="section-title">Loan Status</h3>
                    </div>

                    <div className="form-grid-3">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🏠</span>
                                Housing Loan Availed?
                            </label>
                            <select
                                name="housing"
                                value={formData.housing}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="NO">NO</option>
                                <option value="YES">YES</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🚗</span>
                                Existing Vehicle Loan Closed?
                            </label>
                            <select
                                name="existingLoanClosed"
                                value={formData.existingLoanClosed}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">✓</span>
                                All Liabilities Regular?
                            </label>
                            <select
                                name="liabilitiesRegular"
                                value={formData.liabilitiesRegular}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📄</span>
                                ACR / Assets Filed?
                            </label>
                            <select
                                name="acrFiled"
                                value={formData.acrFiled}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Vehicle Details */}
                <div className="form-section">
                    <div className="section-header">
                        <span className="section-icon">🚗</span>
                        <h3 className="section-title">Vehicle Details</h3>
                    </div>

                    <div className="form-grid-3">
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🚙</span>
                                Vehicle Type
                            </label>
                            <select
                                name="vehType"
                                value={formData.vehType}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="4W">Four Wheeler</option>
                                <option value="2W">Two Wheeler</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">✨</span>
                                New / Used
                            </label>
                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="NEW">New</option>
                                <option value="USED">Used</option>
                            </select>
                        </div>

                        {formData.vehType === "4W" && formData.condition === "USED" && (
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">📅</span>
                                    Vehicle Age (years)
                                </label>
                                <input
                                    type="number"
                                    name="vehicleAge"
                                    value={formData.vehicleAge}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Age of used vehicle"
                                    min="0"
                                    max="5"
                                    required
                                />
                                <span className="helper-text">Max: 5 years</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">💵</span>
                                Vehicle Cost (₹)
                            </label>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter vehicle cost"
                                min="0"
                                required
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
                                <div className="max-loan-label">Final Loan Amount</div>
                                <div className="max-loan-value">
                                    ₹{(result.details.finalLoan / 100000).toFixed(2)} L
                                </div>
                            </div>

                            {/* Key Stats */}
                            <div className="stats-row">
                                <div className="stat-box">
                                    <div className="stat-label">Rate of Interest</div>
                                    <div className="stat-value">{result.details.roi}</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-label">Monthly EMI</div>
                                    <div className="stat-value">₹{Math.round(result.details.emi).toLocaleString('en-IN')}</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-label">Tenure</div>
                                    <div className="stat-value">{result.details.tenure} Months</div>
                                    <div className="stat-sub">{(result.details.tenure / 12).toFixed(1)} Years</div>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="breakdown-section">
                                <h4 className="breakdown-title">📊 Eligibility Breakdown</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Cadre Maximum Limit</span>
                                        <span>₹{(result.details.cadreMaxLoan / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Eligible by Cost ({result.details.costPercentage})</span>
                                        <span>₹{(result.details.eligibleByCost / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Margin Amount (Your Payment)</span>
                                        <span>₹{(result.details.marginAmount / 100000).toFixed(2)} L</span>
                                    </div>
                                </div>
                            </div>

                            <div className="breakdown-section">
                                <h4 className="breakdown-title">💰 Financial Details</h4>
                                <div className="breakdown-table">
                                    <div className="breakdown-row">
                                        <span>Total Interest</span>
                                        <span>₹{Math.round(result.details.totalInterest).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Total Payable Amount</span>
                                        <span>₹{Math.round(result.details.totalPayable).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>NTH Required / Actual</span>
                                        <span>₹{Math.round(result.details.nthRequired).toLocaleString('en-IN')} / ₹{result.details.nthActual.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Max Tenure / Actual</span>
                                        <span>{result.details.maxTenure} / {result.details.tenure} months</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <small style={{ color: '#adb5bd', fontSize: '0.7em' }}>
                                    * Calculations as per Circular No. 347-2022-BC-STF
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default VehicleLoan
