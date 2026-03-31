import { fmt, fmtExact } from './mortgageFormat.js'

export function parseDMY(str) {
  if (!str) return null
  const clean = str.trim().replace(/\//g, '-')
  const parts = clean.split('-')
  if (parts.length !== 3) return null
  const d = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const y = parseInt(parts[2], 10)
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null
  return new Date(y, m - 1, d)
}

export function calcAge(dob) {
  if (!dob) return null
  const birth = parseDMY(dob)
  if (!birth || isNaN(birth.getTime())) return null
  const today = new Date()
  if (birth > today) return null

  let yrs = today.getFullYear() - birth.getFullYear()
  let mo = today.getMonth() - birth.getMonth()
  let days = today.getDate() - birth.getDate()

  if (mo < 0) {
    yrs--
    mo += 12
  }

  if (days > 0) {
    mo += 1
  }

  if (mo >= 12) {
    yrs++
    mo = 0
  }

  const totalMo = yrs * 12 + mo
  return { yrs, mo, totalMo, display: `${yrs} yrs ${mo} mo` }
}

export function isValidDMY(str) {
  return parseDMY(str) !== null
}

export function normDOBValue(v) {
  let val = String(v || '').trim()
  if (!val) return val
  const digits = val.replace(/[-/\s]/g, '')
  if (digits.length === 8) {
    return digits.slice(0, 2) + '-' + digits.slice(2, 4) + '-' + digits.slice(4, 8)
  }
  return val
}

export function sustenancePct(annualGross) {
  if (annualGross <= 300000) return 0.45
  if (annualGross <= 500000) return 0.4
  if (annualGross <= 800000) return 0.35
  if (annualGross <= 1200000) return 0.3
  return 0.25
}

export function computeApplicantIncome(a) {
  if (a.prof === 'salaried') {
    const monthly = parseFloat(a.grossSalary) || 0
    const gross = monthly * 12
    const tax = 0
    return { gross, tax }
  } else if (a.prof === 'business') {
    const ay1 = parseFloat(a.ay2526) || 0
    const ay2 = parseFloat(a.ay2425) || 0
    const ay3 = parseFloat(a.ay2324) || 0
    const t1 = parseFloat(a.tax2526) || 0
    const t2 = parseFloat(a.tax2425) || 0
    const t3 = parseFloat(a.tax2324) || 0

    const incomes = [ay1, ay2, ay3].filter((v) => v > 0)
    const taxes = [t1, t2, t3].filter((v, i) => [ay1, ay2, ay3][i] > 0)

    let selectedGross = ay1
    let selectedTax = t1

    if (incomes.length >= 2) {
      const maxVar = Math.max(
        ...incomes.slice(1).map((v) => Math.abs(v - incomes[0]) / (incomes[0] || 1)),
      )
      if (maxVar > 0.25) {
        selectedGross = incomes.reduce((s, v) => s + v, 0) / incomes.length
        selectedTax = taxes.length > 0 ? taxes.reduce((s, v) => s + v, 0) / taxes.length : 0
      }
    }
    return { gross: selectedGross, tax: selectedTax }
  } else if (a.prof === 'agriculture') {
    const income = parseFloat(a.agriIncome) || 0
    return { gross: income, tax: 0 }
  }

  return { gross: 0, tax: 0 }
}

export function profLabel(p) {
  return p === 'salaried' ? 'Salaried' : p === 'business' ? 'Business / Self-Employed' : 'Agriculture'
}

export function incomeNote(a, inc) {
  if (a.prof === 'salaried') {
    const sal = parseFloat(a.grossSalary) || 0
    if (sal === 0)
      return `<div style="color:var(--ink3);font-size:11px">Enter last month gross salary above.</div>`
    return `<div style="color:var(--ink3);font-size:11px;line-height:1.7">
      Gross A = ${fmt(sal)}/mo × 12 = <b>${fmt(sal * 12)}/yr</b><br>
      Tax B = ₹0 (field removed — tax not deducted)<br>
      Net C = A − B = <b>${fmt(inc.gross)}/yr</b>
    </div>`
  } else if (a.prof === 'business') {
    const ay1 = parseFloat(a.ay2526) || 0,
      ay2 = parseFloat(a.ay2425) || 0,
      ay3 = parseFloat(a.ay2324) || 0
    const t1 = parseFloat(a.tax2526) || 0,
      t2 = parseFloat(a.tax2425) || 0,
      t3 = parseFloat(a.tax2324) || 0
    const incomes = [ay1, ay2, ay3].filter((v) => v > 0)
    if (incomes.length === 0)
      return `<div style="color:var(--ink3);font-size:11px">Enter gross income for at least one assessment year.</div>`
    let maxVar = 0
    if (incomes.length >= 2) {
      maxVar = Math.max(
        ...incomes.slice(1).map((v) => Math.abs(v - incomes[0]) / (incomes[0] || 1)),
      )
    }
    const method =
      incomes.length < 2
        ? 'Only 1 year entered — using AY 2025-26'
        : maxVar > 0.25
          ? `Variation ${(maxVar * 100).toFixed(0)}% > 25% → Average of ${incomes.length} years used`
          : `Variation ${(maxVar * 100).toFixed(0)}% ≤ 25% → Latest AY 2025-26 used`
    return `<div style="color:var(--ink3);font-size:11px;line-height:1.7">
      AY 25-26: ${fmt(ay1)} / Tax: ${fmt(t1)} &nbsp;|&nbsp; AY 24-25: ${fmt(ay2)} / Tax: ${fmt(t2)} &nbsp;|&nbsp; AY 23-24: ${fmt(ay3)} / Tax: ${fmt(t3)}<br>
      <b>${method}</b><br>
      Gross A = <b>${fmt(Math.round(inc.gross))}/yr</b> &nbsp;|&nbsp; Tax B = <b>${fmt(Math.round(inc.tax))}/yr</b> &nbsp;|&nbsp; Net C = <b>${fmt(Math.round(inc.gross - inc.tax))}/yr</b>
    </div>`
  } else {
    const agri = parseFloat(a.agriIncome) || 0
    if (agri === 0)
      return `<div style="color:var(--ink3);font-size:11px">Enter annual income as per Tahsildar certificate.</div>`
    return `<div style="color:var(--ink3);font-size:11px;line-height:1.7">
      Tahsildar certificate income = <b>${fmt(agri)}/yr</b><br>
      Tax B = ₹0 (agriculture income exempt) &nbsp;|&nbsp; Net C = <b>${fmt(agri)}/yr</b>
    </div>`
  }
}

const MIN_LOAN = 300000
const MAX_LOAN = 50000000

export function computeMortgage({ facility, applicants, propNRV, propAge, propResidual }) {
  const issues = []
  const warns = []

  if (!applicants || applicants.length === 0) {
    return {
      issues,
      warns,
      empty: true,
      lowestCibil: 650,
      roi: 0.1175,
      r: 0.1175 / 12,
      n: 0,
      tenureDisplay: '—',
      maxTenureYrs: 0,
      maxTenureMo: 0,
      tB_mo: 0,
      tC_mo: 0,
      tA_mo: 180,
      limitedBy: '',
      ageDesc: '',
      applData: [],
      incomeBlocks: [],
      totalGrossAnnual: 0,
      totalTaxAnnual: 0,
      netIncomeAnnual: 0,
      totalSustenanceAnnual: 0,
      totalDmonthly: 0,
      totalEmonthly: 0,
      maxEmiMonthly: 0,
      susBreakdown: '',
      loanH: 0,
      loanI: 0,
      ltvPct: facility === 'TL' ? 0.6 : 0.5,
      finalLoan: 0,
      limitingFactor2: '—',
      isEligible: false,
      isTL: facility === 'TL',
      emi: 0,
      totalPay: 0,
      totalInt: 0,
      procFee: 0,
      monthlyRed: 0,
      intMonth1: 0,
      intMonthN: 0,
      totalIntSOD: 0,
      totalPaySOD: 0,
      procFeeSOD: 0,
      reviewCharge: 0,
      alerts: [],
      roiActive: { g750: false, g700: false, low: false },
    }
  }

  const applData = applicants.map((a, idx) => {
    const label = idx === 0 ? 'Primary' : 'Co-Applicant ' + idx
    const name = a.name || label
    const inc = computeApplicantIncome(a)
    const hasIncome = inc.gross > 0

    let age = null
    if (a.dob && isValidDMY(a.dob)) age = calcAge(a.dob)
    if (age && age.yrs < 21) issues.push(name + ': Minimum age is 21 years.')

    const cibilRaw = a.cibil === '' || a.cibil === undefined ? null : parseInt(a.cibil, 10)
    if (hasIncome && cibilRaw === null) warns.push(name + ': CIBIL score not entered.')
    if (cibilRaw !== null && cibilRaw !== -1 && cibilRaw < 650)
      issues.push(name + ': CIBIL ' + cibilRaw + ' is below minimum 650.')

    const maxAge = a.prof === 'salaried' ? 60 : 70

    const netIncomePerson = Math.max(0, inc.gross - inc.tax)
    const susPctPerson = sustenancePct(inc.gross)
    const susFPerson = netIncomePerson * susPctPerson

    const dMonthly = parseFloat(a.existingEmi) || 0
    const eMonthly = parseFloat(a.otherOutgoes) || 0
    const dAnnual = dMonthly * 12
    const eAnnual = eMonthly * 12

    const availableAnnual = Math.max(0, netIncomePerson - dAnnual - eAnnual - susFPerson)

    return {
      a,
      name,
      hasIncome,
      inc,
      age,
      maxAge,
      cibilRaw,
      netIncomePerson,
      susPctPerson,
      susFPerson,
      dMonthly,
      eMonthly,
      dAnnual,
      eAnnual,
      availableAnnual,
    }
  })

  let lowestCibil = 9999
  applData.forEach((d) => {
    if (d.hasIncome && d.cibilRaw !== null && d.cibilRaw < lowestCibil) lowestCibil = d.cibilRaw
  })
  if (lowestCibil === 9999) lowestCibil = 650

  let roi = 0.1175
  if (lowestCibil >= 750) roi = 0.11
  else if (lowestCibil >= 700) roi = 0.1125
  const r = roi / 12

  const roiActive = {
    g750: lowestCibil >= 750,
    g700: lowestCibil >= 700 && lowestCibil < 750,
    low: lowestCibil < 700 && lowestCibil !== -1,
  }

  const tA_mo = 180
  let minTenByAge_mo = 9999
  const ageDetails = []

  applData.forEach((d) => {
    if (!d.hasIncome) return
    if (d.age) {
      const monthsToMax = Math.max(0, d.maxAge * 12 - d.age.totalMo)
      if (monthsToMax < minTenByAge_mo) minTenByAge_mo = monthsToMax
      const yrsToMax = Math.floor(monthsToMax / 12)
      const moRem = monthsToMax % 12
      ageDetails.push({ name: d.name, age: d.age, maxAge: d.maxAge, monthsToMax, yrsToMax, moRem })
    }
  })
  if (minTenByAge_mo === 9999) minTenByAge_mo = 180

  const tB_mo = Math.min(tA_mo, minTenByAge_mo)
  const tC_mo = Math.max(0, (propResidual - 5) * 12)
  const n = Math.min(tA_mo, tB_mo, tC_mo)

  const maxTenureYrs = Math.floor(n / 12)
  const maxTenureMo = n % 12

  if (n <= 0) issues.push('Effective tenure is 0 — check applicant ages and property residual life.')
  if (tB_mo <= 0) issues.push('Income-earning applicant has reached maximum permissible age — not eligible.')

  const ageDesc = ageDetails.length
    ? ageDetails
        .map(
          (d) =>
            d.name +
            ' (' +
            d.age.display +
            ', max ' +
            d.maxAge +
            'yr): ' +
            d.yrsToMax +
            ' yrs ' +
            d.moRem +
            ' mo left',
        )
        .join(' | ')
    : 'No DOB entered — using 15 yrs default'
  const limitedBy =
    n === tA_mo
      ? 'Scheme max 15 yrs'
      : n === tB_mo
        ? 'Age limit (' + ageDetails.map((d) => d.name + ':' + d.maxAge + 'yr').join(', ') + ')'
        : 'Property residual life'

  const tenureDisplay =
    maxTenureMo > 0
      ? maxTenureYrs + ' yrs ' + maxTenureMo + ' mo = ' + n + ' months'
      : maxTenureYrs + ' yrs = ' + n + ' months'

  const totalGrossAnnual = applData.reduce((s, d) => s + d.inc.gross, 0)
  const totalTaxAnnual = applData.reduce((s, d) => s + d.inc.tax, 0)
  const netIncomeAnnual = Math.max(0, totalGrossAnnual - totalTaxAnnual)
  const totalSustenanceAnnual = applData.reduce((s, d) => s + d.susFPerson, 0)
  const totalDmonthly = applData.reduce((s, d) => s + d.dMonthly, 0)
  const totalEmonthly = applData.reduce((s, d) => s + d.eMonthly, 0)
  const totalDannual = totalDmonthly * 12
  const totalEannual = totalEmonthly * 12
  const maxEmiMonthly = applData.reduce((s, d) => s + d.availableAnnual, 0) / 12

  const incomeBlocks = applData.map((d, idx) => {
    const cv = d.cibilRaw
    const cibilKind =
      cv === null ? 'missing' : cv === -1 ? 'ntc' : cv >= 750 ? 'hi' : cv >= 700 ? 'mid' : 'low'
    const incomeNoteHtml = incomeNote(d.a, d.inc)
    const susNote =
      d.inc.gross > 0
        ? `<div style="font-size:11px;color:var(--ink3);margin-top:5px;line-height:1.6">` +
          'Sustenance F: ' +
          (d.susPctPerson * 100).toFixed(0) +
          '% × ' +
          fmt(Math.round(d.netIncomePerson)) +
          '/yr = ' +
          fmt(Math.round(d.susFPerson / 12)) +
          '/mo &nbsp;|&nbsp; ' +
          'D (EMI as per CIBIL): ' +
          fmt(d.dMonthly) +
          '/mo &nbsp;|&nbsp; E (salary deductions): ' +
          fmt(d.eMonthly) +
          '/mo' +
          '<br><b style="color:var(--forest)">Available for loan EMI: ' +
          fmt(Math.round(d.availableAnnual / 12)) +
          '/mo</b>' +
          `</div>`
        : '<div style="font-size:11px;color:var(--ink3);margin-top:4px">No income — not counted in repayment capacity</div>'

    return {
      key: d.a.id ?? idx,
      name: d.name,
      prof: profLabel(d.a.prof),
      cibilKind,
      cibilVal: cv,
      maxAge: d.maxAge,
      profType: d.a.prof === 'salaried' ? 'Salaried' : 'Non-salaried',
      incomeNoteHtml,
      gross: fmt(Math.round(d.inc.gross)),
      tax: fmt(Math.round(d.inc.tax)),
      net: fmt(Math.round(d.netIncomePerson)),
      susNoteHtml: susNote,
    }
  })

  const susBreakdown = applData
    .filter((d) => d.inc.gross > 0)
    .map(
      (d) =>
        d.name +
        ': ' +
        (d.susPctPerson * 100).toFixed(0) +
        '% × ' +
        fmt(Math.round(d.netIncomePerson)) +
        ' = ' +
        fmt(Math.round(d.susFPerson / 12)) +
        '/mo',
    )
    .join(' + ')

  let loanH = 0
  if (maxEmiMonthly > 0 && n > 0 && r > 0) {
    const pow1 = Math.pow(1 + r, n)
    loanH = (maxEmiMonthly * (pow1 - 1)) / (r * pow1)
  }

  const ltvPct = facility === 'TL' ? 0.6 : 0.5
  const loanI = propNRV * ltvPct

  const isEligible = issues.length === 0
  let finalLoan = 0
  let limitingFactor2 = '—'
  if (isEligible) {
    finalLoan = Math.max(0, Math.min(loanH, loanI, MAX_LOAN))
    if (loanH <= loanI && loanH <= MAX_LOAN) limitingFactor2 = 'H — Repayment capacity (income)'
    else if (loanI <= loanH && loanI <= MAX_LOAN) limitingFactor2 = 'I — Property LTV'
    else limitingFactor2 = 'Scheme cap ₹5 Cr'
  }
  if (isEligible && finalLoan > 0 && finalLoan < MIN_LOAN)
    warns.push('Computed eligibility ' + fmtExact(finalLoan) + ' is below minimum ₹3,00,000')

  const isTL = facility === 'TL'
  let emi = 0,
    totalPay = 0,
    totalInt = 0,
    procFee = 0
  let monthlyRed = 0,
    intMonth1 = 0,
    intMonthN = 0,
    totalIntSOD = 0,
    totalPaySOD = 0,
    procFeeSOD = 0,
    reviewCharge = 0

  if (isTL) {
    if (finalLoan > 0 && n > 0 && r > 0) {
      const pow2 = Math.pow(1 + r, n)
      emi = (finalLoan * r * pow2) / (pow2 - 1)
      totalPay = emi * n
      totalInt = totalPay - finalLoan
    }
    procFee = finalLoan > 0 ? Math.min(Math.max(finalLoan * 0.01, 3000), 100000) : 0
  } else {
    monthlyRed = finalLoan > 0 ? finalLoan / n : 0
    intMonth1 = finalLoan * r
    intMonthN = monthlyRed * r
    totalIntSOD = finalLoan > 0 ? (r * finalLoan * (n + 1)) / 2 : 0
    totalPaySOD = finalLoan + totalIntSOD
    procFeeSOD = finalLoan > 0 ? Math.min(finalLoan * 0.0035, 100000) : 0
    reviewCharge = finalLoan > 0 ? Math.min(finalLoan * 0.0035, 100000) : 0
  }

  const alerts = []
  issues.forEach((i) => alerts.push({ type: 'err', text: i }))
  warns.forEach((w) => alerts.push({ type: 'warn', text: w }))
  if (propAge > 20 && propAge <= 25)
    alerts.push({ type: 'warn', text: 'Property age >20 yrs — GCAC sanction required' })
  else if (propAge > 25 && propAge <= 30)
    alerts.push({ type: 'warn', text: 'Property age >25 yrs — CCAC sanction required' })
  else if (propAge > 30)
    alerts.push({ type: 'err', text: 'Property age >30 yrs — special approval required' })

  const anyPriorAlert = issues.length > 0 || warns.length > 0 || propAge > 20
  if (isEligible && finalLoan >= MIN_LOAN && !anyPriorAlert)
    alerts.push({
      type: 'ok',
      text: '✓ All conditions satisfied. Proceed with KYC, legal scrutiny and due diligence',
    })

  const hFormulaText =
    maxEmiMonthly > 0 && n > 0 && r > 0
      ? fmtExact(maxEmiMonthly) +
        ' × [(1+' +
        r.toFixed(6) +
        ')^' +
        n +
        '−1] ÷ [' +
        r.toFixed(6) +
        '×(1+' +
        r.toFixed(6) +
        ')^' +
        n +
        '] = ' +
        fmtExact(loanH)
      : '—'

  const okEligible = isEligible && finalLoan >= MIN_LOAN

  return {
    empty: false,
    issues,
    warns,
    lowestCibil,
    roi,
    r,
    n,
    tenureDisplay,
    maxTenureYrs,
    maxTenureMo,
    tB_mo,
    tC_mo,
    tA_mo,
    limitedBy,
    ageDesc,
    applData,
    incomeBlocks,
    totalGrossAnnual,
    totalTaxAnnual,
    netIncomeAnnual,
    totalSustenanceAnnual,
    totalDmonthly,
    totalEmonthly,
    totalDannual,
    totalEannual,
    maxEmiMonthly,
    susBreakdown,
    loanH,
    loanI,
    ltvPct,
    finalLoan,
    limitingFactor2,
    isEligible,
    isTL,
    emi,
    totalPay,
    totalInt,
    procFee,
    monthlyRed,
    intMonth1,
    intMonthN,
    totalIntSOD,
    totalPaySOD,
    procFeeSOD,
    reviewCharge,
    alerts,
    roiActive,
    propNRV,
    propResidual,
    tAgeValText: Math.floor(tB_mo / 12) + ' yrs ' + (tB_mo % 12) + ' mo (' + tB_mo + ' months)',
    tPropLbl: 'C. Property-based (Residual ' + propResidual + ' yrs − 5 yrs buffer)',
    tPropValText: Math.floor(tC_mo / 12) + ' yrs ' + (tC_mo % 12) + ' mo (' + tC_mo + ' months)',
    tFinalText: tenureDisplay + '  [Limited by: ' + limitedBy + ']',
    tAgeLbl:
      'B. Age-based (income earners only, salaried max 60yr, others 70yr) — ' + ageDesc,
    bILbl: 'I. LTV Loan = ' + fmt(Math.round(propNRV)) + ' × ' + (ltvPct * 100).toFixed(0) + '%',
    hFormulaText,
    okEligible,
    MIN_LOAN,
  }
}
