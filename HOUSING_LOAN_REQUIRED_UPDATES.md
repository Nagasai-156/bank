# 🚨 HOUSING LOAN CALCULATOR - REQUIRED UPDATES (CIRCULAR NO. 186)

## ✅ CURRENT STATUS
- ✅ Employment-specific fields working (Salaried/Business/Agriculture)
- ✅ Single/Joint applicant logic working
- ✅ CIBIL gates implemented (≥650, Clean Status)
- ✅ Age/Exit age validation working
- ✅ Guarantor flags implemented
- ✅ 65% EMI rule for joint applicants working

## ❌ CRITICAL ISSUES TO FIX

### 1. Loan Purpose Options (Line ~909-915)
**Current:** 6 options (Repairs and Renovation separate)
```jsx
<option value="Repairs">Repairs (Max ₹30L, 15 yrs)</option>
<option value="Renovation">Renovation (Max ₹30L, 15 yrs)</option>
```

**Required:** 5 options only
```jsx
<option value="Purchase">Purchase</option>
<option value="Construction">Construction</option>
<option value="Plot+Construction">Plot + Construction</option>
<option value="Repairs/Renovation">Repairs / Renovation (Max ₹30L, 15 yrs)</option>
<option value="Takeover">Takeover</option>
```

### 2. Form Data State (Line ~6-59)
**Add These Fields:**
```jsx
// Construction Specific
constructionCost: '',

// Plot + Construction Specific
plotValue: '',

// Repairs/Renovation Specific
repairsRenovationCost: '',

// Takeover Specific
outstandingLoanAmount: ''
```

**Remove:**
```jsx
branchEstimate: '',  // ❌ DELETE THIS
```

### 3. Property Details Section (Line ~919-1040)
**Current:** Shows ALL fields regardless of purpose

**Required:** Conditional rendering by purpose

```jsx
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
    <select name="loanPurpose" value={formData.loanPurpose} onChange={handleChange} className="form-select" required>
      <option value="Purchase">Purchase</option>
      <option value="Construction">Construction</option>
      <option value="Plot+Construction">Plot + Construction</option>
      <option value="Repairs/Renovation">Repairs / Renovation</option>
      <option value="Takeover">Takeover</option>
    </select>
  </div>
</div>

{/* Property Details - PURPOSE-SPECIFIC */}
<div className="section-header">
  <h3>🏘️ Property Details</h3>
</div>
<div className="form-grid">
  
  {/* A) PURCHASE */}
  {formData.loanPurpose === 'Purchase' && (
    <>
      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">🏢</span>
          Property Type
        </label>
        <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="form-select" required>
          <option value="Flat">Residential Flat</option>
          <option value="Building">Residential Building</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">📍</span>
          Property Location
        </label>
        <select name="propertyLocation" value={formData.propertyLocation} onChange={handleChange} className="form-select" required>
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
        <input type="number" name="propertyAge" value={formData.propertyAge} onChange={handleChange} className="form-input" placeholder="Current age" min="0" required />
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">📄</span>
          Sale Agreement Value (₹)
        </label>
        <input type="number" name="saleAgreementValue" value={formData.saleAgreementValue} onChange={handleChange} className="form-input" placeholder="As per agreement" min="0" required />
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">💎</span>
          Valuer Realizable Value (₹)
        </label>
        <input type="number" name="realizableValue" value={formData.realizableValue} onChange={handleChange} className="form-input" placeholder="Valuer estimate" min="0" required />
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">🔨</span>
          Pending Works Cost (₹)
        </label>
        <input type="number" name="pendingWorks" value={formData.pendingWorks} onChange={handleChange} className="form-input" placeholder="If any" min="0" />
      </div>
    </>
  )}

  {/* B) CONSTRUCTION */}
  {formData.loanPurpose === 'Construction' && (
    <>
      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">📍</span>
          Property Location
        </label>
        <select name="propertyLocation" value={formData.propertyLocation} onChange={handleChange} className="form-select" required>
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
        <input type="number" name="constructionCost" value={formData.constructionCost} onChange={handleChange} className="form-input" placeholder="Engineer estimate" min="0" required />
      </div>
    </>
  )}

  {/* C) PLOT + CONSTRUCTION */}
  {formData.loanPurpose === 'Plot+Construction' && (
    <>
      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">📍</span>
          Property Location
        </label>
        <select name="propertyLocation" value={formData.propertyLocation} onChange={handleChange} className="form-select" required>
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
        <input type="number" name="plotValue" value={formData.plotValue} onChange={handleChange} className="form-input" placeholder="Plot purchase value" min="0" required />
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">🏗️</span>
          Estimated Construction Cost (₹)
        </label>
        <input type="number" name="constructionCost" value={formData.constructionCost} onChange={handleChange} className="form-input" placeholder="Construction estimate" min="0" required />
      </div>
    </>
  )}

  {/* D) REPAIRS/RENOVATION */}
  {formData.loanPurpose === 'Repairs/Renovation' && (
    <>
      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">📍</span>
          Property Location
        </label>
        <select name="propertyLocation" value={formData.propertyLocation} onChange={handleChange} className="form-select" required>
          <option value="Urban">Urban</option>
          <option value="Semi-urban">Semi-urban</option>
          <option value="Rural">Rural</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">🔧</span>
          Estimated Repairs / Renovation Cost (₹)
        </label>
        <input type="number" name="repairsRenovationCost" value={formData.repairsRenovationCost} onChange={handleChange} className="form-input" placeholder="Repair cost estimate" min="0" required />
      </div>
    </>
  )}

  {/* E) TAKEOVER */}
  {formData.loanPurpose === 'Takeover' && (
    <>
      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">🏢</span>
          Property Type
        </label>
        <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="form-select" required>
          <option value="Flat">Residential Flat</option>
          <option value="Building">Residential Building</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">📍</span>
          Property Location
        </label>
        <select name="propertyLocation" value={formData.propertyLocation} onChange={handleChange} className="form-select" required>
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
        <input type="number" name="propertyAge" value={formData.propertyAge} onChange={handleChange} className="form-input" placeholder="Current age" min="0" required />
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">📊</span>
          Outstanding Loan Amount (₹)
        </label>
        <input type="number" name="outstandingLoanAmount" value={formData.outstandingLoanAmount} onChange={handleChange} className="form-input" placeholder="Current outstanding" min="0" required />
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-icon">💎</span>
          Valuer Realizable Value (₹)
        </label>
        <input type="number" name="realizableValue" value={formData.realizableValue} onChange={handleChange} className="form-input" placeholder="Valuer estimate" min="0" required />
      </div>
    </>
  )}
</div>
```

### 4. Calculate Function - Project Cost Logic (Line ~195-220)
**Update to purpose-specific:**
```javascript
// Calculate Project Cost based on purpose
let projectCost = 0

if (loanPurpose === 'Purchase') {
  const saleValue = Number(formData.saleAgreementValue) || 0
  const realizableValue = Number(formData.realizableValue) || 0
  const pendingWorks = Number(formData.pendingWorks) || 0
  projectCost = Math.min(saleValue, realizableValue) + pendingWorks
} else if (loanPurpose === 'Construction') {
  projectCost = Number(formData.constructionCost) || 0
} else if (loanPurpose === 'Plot+Construction') {
  const plotValue = Number(formData.plotValue) || 0
  const constructionCost = Number(formData.constructionCost) || 0
  projectCost = plotValue + constructionCost
  
  // Hard rule: Plot ≤ 50% check happens later in eligibility calculation
} else if (loanPurpose === 'Repairs/Renovation') {
  projectCost = Number(formData.repairsRenovationCost) || 0
} else if (loanPurpose === 'Takeover') {
  projectCost = Number(formData.realizableValue) || 0
}
```

### 5. Purpose-Specific Validation Logic
```javascript
// Purpose-specific cap
let purposeCap = Infinity
let maxTenureByPurpose = 30

if (loanPurpose === 'Repairs/Renovation') {
  purposeCap = 3000000 // ₹30 Lakhs
  maxTenureByPurpose = 15
  
  // Property must be ≥ 3 years old
  const propertyAge = Number(formData.propertyAge) || 0
  if (propertyAge < 3) {
    setResult({
      eligible: false,
      message: "NOT ELIGIBLE - Property Too New",
      reason: "For repairs/renovation, property must be at least 3 years old."
    })
    return
  }
}

// Plot + Construction: Plot ≤ 50% rule
if (loanPurpose === 'Plot+Construction') {
  const plotValue = Number(formData.plotValue) || 0
  const plotPercentage = (plotValue / eligibleLoan) * 100
  
  if (plotPercentage > 50) {
    // Reduce loan or fail validation
  }
}

// Takeover: Different calculation
if (loanPurpose === 'Takeover') {
  const outstandingAmount = Number(formData.outstandingLoanAmount) || 0
  const ltvBasedTakeover = projectCost * ltvRate
  
  // Final loan = MIN(Outstanding, LTV-based)
  eligibleLoan = Math.min(outstandingAmount, ltvBasedTakeover, loanAsPerEMI)
}
```

## 📋 TESTING CHECKLIST

After implementation, test each purpose:

- [ ] Purchase: Shows Property Type, Location, Age, Sale Agreement, Realizable, Pending Works
- [ ] Construction: Shows ONLY Location, Construction Cost
- [ ] Plot+Construction: Shows ONLY Location, Plot Value, Construction Cost  
- [ ] Repairs/Renovation: Shows ONLY Location, Repairs/Renovation Cost
- [ ] Takeover: Shows Property Type, Location, Age, Outstanding Loan, Realizable Value
- [ ] Branch Estimate field REMOVED from all purposes
- [ ] Repairs and Renovation are ONE merged option

## ✅ EXPECTED OUTCOME

100% circular-aligned property details section with:
- ✅ 5 loan purposes
- ✅ Purpose-specific fields only
- ✅ No extra fields
- ✅ No missing fields
- ✅ Correct calculation logic per purpose
- ✅ CPC-grade accuracy

---

**Priority**: CRITICAL - Must be fixed before deployment
**Circular**: No. 186 dated 03.09.2025 - APGB Home Loans
**Status**: Documented, ready for implementation
