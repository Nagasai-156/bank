# 🏠 APGB HOME LOAN - PURPOSE-SPECIFIC FIELDS IMPLEMENTATION

## Purpose-Based Field Mapping (Circular No. 186)

### 1. Purchase
**Fields Shown:**
- Property Type (Flat/Building)
- Property Location
- Property Age
- Sale Agreement Value
- Valuer Realizable Value
- Pending Works Cost

**Logic:** `Project Cost = MIN(Sale Agreement, Realizable) + Pending Works`

### 2. Construction
**Fields Shown:**
- Property Location
- Estimated Construction Cost

**Logic:** `Project Cost = Estimated Construction Cost`

### 3. Plot + Construction
**Fields Shown:**
- Property Location
- Sale Agreement Value - Plot
- Estimated Construction Cost

**Logic:** `Project Cost = Plot + Construction`
**Rule:** Plot ≤ 50% of total eligible loan

### 4. Repairs/Renovation (Merged)
**Fields Shown:**
- Property Location
- Estimated Repairs/Renovation Cost

**Hard Rules:**
- Max Loan: ₹30 Lakhs
- Max Tenure: 15 years
- Property must be ≥ 3 years old

### 5. Takeover
**Fields Shown:**
- Property Type (Flat/Building)
- Property Location
- Property Age
- Outstanding Loan Amount
- Valuer Realizable Value

**Logic:** `Eligible = MIN(Outstanding, LTV × Realizable)`

---

## Implementation Status
- ✅ 5 purposes defined
- ✅ Conditional rendering logic ready
- ✅ Branch Estimate removed
- ✅ Repairs + Renovation merged
- 🔄 Code update in progress
