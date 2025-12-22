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
                reason: `Your Net Take Home (Ôé╣${nth.toLocaleString('en-IN')}) is below the required amount of Ôé╣${nthRequired.toLocaleString('en-IN', { maximumFractionDigits: 0 })}. ${housing === "YES" ? "With housing loan, NTH must be ÔëÑ 30% of gross salary." : "NTH must be ÔëÑ 40% of gross salary."}`
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
                    reason: `Used four-wheelers must be Ôëñ 5 years old. Current vehicle age: ${vehicleAge} years.`
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
            message: "Ô£à ELIGIBLE for Vehicle Loan",
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
        <div className="vehicle-loan-page">
            <div className="page-header">
                <Link to="/" className="back-button">ÔåÉ Back to Services</Link>
            </div>

            <div className="app">
                <div className="calculator-container">
                    <div className="header">
                        <div className="header-icon">­ƒÜù</div>
                        <h1 className="title">Staff Vehicle Loan Calculator</h1>
                        <p className="subtitle">Based on Circular No. 347-2022-BC-STF</p>
                    </div>

                    <form onSubmit={calculate}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">­ƒæñ</span>
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
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">Ô£ô</span>
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
                                    <span className="label-icon">­ƒôà</span>
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
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">­ƒÄ»</span>
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
                                    <span className="label-icon">­ƒÆ░</span>
                                    Gross Salary (Ôé╣)
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
                                    <span className="label-icon">­ƒÆÁ</span>
                                    Net Take Home (Ôé╣)
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
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">­ƒÅá</span>
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
                                    <span className="label-icon">­ƒöÆ</span>
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
                                    <span className="label-icon">­ƒôè</span>
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
                                    <span className="label-icon">­ƒôä</span>
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

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">­ƒÜÖ</span>
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
                                    <span className="label-icon">­ƒåò</span>
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
                                        <span className="label-icon">ÔÅ▒´©Å</span>
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
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">
                                    <span className="label-icon">­ƒÆ│</span>
                                    Vehicle Cost (Ôé╣)
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

                        <button type="submit" className="calculate-btn">
                            Calculate Eligibility
                        </button>
                    </form>

                    {result && (
                        <div className={`result-container ${result.eligible ? 'result-success' : 'result-error'}`}>
                            <div className="result-header">
                                <span className="result-icon">{result.eligible ? 'Ô£à' : 'ÔØî'}</span>
                                <span>{result.message}</span>
                            </div>

                            {!result.eligible ? (
                                <p className="result-message">{result.reason}</p>
                            ) : (
                                <div className="result-details">
                                    <div className="result-item">
                                        <span className="result-label">Final Loan Amount</span>
                                        <span className="result-value highlight">
                                            Ôé╣{result.details.finalLoan.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Cadre Maximum Limit</span>
                                        <span className="result-value">
                                            Ôé╣{result.details.cadreMaxLoan.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Eligible by Cost ({result.details.costPercentage})</span>
                                        <span className="result-value">
                                            Ôé╣{result.details.eligibleByCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Margin Amount (Your Payment)</span>
                                        <span className="result-value">
                                            Ôé╣{result.details.marginAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Rate of Interest</span>
                                        <span className="result-value">{result.details.roi}</span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Tenure (Actual / Maximum)</span>
                                        <span className="result-value">
                                            {result.details.tenure} / {result.details.maxTenure} months
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Monthly EMI</span>
                                        <span className="result-value highlight">
                                            Ôé╣{result.details.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / month
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Total Interest</span>
                                        <span className="result-value">
                                            Ôé╣{result.details.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">Total Payable Amount</span>
                                        <span className="result-value">
                                            Ôé╣{result.details.totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <span className="result-label">NTH Required / Actual</span>
                                        <span className="result-value">
                                            Ôé╣{result.details.nthRequired.toLocaleString('en-IN', { maximumFractionDigits: 0 })} /
                                            Ôé╣{result.details.nthActual.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="footer">
                        <p>┬® 2024 Staff Vehicle Loan Calculator | Based on Circular No. 347-2022-BC-STF</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            All calculations follow the official circular guidelines
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VehicleLoan
