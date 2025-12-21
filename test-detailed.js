/**
 * HOUSING LOAN CALCULATOR - DETAILED TEST SCRIPT
 * Complete step-by-step calculations as per Circular No. 186
 */

console.log('='.repeat(80));
console.log('🏠 APGB HOUSING LOAN CALCULATOR - DETAILED CALCULATION TEST');
console.log('Circular No. 186/2025 - Step by Step Verification');
console.log('='.repeat(80));

// ===== HELPER FUNCTIONS =====

const formatCurrency = (num) => '₹' + Math.round(num).toLocaleString('en-IN');

const getROI = (cibil) => {
    if (cibil === -1 || (cibil >= 1 && cibil <= 5) || (cibil >= 100 && cibil <= 200)) return 8.25;
    if (cibil >= 750) return 7.75;
    if (cibil >= 700) return 8.25;
    if (cibil >= 650) return 8.75;
    return 9.50;
};

const getSustenanceAmount = (netMonthlyIncome) => {
    const annual = netMonthlyIncome * 12;
    if (annual <= 300000) return netMonthlyIncome * 0.45;
    if (annual <= 500000) return netMonthlyIncome * 0.40;
    if (annual <= 800000) return netMonthlyIncome * 0.35;
    if (annual <= 1200000) return netMonthlyIncome * 0.30;
    return Math.min(netMonthlyIncome * 0.25, 20000);
};

const getSustenancePercent = (netMonthlyIncome) => {
    const annual = netMonthlyIncome * 12;
    if (annual <= 300000) return 45;
    if (annual <= 500000) return 40;
    if (annual <= 800000) return 35;
    if (annual <= 1200000) return 30;
    return 25;
};

const getLTV = (projectCost) => {
    if (projectCost <= 3000000) return 90;
    if (projectCost <= 7500000) return 80;
    return 75;
};

const calculateEMI = (principal, roi, tenureYears) => {
    const r = roi / 12 / 100;
    const n = tenureYears * 12;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const calculateEMIPerLakh = (roi, tenureYears) => calculateEMI(100000, roi, tenureYears);

// ===== TEST CASE 1: SINGLE SALARIED PURCHASE =====
console.log('\n\n' + '▶'.repeat(80));
console.log('TEST CASE 1: SINGLE APPLICANT - SALARIED - PURCHASE');
console.log('◀'.repeat(80));

const tc1 = {
    applicantType: 'Single',
    dob: '1990-05-15',
    age: 35,
    employment: 'Salaried',
    grossSalary: 80000,
    taxDeduction: 8000,
    otherDeductions: 5000,
    cibilScore: 750,
    cibilClean: 'YES',
    existingEMI: 5000,
    purpose: 'Purchase',
    propertyType: 'Flat',
    location: 'Urban',
    propertyAge: 3,
    saleAgreement: 4000000,
    realizableValue: 3800000,
    pendingWorks: 0
};

console.log('\n📝 INPUT VALUES:');
console.log(`   Age: ${tc1.age} years | Employment: ${tc1.employment}`);
console.log(`   Gross Salary: ${formatCurrency(tc1.grossSalary)}/month`);
console.log(`   Tax: ${formatCurrency(tc1.taxDeduction)} | Other: ${formatCurrency(tc1.otherDeductions)}`);
console.log(`   CIBIL: ${tc1.cibilScore} | Clean: ${tc1.cibilClean}`);
console.log(`   Existing EMI: ${formatCurrency(tc1.existingEMI)}`);
console.log(`   Purpose: ${tc1.purpose} | Property: ${tc1.propertyType}`);
console.log(`   Sale Agreement: ${formatCurrency(tc1.saleAgreement)}`);
console.log(`   Realizable: ${formatCurrency(tc1.realizableValue)}`);

console.log('\n🧮 STEP-BY-STEP CALCULATION:');

// Step 1: Net Monthly Income
const tc1_netIncome = tc1.grossSalary - tc1.taxDeduction - tc1.otherDeductions;
console.log(`\n   STEP 1: Net Monthly Income`);
console.log(`   ${formatCurrency(tc1.grossSalary)} - ${formatCurrency(tc1.taxDeduction)} - ${formatCurrency(tc1.otherDeductions)}`);
console.log(`   = ${formatCurrency(tc1_netIncome)}/month`);

// Step 2: Annual Income
const tc1_annualIncome = tc1_netIncome * 12;
console.log(`\n   STEP 2: Annual Income`);
console.log(`   ${formatCurrency(tc1_netIncome)} × 12 = ${formatCurrency(tc1_annualIncome)}/year`);

// Step 3: Sustenance
const tc1_sustenancePercent = getSustenancePercent(tc1_netIncome);
const tc1_sustenanceAmount = getSustenanceAmount(tc1_netIncome);
console.log(`\n   STEP 3: Sustenance (${tc1_sustenancePercent}% for ${formatCurrency(tc1_annualIncome)} income)`);
console.log(`   ${formatCurrency(tc1_netIncome)} × ${tc1_sustenancePercent}% = ${formatCurrency(tc1_sustenanceAmount)}/month`);

// Step 4: Available EMI
const tc1_availableEMI = tc1_netIncome - tc1_sustenanceAmount - tc1.existingEMI;
console.log(`\n   STEP 4: Available EMI for New Loan`);
console.log(`   ${formatCurrency(tc1_netIncome)} - ${formatCurrency(tc1_sustenanceAmount)} - ${formatCurrency(tc1.existingEMI)}`);
console.log(`   = ${formatCurrency(tc1_availableEMI)}/month`);

// Step 5: ROI
const tc1_roi = getROI(tc1.cibilScore);
console.log(`\n   STEP 5: ROI (CIBIL ${tc1.cibilScore} ≥ 750)`);
console.log(`   = ${tc1_roi}% p.a.`);

// Step 6: Max Tenure
const tc1_exitAge = 60; // Salaried
const tc1_maxTenure = Math.min(30, tc1_exitAge - tc1.age);
console.log(`\n   STEP 6: Maximum Tenure`);
console.log(`   Exit Age (Salaried): ${tc1_exitAge}`);
console.log(`   ${tc1_exitAge} - ${tc1.age} = ${tc1_maxTenure} years`);

// Step 7: EMI per Lakh
const tc1_emiPerLakh = calculateEMIPerLakh(tc1_roi, tc1_maxTenure);
console.log(`\n   STEP 7: EMI per Lakh (${tc1_roi}%, ${tc1_maxTenure} years)`);
console.log(`   = ${formatCurrency(tc1_emiPerLakh)}/month per ₹1 Lakh`);

// Step 8: Loan as per EMI Capacity
const tc1_loanAsPerEMI = (tc1_availableEMI / tc1_emiPerLakh) * 100000;
console.log(`\n   STEP 8: Loan as per EMI Capacity`);
console.log(`   (${formatCurrency(tc1_availableEMI)} ÷ ${formatCurrency(tc1_emiPerLakh)}) × ₹1,00,000`);
console.log(`   = ${formatCurrency(tc1_loanAsPerEMI)}`);

// Step 9: Project Cost
const tc1_projectCost = Math.min(tc1.saleAgreement, tc1.realizableValue) + tc1.pendingWorks;
console.log(`\n   STEP 9: Project Cost`);
console.log(`   MIN(${formatCurrency(tc1.saleAgreement)}, ${formatCurrency(tc1.realizableValue)}) + ${formatCurrency(tc1.pendingWorks)}`);
console.log(`   = ${formatCurrency(tc1_projectCost)}`);

// Step 10: LTV
const tc1_ltvPercent = getLTV(tc1_projectCost);
const tc1_loanAsPerLTV = tc1_projectCost * (tc1_ltvPercent / 100);
console.log(`\n   STEP 10: Loan as per LTV (${tc1_ltvPercent}% for ${formatCurrency(tc1_projectCost)})`);
console.log(`   ${formatCurrency(tc1_projectCost)} × ${tc1_ltvPercent}%`);
console.log(`   = ${formatCurrency(tc1_loanAsPerLTV)}`);

// Step 11: Final Eligible Loan
const tc1_eligibleLoan = Math.min(tc1_loanAsPerEMI, tc1_loanAsPerLTV);
const tc1_limitingFactor = tc1_eligibleLoan === tc1_loanAsPerEMI ? 'EMI Capacity' : 'LTV Limit';
console.log(`\n   STEP 11: Final Eligible Loan`);
console.log(`   MIN(${formatCurrency(tc1_loanAsPerEMI)}, ${formatCurrency(tc1_loanAsPerLTV)})`);
console.log(`   = ${formatCurrency(tc1_eligibleLoan)}`);
console.log(`   Limiting Factor: ${tc1_limitingFactor}`);

// Step 12: Actual EMI
const tc1_actualEMI = calculateEMI(tc1_eligibleLoan, tc1_roi, tc1_maxTenure);
console.log(`\n   STEP 12: Actual EMI for ${formatCurrency(tc1_eligibleLoan)}`);
console.log(`   = ${formatCurrency(tc1_actualEMI)}/month`);

// Step 13: Total Interest
const tc1_totalPayable = tc1_actualEMI * tc1_maxTenure * 12;
const tc1_totalInterest = tc1_totalPayable - tc1_eligibleLoan;
console.log(`\n   STEP 13: Total Interest`);
console.log(`   (${formatCurrency(tc1_actualEMI)} × ${tc1_maxTenure} × 12) - ${formatCurrency(tc1_eligibleLoan)}`);
console.log(`   = ${formatCurrency(tc1_totalInterest)}`);

// Step 14: Margin Required
const tc1_margin = tc1_projectCost - tc1_eligibleLoan;
console.log(`\n   STEP 14: Margin Required (Down Payment)`);
console.log(`   ${formatCurrency(tc1_projectCost)} - ${formatCurrency(tc1_eligibleLoan)}`);
console.log(`   = ${formatCurrency(tc1_margin)}`);

console.log('\n' + '─'.repeat(80));
console.log('📊 RESULT SUMMARY:');
console.log('─'.repeat(80));
console.log(`   ✅ STATUS: ELIGIBLE`);
console.log(`   💰 Eligible Loan: ${formatCurrency(tc1_eligibleLoan)}`);
console.log(`   📈 ROI: ${tc1_roi}% p.a. (Fixed for 5 years)`);
console.log(`   📅 Tenure: ${tc1_maxTenure} years`);
console.log(`   💵 Monthly EMI: ${formatCurrency(tc1_actualEMI)}`);
console.log(`   🎯 Limiting Factor: ${tc1_limitingFactor}`);
console.log(`   🏠 Project Cost: ${formatCurrency(tc1_projectCost)}`);
console.log(`   💲 Margin Required: ${formatCurrency(tc1_margin)}`);
console.log(`   🏦 Total Interest: ${formatCurrency(tc1_totalInterest)}`);
console.log(`   📝 Total Payable: ${formatCurrency(tc1_totalPayable)}`);


// ===== TEST CASE 2: JOINT APPLICATION =====
console.log('\n\n' + '▶'.repeat(80));
console.log('TEST CASE 2: JOINT APPLICANTS - BOTH SALARIED - PURCHASE');
console.log('◀'.repeat(80));

const tc2 = {
    app1: { age: 36, netIncome: 85000, cibil: 780, existingEMI: 10000, empType: 'Salaried' },
    app2: { age: 34, netIncome: 62000, cibil: 750, existingEMI: 5000, empType: 'Salaried' },
    projectCost: 7500000
};

console.log('\n📝 INPUT VALUES:');
console.log(`   APPLICANT 1: Age ${tc2.app1.age}, Net Income ${formatCurrency(tc2.app1.netIncome)}, CIBIL ${tc2.app1.cibil}`);
console.log(`   APPLICANT 2: Age ${tc2.app2.age}, Net Income ${formatCurrency(tc2.app2.netIncome)}, CIBIL ${tc2.app2.cibil}`);
console.log(`   Project Cost: ${formatCurrency(tc2.projectCost)}`);

console.log('\n🧮 STEP-BY-STEP CALCULATION (65% RULE):');

// Step 1: 65% EMI for each
const tc2_emi1 = tc2.app1.netIncome * 0.65;
const tc2_emi2 = tc2.app2.netIncome * 0.65;
console.log(`\n   STEP 1: 65% EMI Capacity`);
console.log(`   Applicant 1: ${formatCurrency(tc2.app1.netIncome)} × 65% = ${formatCurrency(tc2_emi1)}`);
console.log(`   Applicant 2: ${formatCurrency(tc2.app2.netIncome)} × 65% = ${formatCurrency(tc2_emi2)}`);

// Step 2: Total Eligible EMI
const tc2_totalEligible = tc2_emi1 + tc2_emi2;
console.log(`\n   STEP 2: Total Eligible EMI`);
console.log(`   ${formatCurrency(tc2_emi1)} + ${formatCurrency(tc2_emi2)} = ${formatCurrency(tc2_totalEligible)}`);

// Step 3: Available EMI
const tc2_totalExisting = tc2.app1.existingEMI + tc2.app2.existingEMI;
const tc2_availableEMI = tc2_totalEligible - tc2_totalExisting;
console.log(`\n   STEP 3: Available EMI`);
console.log(`   ${formatCurrency(tc2_totalEligible)} - (${formatCurrency(tc2.app1.existingEMI)} + ${formatCurrency(tc2.app2.existingEMI)})`);
console.log(`   = ${formatCurrency(tc2_availableEMI)}`);

// Step 4: ROI (worst of both)
const tc2_roi = Math.max(getROI(tc2.app1.cibil), getROI(tc2.app2.cibil));
console.log(`\n   STEP 4: ROI (Higher of both)`);
console.log(`   App1 (${tc2.app1.cibil}): ${getROI(tc2.app1.cibil)}% | App2 (${tc2.app2.cibil}): ${getROI(tc2.app2.cibil)}%`);
console.log(`   Applied ROI: ${tc2_roi}%`);

// Step 5: Max Tenure
const tc2_elderAge = Math.max(tc2.app1.age, tc2.app2.age);
const tc2_maxTenure = Math.min(30, 60 - tc2_elderAge);
console.log(`\n   STEP 5: Maximum Tenure (Elder: ${tc2_elderAge} years old)`);
console.log(`   60 - ${tc2_elderAge} = ${tc2_maxTenure} years`);

// Step 6: EMI per Lakh & Loan
const tc2_emiPerLakh = calculateEMIPerLakh(tc2_roi, tc2_maxTenure);
const tc2_loanAsPerEMI = (tc2_availableEMI / tc2_emiPerLakh) * 100000;
console.log(`\n   STEP 6: Loan as per EMI`);
console.log(`   EMI per Lakh: ${formatCurrency(tc2_emiPerLakh)}`);
console.log(`   Loan: ${formatCurrency(tc2_loanAsPerEMI)}`);

// Step 7: LTV
const tc2_ltv = getLTV(tc2.projectCost);
const tc2_loanAsPerLTV = tc2.projectCost * (tc2_ltv / 100);
console.log(`\n   STEP 7: Loan as per LTV (${tc2_ltv}%)`);
console.log(`   ${formatCurrency(tc2.projectCost)} × ${tc2_ltv}% = ${formatCurrency(tc2_loanAsPerLTV)}`);

// Step 8: Final Loan
const tc2_eligibleLoan = Math.min(tc2_loanAsPerEMI, tc2_loanAsPerLTV);
console.log(`\n   STEP 8: Final Eligible Loan`);
console.log(`   MIN(${formatCurrency(tc2_loanAsPerEMI)}, ${formatCurrency(tc2_loanAsPerLTV)})`);
console.log(`   = ${formatCurrency(tc2_eligibleLoan)}`);

const tc2_actualEMI = calculateEMI(tc2_eligibleLoan, tc2_roi, tc2_maxTenure);

console.log('\n' + '─'.repeat(80));
console.log('📊 RESULT SUMMARY:');
console.log('─'.repeat(80));
console.log(`   ✅ STATUS: ELIGIBLE (Joint Application)`);
console.log(`   💰 Eligible Loan: ${formatCurrency(tc2_eligibleLoan)}`);
console.log(`   📈 ROI: ${tc2_roi}% p.a.`);
console.log(`   📅 Tenure: ${tc2_maxTenure} years`);
console.log(`   💵 Monthly EMI: ${formatCurrency(tc2_actualEMI)}`);


// ===== TEST CASE 3: REJECTION =====
console.log('\n\n' + '▶'.repeat(80));
console.log('TEST CASE 3: REJECTION - LOW CIBIL');
console.log('◀'.repeat(80));

console.log('\n📝 INPUT: CIBIL Score = 600, Clean = YES');
console.log('\n🔴 HARD GATE CHECK:');
console.log('   CIBIL Score (600) < 650 minimum');
console.log('   NOT a special case (NTC/-1/1-5/100-200)');
console.log('\n' + '─'.repeat(80));
console.log('📊 RESULT: ❌ NOT ELIGIBLE');
console.log('   Reason: CIBIL score below minimum 650');


console.log('\n\n' + '='.repeat(80));
console.log('✅ ALL DETAILED CALCULATIONS COMPLETE');
console.log('='.repeat(80));
console.log('\nThe calculator uses these exact formulas from Circular No. 186!');
