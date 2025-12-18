# 🏦 Staff Vehicle Loan Calculator

A professional, circular-accurate vehicle loan calculator for bank staff based on **Circular No. 347-2022-BC-STF**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646cff.svg)

## 🌟 Features

- ✅ **Complete Eligibility Validation** - All 6 circular-mandated checks
- ✅ **NTH (Net Take Home) Rules** - 30% and 40% validation
- ✅ **Vehicle Type Rules** - 2W/4W with new/used conditions
- ✅ **Cadre-Based Limits** - Workmen, Scale I-V specific caps
- ✅ **Accurate EMI Calculation** - 7% p.a simple interest
- ✅ **Age-Based Tenure** - Automatic adjustment for retirement
- ✅ **Edge Case Handling** - All circular edge cases covered
- ✅ **Clean Modern UI** - Professional white theme
- ✅ **Responsive Design** - Works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Nagasai-156/bank.git

# Navigate to project directory
cd bank

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

## 📋 Loan Eligibility Criteria

### Hard Requirements (All Must Pass)

1. **Confirmed Employee** - Must be YES
2. **Years of Service** - Minimum 2 years
3. **Age Limit** - Must be < 60 years
4. **Existing Loan** - Previous vehicle loan must be closed
5. **Liabilities** - All liabilities must be regular
6. **ACR/Assets** - Must be filed

### Net Take Home (NTH) Rules

- **Without Housing Loan**: NTH ≥ 40% of Gross Salary
- **With Housing Loan**: NTH ≥ 30% of Gross Salary

### Loan Limits by Cadre

| Cadre | Four Wheeler | Two Wheeler |
|-------|--------------|-------------|
| Workmen | ₹8,00,000 | ₹2,00,000 |
| Officer Scale I-III | ₹12,00,000 | ₹2,00,000 |
| Officer Scale IV-V | ₹15,00,000 | ₹2,00,000 |

### Vehicle Type Rules

#### Four Wheeler
- **New**: 95% of cost (max cadre limit)
- **Used**: 80% of cost, max 5 years old

#### Two Wheeler
- **New**: 95% of cost (max ₹2,00,000)
- **Used**: ❌ Not Allowed

### Interest & Tenure

- **Rate of Interest**: 7% p.a (Simple Interest)
- **Four Wheeler Tenure**: Max 200 months
- **Two Wheeler Tenure**: Max 84 months
- **Age Restriction**: Tenure cannot extend beyond age 60

## 🧮 Calculation Formula

### Final Loan Amount
```
Final Loan = MIN(Cadre Maximum Limit, Vehicle Cost × Percentage)
```

### EMI Calculation (Simple Interest)
```
Total Interest = Loan × 7% × (Months / 12)
Total Payable = Loan + Total Interest
EMI = Total Payable / Months
```

### Tenure Adjustment
```
Months to Retirement = (60 - Current Age) × 12
Actual Tenure = MIN(Max Tenure, Months to Retirement)
```

## 📊 Example Scenarios

### Scenario 1: Eligible Case
- **Employee**: Officer Scale I, Age 35, 5 years service
- **Salary**: Gross ₹80,000, NTH ₹40,000
- **Vehicle**: 4W New, Cost ₹18,50,000
- **Result**: ✅ Eligible for ₹12,00,000 (Cadre cap)

### Scenario 2: Ineligible - Used 2W
- **Employee**: Workmen, Age 30, 5 years service
- **Vehicle**: 2W Used
- **Result**: ❌ Not Eligible - Used two-wheelers not allowed

### Scenario 3: Ineligible - NTH Failure
- **Employee**: Workmen, Age 35, 5 years service
- **Salary**: Gross ₹50,000, NTH ₹19,000
- **Result**: ❌ Not Eligible - NTH below required ₹20,000

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Vanilla CSS with CSS Variables
- **Font**: Inter (Google Fonts)
- **Language**: JavaScript (ES6+)

## 📁 Project Structure

```
bank/
├── src/
│   ├── App.jsx              # Main component with calculation logic
│   ├── App.css              # Component styles
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── TEST_CASES.md            # 31+ comprehensive test cases
├── IMPLEMENTATION_SUMMARY.md # Complete documentation
└── README.md                # This file
```

## 🧪 Testing

Comprehensive test cases are documented in `TEST_CASES.md`, covering:

- ✅ 15+ Eligible scenarios
- ❌ 11+ Ineligibility tests
- 🔍 5+ Edge cases
- 📈 Multiple boundary conditions

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Nagasai**

## 🙏 Acknowledgments

- Based on Circular No. 347-2022-BC-STF
- Built with React and Vite
- Designed for banking staff loan processing

---

**Note**: This calculator is for estimation purposes. Final loan approval is subject to bank policies and circular guidelines.
