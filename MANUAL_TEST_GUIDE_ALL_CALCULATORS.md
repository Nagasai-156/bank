# MORTGAGE LOAN & HOME LOAN PLUS - MANUAL TEST GUIDE

## 🎯 COMPLETE TEST EXECUTION GUIDE

This document contains **step-by-step manual testing instructions** for both calculators with **expected results**.

---

# PART 1: MORTGAGE LOAN ELIGIBILITY TESTS

## 🟢 TEST ML-01: FULLY ELIGIBLE (BEST CASE)

### Input Data:
```
APPLICANT DETAILS:
- Applicant Category: Salaried
- Resident Type: Resident
- DOB: 15-06-1985 (Age 39)
- CIBIL Score: 780
- Facility Type: Term Loan (TL)

PROPERTY DETAILS:
- Property Type: Residential
- Property Ownership: Applicant
- Property Location: Urban
- Net Realizable Value: 10000000 (₹1 Crore)
- Property Age: 10
- Residual Life: 30

LOAN PURPOSE:
- Purpose: House renovation
- Requested Amount: 5500000 (₹55 Lakhs)

INCOME DETAILS:
- Gross Monthly Salary: 150000
- Annual Tax Paid: 300000

OBLIGATIONS:
- Existing EMIs: 20000
- Other Obligations: 5000
```

### ✅ Expected Result:
```
STATUS: ✅ ELIGIBLE FOR MORTGAGE LOAN

Key Metrics:
- Eligible Loan Amount: ₹55.00 L (Full requested amount)
- ROI: 11.00% (CIBIL 780 ≥ 750)
- Monthly EMI: ~₹64,000 (for 15 years)
- Tenure: 15 Years (or lower based on constraints)

LTV Analysis:
- Property NRV: ₹100.00 L
- LTV Rate (Term Loan): 60%
- Maximum by LTV: ₹60.00 L
- ✅ Requested ₹55L < ₹60L LTV limit

Income & EMI Analysis:
- Gross Annual: ₹18,00,000
- Less Tax: ₹3,00,000
- Net Annual: ₹15,00,000
- Net Monthly: ₹1,25,000
- Sustenance (25%): ₹31,250
- Less Existing EMI: ₹20,000
- Less Other: ₹5,000
- Available EMI: ₹68,750
- ✅ Sufficient capacity for ₹55L loan

Restricting Factor: Requested Amount
```

### 📸 What to Verify:
- [✓] Green success banner
- [✓] Eligible amount = ₹55.00 L
- [✓] ROI shows 11.00%
- [✓] Tenure shows 15 Years or lower
- [✓] Detailed breakdowns visible

---

## 🔴 TEST ML-02: AGRICULTURIST (AUTO REJECT)

### Input Data:
```
APPLICANT DETAILS:
- Applicant Category: Agriculturist ⚠️
- DOB: 01-01-1980
- CIBIL: 750
(other fields can be any valid values)
```

### ❌ Expected Result:
```
STATUS: ❌ NOT ELIGIBLE - Agriculturists Not Permitted

Reason: 
Mortgage Loan is not available for agriculturists as per Circular 178.
```

### 📸 What to Verify:
- [✓] Red rejection banner
- [✓] Clear message about agriculturists
- [✓] References Circular 178

---

## 🔴 TEST ML-03: LOW CIBIL SCORE

### Input Data:
```
APPLICANT DETAILS:
- Applicant Category: Salaried
- CIBIL Score: 620 ⚠️
(other fields valid)
```

### ❌ Expected Result:
```
STATUS: ❌ NOT ELIGIBLE - CIBIL Below Minimum

Reason:
CIBIL score (620) must be at least 650 as per Circular 178.
```

### 📸 What to Verify:
- [✓] Red rejection banner
- [✓] Shows actual CIBIL entered (620)
- [✓] States minimum requirement (650)

---

## 🟠 TEST ML-04: LTV RESTRICTION (TERM LOAN)

### Input Data:
```
PROPERTY DETAILS:
- NRV: 8000000 (₹80 Lakhs)
- Facility Type: Term Loan

LOAN REQUEST:
- Requested Amount: 6000000 (₹60 Lakhs) ⚠️

(All other fields valid, high income)
```

### Calculation:
```
LTV for Term Loan = 60%
Max LTV = 80L × 60% = ₹48 Lakhs
Requested = ₹60 Lakhs
→ Exceeds LTV by ₹12 Lakhs
```

### ⚠️ Expected Result:
```
STATUS: ✅ ELIGIBLE (with restriction)

Eligible Loan Amount: ₹48.00 L
(NOT ₹60L as requested)

Restricting Factor: LTV Limit

Note in breakdown:
- Max by LTV: ₹48.00 L
- Requested: ₹60.00 L
- Final: ₹48.00 L (restricted)
```

### 📸 What to Verify:
- [✓] Shows ELIGIBLE status
- [✓] Amount is ₹48L (not ₹60L)
- [✓] "Restricting Factor" shows "LTV Limit"

---

## 🔴 TEST ML-05: RESIDUAL LIFE FAILURE

### Input Data:
```
PROPERTY DETAILS:
- Residual Life: 18 years ⚠️

(Implicit tenure would be ~15 years based on other constraints)
```

### Calculation:
```
Rule: Residual Life ≥ (Tenure + 5)
If tenure = 15 years
Required residual life = 15 + 5 = 20 years
Actual = 18 years
→ FAILS
```

### ❌ Expected Result:
```
STATUS: ❌ NOT ELIGIBLE - Property Life Insufficient

Reason:
Property residual life (18 years) must be at least 5 years more than loan tenure.
```

### 📸 What to Verify:
- [✓] Red rejection
- [✓] Mentions residual life
- [✓] States the rule clearly

---

## 🟠 TEST ML-06: AGE AT MATURITY RESTRICTION

### Input Data:
```
APPLICANT DETAILS:
- DOB: 01-01-1962 (Age 63) ⚠️

LOAN REQUEST:
- (System will calculate max tenure based on age)
```

### Calculation:
```
Current Age: 63
Max age at maturity: 70
Max tenure = 70 - 63 = 7 years
(Even if 15 years requested, system caps at 7)
```

### ⚠️ Expected Result:
```
STATUS: ✅ ELIGIBLE

Tenure: 7 Years
(NOT 15 years)

Explanation in breakdown:
- Age constraint limits tenure to reach age 70
- Final tenure = 7 years
```

### 📸 What to Verify:
- [✓] Shows ELIGIBLE
- [✓] Tenure shows 7 Years
- [✓] EMI calculated for 7 years

---

## 🔴 TEST ML-07: PURPOSE NOT ALLOWED

**NOTE**: Cannot test directly as dropdown only shows allowed purposes.

### Verification:
- [✓] Purpose dropdown shows ONLY:
  - Personal needs
  - Medical expenses
  - Higher education
  - House renovation
  - Travel / unforeseen expenses
  - Liquidity support

### ✅ This is CORRECT behavior
Business expansion should NOT be in the list, preventing invalid selection.

---

# PART 2: HOME LOAN PLUS ELIGIBILITY TESTS

## 🟢 TEST HLP-01: FULLY ELIGIBLE (URBAN)

### Input Data:
```
EXISTING HOME LOAN:
- Sanction Date: 2022-01-01 (3 years ago)
- Original Amount: 3000000
- Outstanding: 2200000 (₹22 Lakhs)
- Monthly EMI: 25000
- ROI: 8.25
- Original Tenure: 20
- Months Completed: 36 (3 years)
- EMI Overdue >30 days: NO

PROPERTY DETAILS:
- Location: Urban
- Property Type: Residential
- NRV: 5000000 (₹50 Lakhs)
- Building Age: 12
- Residual Life: 25

LOAN REQUEST:
- Purpose: Personal needs
- Requested Amount: 700000 (₹7 Lakhs)

APPLICANT:
- DOB: 1988-08-15 (Age 36)
- Employment: Salaried
- Gross Salary: 90000
- Tax Paid (annual): 60000 (₹5k/month × 12)
- Other Deductions: 3000
- CIBIL: 760
- Other EMIs: 5000
```

### ✅ Expected Result:
```
STATUS: ✅ ELIGIBLE FOR HOME LOAN PLUS

Key Metrics:
- Eligible Amount: ₹7.00 L
- ROI: 9.00% (8.25% + 0.75%)
- Monthly EMI: ~₹8,700 (approximate)

LTV Analysis:
- Total Housing Exposure: ₹22L + ₹7L = ₹29L
- LTV Slab: 90% (exposure ≤ ₹30L)
- Max Allowed: ₹50L × 90% = ₹45L
- ✅ ₹29L < ₹45L (within limit)

Co-terminus Tenure:
- Remaining HL Tenure: 17 years (20 - 3)
- HLP will finish with existing HL
```

### 📸 What to Verify:
- [✓] Green eligible banner
- [✓] Amount = ₹7.00 L
- [✓] ROI = 9.00% (base + 0.75%)
- [✓] Shows remaining tenure
- [✓] LTV breakdown shows 90% slab

---

## 🟠 TEST HLP-02: LTV RESTRICTION

### Input Data:
```
EXISTING HOME LOAN:
- Outstanding: 3000000 (₹30 Lakhs)

PROPERTY:
- NRV: 5000000 (₹50 Lakhs)

LOAN REQUEST:
- Requested: 1500000 (₹15 Lakhs) ⚠️
```

### Calculation:
```
Total Exposure = ₹30L + ₹15L = ₹45L
LTV Slab for ₹45L = 80%
Max Allowed = ₹50L × 80% = ₹40L
Possible HLP = ₹40L - ₹30L = ₹10L
```

### ⚠️ Expected Result:
```
STATUS: ✅ ELIGIBLE (restricted)

Eligible Amount: ₹10.00 L
(NOT ₹15L as requested)

Reason: LTV cap on total exposure
```

### 📸 What to Verify:
- [✓] Shows ₹10L (not ₹15L)
- [✓] LTV breakdown shows restriction

---

## 🔴 TEST HLP-03: EMI OVERDUE

### Input Data:
```
EXISTING HOME LOAN:
- EMI Overdue >30 days: YES ⚠️
```

### ❌ Expected Result:
```
STATUS: ❌ NOT ELIGIBLE - EMI Overdue > 30 Days

Reason:
Existing home loan has EMI overdue exceeding 30 days. Clean repayment track record required.
```

### 📸 What to Verify:
- [✓] Red rejection
- [✓] Mentions overdue requirement

---

## 🔴 TEST HLP-04: LESS THAN 12 MONTHS OLD

### Input Data:
```
EXISTING HOME LOAN:
- Sanction Date: 2024-06-01 (6 months ago)
- Months Completed: 6 ⚠️
```

### ❌ Expected Result:
```
STATUS: ❌ NOT ELIGIBLE

Reason:
Existing home loan must have completed at least 12 months from sanction date.
```

### 📸 What to Verify:
- [✓] Red rejection
- [✓] States 12-month requirement

---

## 🟠 TEST HLP-05: CO-TERMINUS RULE

### Input Data:
```
EXISTING HOME LOAN:
- Original Tenure: 10 years
- Months Completed: 48 (4 years)
- Remaining: 72 months = 6 years ⚠️
```

### Calculation:
```
Remaining HL Tenure = 6 years
Even if applicant age allows 15 years
HLP tenure MUST end with HL
→ Max HLP tenure = 6 years
```

### ⚠️ Expected Result:
```
STATUS: ✅ ELIGIBLE

Tenure: 6 Years (co-terminus)

Remaining Tenure Display:
Shows "6 years 0 months" in calculated field
```

### 📸 What to Verify:
- [✓] "Remaining Tenure" field shows correct calculation
- [✓] Result tenure matches remaining HL tenure

---

## 🔴 TEST HLP-06: COMMERCIAL PROPERTY

### Input Data:
```
PROPERTY DETAILS:
- Property Type: Commercial ⚠️
```

### ❌ Expected Result:
```
STATUS: ❌ NOT ELIGIBLE - Commercial Property

Reason:
Home Loan Plus is available only for fully constructed residential properties as per Circular 187.
```

### 📸 What to Verify:
- [✓] Red rejection
- [✓] Mentions residential-only rule

---

## 🔴 TEST HLP-07: UNDER CONSTRUCTION

### Input Data:
```
PROPERTY DETAILS:
- Property Type: Under Construction ⚠️
```

### ❌ Expected Result:
```
STATUS: ❌ NOT ELIGIBLE - Under-Construction Property

Reason:
Only fully constructed properties are eligible for Home Loan Plus.
```

### 📸 What to Verify:
- [✓] Red rejection
- [✓] States fully-constructed requirement

---

# 📊 TEST EXECUTION SUMMARY

## Mortgage Loan Tests:
| Test | Type | Expected Result | Status |
|------|------|----------------|--------|
| ML-01 | ✅ Eligible | ₹55L approved | To Test |
| ML-02 | ❌ Reject | Agriculturist  | To Test |
| ML-03 | ❌ Reject | Low CIBIL | To Test |
| ML-04 | ⚠️ Restrict | LTV cap ₹48L | To Test |
| ML-05 | ❌ Reject | Residual life | To Test |
| ML-06 | ⚠️ Restrict | Age tenure cap | To Test |
| ML-07 | ✅ Prevent | Purpose dropdown | To Test |

## Home Loan Plus Tests:
| Test | Type | Expected Result | Status |
|------|------|----------------|--------|
| HLP-01 | ✅ Eligible | ₹7L approved | To Test |
| HLP-02 | ⚠️ Restrict | LTV cap ₹10L | To Test |
| HLP-03 | ❌ Reject | EMI overdue | To Test |
| HLP-04 | ❌ Reject | <12 months | To Test |
| HLP-05 | ⚠️ Restrict | Co-terminus | To Test |
| HLP-06 | ❌ Reject | Commercial | To Test |
| HLP-07 | ❌ Reject | Under-construction | To Test |

---

# 🎯 TESTING INSTRUCTIONS

1. **Open Application**: http://localhost:5173

2. **For Mortgage Loan**: Click "Mortgage Loan Checker"

3. **For Home Loan Plus**: Click "Home Loan Plus"

4. **Enter Data**: Copy exact values from each test case

5. **Submit**: Click "Calculate Eligibility"

6. **Verify**: Check result matches expected outcome

7. **Document**: Mark test as ✅ Pass or ❌ Fail

---

# ✅ PASS CRITERIA

A test PASSES if:
- Eligibility status matches (Eligible/Not Eligible)
- Amounts match (or are restricted correctly)
- Rejection reasons are clear and cite circular
- All calculations are visible and correct
- ROI, tenure, and EMI are accurate

---

# 🏁 FINAL VERDICT

If ALL tests pass:
✅ **Calculators are 100% Circular-compliant and production-ready**

If ANY test fails:
❌ **Review implementation for that specific validation**

---

**Document Created**: 22-Dec-2024
**Test Coverage**: Mortgage Loan (Cir 178) + Home Loan Plus (Cir 187)
**Total Test Cases**: 14 comprehensive scenarios
