# 🧪 HOUSING LOAN CALCULATOR - 10 TEST CASES
## Manual Testing with Expected Results

---

## TEST CASE 1: Single - Salaried - Purchase (Standard)
### Input:
| Field | Value |
|-------|-------|
| Applicant Type | Single |
| DOB | 1990-05-15 (Age ~35) |
| Employment | Salaried |
| Gross Salary | ₹80,000 |
| Tax Deduction | ₹8,000 |
| Other Deductions | ₹5,000 |
| CIBIL Score | 750 |
| CIBIL Clean | YES |
| Existing EMI | ₹5,000 |
| Purpose | Purchase |
| Property Type | Flat |
| Location | Urban |
| Property Age | 3 years |
| Sale Agreement | ₹40,00,000 |
| Realizable | ₹38,00,000 |
| Pending Works | ₹0 |

### Expected Result:
- **Status**: ✅ ELIGIBLE
- **ROI**: 7.75% (CIBIL ≥750)
- **Tenure**: ~25 years (60-35)
- **Net Income**: ₹67,000/month
- **Sustenance (35%)**: ₹23,450
- **Available EMI**: ₹67,000 - ₹23,450 - ₹5,000 = **₹38,550**
- **Project Cost**: MIN(40L, 38L) = ₹38,00,000
- **LTV (80%)**: ₹30,40,000

---

## TEST CASE 2: Single - Business - Construction
### Input:
| Field | Value |
|-------|-------|
| Applicant Type | Single |
| DOB | 1985-03-20 (Age ~40) |
| Employment | Business |
| ITR Year 1 | ₹15,00,000 |
| Tax Year 1 | ₹2,00,000 |
| ITR Year 2 | ₹14,00,000 |
| Tax Year 2 | ₹1,80,000 |
| ITR Year 3 | ₹16,00,000 |
| Tax Year 3 | ₹2,20,000 |
| CIBIL Score | 720 |
| CIBIL Clean | YES |
| Existing EMI | ₹20,000 |
| Purpose | Construction |
| Location | Rural |
| Construction Cost | ₹50,00,000 |

### Expected Result:
- **Status**: ✅ ELIGIBLE (Subject to Guarantor)
- **ROI**: 8.25% (CIBIL 700-749)
- **Tenure**: ~35 years (75-40)
- **Guarantor Required**: YES (Rural + Non-Salaried)

---

## TEST CASE 3: Single - Agriculture - Repairs/Renovation
### Input:
| Field | Value |
|-------|-------|
| Applicant Type | Single |
| DOB | 1980-08-10 (Age ~44) |
| Employment | Agriculture |
| Annual Agri Income | ₹8,00,000 |
| CIBIL Score | 680 |
| CIBIL Clean | YES |
| Existing EMI | ₹0 |
| Purpose | Repairs/Renovation |
| Location | Rural |
| Repairs Cost | ₹25,00,000 |
| Property Age | 5 years |

### Expected Result:
- **Status**: ✅ ELIGIBLE
- **ROI**: 8.75% (CIBIL 650-699)
- **Max Tenure**: 15 years (Purpose cap)
- **Max Loan**: MIN(EMI-based, ₹30L cap)

---

## TEST CASE 4: Single - NTC (-1 CIBIL) - Purchase
### Input:
| Field | Value |
|-------|-------|
| Applicant Type | Single |
| DOB | 1995-12-25 (Age ~29) |
| Employment | Salaried |
| Gross Salary | ₹50,000 |
| Tax Deduction | ₹3,000 |
| Other Deductions | ₹2,000 |
| CIBIL Score | -1 (NTC) |
| CIBIL Clean | YES |
| Existing EMI | ₹0 |
| Purpose | Purchase |
| Property Type | Flat |
| Location | Urban |
| Property Age | 2 years |
| Sale Agreement | ₹30,00,000 |
| Realizable | ₹28,00,000 |

### Expected Result:
- **Status**: ✅ ELIGIBLE
- **ROI**: 8.25% (NTC treated as 700-749)
- **Tenure**: 31 years (60-29) → 30 years max

---

## TEST CASE 5: Joint - Both Salaried - Purchase
### Input:
**Applicant 1:**
| Field | Value |
|-------|-------|
| DOB | 1988-06-15 (Age ~36) |
| Employment | Salaried |
| Gross Salary | ₹1,00,000 |
| Tax | ₹10,000 |
| Other | ₹5,000 |
| CIBIL | 780 |
| Clean | YES |
| Existing EMI | ₹10,000 |

**Applicant 2:**
| Field | Value |
|-------|-------|
| DOB | 1990-09-20 (Age ~34) |
| Employment | Salaried |
| Gross Salary | ₹70,000 |
| Tax | ₹5,000 |
| Other | ₹3,000 |
| CIBIL | 750 |
| Clean | YES |
| Existing EMI | ₹5,000 |

**Property:**
| Field | Value |
|-------|-------|
| Purpose | Purchase |
| Type | Building |
| Location | Urban |
| Age | 5 years |
| Sale | ₹80,00,000 |
| Realizable | ₹75,00,000 |

### Expected Result:
- **Status**: ✅ ELIGIBLE (Joint)
- **ROI**: 7.75% (Both ≥750)
- **65% EMI Rule**:
  - App1: ₹85,000 × 65% = ₹55,250
  - App2: ₹62,000 × 65% = ₹40,300
  - Total: ₹95,550 - ₹15,000 = **₹80,550 available**

---

## TEST CASE 6: Joint - Plot + Construction
### Input:
**Applicant 1:**
- Age: 45, Business, Net Monthly: ₹1,20,000, CIBIL: 700

**Applicant 2:**
- Age: 42, Salaried, Net Monthly: ₹90,000, CIBIL: 720

**Property:**
| Field | Value |
|-------|-------|
| Purpose | Plot + Construction |
| Location | Urban |
| Plot Value | ₹25,00,000 |
| Construction | ₹45,00,000 |

### Expected Result:
- **Status**: ✅ ELIGIBLE
- **Project Cost**: ₹70,00,000
- **Plot ≤ 50% Check**: ₹25L must be ≤ 50% of eligible loan

---

## TEST CASE 7: Takeover Case
### Input:
| Field | Value |
|-------|-------|
| Applicant Type | Single |
| DOB | 1982-04-10 (Age ~43) |
| Employment | Salaried |
| Gross Salary | ₹1,50,000 |
| Tax | ₹20,000 |
| Other | ₹10,000 |
| CIBIL | 760 |
| Clean | YES |
| Existing EMI | ₹30,000 |
| Purpose | Takeover |
| Type | Flat |
| Location | Urban |
| Age | 8 years |
| Outstanding Loan | ₹35,00,000 |
| Realizable | ₹50,00,000 |

### Expected Result:
- **Status**: ✅ ELIGIBLE
- **Eligible = MIN(EMI-based, LTV-based, Outstanding)**
- **Outstanding limits final loan to ₹35,00,000 max**

---

## TEST CASE 8: REJECTION - Low CIBIL
### Input:
| Field | Value |
|-------|-------|
| CIBIL Score | 600 |
| CIBIL Clean | YES |

### Expected Result:
- **Status**: ❌ NOT ELIGIBLE
- **Reason**: CIBIL score below 650

---

## TEST CASE 9: REJECTION - CIBIL Adverse
### Input:
| Field | Value |
|-------|-------|
| CIBIL Score | 750 |
| CIBIL Clean | NO |

### Expected Result:
- **Status**: ❌ NOT ELIGIBLE
- **Reason**: Has adverse CIBIL history

---

## TEST CASE 10: REJECTION - Property Too Old
### Input:
| Field | Value |
|-------|-------|
| Purpose | Purchase |
| Property Type | Flat |
| Property Age | 22 years |

### Expected Result:
- **Status**: ❌ NOT ELIGIBLE
- **Reason**: Flat age (22) exceeds maximum (20 years)

---

## 📊 TEST MATRIX

| # | Type | Employment | Purpose | Expected |
|---|------|------------|---------|----------|
| 1 | Single | Salaried | Purchase | ✅ Eligible |
| 2 | Single | Business | Construction | ✅ Eligible + Guarantor |
| 3 | Single | Agriculture | Repairs | ✅ Eligible (15yr/30L cap) |
| 4 | Single | Salaried | Purchase | ✅ NTC gets 8.25% |
| 5 | Joint | Both Salaried | Purchase | ✅ 65% Rule |
| 6 | Joint | Mixed | Plot+Const | ✅ Plot ≤50% |
| 7 | Single | Salaried | Takeover | ✅ Outstanding Limit |
| 8 | Single | Any | Any | ❌ Low CIBIL |
| 9 | Single | Any | Any | ❌ CIBIL Adverse |
| 10 | Single | Any | Purchase | ❌ Property Too Old |

---

## ✅ HOW TO TEST

1. Open http://localhost:5173/housing-loan
2. For each test case:
   - Enter all values exactly as shown
   - Click "Check Eligibility"
   - Compare result with expected output
3. All 10 cases should match expected results

---

**Last Updated**: 21-Dec-2024
**Circular Reference**: No. 186/2025
