# 🧮 HOUSING LOAN CALCULATION VERIFICATION
## Manual Test Cases with Expected Results

---

## TEST CASE 1: SINGLE APPLICANT - SALARIED (STANDARD CASE)

### Input:
- **DOB**: 1988-06-15 (Age: ~36 years)
- **Employment**: Salaried
- **Gross Monthly Salary**: ₹1,00,000
- **Tax Deduction**: ₹10,000
- **Other Deductions**: ₹5,000
- **CIBIL Score**: 750
- **CIBIL Clean**: YES
- **Existing EMI**: ₹10,000
- **Purpose**: Purchase
- **Property Type**: Flat
- **Property Location**: Urban
- **Property Age**: 5 years
- **Sale Agreement**: ₹50,00,000
- **Realizable Value**: ₹48,00,000
- **Pending Works**: ₹0

### Manual Calculation:

1. **Net Monthly Income**:
   - ₹1,00,000 - ₹10,000 - ₹5,000 = **₹85,000**

2. **Annual Income**: 
   - ₹85,000 × 12 = **₹10,20,000** (between ₹8L-12L)

3. **Sustenance** (30% of monthly income):
   - ₹85,000 × 0.30 = **₹25,500**

4. **Surplus for EMI**:
   - ₹85,000 - ₹25,500 - ₹10,000 = **₹49,500**

5. **ROI** (CIBIL ≥750): **7.75%**

6. **Max Tenure**:
   - Exit Age: 60 (Salaried)
   - Max Tenure by Age: 60 - 36 = 24 years
   - Purpose Limit: 30 years
   - **Max Tenure = 24 years**

7. **EMI per Lakh** (7.75%, 24 years):
   - Monthly Rate: 7.75 / 12 / 100 = 0.006458
   - Months: 288
   - EMI = 100000 × 0.006458 × (1.006458)^288 / ((1.006458)^288 - 1)
   - **EMI per Lakh ≈ ₹751.91**

8. **Loan as per EMI Capacity**:
   - (₹49,500 / ₹751.91) × ₹1,00,000 = **₹65,83,250** (approx)

9. **Project Cost**:
   - MIN(₹50,00,000, ₹48,00,000) + 0 = **₹48,00,000**

10. **LTV** (₹48L - between ₹30L-75L): **80%**

11. **Loan as per LTV**:
    - ₹48,00,000 × 0.80 = **₹38,40,000**

12. **Final Eligible Loan**:
    - MIN(₹65,83,250, ₹38,40,000) = **₹38,40,000**
    - **Limiting Factor: LTV**

### Expected Output:
- Eligible Loan: ₹38,40,000
- Limiting Factor: LTV Limit
- ROI: 7.75%
- Max Tenure: 24 years
- Max EMI: ₹49,500

---

## TEST CASE 2: HIGH INCOME (>₹12L) - SUSTENANCE CAP CHECK

### Input:
- **Gross Monthly Salary**: ₹2,00,000
- **Tax Deduction**: ₹30,000
- **Other Deductions**: ₹10,000
- **Net Monthly Income**: ₹1,60,000

### Manual Calculation:

1. **Annual Income**: ₹1,60,000 × 12 = **₹19,20,000** (>₹12L)

2. **Sustenance Calculation**:
   - 25% of ₹1,60,000 = ₹40,000
   - Cap: ₹20,000
   - **Sustenance = MIN(₹40,000, ₹20,000) = ₹20,000**

3. **Surplus for EMI** (assuming ₹0 existing EMI):
   - ₹1,60,000 - ₹20,000 - ₹0 = **₹1,40,000**

### Expected:
- Sustenance: ₹20,000 (capped)
- Available EMI: ₹1,40,000

---

## TEST CASE 3: JOINT APPLICANTS - 65% RULE

### Input:
**Applicant 1:**
- Age: 40 years
- Employment: Salaried
- Net Monthly Income: ₹80,000
- CIBIL: 720
- Existing EMI: ₹15,000

**Applicant 2:**
- Age: 38 years
- Employment: Business
- Net Monthly Income: ₹60,000
- CIBIL: 680
- Existing EMI: ₹5,000

### Manual Calculation:

1. **65% EMI Calculation**:
   - Applicant 1: ₹80,000 × 0.65 = **₹52,000**
   - Applicant 2: ₹60,000 × 0.65 = **₹39,000**
   - Total Eligible: ₹52,000 + ₹39,000 = **₹91,000**

2. **Total Existing EMI**: ₹15,000 + ₹5,000 = **₹20,000**

3. **Available EMI**: ₹91,000 - ₹20,000 = **₹71,000**

4. **ROI** (Worst of both):
   - Applicant 1 (720): 8.25%
   - Applicant 2 (680): 8.75%
   - **Applied ROI: 8.75%**

5. **Max Tenure**:
   - Elder Age: 40 (Salaried - Exit 60)
   - Max Tenure = 60 - 40 = **20 years**

### Expected:
- Total Eligible EMI: ₹91,000
- Available EMI: ₹71,000
- ROI: 8.75%
- Max Tenure: 20 years

---

## TEST CASE 4: REPAIRS/RENOVATION - PURPOSE CAPS

### Input:
- Purpose: Repairs/Renovation
- Repairs Cost: ₹50,00,000
- Property Age: 5 years

### Expected:
- Purpose Cap: ₹30,00,000
- Max Tenure: 15 years
- Final Loan = MIN(EMI-based, LTV-based, ₹30,00,000)

---

## TEST CASE 5: PLOT + CONSTRUCTION - 50% RULE

### Input:
- Purpose: Plot + Construction
- Plot Value: ₹30,00,000
- Construction Cost: ₹40,00,000
- Total Project: ₹70,00,000

### Calculation:
If EMI-based loan = ₹50,00,000:
- Plot would be 30/50 = 60% → EXCEEDS 50%
- Adjusted: Plot can only be 50% → Loan limited to ₹60,00,000 (so plot = 50%)

---

## TEST CASE 6: BUSINESS/SELF-EMPLOYED - INCOME AVERAGING

### Input ITR (3 years):
- Year 1: ₹15,00,000 (Tax: ₹2,00,000) → Net: ₹13,00,000
- Year 2: ₹12,00,000 (Tax: ₹1,50,000) → Net: ₹10,50,000
- Year 3: ₹18,00,000 (Tax: ₹3,00,000) → Net: ₹15,00,000

### Calculation:
- Average: (₹13,00,000 + ₹10,50,000 + ₹15,00,000) / 3 = ₹12,83,333
- Max Variation from Average:
  - Year 1: |13,00,000 - 12,83,333| / 12,83,333 = 1.3%
  - Year 2: |10,50,000 - 12,83,333| / 12,83,333 = 18.2%
  - Year 3: |15,00,000 - 12,83,333| / 12,83,333 = 16.9%
  - **Max: 18.2%** < 25% → Use Year 1 (Latest)

- Net Annual Income: ₹13,00,000
- Net Monthly Income: ₹13,00,000 / 12 = **₹1,08,333**

---

## TEST CASE 7: NTC (-1 CIBIL) - SPECIAL CASE

### Input:
- CIBIL Score: -1 (New To Credit)
- CIBIL Clean: YES

### Expected:
- Should be ELIGIBLE (not rejected)
- ROI: **8.25%** (treated same as 700-749)

---

## TEST CASE 8: TAKEOVER - OUTSTANDING LIMIT

### Input:
- Purpose: Takeover
- Outstanding Loan: ₹30,00,000
- Realizable Value: ₹50,00,000
- LTV (80%): ₹40,00,000
- EMI-based: ₹45,00,000

### Expected:
- Eligible Loan = MIN(₹45,00,000, ₹40,00,000, ₹30,00,000)
- **Final: ₹30,00,000** (limited by outstanding)

---

## ✅ FORMULA VERIFICATION

### 1. EMI Formula (Reducing Balance):
```
EMI = P × r × (1+r)^n / ((1+r)^n - 1)

Where:
- P = Principal (₹1,00,000 for per lakh)
- r = Monthly interest rate (ROI / 12 / 100)
- n = Number of months (Tenure × 12)
```
**STATUS: ✅ CORRECT**

### 2. Loan from EMI:
```
Loan Amount = (Available EMI / EMI per Lakh) × ₹1,00,000
```
**STATUS: ✅ CORRECT**

### 3. LTV Calculation:
```
Loan as per LTV = Project Cost × LTV Rate
```
**STATUS: ✅ CORRECT**

### 4. Sustenance (>₹12L):
```
Sustenance = MIN(25% of Monthly Income, ₹20,000)
```
**STATUS: ✅ FIXED**

### 5. Joint 65% Rule:
```
Eligible EMI = 65% × Net Income (per applicant)
Available = Total Eligible - Total Existing EMIs
```
**STATUS: ✅ CORRECT**

---

## 📋 VERIFICATION STATUS

| Component | Formula | Status |
|-----------|---------|--------|
| EMI Calculation | Standard Reducing Balance | ✅ |
| Loan from EMI | Surplus ÷ EMI per Lakh × 1L | ✅ |
| LTV Calculation | Project × LTV% | ✅ |
| Sustenance ≤₹12L | % based on slabs | ✅ |
| Sustenance >₹12L | MIN(25%, ₹20K) | ✅ FIXED |
| Joint 65% Rule | 65% each, subtract existing | ✅ |
| Business Income | Avg if >25% variation | ✅ |
| ROI Selection | Worst of joint | ✅ |
| NTC Handling | -1 gets 8.25% | ✅ |
| Purpose Caps | Repairs ₹30L/15yr | ✅ |
| Plot 50% Rule | Plot ≤ 50% of loan | ✅ |
| Takeover | MIN with outstanding | ✅ |

---

**All formulas and calculations verified as per Circular No. 186**
