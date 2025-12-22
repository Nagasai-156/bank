
// Precision Debug Script
const roi = 7.75;
const tenureYears = 15;
const surplusEMI = 75632; // (125000 - 31250 - 18118)

// 1. Calculate Monthly Rate
// 7.75 / 12 / 100
const monthlyRate = roi / 12 / 100;

// 2. Calculate Compound Factor (1+r)^n
const tenureMonths = tenureYears * 12;
const compoundFactor = Math.pow(1 + monthlyRate, tenureMonths);

// 3. Calculate EMI per 1 Lakh
// E = P * r * (1+r)^n / ((1+r)^n - 1)
const P = 100000;
const numerator = P * monthlyRate * compoundFactor;
const denominator = compoundFactor - 1;
const emiPerLakh = numerator / denominator;

// 4. Calculate Loan Capacity
// (Surplus / EMI_per_Lakh) * 1 Lakh
const loanCapacity = (surplusEMI / emiPerLakh) * 100000;

console.log("=== PRECISE CALCULATION TRACE ===");
console.log(`ROI: ${roi}%`);
console.log(`Monthly Rate (r): ${monthlyRate.toFixed(15)}`);
console.log(`Tenure Months (n): ${tenureMonths}`);
console.log(`(1+r)^n: ${compoundFactor.toFixed(15)}`);
console.log(`Numerator (P*r*(1+r)^n): ${numerator.toFixed(15)}`);
console.log(`Denominator ((1+r)^n - 1): ${denominator.toFixed(15)}`);
console.log(`-----------------------------------`);
console.log(`EMI Per Lakh: ${emiPerLakh.toFixed(15)}`);
console.log(`Surplus EMI: ${surplusEMI}`);
console.log(`Loan Calculation: (${surplusEMI} / ${emiPerLakh.toFixed(10)}) * 100000`);
console.log(`-----------------------------------`);
console.log(`FINAL LOAN CAPACITY: ${loanCapacity.toFixed(15)}`);
