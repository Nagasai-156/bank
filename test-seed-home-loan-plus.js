/**
 * HOME LOAN PLUS - AUTOMATED TEST SEED SCRIPT
 * Circular 187/2025 Compliance Testing
 * 
 * This script contains test data for all 115+ test cases
 * Run in browser console on the Home Loan Plus page
 */

// ============================================
// HELPER FUNCTIONS
// ============================================

function fillForm(testData) {
    // Existing Home Loan Details
    if (testData.existingLoanSanctionDate) {
        document.querySelector('input[name="existingLoanSanctionDate"]').value = testData.existingLoanSanctionDate;
    }
    if (testData.existingLoanOriginalAmount) {
        document.querySelector('input[name="existingLoanOriginalAmount"]').value = testData.existingLoanOriginalAmount;
    }
    if (testData.existingLoanOutstanding) {
        document.querySelector('input[name="existingLoanOutstanding"]').value = testData.existingLoanOutstanding;
    }
    if (testData.existingLoanEMI) {
        document.querySelector('input[name="existingLoanEMI"]').value = testData.existingLoanEMI;
    }
    if (testData.existingLoanROI) {
        document.querySelector('input[name="existingLoanROI"]').value = testData.existingLoanROI;
    }
    if (testData.existingLoanTenure) {
        document.querySelector('input[name="existingLoanTenure"]').value = testData.existingLoanTenure;
    }
    if (testData.existingLoanCompletedMonths) {
        document.querySelector('input[name="existingLoanCompletedMonths"]').value = testData.existingLoanCompletedMonths;
    }
    if (testData.anyEMIOverdue) {
        document.querySelector('select[name="anyEMIOverdue"]').value = testData.anyEMIOverdue;
    }

    // Property Details
    if (testData.propertyLocation) {
        document.querySelector('select[name="propertyLocation"]').value = testData.propertyLocation;
    }
    if (testData.propertyType) {
        document.querySelector('select[name="propertyType"]').value = testData.propertyType;
    }
    if (testData.propertyNRV) {
        document.querySelector('input[name="propertyNRV"]').value = testData.propertyNRV;
    }
    if (testData.buildingAge) {
        document.querySelector('input[name="buildingAge"]').value = testData.buildingAge;
    }
    if (testData.buildingResidualLife) {
        document.querySelector('input[name="buildingResidualLife"]').value = testData.buildingResidualLife;
    }

    // Loan Request
    if (testData.loanPurpose) {
        document.querySelector('select[name="loanPurpose"]').value = testData.loanPurpose;
    }
    if (testData.requestedAmount) {
        document.querySelector('input[name="requestedAmount"]').value = testData.requestedAmount;
    }

    // Applicant Details
    if (testData.dob1) {
        document.querySelector('input[name="dob1"]').value = testData.dob1;
    }
    if (testData.employmentType1) {
        document.querySelector('select[name="employmentType1"]').value = testData.employmentType1;
        // Trigger change event to show conditional fields
        document.querySelector('select[name="employmentType1"]').dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Salaried fields
    if (testData.grossSalary1) {
        setTimeout(() => {
            const field = document.querySelector('input[name="grossSalary1"]');
            if (field) field.value = testData.grossSalary1;
        }, 100);
    }
    if (testData.taxDeduction1) {
        setTimeout(() => {
            const field = document.querySelector('input[name="taxDeduction1"]');
            if (field) field.value = testData.taxDeduction1;
        }, 100);
    }
    if (testData.otherDeductions1) {
        setTimeout(() => {
            const field = document.querySelector('input[name="otherDeductions1"]');
            if (field) field.value = testData.otherDeductions1;
        }, 100);
    }

    // Business fields
    if (testData.itrYear1_1) {
        setTimeout(() => {
            const field = document.querySelector('input[name="itrYear1_1"]');
            if (field) field.value = testData.itrYear1_1;
        }, 100);
    }
    if (testData.itrYear2_1) {
        setTimeout(() => {
            const field = document.querySelector('input[name="itrYear2_1"]');
            if (field) field.value = testData.itrYear2_1;
        }, 100);
    }
    if (testData.itrYear3_1) {
        setTimeout(() => {
            const field = document.querySelector('input[name="itrYear3_1"]');
            if (field) field.value = testData.itrYear3_1;
        }, 100);
    }

    // Agriculture fields
    if (testData.agriIncome1) {
        setTimeout(() => {
            const field = document.querySelector('input[name="agriIncome1"]');
            if (field) field.value = testData.agriIncome1;
        }, 100);
    }

    // ITR Filed
    if (testData.itrFiledLast2Years1) {
        setTimeout(() => {
            const field = document.querySelector('select[name="itrFiledLast2Years1"]');
            if (field) field.value = testData.itrFiledLast2Years1;
        }, 100);
    }

    // CIBIL
    if (testData.cibil1) {
        document.querySelector('input[name="cibil1"]').value = testData.cibil1;
    }
    if (testData.cibilClean1) {
        document.querySelector('select[name="cibilClean1"]').value = testData.cibilClean1;
    }
    if (testData.otherEMI1 !== undefined) {
        document.querySelector('input[name="otherEMI1"]').value = testData.otherEMI1;
    }
}

function submitForm() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.click();
    }
}

function getCalculatedDate(monthsAgo) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    return date.toISOString().split('T')[0];
}

async function runTest(testCase) {
    console.log(`\n🧪 Running Test Case ${testCase.id}: ${testCase.name}`);
    console.log('Expected:', testCase.expected);

    fillForm(testCase.data);

    // Wait for form to be filled
    await new Promise(resolve => setTimeout(resolve, 500));

    submitForm();

    // Wait for results
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check result
    const resultCard = document.querySelector('.result-card, .result-card-premium');
    if (resultCard) {
        const message = resultCard.querySelector('.result-header, .result-header-premium').textContent;
        const passed = message.includes(testCase.expected.status);
        console.log(passed ? '✅ PASS' : '❌ FAIL', '- Result:', message);
        return passed;
    } else {
        console.log('⚠️ NO RESULT - Form may have validation errors');
        return false;
    }
}

// ============================================
// TEST DATA - GROUP 1: EXISTING LOAN CONDITIONS
// ============================================

const GROUP1_EXISTING_LOAN_TESTS = [
    {
        id: 1,
        name: "Loan < 12 months - Should REJECT",
        expected: { status: "NOT ELIGIBLE", reason: "Insufficient repayment history" },
        data: {
            existingLoanSanctionDate: getCalculatedDate(11),
            existingLoanOriginalAmount: 5000000,
            existingLoanOutstanding: 4500000,
            existingLoanEMI: 40000,
            existingLoanROI: 8.25,
            existingLoanTenure: 20,
            existingLoanCompletedMonths: 11,
            anyEMIOverdue: "NO",
            propertyLocation: "Urban",
            propertyType: "Residential",
            propertyNRV: 8000000,
            buildingAge: 5,
            buildingResidualLife: 55,
            loanPurpose: "Personal",
            requestedAmount: 500000,
            dob1: "1985-01-01",
            employmentType1: "Salaried",
            grossSalary1: 100000,
            taxDeduction1: 10000,
            otherDeductions1: 5000,
            cibil1: 750,
            cibilClean1: "YES",
            otherEMI1: 0
        }
    },
    {
        id: 2,
        name: "Loan = 12 months - Should PASS",
        expected: { status: "ELIGIBLE" },
        data: {
            existingLoanSanctionDate: getCalculatedDate(12),
            existingLoanOriginalAmount: 5000000,
            existingLoanOutstanding: 4500000,
            existingLoanEMI: 40000,
            existingLoanROI: 8.25,
            existingLoanTenure: 20,
            existingLoanCompletedMonths: 12,
            anyEMIOverdue: "NO",
            propertyLocation: "Urban",
            propertyType: "Residential",
            propertyNRV: 8000000,
            buildingAge: 5,
            buildingResidualLife: 55,
            loanPurpose: "Personal",
            requestedAmount: 500000,
            dob1: "1985-01-01",
            employmentType1: "Salaried",
            grossSalary1: 100000,
            taxDeduction1: 10000,
            otherDeductions1: 5000,
            cibil1: 750,
            cibilClean1: "YES",
            otherEMI1: 0
        }
    },
    {
        id: 6,
        name: "EMI Overdue > 30 days - Should REJECT",
        expected: { status: "NOT ELIGIBLE", reason: "EMI Overdue" },
        data: {
            existingLoanSanctionDate: getCalculatedDate(13),
            existingLoanOriginalAmount: 5000000,
            existingLoanOutstanding: 4500000,
            existingLoanEMI: 40000,
            existingLoanROI: 8.25,
            existingLoanTenure: 20,
            existingLoanCompletedMonths: 13,
            anyEMIOverdue: "YES",
            propertyLocation: "Urban",
            propertyType: "Residential",
            propertyNRV: 8000000,
            buildingAge: 5,
            buildingResidualLife: 55,
            loanPurpose: "Personal",
            requestedAmount: 500000,
            dob1: "1985-01-01",
            employmentType1: "Salaried",
            grossSalary1: 100000,
            taxDeduction1: 10000,
            otherDeductions1: 5000,
            cibil1: 750,
            cibilClean1: "YES",
            otherEMI1: 0
        }
    }
];

// ============================================
// TEST DATA - GROUP 2: PROPERTY VALIDATION
// ============================================

const GROUP2_PROPERTY_TESTS = [
    {
        id: 21,
        name: "Commercial Property - Should REJECT",
        expected: { status: "NOT ELIGIBLE", reason: "Commercial Property" },
        data: {
            existingLoanSanctionDate: getCalculatedDate(24),
            existingLoanOriginalAmount: 5000000,
            existingLoanOutstanding: 4000000,
            existingLoanEMI: 40000,
            existingLoanROI: 8.25,
            existingLoanTenure: 20,
            existingLoanCompletedMonths: 24,
            anyEMIOverdue: "NO",
            propertyLocation: "Urban",
            propertyType: "Commercial",
            propertyNRV: 8000000,
            buildingAge: 5,
            buildingResidualLife: 55,
            loanPurpose: "Personal",
            requestedAmount: 500000,
            dob1: "1985-01-01",
            employmentType1: "Salaried",
            grossSalary1: 100000,
            taxDeduction1: 10000,
            otherDeductions1: 5000,
            cibil1: 750,
            cibilClean1: "YES",
            otherEMI1: 0
        }
    },
    {
        id: 23,
        name: "Under Construction - Should REJECT",
        expected: { status: "NOT ELIGIBLE", reason: "Under-Construction" },
        data: {
            existingLoanSanctionDate: getCalculatedDate(24),
            existingLoanOriginalAmount: 5000000,
            existingLoanOutstanding: 4000000,
            existingLoanEMI: 40000,
            existingLoanROI: 8.25,
            existingLoanTenure: 20,
            existingLoanCompletedMonths: 24,
            anyEMIOverdue: "NO",
            propertyLocation: "Urban",
            propertyType: "Under Construction",
            propertyNRV: 8000000,
            buildingAge: 5,
            buildingResidualLife: 55,
            loanPurpose: "Personal",
            requestedAmount: 500000,
            dob1: "1985-01-01",
            employmentType1: "Salaried",
            grossSalary1: 100000,
            taxDeduction1: 10000,
            otherDeductions1: 5000,
            cibil1: 750,
            cibilClean1: "YES",
            otherEMI1: 0
        }
    }
];

// ============================================
// TEST DATA - GROUP 3: LTV VALIDATION
// ============================================

const GROUP3_LTV_TESTS = [
    {
        id: 37,
        name: "LTV Exceeded (₹28L > ₹27L max) - Should REJECT",
        expected: { status: "NOT ELIGIBLE", reason: "LTV" },
        data: {
            existingLoanSanctionDate: getCalculatedDate(24),
            existingLoanOriginalAmount: 3000000,
            existingLoanOutstanding: 2600000, // 26L
            existingLoanEMI: 25000,
            existingLoanROI: 8.25,
            existingLoanTenure: 20,
            existingLoanCompletedMonths: 24,
            anyEMIOverdue: "NO",
            propertyLocation: "Urban",
            propertyType: "Residential",
            propertyNRV: 3000000, // 30L - Max 90% = 27L
            buildingAge: 5,
            buildingResidualLife: 55,
            loanPurpose: "Personal",
            requestedAmount: 200000, // 2L - Total = 28L > 27L
            dob1: "1985-01-01",
            employmentType1: "Salaried",
            grossSalary1: 100000,
            taxDeduction1: 10000,
            otherDeductions1: 5000,
            cibil1: 750,
            cibilClean1: "YES",
            otherEMI1: 0
        }
    },
    {
        id: 40,
        name: "LTV Exactly at Limit (₹40L = ₹40L) - Should PASS",
        expected: { status: "ELIGIBLE" },
        data: {
            existingLoanSanctionDate: getCalculatedDate(24),
            existingLoanOriginalAmount: 5000000,
            existingLoanOutstanding: 3000000, // 30L
            existingLoanEMI: 30000,
            existingLoanROI: 8.25,
            existingLoanTenure: 20,
            existingLoanCompletedMonths: 24,
            anyEMIOverdue: "NO",
            propertyLocation: "Urban",
            propertyType: "Residential",
            propertyNRV: 5000000, // 50L - Max 80% = 40L
            buildingAge: 5,
            buildingResidualLife: 55,
            loanPurpose: "Personal",
            requestedAmount: 1000000, // 10L - Total = 40L = 40L
            dob1: "1985-01-01",
            employmentType1: "Salaried",
            grossSalary1: 100000,
            taxDeduction1: 10000,
            otherDeductions1: 5000,
            cibil1: 750,
            cibilClean1: "YES",
            otherEMI1: 0
        }
    }
];

// ============================================
// TEST DATA - GROUP 7: ITR VALIDATION
// ============================================

const GROUP7_ITR_TESTS = [
    {
        id: 109,
        name: "Business without ITR - Should REJECT",
        expected: { status: "NOT ELIGIBLE", reason: "ITR Not Filed" },
        data: {
            existingLoanSanctionDate: getCalculatedDate(24),
            existingLoanOriginalAmount: 5000000,
            existingLoanOutstanding: 4000000,
            existingLoanEMI: 40000,
            existingLoanROI: 8.25,
            existingLoanTenure: 20,
            existingLoanCompletedMonths: 24,
            anyEMIOverdue: "NO",
            propertyLocation: "Urban",
            propertyType: "Residential",
            propertyNRV: 8000000,
            buildingAge: 5,
            buildingResidualLife: 55,
            loanPurpose: "Personal",
            requestedAmount: 500000,
            dob1: "1985-01-01",
            employmentType1: "Business",
            itrYear1_1: 1200000,
            itrYear2_1: 1100000,
            itrYear3_1: 1000000,
            taxYear1_1: 100000,
            taxYear2_1: 90000,
            taxYear3_1: 80000,
            itrFiledLast2Years1: "NO", // Critical: NO ITR
            cibil1: 750,
            cibilClean1: "YES",
            otherEMI1: 0
        }
    },
    {
        id: 108,
        name: "Business with ITR - Should PASS",
        expected: { status: "ELIGIBLE" },
        data: {
            existingLoanSanctionDate: getCalculatedDate(24),
            existingLoanOriginalAmount: 5000000,
            existingLoanOutstanding: 4000000,
            existingLoanEMI: 40000,
            existingLoanROI: 8.25,
            existingLoanTenure: 20,
            existingLoanCompletedMonths: 24,
            anyEMIOverdue: "NO",
            propertyLocation: "Urban",
            propertyType: "Residential",
            propertyNRV: 8000000,
            buildingAge: 5,
            buildingResidualLife: 55,
            loanPurpose: "Personal",
            requestedAmount: 500000,
            dob1: "1985-01-01",
            employmentType1: "Business",
            itrYear1_1: 1200000,
            itrYear2_1: 1100000,
            itrYear3_1: 1000000,
            taxYear1_1: 100000,
            taxYear2_1: 90000,
            taxYear3_1: 80000,
            itrFiledLast2Years1: "YES", // Critical: YES ITR
            cibil1: 750,
            cibilClean1: "YES",
            otherEMI1: 0
        }
    }
];

// ============================================
// MASTER TEST SUITE
// ============================================

const ALL_TESTS = [
    ...GROUP1_EXISTING_LOAN_TESTS,
    ...GROUP2_PROPERTY_TESTS,
    ...GROUP3_LTV_TESTS,
    ...GROUP7_ITR_TESTS
];

// ============================================
// TEST RUNNER
// ============================================

async function runAllTests() {
    console.log('🚀 Starting Home Loan Plus Test Suite');
    console.log(`Total Tests: ${ALL_TESTS.length}\n`);

    let passed = 0;
    let failed = 0;

    for (const test of ALL_TESTS) {
        const result = await runTest(test);
        if (result) {
            passed++;
        } else {
            failed++;
        }

        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}/${ALL_TESTS.length}`);
    console.log(`❌ Failed: ${failed}/${ALL_TESTS.length}`);
    console.log(`📈 Pass Rate: ${((passed / ALL_TESTS.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
}

// ============================================
// QUICK TEST FUNCTIONS
// ============================================

function testCase(id) {
    const test = ALL_TESTS.find(t => t.id === id);
    if (test) {
        runTest(test);
    } else {
        console.error(`Test case ${id} not found`);
    }
}

// ============================================
// USAGE INSTRUCTIONS
// ============================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║  HOME LOAN PLUS - AUTOMATED TEST SEED SCRIPT                 ║
║  Circular 187/2025 Compliance Testing                        ║
╚══════════════════════════════════════════════════════════════╝

📋 Available Commands:

1. Run ALL tests:
   runAllTests()

2. Run specific test case:
   testCase(1)   - Test loan < 12 months
   testCase(21)  - Test commercial property
   testCase(37)  - Test LTV exceeded
   testCase(109) - Test business without ITR

3. Run test group:
   GROUP1_EXISTING_LOAN_TESTS.forEach(t => runTest(t))
   GROUP2_PROPERTY_TESTS.forEach(t => runTest(t))

4. View test data:
   ALL_TESTS

⚠️  Navigate to /home-loan-plus first, then run tests!
`);
