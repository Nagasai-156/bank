# 🧪 APGB HOME LOAN – MASTER TEST CASE SUITE

Based on Circular No. 186 - APGB Home Loans (Fixed ROI)

---

## 🧱 A. BASIC ELIGIBILITY TESTS (HARD BLOCKERS)

### ❌ TC-A1: Age Below Minimum
**Input:**
- Age: 17
- Purpose: Purchase
- Income: ₹50,000

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Minimum age requirement is 18 years"

---

### ❌ TC-A2: Age Exceeds 75 at Loan End
**Input:**
- Age: 52
- Tenure requested: 25 years
- Age at loan end: 77

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Age at loan end will be 77 years. Maximum allowed is 75 years. Please reduce tenure."

---

### ✅ TC-A3: Age Exactly at Boundary (75 at end)
**Input:**
- Age: 50
- Tenure: 25 years
- Age at end: 75

**Expected Result:**
- ✅ ELIGIBLE (if other criteria met)

---

### ❌ TC-A4: Age 75 Currently
**Input:**
- Current age: 75
- Tenure: 5 years

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: Age exceeds limit

---

## 🏘️ B. PURPOSE-BASED TESTS

### ✅ TC-B1: Purchase of House/Flat
**Input:**
- Purpose: Purchase
- Property Location: Urban
- Property Value: ₹40,00,000

**Expected Result:**
- ✅ ELIGIBLE
- Scheme Cap: ₹50,00,000

---

### ✅ TC-B2: Construction
**Input:**
- Purpose: Construction
- Max Tenure: 30 years

**Expected Result:**
- ✅ ELIGIBLE
- Tenure allowed: Up to 30 years

---

### ✅ TC-B3: Repairs/Renovation
**Input:**
- Purpose: Repairs
- Tenure requested: 15 years

**Expected Result:**
- ✅ ELIGIBLE
- Max tenure: 15 years

---

### ❌ TC-B4: Repairs with Tenure > 15 Years
**Input:**
- Purpose: Repairs
- Tenure: 20 years

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Maximum tenure for Repairs is 15 years. You requested 20 years."

---

## 👤 C. APPLICANT / CO-APPLICANT LOGIC

### ✅ TC-C1: Single Applicant
**Input:**
- Gross Monthly Income: ₹80,000
- Co-Applicant Income: 0

**Expected Result:**
- ✅ Income considered: ₹80,000

---

### ✅ TC-C2: Husband + Wife (Both Earning)
**Input:**
- Applicant Income: ₹50,000
- Co-Applicant Income: ₹40,000
- Total: ₹90,000

**Expected Result:**
- ✅ Combined income used: ₹90,000
- Higher eligibility

---

### ✅ TC-C3: With Co-Applicant vs Without
**Scenario A (Without):**
- Income: ₹60,000
- Eligible Loan: X

**Scenario B (With Co-Applicant):**
- Income: ₹60,000 + ₹30,000 = ₹90,000
- Eligible Loan: Y (Y > X)

**Expected Result:**
- Co-applicant increases eligibility

---

## 💰 D. INCOME & REPAYMENT CAPACITY TESTS

### ✅ TC-D1: Salaried – Normal Case
**Input:**
- Employment: Salaried
- Gross Monthly: ₹60,000
- Existing EMI: ₹5,000
- CIBIL: 750
- Property Value: ₹30,00,000
- Tenure: 20 years

**Expected Result:**
- ✅ ELIGIBLE
- EMI capacity calculated after sustenance

---

### ❌ TC-D2: Existing EMI Too High
**Input:**
- Gross: ₹60,000
- Existing EMI: ₹40,000
- Annual Income: ₹7,20,000
- Sustenance (35%): ₹2,52,000
- Available: ₹7,20,000 - ₹4,80,000 - ₹2,52,000 = -₹12,000

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "After sustenance and existing EMIs, no income is available for new EMI"

---

### ✅ TC-D3: Zero Existing EMI
**Input:**
- Gross: ₹80,000
- Existing EMI: 0

**Expected Result:**
- ✅ Maximum repayment capacity
- Higher eligible loan

---

## 🧮 E. SUSTENANCE NORMS (CRITICAL TESTS)

### ✅ TC-E1: Income ₹2.5L p.a (45% Sustenance)
**Input:**
- Monthly Income: ₹20,833
- Annual: ₹2,50,000
- Sustenance: 45%

**Expected Result:**
- Sustenance Amount: ₹1,12,500
- Available for EMI: Lower

---

### ✅ TC-E2: Income ₹4L p.a (40% Sustenance)
**Input:**
- Monthly Income: ₹33,333
- Annual: ₹4,00,000
- Sustenance: 40%

**Expected Result:**
- Sustenance Amount: ₹1,60,000

---

### ✅ TC-E3: Income ₹6L p.a (35% Sustenance)
**Input:**
- Monthly Income: ₹50,000
- Annual: ₹6,00,000
- Sustenance: 35%

**Expected Result:**
- Sustenance Amount: ₹2,10,000

---

### ✅ TC-E4: Income ₹10L p.a (30% Sustenance)
**Input:**
- Monthly Income: ₹83,333
- Annual: ₹10,00,000
- Sustenance: 30%

**Expected Result:**
- Sustenance Amount: ₹3,00,000

---

### ✅ TC-E5: Income ₹15L p.a (25% or ₹2L/month)
**Input:**
- Monthly Income: ₹1,25,000
- Annual: ₹15,00,000
- Sustenance: 25% = ₹3,75,000 OR ₹2L/month = ₹24,00,000

**Expected Result:**
- Sustenance: ₹3,75,000 (lower of the two)

---

### ✅ TC-E6: Very High Income ₹30L p.a
**Input:**
- Monthly Income: ₹2,50,000
- Annual: ₹30,00,000
- 25% = ₹7,50,000
- ₹2L/month = ₹24,00,000

**Expected Result:**
- Sustenance: ₹7,50,000 (25% is lower)

---

## 🏦 F. LTV / MARGIN TESTS

### ✅ TC-F1: Property ₹25L (90% LTV)
**Input:**
- Property Value: ₹25,00,000
- Loan Amount: ≤ ₹30L

**Expected Result:**
- LTV: 90%
- Max Loan by LTV: ₹22,50,000
- Margin: ₹2,50,000 (10%)

---

### ✅ TC-F2: Property ₹50L (80% LTV)
**Input:**
- Property Value: ₹50,00,000
- Loan Amount: ₹30L-₹75L range

**Expected Result:**
- LTV: 80%
- Max Loan by LTV: ₹40,00,000
- Margin: ₹10,00,000 (20%)

---

### ✅ TC-F3: Property ₹1Cr (75% LTV)
**Input:**
- Property Value: ₹1,00,00,000
- Loan Amount: > ₹75L

**Expected Result:**
- LTV: 75%
- Max Loan by LTV: ₹75,00,000
- But capped by scheme limit (₹50L Urban)
- Final Loan: ₹50,00,000

---

### ✅ TC-F4: Repayment Capacity > LTV
**Input:**
- Repayment-based: ₹30,00,000
- LTV-based: ₹22,50,000

**Expected Result:**
- Final Loan: ₹22,50,000
- Limiting Factor: "LTV Limit"

---

### ✅ TC-F5: LTV > Repayment Capacity
**Input:**
- Repayment-based: ₹18,00,000
- LTV-based: ₹25,00,000

**Expected Result:**
- Final Loan: ₹18,00,000
- Limiting Factor: "Repayment Capacity"

---

## 📊 G. ROI (CIBIL-BASED) TESTS

### ✅ TC-G1: CIBIL 820 (Excellent)
**Input:**
- CIBIL Score: 820

**Expected Result:**
- ROI: 8.00% p.a
- Status: "Fixed for first 5 years"

---

### ✅ TC-G2: CIBIL 780 (Very Good)
**Input:**
- CIBIL Score: 780

**Expected Result:**
- ROI: 8.25% p.a

---

### ✅ TC-G3: CIBIL 720 (Good)
**Input:**
- CIBIL Score: 720

**Expected Result:**
- ROI: 8.50% p.a

---

### ✅ TC-G4: CIBIL 680 (Fair)
**Input:**
- CIBIL Score: 680

**Expected Result:**
- ROI: 9.00% p.a

---

### ✅ TC-G5: CIBIL 600 (Poor)
**Input:**
- CIBIL Score: 600

**Expected Result:**
- ROI: 9.50% p.a

---

### ✅ TC-G6: CIBIL Boundary - 800
**Input:**
- CIBIL: 800

**Expected Result:**
- ROI: 8.00% (≥800 slab)

---

### ✅ TC-G7: CIBIL Boundary - 799
**Input:**
- CIBIL: 799

**Expected Result:**
- ROI: 8.25% (750-799 slab)

---

## ⏳ H. TENURE EDGE CASES

### ✅ TC-H1: Purchase - 30 Years Allowed
**Input:**
- Purpose: Purchase
- Tenure: 30 years
- Age: 30

**Expected Result:**
- ✅ ELIGIBLE
- Max Tenure: 30 years

---

### ❌ TC-H2: Purchase - 31 Years Requested
**Input:**
- Purpose: Purchase
- Tenure: 31 years

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Maximum tenure for Purchase is 30 years"

---

### ✅ TC-H3: Repairs - 15 Years Max
**Input:**
- Purpose: Repairs
- Tenure: 15 years

**Expected Result:**
- ✅ ELIGIBLE

---

### ❌ TC-H4: Repairs - 16 Years
**Input:**
- Purpose: Repairs
- Tenure: 16 years

**Expected Result:**
- ❌ NOT ELIGIBLE

---

### ✅ TC-H5: Age-Based Tenure Restriction
**Input:**
- Age: 60
- Tenure Requested: 20 years
- Age at end: 80

**Expected Result:**
- ❌ NOT ELIGIBLE
- Max allowed: 15 years (to reach 75)

---

## 📍 I. LOCATION-BASED SCHEME CAP TESTS

### ✅ TC-I1: Urban Property
**Input:**
- Location: Urban
- Property Value: ₹60,00,000

**Expected Result:**
- Scheme Cap: ₹50,00,000
- Even if repayment & LTV allow more

---

### ✅ TC-I2: Semi-Urban Property
**Input:**
- Location: Semi-urban

**Expected Result:**
- Scheme Cap: ₹50,00,000

---

### ✅ TC-I3: Rural Property
**Input:**
- Location: Rural
- Property Value: ₹40,00,000

**Expected Result:**
- Scheme Cap: ₹35,00,000
- Lower than urban

---

### ✅ TC-I4: Rural Property - Exceeds Cap
**Input:**
- Location: Rural
- Repayment-based: ₹40,00,000
- LTV-based: ₹38,00,000
- Scheme Cap: ₹35,00,000

**Expected Result:**
- Final Loan: ₹35,00,000
- Limiting Factor: "Scheme Cap"

---

## 🧾 J. FINAL CALCULATION SANITY TESTS

### ✅ TC-J1: Repayment < LTV < Scheme Cap
**Input:**
- Repayment-based: ₹20,00,000
- LTV-based: ₹25,00,000
- Scheme Cap: ₹50,00,000

**Expected Result:**
- Final Loan: ₹20,00,000
- Limiting Factor: "Repayment Capacity"

---

### ✅ TC-J2: LTV < Repayment < Scheme Cap
**Input:**
- Repayment-based: ₹30,00,000
- LTV-based: ₹22,50,000
- Scheme Cap: ₹50,00,000

**Expected Result:**
- Final Loan: ₹22,50,000
- Limiting Factor: "LTV Limit"

---

### ✅ TC-J3: Scheme Cap < Both
**Input:**
- Repayment-based: ₹40,00,000
- LTV-based: ₹38,00,000
- Scheme Cap: ₹35,00,000 (Rural)

**Expected Result:**
- Final Loan: ₹35,00,000
- Limiting Factor: "Scheme Cap"

---

### ❌ TC-J4: All Fail (No Capacity)
**Input:**
- Repayment-based: ₹0 (no capacity)
- LTV-based: ₹10,00,000
- Scheme Cap: ₹50,00,000

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Insufficient income"

---

## 🔍 K. OUTPUT VALIDATION TESTS

### ✅ TC-K1: Complete Output Display
**For every ELIGIBLE case, verify UI shows:**

- [x] Eligibility: YES
- [x] Eligible Loan Amount
- [x] Limiting Factor
- [x] Repayment Capacity Based Loan
- [x] LTV Based Loan
- [x] Scheme Cap
- [x] ROI (CIBIL-based)
- [x] ROI Status (Fixed for 5 years)
- [x] Loan Tenure
- [x] Max Tenure
- [x] Monthly EMI
- [x] EMI per Lakh
- [x] Total Interest
- [x] Total Payable Amount
- [x] LTV Percentage
- [x] Margin Required (Amount & %)
- [x] Sustenance Amount (Annual & %)
- [x] Available for EMI

---

## 🎯 L. COMPREHENSIVE SCENARIO TESTS

### ✅ TC-L1: Perfect Scenario
**Input:**
- Age: 35
- Employment: Salaried
- Monthly Income: ₹1,00,000
- Co-Applicant: ₹50,000
- Existing EMI: ₹10,000
- CIBIL: 820
- Purpose: Purchase
- Location: Urban
- Property Value: ₹40,00,000
- Tenure: 20 years

**Expected Result:**
- ✅ ELIGIBLE
- High loan amount
- 8% ROI
- All calculations accurate

---

### ✅ TC-L2: Moderate Income Scenario
**Input:**
- Age: 40
- Monthly Income: ₹50,000
- Existing EMI: ₹5,000
- CIBIL: 720
- Property Value: ₹25,00,000
- Tenure: 15 years

**Expected Result:**
- ✅ ELIGIBLE
- Moderate loan
- 8.5% ROI

---

### ❌ TC-L3: Low Income Scenario
**Input:**
- Age: 45
- Monthly Income: ₹25,000
- Existing EMI: ₹8,000
- Property Value: ₹30,00,000
- Tenure: 20 years

**Expected Result:**
- ❌ NOT ELIGIBLE or Very Low Loan
- Insufficient capacity

---

### ✅ TC-L4: High Value Property
**Input:**
- Monthly Income: ₹2,00,000
- Property Value: ₹1,00,00,000
- Location: Urban

**Expected Result:**
- Loan capped at ₹50,00,000 (scheme cap)
- Even though capacity & LTV allow more

---

## 📋 M. EDGE CASE MATRIX

| Test | Age | Income | CIBIL | Property | Expected |
|------|-----|--------|-------|----------|----------|
| M1 | 18 | 50k | 800 | 25L | ✅ Min age OK |
| M2 | 74 | 100k | 800 | 40L | ✅ 1yr tenure max |
| M3 | 50 | 30k | 650 | 50L | ❌ Low capacity |
| M4 | 35 | 150k | 600 | 80L | ✅ But 9.5% ROI |
| M5 | 40 | 80k | 750 | 30L | ✅ Ideal case |

---

## ✅ QUALITY CHECKLIST

### Calculator Must:
- [ ] Reject age < 18
- [ ] Reject age at loan end > 75
- [ ] Apply correct sustenance % based on income
- [ ] Apply correct LTV based on loan amount
- [ ] Apply correct ROI based on CIBIL
- [ ] Respect scheme caps (₹50L Urban, ₹35L Rural)
- [ ] Respect tenure limits (30yr Purchase, 15yr Repairs)
- [ ] Calculate MIN(Repayment, LTV, Scheme Cap)
- [ ] Show limiting factor correctly
- [ ] Calculate EMI accurately
- [ ] Display all required output fields
- [ ] Handle co-applicant income
- [ ] Handle existing EMI deduction

---

## 🎯 FINAL VERDICT

**If your calculator passes:**
- ✅ All A-M test categories
- ✅ Rejects where required
- ✅ Reduces loan where required
- ✅ Never exceeds caps
- ✅ Shows all output fields

**Then:** 
🎉 **100% Circular-Compliant & Audit-Safe!**

---

## 📊 TEST EXECUTION SUMMARY

Total Test Cases: 60+

Categories:
- Basic Eligibility: 4 tests
- Purpose-Based: 4 tests
- Co-Applicant: 3 tests
- Income/Repayment: 3 tests
- Sustenance: 6 tests
- LTV/Margin: 5 tests
- CIBIL/ROI: 7 tests
- Tenure: 5 tests
- Location/Cap: 4 tests
- Calculation: 4 tests
- Output: 1 test
- Scenarios: 4 tests
- Edge Cases: 5 tests

**Status**: Ready for execution ✅
