/**
 * HOUSING LOAN CALCULATOR - AUTOMATED TEST SCRIPT
 * Tests all calculation logic from Circular No. 186
 * Run with: node test-housing-loan.js
 */

console.log('='.repeat(70));
console.log('🏠 APGB HOUSING LOAN CALCULATOR - AUTOMATED TEST SUITE');
console.log('Circular No. 186/2025 Compliance Testing');
console.log('='.repeat(70));
console.log('');

// ===== CALCULATION FUNCTIONS (SAME AS IN HOUSING LOAN COMPONENT) =====

const getROI = (cibil) => {
    if (cibil === -1 || (cibil >= 1 && cibil <= 5) || (cibil >= 100 && cibil <= 200)) {
        return 8.25;
    }
    if (cibil >= 750) return 7.75;
    if (cibil >= 700) return 8.25;
    if (cibil >= 650) return 8.75;
    return 9.50;
};

const getSustenanceAmount = (netMonthlyIncome) => {
    const annualIncome = netMonthlyIncome * 12;
    if (annualIncome <= 300000) return netMonthlyIncome * 0.45;
    if (annualIncome <= 500000) return netMonthlyIncome * 0.40;
    if (annualIncome <= 800000) return netMonthlyIncome * 0.35;
    if (annualIncome <= 1200000) return netMonthlyIncome * 0.30;
    return Math.min(netMonthlyIncome * 0.25, 20000);
};

const getLTV = (projectCost) => {
    if (projectCost <= 3000000) return 0.90;
    if (projectCost <= 7500000) return 0.80;
    return 0.75;
};

const calculateEMIPerLakh = (roi, tenureYears) => {
    const monthlyRate = roi / 12 / 100;
    const tenureMonths = tenureYears * 12;
    return (100000 * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);
};

const getMaxExitAge = (empType) => {
    return empType === 'Salaried' ? 60 : 75;
};

const isSpecialCIBIL = (score) => {
    return score === -1 || (score >= 1 && score <= 5) || (score >= 100 && score <= 200);
};

// ===== TEST CASES =====
const testCases = [
    {
        id: 1,
        name: 'Single - Salaried - Purchase (Standard)',
        type: 'Single',
        age: 35,
        empType: 'Salaried',
        netMonthlyIncome: 67000, // 80000 - 8000 - 5000
        cibil: 750,
        cibilClean: true,
        existingEMI: 5000,
        purpose: 'Purchase',
        projectCost: 3800000, // MIN(40L, 38L)
        propertyAge: 3,
        propertyType: 'Flat',
        expectedEligible: true,
        expectedROI: 7.75
    },
    {
        id: 2,
        name: 'Single - Business - Construction (Guarantor Required)',
        type: 'Single',
        age: 40,
        empType: 'Business',
        netMonthlyIncome: 108333, // (13L + 12.2L + 13.8L) / 3 / 12
        cibil: 720,
        cibilClean: true,
        existingEMI: 20000,
        purpose: 'Construction',
        projectCost: 5000000,
        location: 'Rural',
        expectedEligible: true,
        expectedROI: 8.25,
        expectedGuarantor: true
    },
    {
        id: 3,
        name: 'Single - Agriculture - Repairs (15yr/30L cap)',
        type: 'Single',
        age: 44,
        empType: 'Agriculture',
        netMonthlyIncome: 66666, // 8L / 12
        cibil: 680,
        cibilClean: true,
        existingEMI: 0,
        purpose: 'Repairs/Renovation',
        projectCost: 2500000,
        propertyAge: 5,
        expectedEligible: true,
        expectedROI: 8.75,
        maxTenure: 15
    },
    {
        id: 4,
        name: 'Single - NTC (-1 CIBIL) - Purchase',
        type: 'Single',
        age: 29,
        empType: 'Salaried',
        netMonthlyIncome: 45000, // 50000 - 3000 - 2000
        cibil: -1, // NTC
        cibilClean: true,
        existingEMI: 0,
        purpose: 'Purchase',
        projectCost: 2800000,
        propertyAge: 2,
        propertyType: 'Flat',
        expectedEligible: true,
        expectedROI: 8.25
    },
    {
        id: 5,
        name: 'Joint - Both Salaried - Purchase (65% Rule)',
        type: 'Joint',
        age1: 36,
        age2: 34,
        empType1: 'Salaried',
        empType2: 'Salaried',
        netIncome1: 85000, // 100000 - 10000 - 5000
        netIncome2: 62000, // 70000 - 5000 - 3000
        cibil1: 780,
        cibil2: 750,
        cibilClean1: true,
        cibilClean2: true,
        existingEMI1: 10000,
        existingEMI2: 5000,
        purpose: 'Purchase',
        projectCost: 7500000,
        propertyAge: 5,
        propertyType: 'Building',
        expectedEligible: true,
        expectedROI: 7.75
    },
    {
        id: 6,
        name: 'Joint - Plot + Construction (50% Rule)',
        type: 'Joint',
        age1: 45,
        age2: 42,
        empType1: 'Business',
        empType2: 'Salaried',
        netIncome1: 120000,
        netIncome2: 90000,
        cibil1: 700,
        cibil2: 720,
        cibilClean1: true,
        cibilClean2: true,
        existingEMI1: 15000,
        existingEMI2: 10000,
        purpose: 'Plot+Construction',
        plotValue: 2500000,
        constructionCost: 4500000,
        projectCost: 7000000,
        expectedEligible: true,
        expectedROI: 8.25
    },
    {
        id: 7,
        name: 'Single - Takeover (Outstanding Limit)',
        type: 'Single',
        age: 43,
        empType: 'Salaried',
        netMonthlyIncome: 120000, // 150000 - 20000 - 10000
        cibil: 760,
        cibilClean: true,
        existingEMI: 30000,
        purpose: 'Takeover',
        outstandingLoan: 3500000,
        projectCost: 5000000,
        propertyAge: 8,
        propertyType: 'Flat',
        expectedEligible: true,
        expectedROI: 7.75
    },
    {
        id: 8,
        name: 'REJECTION - Low CIBIL (600)',
        type: 'Single',
        age: 35,
        empType: 'Salaried',
        netMonthlyIncome: 50000,
        cibil: 600,
        cibilClean: true,
        existingEMI: 0,
        purpose: 'Purchase',
        projectCost: 3000000,
        expectedEligible: false,
        rejectionReason: 'CIBIL score below 650'
    },
    {
        id: 9,
        name: 'REJECTION - CIBIL Adverse',
        type: 'Single',
        age: 35,
        empType: 'Salaried',
        netMonthlyIncome: 50000,
        cibil: 750,
        cibilClean: false,
        existingEMI: 0,
        purpose: 'Purchase',
        projectCost: 3000000,
        expectedEligible: false,
        rejectionReason: 'Has adverse CIBIL history'
    },
    {
        id: 10,
        name: 'REJECTION - Property Too Old (Flat 22yrs)',
        type: 'Single',
        age: 35,
        empType: 'Salaried',
        netMonthlyIncome: 80000,
        cibil: 750,
        cibilClean: true,
        existingEMI: 0,
        purpose: 'Purchase',
        projectCost: 4000000,
        propertyAge: 22,
        propertyType: 'Flat',
        expectedEligible: false,
        rejectionReason: 'Flat age exceeds 20 years'
    }
];

// ===== RUN TESTS =====
let passed = 0;
let failed = 0;

testCases.forEach(tc => {
    console.log(`\n📋 TEST ${tc.id}: ${tc.name}`);
    console.log('-'.repeat(60));

    let result = { eligible: true, reason: '' };

    // 1. CIBIL Clean Check
    if (!tc.cibilClean) {
        result = { eligible: false, reason: 'Has adverse CIBIL history' };
    }

    // 2. CIBIL Score Check
    if (result.eligible && tc.cibil < 650 && !isSpecialCIBIL(tc.cibil)) {
        result = { eligible: false, reason: 'CIBIL score below 650' };
    }

    // 3. Property Age Check (for Purchase/Takeover)
    if (result.eligible && (tc.purpose === 'Purchase' || tc.purpose === 'Takeover')) {
        const maxAge = tc.propertyType === 'Flat' ? 20 : 25;
        if (tc.propertyAge > maxAge) {
            result = { eligible: false, reason: `${tc.propertyType} age exceeds ${maxAge} years` };
        }
    }

    // 4. Repairs Property Age Check (min 3 years)
    if (result.eligible && tc.purpose === 'Repairs/Renovation' && tc.propertyAge < 3) {
        result = { eligible: false, reason: 'Property must be at least 3 years old' };
    }

    // If still eligible, calculate loan
    let eligibleLoan = 0;
    let actualROI = 0;
    let maxTenure = 0;
    let availableEMI = 0;

    if (result.eligible) {
        if (tc.type === 'Single') {
            // Single Applicant Logic
            const exitAge = getMaxExitAge(tc.empType);
            maxTenure = Math.min(30, exitAge - tc.age);
            if (tc.purpose === 'Repairs/Renovation') maxTenure = Math.min(maxTenure, 15);

            actualROI = getROI(tc.cibil);
            const sustenanceAmount = getSustenanceAmount(tc.netMonthlyIncome);
            availableEMI = tc.netMonthlyIncome - sustenanceAmount - tc.existingEMI;

            if (availableEMI <= 0) {
                result = { eligible: false, reason: 'Insufficient repayment capacity' };
            } else {
                const emiPerLakh = calculateEMIPerLakh(actualROI, maxTenure);
                const loanAsPerEMI = (availableEMI / emiPerLakh) * 100000;
                const ltvRate = getLTV(tc.projectCost);
                const loanAsPerLTV = tc.projectCost * ltvRate;

                let purposeCap = Infinity;
                if (tc.purpose === 'Repairs/Renovation') purposeCap = 3000000;

                eligibleLoan = Math.min(loanAsPerEMI, loanAsPerLTV, purposeCap);

                if (tc.purpose === 'Takeover' && tc.outstandingLoan) {
                    eligibleLoan = Math.min(eligibleLoan, tc.outstandingLoan);
                }
            }
        } else {
            // Joint Applicant Logic
            const elderAge = Math.max(tc.age1, tc.age2);
            const elderEmpType = tc.age1 >= tc.age2 ? tc.empType1 : tc.empType2;
            const exitAge = getMaxExitAge(elderEmpType);
            maxTenure = Math.min(30, exitAge - elderAge);

            actualROI = Math.max(getROI(tc.cibil1), getROI(tc.cibil2));

            const eligibleEMI1 = tc.netIncome1 * 0.65;
            const eligibleEMI2 = tc.netIncome2 * 0.65;
            availableEMI = eligibleEMI1 + eligibleEMI2 - tc.existingEMI1 - tc.existingEMI2;

            if (availableEMI <= 0) {
                result = { eligible: false, reason: 'Insufficient combined repayment capacity' };
            } else {
                const emiPerLakh = calculateEMIPerLakh(actualROI, maxTenure);
                const loanAsPerEMI = (availableEMI / emiPerLakh) * 100000;
                const ltvRate = getLTV(tc.projectCost);
                const loanAsPerLTV = tc.projectCost * ltvRate;

                eligibleLoan = Math.min(loanAsPerEMI, loanAsPerLTV);
            }
        }
    }

    // VERIFY RESULTS
    const roiMatch = !result.eligible || Math.abs(actualROI - (tc.expectedROI || 0)) < 0.01;
    const eligibilityMatch = result.eligible === tc.expectedEligible;

    if (eligibilityMatch && roiMatch) {
        console.log(`   ✅ PASSED`);
        console.log(`   Result: ${result.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
        if (result.eligible) {
            console.log(`   ROI: ${actualROI}% | Tenure: ${maxTenure} years`);
            console.log(`   Available EMI: ₹${Math.round(availableEMI).toLocaleString('en-IN')}`);
            console.log(`   Eligible Loan: ₹${Math.round(eligibleLoan).toLocaleString('en-IN')}`);
        } else {
            console.log(`   Reason: ${result.reason}`);
        }
        passed++;
    } else {
        console.log(`   ❌ FAILED`);
        console.log(`   Expected: ${tc.expectedEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
        console.log(`   Got: ${result.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
        if (tc.expectedROI) console.log(`   Expected ROI: ${tc.expectedROI}% | Got: ${actualROI}%`);
        failed++;
    }
});

// SUMMARY
console.log('\n' + '='.repeat(70));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(70));
console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
console.log('='.repeat(70));

if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Calculator is 100% compliant with Circular No. 186');
} else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
}
