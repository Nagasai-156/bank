# 🧪 STAFF VEHICLE LOAN - COMPREHENSIVE TEST CASES

Based on Circular No. 347-2022-BC-STF

## Test Case Categories

### ✅ ELIGIBLE CASES (Should Pass)
### ❌ INELIGIBLE CASES (Should Fail with Specific Reason)

---

## 1️⃣ BASIC ELIGIBLE CASES

### Test Case 1: Perfect Workmen - 4W New
- Age: 35
- Confirmed: YES
- Service: 5
- Cadre: Workmen
- Gross: 50,000
- NTH: 25,000
- Housing: NO
- Vehicle Type: 4W
- Condition: NEW
- Cost: 8,00,000
- Existing Loan Closed: YES
- Liabilities Regular: YES
- ACR Filed: YES

**Expected Result:**
- ✅ ELIGIBLE
- Final Loan: ₹7,60,000 (95% of cost)
- Cadre Max: ₹8,00,000
- Margin: ₹40,000
- Tenure: 200 months
- EMI: ~₹5,320/month

---

### Test Case 2: Scale I Officer - 4W New (Max Limit)
- Age: 40
- Confirmed: YES
- Service: 10
- Cadre: Scale1
- Gross: 80,000
- NTH: 40,000
- Housing: NO
- Vehicle Type: 4W
- Condition: NEW
- Cost: 18,50,000
- Existing Loan Closed: YES
- Liabilities Regular: YES
- ACR Filed: YES

**Expected Result:**
- ✅ ELIGIBLE
- Final Loan: ₹12,00,000 (Cadre cap, not 95% of cost)
- Eligible by Cost: ₹17,57,500
- Margin: ₹6,50,000
- Tenure: 200 months
- EMI: ~₹8,400/month

---

### Test Case 3: Scale V Officer - 4W New (Premium)
- Age: 45
- Confirmed: YES
- Service: 20
- Cadre: Scale5
- Gross: 1,50,000
- NTH: 75,000
- Housing: NO
- Vehicle Type: 4W
- Condition: NEW
- Cost: 25,00,000
- Existing Loan Closed: YES
- Liabilities Regular: YES
- ACR Filed: YES

**Expected Result:**
- ✅ ELIGIBLE
- Final Loan: ₹15,00,000 (Cadre cap)
- Eligible by Cost: ₹23,75,000
- Margin: ₹10,00,000
- Tenure: 180 months (age limit)
- EMI: ~₹11,667/month

---

### Test Case 4: Two Wheeler - New
- Age: 28
- Confirmed: YES
- Service: 3
- Cadre: Workmen
- Gross: 30,000
- NTH: 15,000
- Housing: NO
- Vehicle Type: 2W
- Condition: NEW
- Cost: 1,50,000
- Existing Loan Closed: YES
- Liabilities Regular: YES
- ACR Filed: YES

**Expected Result:**
- ✅ ELIGIBLE
- Final Loan: ₹1,42,500 (95% of cost)
- Cadre Max: ₹2,00,000
- Margin: ₹7,500
- Tenure: 84 months
- EMI: ~₹2,200/month

---

### Test Case 5: Used 4W - 3 Years Old
- Age: 38
- Confirmed: YES
- Service: 8
- Cadre: Scale2
- Gross: 70,000
- NTH: 35,000
- Housing: NO
- Vehicle Type: 4W
- Condition: USED
- Vehicle Age: 3
- Cost: 10,00,000
- Existing Loan Closed: YES
- Liabilities Regular: YES
- ACR Filed: YES

**Expected Result:**
- ✅ ELIGIBLE
- Final Loan: ₹8,00,000 (80% of cost)
- Cadre Max: ₹12,00,000
- Margin: ₹2,00,000
- Tenure: 200 months
- EMI: ~₹5,600/month

---

### Test Case 6: With Housing Loan (30% NTH Rule)
- Age: 42
- Confirmed: YES
- Service: 15
- Cadre: Scale3
- Gross: 90,000
- NTH: 30,000 (33.33% - should pass)
- Housing: YES
- Vehicle Type: 4W
- Condition: NEW
- Cost: 12,00,000
- Existing Loan Closed: YES
- Liabilities Regular: YES
- ACR Filed: YES

**Expected Result:**
- ✅ ELIGIBLE
- NTH Required: ₹27,000 (30% of gross)
- Final Loan: ₹11,40,000
- Tenure: 200 months

---

## 2️⃣ ELIGIBILITY FAILURES

### Test Case 7: NOT CONFIRMED
- Age: 30
- Confirmed: NO ❌
- Service: 5
- Cadre: Workmen
- Gross: 50,000
- NTH: 25,000

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Must be a Confirmed Employee"

---

### Test Case 8: INSUFFICIENT SERVICE (< 2 years)
- Age: 25
- Confirmed: YES
- Service: 1.5 ❌
- Cadre: Scale1
- Gross: 60,000
- NTH: 30,000

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Insufficient Years of Service"

---

### Test Case 9: AGE = 60 (Boundary)
- Age: 60 ❌
- Confirmed: YES
- Service: 30
- Cadre: Scale5
- Gross: 1,50,000
- NTH: 80,000

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Age Limit Exceeded"

---

### Test Case 10: AGE = 59 (Should Pass Age Check)
- Age: 59 ✅
- Confirmed: YES
- Service: 30
- Cadre: Scale5
- Gross: 1,50,000
- NTH: 80,000
- Housing: NO
- Vehicle Type: 4W
- Condition: NEW
- Cost: 15,00,000
- Existing Loan Closed: YES
- Liabilities Regular: YES
- ACR Filed: YES

**Expected Result:**
- ✅ ELIGIBLE
- Tenure: 12 months (only 1 year to retirement)
- Final Loan: ₹14,25,000

---

### Test Case 11: NTH FAILURE (40% Rule)
- Age: 35
- Confirmed: YES
- Service: 5
- Cadre: Workmen
- Gross: 50,000
- NTH: 19,000 ❌ (Need 20,000)
- Housing: NO

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Net Take Home Insufficient"
- Required: ₹20,000
- Actual: ₹19,000

---

### Test Case 12: NTH FAILURE (30% Rule with Housing)
- Age: 40
- Confirmed: YES
- Service: 10
- Cadre: Scale2
- Gross: 80,000
- NTH: 23,000 ❌ (Need 24,000)
- Housing: YES

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Net Take Home Insufficient"
- Required: ₹24,000
- Actual: ₹23,000

---

### Test Case 13: USED TWO WHEELER ❌
- Age: 30
- Confirmed: YES
- Service: 5
- Cadre: Workmen
- Gross: 40,000
- NTH: 20,000
- Housing: NO
- Vehicle Type: 2W
- Condition: USED ❌

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Used Two Wheelers Not Allowed"

---

### Test Case 14: USED 4W - TOO OLD (> 5 years)
- Age: 38
- Confirmed: YES
- Service: 8
- Cadre: Scale2
- Gross: 70,000
- NTH: 35,000
- Housing: NO
- Vehicle Type: 4W
- Condition: USED
- Vehicle Age: 6 ❌

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Used Vehicle Too Old"

---

### Test Case 15: EXISTING LOAN NOT CLOSED
- Age: 35
- Confirmed: YES
- Service: 5
- Cadre: Workmen
- Gross: 50,000
- NTH: 25,000
- Housing: NO
- Existing Loan Closed: NO ❌

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Existing Vehicle Loan Not Closed"

---

### Test Case 16: IRREGULAR LIABILITIES
- Age: 35
- Confirmed: YES
- Service: 5
- Cadre: Workmen
- Gross: 50,000
- NTH: 25,000
- Housing: NO
- Existing Loan Closed: YES
- Liabilities Regular: NO ❌

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "Irregular Liabilities"

---

### Test Case 17: ACR NOT FILED
- Age: 35
- Confirmed: YES
- Service: 5
- Cadre: Workmen
- Gross: 50,000
- NTH: 25,000
- Housing: NO
- Existing Loan Closed: YES
- Liabilities Regular: YES
- ACR Filed: NO ❌

**Expected Result:**
- ❌ NOT ELIGIBLE
- Reason: "ACR/Assets Not Filed"

---

## 3️⃣ EDGE CASES

### Test Case 18: Exactly 2 Years Service (Boundary)
- Age: 30
- Confirmed: YES
- Service: 2.0 ✅
- Cadre: Workmen
- Gross: 50,000
- NTH: 25,000
- Housing: NO
- Vehicle Type: 4W
- Condition: NEW
- Cost: 8,00,000
- All other: YES

**Expected Result:**
- ✅ ELIGIBLE

---

### Test Case 19: NTH Exactly at Limit (40%)
- Age: 35
- Confirmed: YES
- Service: 5
- Cadre: Workmen
- Gross: 50,000
- NTH: 20,000 ✅ (Exactly 40%)
- Housing: NO

**Expected Result:**
- ✅ ELIGIBLE

---

### Test Case 20: NTH Exactly at Limit (30% with Housing)
- Age: 40
- Confirmed: YES
- Service: 10
- Cadre: Scale2
- Gross: 80,000
- NTH: 24,000 ✅ (Exactly 30%)
- Housing: YES

**Expected Result:**
- ✅ ELIGIBLE

---

### Test Case 21: Cost Exactly at 2W Limit
- Age: 28
- Confirmed: YES
- Service: 3
- Cadre: Workmen
- Gross: 30,000
- NTH: 15,000
- Housing: NO
- Vehicle Type: 2W
- Condition: NEW
- Cost: 2,10,526 (95% = 2,00,000)

**Expected Result:**
- ✅ ELIGIBLE
- Final Loan: ₹2,00,000 (Cadre cap)

---

### Test Case 22: Age 59 - Limited Tenure
- Age: 59
- Confirmed: YES
- Service: 30
- Cadre: Scale4
- Gross: 1,20,000
- NTH: 60,000
- Housing: NO
- Vehicle Type: 4W
- Condition: NEW
- Cost: 15,00,000
- All other: YES

**Expected Result:**
- ✅ ELIGIBLE
- Tenure: 12 months (not 200)
- Higher EMI due to short tenure

---

### Test Case 23: Age 55 - Partial Tenure
- Age: 55
- Confirmed: YES
- Service: 25
- Cadre: Scale3
- Gross: 90,000
- NTH: 45,000
- Housing: NO
- Vehicle Type: 4W
- Condition: NEW
- Cost: 12,00,000
- All other: YES

**Expected Result:**
- ✅ ELIGIBLE
- Tenure: 60 months (5 years to retirement)

---

## 4️⃣ CADRE CAP TESTS

### Test Case 24: Workmen - Hitting Cadre Cap
- Age: 35
- Confirmed: YES
- Service: 10
- Cadre: Workmen
- Gross: 60,000
- NTH: 30,000
- Housing: NO
- Vehicle Type: 4W
- Condition: NEW
- Cost: 10,00,000 (95% = 9,50,000)

**Expected Result:**
- ✅ ELIGIBLE
- Final Loan: ₹8,00,000 (Cadre cap, not cost)
- Margin: ₹2,00,000

---

### Test Case 25: Scale I-III - Hitting Cadre Cap
- Age: 38
- Confirmed: YES
- Service: 12
- Cadre: Scale2
- Gross: 85,000
- NTH: 42,500
- Housing: NO
- Vehicle Type: 4W
- Condition: NEW
- Cost: 20,00,000 (95% = 19,00,000)

**Expected Result:**
- ✅ ELIGIBLE
- Final Loan: ₹12,00,000 (Cadre cap)
- Margin: ₹8,00,000

---

### Test Case 26: Scale IV-V - Hitting Cadre Cap
- Age: 48
- Confirmed: YES
- Service: 22
- Cadre: Scale5
- Gross: 1,80,000
- NTH: 90,000
- Housing: NO
- Vehicle Type: 4W
- Condition: NEW
- Cost: 30,00,000 (95% = 28,50,000)

**Expected Result:**
- ✅ ELIGIBLE
- Final Loan: ₹15,00,000 (Cadre cap)
- Margin: ₹15,00,000

---

## 5️⃣ PERCENTAGE TESTS

### Test Case 27: New 4W - 95% Rule
- Cost: 10,00,000
- Condition: NEW
- Expected Eligible by Cost: ₹9,50,000

---

### Test Case 28: Used 4W - 80% Rule
- Cost: 10,00,000
- Condition: USED
- Vehicle Age: 4
- Expected Eligible by Cost: ₹8,00,000

---

### Test Case 29: New 2W - 95% Rule
- Cost: 1,50,000
- Condition: NEW
- Expected Eligible by Cost: ₹1,42,500

---

## 6️⃣ TENURE & EMI TESTS

### Test Case 30: 4W - Full 200 Months
- Age: 30
- Loan: ₹12,00,000
- Expected Tenure: 200 months
- Expected Interest: ₹14,00,000
- Expected Total: ₹26,00,000
- Expected EMI: ₹13,000/month

---

### Test Case 31: 2W - Full 84 Months
- Age: 30
- Loan: ₹1,50,000
- Expected Tenure: 84 months
- Expected Interest: ₹73,500
- Expected Total: ₹2,23,500
- Expected EMI: ₹2,661/month

---

## 📊 SUMMARY

Total Test Cases: 31+

### Categories:
- ✅ Eligible Cases: 15
- ❌ Ineligibility Tests: 11
- 🔍 Edge Cases: 5
- 📈 Boundary Tests: Multiple

### Coverage:
- All 6 eligibility checks ✅
- NTH rules (30% & 40%) ✅
- Vehicle type rules ✅
- Cadre caps ✅
- Percentage rules ✅
- Tenure calculations ✅
- Age boundaries ✅
- Used vehicle age limits ✅

---

## 🎯 VALIDATION CHECKLIST

When testing, verify:
1. ✅ Correct eligibility decision
2. ✅ Accurate rejection reason
3. ✅ Proper loan amount (MIN of cadre cap & cost %)
4. ✅ Correct margin calculation
5. ✅ Accurate tenure (considering age)
6. ✅ Correct EMI with simple interest
7. ✅ All output fields populated
8. ✅ NTH validation working
9. ✅ Edge cases handled
10. ✅ No rounding errors
