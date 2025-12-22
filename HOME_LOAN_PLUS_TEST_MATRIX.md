# Home Loan Plus - 100+ Test Cases (Circular 187 Compliance)

## 📋 TEST MATRIX OVERVIEW

This document contains **105 structured test cases** to validate complete Circular 187 compliance.

---

## 🔹 GROUP 1: EXISTING LOAN CONDITIONS (15 Cases)

### Test Cases 1-15: Loan Age & EMI Overdue Validation

| Case | Sanction Date | Months Old | EMI Overdue > 30 Days | Expected Result | Circular Reference |
|------|---------------|------------|----------------------|-----------------|-------------------|
| 1 | 11 months ago | 11 | No | ❌ REJECT - "Insufficient repayment history" | Cl.187 - Min 12 months |
| 2 | Exactly 12 months ago | 12 | No | ✅ PASS | Cl.187 - Min requirement met |
| 3 | 18 months ago | 18 | No | ✅ PASS | Cl.187 - Compliant |
| 4 | 24 months ago | 24 | No | ✅ PASS | Cl.187 - Compliant |
| 5 | 36 months ago | 36 | No | ✅ PASS | Cl.187 - Compliant |
| 6 | 13 months ago | 13 | Yes (31 days) | ❌ REJECT - "EMI overdue > 30 days" | Cl.187 - Clean record required |
| 7 | 15 months ago | 15 | Yes (45 days) | ❌ REJECT - "EMI overdue > 30 days" | Cl.187 - Clean record required |
| 8 | 20 months ago | 20 | Yes (60 days) | ❌ REJECT - "EMI overdue > 30 days" | Cl.187 - Clean record required |
| 9 | 14 months ago | 14 | Yes (10 days) | ✅ PASS - Overdue < 30 days | Cl.187 - Acceptable |
| 10 | 16 months ago | 16 | Yes (29 days) | ✅ PASS - Overdue < 30 days | Cl.187 - Acceptable |
| 11 | 25 months ago | 25 | Yes (exactly 30 days) | ✅ PASS - Exactly 30 days is OK | Cl.187 - Boundary case |
| 12 | 10 months ago | 10 | No | ❌ REJECT - "Insufficient repayment history" | Cl.187 - Min 12 months |
| 13 | 6 months ago | 6 | No | ❌ REJECT - "Insufficient repayment history" | Cl.187 - Min 12 months |
| 14 | 48 months ago | 48 | No | ✅ PASS | Cl.187 - Compliant |
| 15 | No date provided | N/A | No | ❌ REJECT - "Missing loan details" | Cl.187 - Mandatory field |

**Expected Pass Rate**: 8/15 (53%)

---

## 🔹 GROUP 2: PROPERTY VALIDATION (20 Cases)

### Test Cases 16-35: Property Type & Location

| Case | Property Type | Location | Expected Result | Circular Reference |
|------|--------------|----------|-----------------|-------------------|
| 16 | Residential - Self Occupied | Urban | ✅ PASS | Cl.187 - Eligible |
| 17 | Residential - Self Occupied | Semi-urban | ✅ PASS | Cl.187 - Eligible |
| 18 | Residential - Self Occupied | Rural | ✅ PASS | Cl.187 - Eligible |
| 19 | Residential - Rented | Urban | ✅ PASS | Cl.187 - Eligible |
| 20 | Residential - Rented | Rural | ✅ PASS | Cl.187 - Eligible |
| 21 | **Commercial** | Urban | ❌ REJECT - "Commercial Property" | **Cl.187 - Not allowed** |
| 22 | **Commercial** | Rural | ❌ REJECT - "Commercial Property" | **Cl.187 - Not allowed** |
| 23 | **Under Construction** | Urban | ❌ REJECT - "Under-Construction" | **Cl.187 - Only fully constructed** |
| 24 | **Under Construction** | Rural | ❌ REJECT - "Under-Construction" | **Cl.187 - Only fully constructed** |
| 25 | Residential - Self Occupied | Urban | ✅ PASS | Cl.187 - Eligible |
| 26 | Residential - Self Occupied | Semi-urban | ✅ PASS | Cl.187 - Eligible |
| 27 | Residential - Rented | Urban | ✅ PASS | Cl.187 - Eligible |
| 28 | Residential - Rented | Semi-urban | ✅ PASS | Cl.187 - Eligible |
| 29 | Residential - Self Occupied | Rural | ✅ PASS | Cl.187 - Eligible |
| 30 | **Commercial** | Semi-urban | ❌ REJECT - "Commercial Property" | **Cl.187 - Not allowed** |
| 31 | Residential - Self Occupied | Urban | ✅ PASS | Cl.187 - Eligible |
| 32 | Residential - Rented | Rural | ✅ PASS | Cl.187 - Eligible |
| 33 | **Under Construction** | Semi-urban | ❌ REJECT - "Under-Construction" | **Cl.187 - Only fully constructed** |
| 34 | Residential - Self Occupied | Urban | ✅ PASS | Cl.187 - Eligible |
| 35 | Residential - Rented | Urban | ✅ PASS | Cl.187 - Eligible |

**Expected Pass Rate**: 14/20 (70%)

---

## 🔹 GROUP 3: LTV STRESS TEST (30 Cases)

### Test Cases 36-65: Total Housing Exposure vs LTV Limits

| Case | Property NRV | Existing Outstanding | Requested | Total Exposure | LTV Slab | Max Allowed | Result |
|------|-------------|---------------------|-----------|----------------|----------|-------------|--------|
| 36 | ₹30L | ₹25L | ₹2L | ₹27L | 90% | ₹27L | ✅ PASS (exactly at limit) |
| 37 | ₹30L | ₹26L | ₹2L | ₹28L | 90% | ₹27L | ❌ REJECT - LTV exceeded |
| 38 | ₹40L | ₹24L | ₹8L | ₹32L | 90% | ₹36L | ✅ PASS |
| 39 | ₹40L | ₹30L | ₹7L | ₹37L | 90% | ₹36L | ❌ REJECT - LTV exceeded |
| 40 | ₹50L | ₹30L | ₹10L | ₹40L | 80% | ₹40L | ✅ PASS (exactly) |
| 41 | ₹50L | ₹32L | ₹10L | ₹42L | 80% | ₹40L | ❌ REJECT - LTV exceeded |
| 42 | ₹60L | ₹38L | ₹10L | ₹48L | 80% | ₹48L | ✅ PASS (exactly) |
| 43 | ₹60L | ₹40L | ₹10L | ₹50L | 80% | ₹48L | ❌ REJECT - LTV exceeded |
| 44 | ₹80L | ₹55L | ₹5L | ₹60L | 75% | ₹60L | ✅ PASS (exactly) |
| 45 | ₹80L | ₹56L | ₹5L | ₹61L | 75% | ₹60L | ❌ REJECT - LTV exceeded |
| 46 | ₹100L | ₹70L | ₹5L | ₹75L | 75% | ₹75L | ✅ PASS (exactly) |
| 47 | ₹100L | ₹71L | ₹5L | ₹76L | 75% | ₹75L | ❌ REJECT - LTV exceeded |
| 48 | ₹25L | ₹20L | ₹2L | ₹22L | 90% | ₹22.5L | ✅ PASS |
| 49 | ₹35L | ₹28L | ₹3L | ₹31L | 80% | ₹28L | ✅ PASS |
| 50 | ₹45L | ₹30L | ₹6L | ₹36L | 80% | ₹36L | ✅ PASS |
| 51 | ₹55L | ₹40L | ₹4L | ₹44L | 80% | ₹44L | ✅ PASS |
| 52 | ₹65L | ₹45L | ₹3L | ₹48L | 80% | ₹52L | ✅ PASS |
| 53 | ₹75L | ₹50L | ₹6L | ₹56L | 75% | ₹56.25L | ✅ PASS |
| 54 | ₹85L | ₹60L | ₹4L | ₹64L | 75% | ₹63.75L | ❌ REJECT - LTV exceeded |
| 55 | ₹90L | ₹65L | ₹2L | ₹67L | 75% | ₹67.5L | ✅ PASS |
| 56 | ₹20L | ₹15L | ₹3L | ₹18L | 90% | ₹18L | ✅ PASS |
| 57 | ₹22L | ₹17L | ₹4L | ₹21L | 90% | ₹19.8L | ❌ REJECT - LTV exceeded |
| 58 | ₹42L | ₹32L | ₹5L | ₹37L | 80% | ₹33.6L | ❌ REJECT - LTV exceeded |
| 59 | ₹52L | ₹38L | ₹6L | ₹44L | 80% | ₹41.6L | ❌ REJECT - LTV exceeded |
| 60 | ₹70L | ₹48L | ₹7L | ₹55L | 80% | ₹56L | ✅ PASS |
| 61 | ₹78L | ₹55L | ₹4L | ₹59L | 75% | ₹58.5L | ❌ REJECT - LTV exceeded |
| 62 | ₹95L | ₹68L | ₹3L | ₹71L | 75% | ₹71.25L | ✅ PASS |
| 63 | ₹28L | ₹22L | ₹3L | ₹25L | 90% | ₹25.2L | ✅ PASS |
| 64 | ₹38L | ₹29L | ₹7L | ₹36L | 80% | ₹30.4L | ❌ REJECT - LTV exceeded |
| 65 | ₹88L | ₹62L | ₹4L | ₹66L | 75% | ₹66L | ✅ PASS |

**LTV Calculation Reference (Circular 187):**
- Total Exposure ≤ ₹30L → LTV = 90%
- ₹30L < Total Exposure ≤ ₹75L → LTV = 80%
- Total Exposure > ₹75L → LTV = 75%

**Expected Pass Rate**: 19/30 (63%)

---

## 🔹 GROUP 4: TENURE & AGE VALIDATION (15 Cases)

### Test Cases 66-80: Co-terminus Rule & Age Limits

| Case | Age | Remaining HL Tenure | Requested Tenure | Building Life | Expected Result | Circular Reference |
|------|-----|-------------------|-----------------|---------------|-----------------|-------------------|
| 66 | 35 | 180M (15Y) | 10Y | 50Y | ✅ PASS - Max 15Y (co-terminus) | Cl.187 - Must finish with HL |
| 67 | 40 | 120M (10Y) | 15Y | 40Y | ✅ PASS - Max 10Y (co-terminus) | Cl.187 - Co-terminus rule |
| 68 | 62 | 120M (10Y) | 10Y | 30Y | ⚠️ PASS - Max 8Y (age 70 limit) | Cl.187 - Age ≤ 70 |
| 69 | 65 | 60M (5Y) | 10Y | 25Y | ✅ PASS - Max 5Y (co-terminus) | Cl.187 - Co-terminus rule |
| 70 | 69 | 24M (2Y) | 5Y | 20Y | ⚠️ PASS - Max 1Y (age limit) | Cl.187 - Age ≤ 70 |
| 71 | 45 | 240M (20Y) | 20Y | 60Y | ✅ PASS - Max 20Y (scheme max) | Cl.187 - Max 20 years |
| 72 | 50 | 180M (15Y) | 15Y | 45Y | ✅ PASS - Max 15Y (co-terminus) | Cl.187 - Co-terminus rule |
| 73 | 55 | 96M (8Y) | 10Y | 30Y | ✅ PASS - Max 8Y (co-terminus) | Cl.187 - Co-terminus rule |
| 74 | 60 | 144M (12Y) | 15Y | 35Y | ⚠️ PASS - Max 10Y (age limit) | Cl.187 - Age ≤ 70 |
| 75 | 64 | 72M (6Y) | 10Y | 25Y | ✅ PASS - Max 6Y (co-terminus) | Cl.187 - Co-terminus rule |
| 76 | 30 | 200M (16.7Y) | 20Y | 55Y | ✅ PASS - Max 16.7Y (co-terminus) | Cl.187 - Co-terminus rule |
| 77 | 42 | 156M (13Y) | 15Y | 40Y | ✅ PASS - Max 13Y (co-terminus) | Cl.187 - Co-terminus rule |
| 78 | 58 | 108M (9Y) | 12Y | 32Y | ✅ PASS - Max 9Y (co-terminus) | Cl.187 - Co-terminus rule |
| 79 | 66 | 48M (4Y) | 10Y | 20Y | ✅ PASS - Max 4Y (co-terminus) | Cl.187 - Co-terminus rule |
| 80 | 68 | 36M (3Y) | 5Y | 18Y | ⚠️ PASS - Max 2Y (age limit) | Cl.187 - Age ≤ 70 |

**Tenure Rule (Circular 187):**
Final Tenure = MIN(
  - Remaining HL Tenure (Co-terminus - CRITICAL)
  - 20 years (Scheme maximum)
  - Age ≤ 70 years
  - Building life - 5 years
)

**Expected Pass Rate**: 15/15 (100% - All pass with appropriate tenure caps)

---

## 🔹 GROUP 5: EMI & INCOME CAPACITY (20 Cases)

### Test Cases 81-100: Income vs Total EMI Commitment

| Case | Net Income | Sustenance | Existing HL EMI | Other EMI | Requested Loan | New EMI | Total EMI | Surplus | Result |
|------|-----------|-----------|----------------|-----------|---------------|---------|-----------|---------|--------|
| 81 | ₹80k | ₹32k | ₹25k | ₹5k | ₹5L | ₹5k | ₹35k | ₹13k | ✅ PASS |
| 82 | ₹60k | ₹24k | ₹30k | ₹8k | ₹3L | ₹3k | ₹41k | -₹5k | ❌ REJECT - No surplus |
| 83 | ₹100k | ₹40k | ₹35k | ₹0 | ₹7L | ₹7k | ₹42k | ₹18k | ✅ PASS |
| 84 | ₹50k | ₹20k | ₹25k | ₹10k | ₹2L | ₹2k | ₹37k | -₹7k | ❌ REJECT - No surplus |
| 85 | ₹90k | ₹36k | ₹30k | ₹5k | ₹6L | ₹6k | ₹41k | ₹13k | ✅ PASS |
| 86 | ₹70k | ₹28k | ₹28k | ₹12k | ₹4L | ₹4k | ₹44k | -₹2k | ❌ REJECT - No surplus |
| 87 | ₹120k | ₹48k | ₹40k | ₹0 | ₹10L | ₹10k | ₹50k | ₹22k | ✅ PASS |
| 88 | ₹55k | ₹22k | ₹22k | ₹15k | ₹2.5L | ₹2.5k | ₹39.5k | -₹6.5k | ❌ REJECT - No surplus |
| 89 | ₹85k | ₹34k | ₹32k | ₹3k | ₹5.5L | ₹5.5k | ₹40.5k | ₹10.5k | ✅ PASS |
| 90 | ₹65k | ₹26k | ₹26k | ₹14k | ₹3L | ₹3k | ₹43k | -₹4k | ❌ REJECT - No surplus |
| 91 | ₹110k | ₹44k | ₹38k | ₹2k | ₹8L | ₹8k | ₹48k | ₹18k | ✅ PASS |
| 92 | ₹75k | ₹30k | ₹30k | ₹16k | ₹4L | ₹4k | ₹50k | -₹5k | ❌ REJECT - No surplus |
| 93 | ₹95k | ₹38k | ₹33k | ₹4k | ₹6.5L | ₹6.5k | ₹43.5k | ₹13.5k | ✅ PASS |
| 94 | ₹58k | ₹23k | ₹24k | ₹13k | ₹2L | ₹2k | ₹39k | -₹4k | ❌ REJECT - No surplus |
| 95 | ₹105k | ₹42k | ₹36k | ₹0 | ₹7.5L | ₹7.5k | ₹43.5k | ₹19.5k | ✅ PASS |
| 96 | ₹68k | ₹27k | ₹27k | ₹15k | ₹3L | ₹3k | ₹45k | -₹4k | ❌ REJECT - No surplus |
| 97 | ₹88k | ₹35k | ₹31k | ₹6k | ₹5L | ₹5k | ₹42k | ₹11k | ✅ PASS |
| 98 | ₹62k | ₹25k | ₹25k | ₹17k | ₹2.5L | ₹2.5k | ₹44.5k | -₹7.5k | ❌ REJECT - No surplus |
| 99 | ₹98k | ₹39k | ₹34k | ₹0 | ₹7L | ₹7k | ₹41k | ₹18k | ✅ PASS |
| 100 | ₹72k | ₹29k | ₹29k | ₹18k | ₹3.5L | ₹3.5k | ₹50.5k | -₹7.5k | ❌ REJECT - No surplus |

**Formula (Circular 187):**
- Total EMI = Existing HL EMI + New Home Loan Plus EMI + Other EMIs
- Available Surplus = Net Income - Sustenance - Total EMI
- Eligible if Surplus ≥ 0

**Expected Pass Rate**: 10/20 (50%)

---

## 🔹 GROUP 6: PURPOSE VALIDATION (5 Cases)

### Test Cases 101-105: Loan Purpose Restrictions

| Case | Purpose | Expected Result | Circular Reference |
|------|---------|-----------------|-------------------|
| 101 | Personal Needs | ✅ PASS - Allowed | Cl.187 - Permitted purpose |
| 102 | Debt Consolidation | ✅ PASS - Allowed | Cl.187 - Permitted purpose |
| 103 | Speculative (if manually entered) | ❌ REJECT - "Invalid Purpose" | Cl.187 - Not allowed |
| 104 | Blank/None | ❌ REJECT - "Invalid Purpose" | Cl.187 - Required field |
| 105 | Personal Needs | ✅ PASS - Allowed | Cl.187 - Permitted purpose |

**Purpose Rule (Circular 187):**
- ✅ Personal needs
- ✅ Debt consolidation
- ❌ Speculative purposes

**Expected Pass Rate**: 3/5 (60% - Only valid purposes pass)

---

## 🔹 BONUS GROUP 7: ITR VALIDATION (10 Cases)

### Test Cases 106-115: ITR Filed for Non-Salaried

| Case | Employment Type | ITR Filed Last 2 Years | Expected Result | Circular Reference |
|------|----------------|----------------------|-----------------|-------------------|
| 106 | Salaried | N/A (field not shown) | ✅ PASS - Not applicable | Cl.187 - Salaried exempt |
| 107 | Salaried + Pension | N/A (field not shown) | ✅ PASS - Not applicable | Cl.187 - Salaried exempt |
| 108 | Business | YES | ✅ PASS | Cl.187 - Mandatory compliance |
| 109 | Business | NO | ❌ REJECT - "ITR Not Filed" | Cl.187 - Mandatory for 2 years |
| 110 | Agriculture | YES | ✅ PASS | Cl.187 - Mandatory compliance |
| 111 | Agriculture | NO | ❌ REJECT - "ITR Not Filed" | Cl.187 - Mandatory for 2 years |
| 112 | Business | YES | ✅ PASS | Cl.187 - Mandatory compliance |
| 113 | Business | NO | ❌ REJECT - "ITR Not Filed" | Cl.187 - Mandatory for 2 years |
| 114 | Agriculture | YES | ✅ PASS | Cl.187 - Mandatory compliance |
| 115 | Agriculture | NO | ❌ REJECT - "ITR Not Filed" | Cl.187 - Mandatory for 2 years |

**ITR Rule (Circular 187):**
- Business/Self-Employed/Agriculture → **Mandatory** ITR for last 2 years (min 6 months gap)
- Salaried → **Not required**

**Expected Pass Rate**: 7/10 (70%)

---

## 📊 OVERALL TEST SUMMARY

| Group | Total Cases | Expected Pass | Pass Rate | Coverage |
|-------|------------|--------------|-----------|----------|
| 1. Existing Loan Conditions | 15 | 8 | 53% | ✅ Complete |
| 2. Property Validation | 20 | 14 | 70% | ✅ Complete |
| 3. LTV Stress Test | 30 | 19 | 63% | ✅ Complete |
| 4. Tenure & Age | 15 | 15 | 100% | ✅ Complete |
| 5. EMI & Income | 20 | 10 | 50% | ✅ Complete |
| 6. Purpose Validation | 5 | 3 | 60% | ✅ Complete |
| 7. ITR Validation | 10 | 7 | 70% | ✅ Complete |
| **TOTAL** | **115** | **76** | **66%** | **✅ 100%** |

---

## ✅ VALIDATION CHECKLIST

### Critical Validations to Verify

- [ ] **Test Case 1**: Loan < 12 months → REJECT
- [ ] **Test Case 2**: Loan = 12 months → PASS
- [ ] **Test Case 6**: EMI overdue 31 days → REJECT
- [ ] **Test Case 21**: Commercial property → REJECT with specific message
- [ ] **Test Case 23**: Under-construction → REJECT with specific message
- [ ] **Test Case 37**: LTV exceeded (₹28L vs ₹27L max) → REJECT
- [ ] **Test Case 40**: LTV exactly at limit (₹40L = ₹40L) → PASS
- [ ] **Test Case 68**: Age 62, tenure adjusts for age 70 limit → PASS with capped tenure
- [ ] **Test Case 82**: No surplus (₹60k - ₹24k - ₹41k = -₹5k) → REJECT
- [ ] **Test Case 103**: Speculative purpose → REJECT
- [ ] **Test Case 109**: Business without ITR → REJECT
- [ ] **Remaining Tenure Display**: Auto-calculates correctly
- [ ] **Co-terminus Rule**: Home Loan Plus tenure ≤ Remaining HL tenure

---

## 🎯 EXPECTED OUTCOMES BY VALIDATION TYPE

### Pre-Conditions (Should REJECT)
- Loan age < 12 months
- EMI overdue > 30 days
- Commercial property
- Under-construction property
- Invalid purpose
- Business/Agriculture without ITR

### Calculations (Should RESTRICT)
- LTV exceeded → Reduce to max allowed or REJECT
- Co-terminus violation → Cap tenure to remaining HL tenure
- Age limit → Cap tenure to reach age 70
- No EMI capacity → REJECT

### Edge Cases (Should HANDLE)
- Exactly at LTV limit → PASS
- Exactly 12 months old → PASS
- Exactly 30 days overdue → PASS
- Age 69 with short tenure → PASS with capped tenure

---

## 🔍 MANUAL VERIFICATION STEPS

1. **Open Calculator**: Navigate to `/home-loan-plus`
2. **Test Case 21** (Commercial Property):
   - Select "Commercial" in Property Type
   - Fill other valid data
   - **Verify**: Should show "NOT ELIGIBLE - Commercial Property"
3. **Test Case 109** (Business without ITR):
   - Select "Business" employment
   - Set ITR Filed = "NO"
   - **Verify**: Should show "NOT ELIGIBLE - ITR Not Filed"
4. **Test Case 37** (LTV Exceeded):
   - NRV = ₹30L, Outstanding = ₹26L, Requested = ₹2L
   - **Verify**: Should REJECT (total ₹28L > ₹27L max at 90% LTV)
5. **Remaining Tenure**:
   - Original Tenure = 20 years, Completed = 120 months
   - **Verify**: Should display "10 years 0 months"

---

## ✅ SUCCESS CRITERIA

The Home Loan Plus calculator is **Circular 187 compliant** if:

1. ✅ All property type rejections work correctly
2. ✅ ITR validation only applies to Business/Agriculture
3. ✅ LTV calculated on TOTAL exposure (existing + new)
4. ✅ Remaining tenure displays correctly
5. ✅ Co-terminus rule enforced
6. ✅ All rejection messages cite Circular 187
7. ✅ Purpose restricted to Personal/Debt only
8. ✅ Minimum 12 months loan age enforced
9. ✅ EMI overdue > 30 days rejected
10. ✅ All edge cases handled properly

---

**📋 Total Test Cases**: 115  
**🎯 Expected Pass**: 76 (66%)  
**❌ Expected Reject**: 39 (34%)  
**✅ Circular 187 Compliance**: 100%

---

**Next Step**: Execute these test cases manually or automate them to verify complete Circular 187 compliance!
