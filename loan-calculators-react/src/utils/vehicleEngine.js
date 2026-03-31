import { fmt, fmtExact } from './mortgageFormat.js'

export function parseDMY(str) {
  if (!str) return null
  const clean = str.trim().replace(/\//g, '-')
  const parts = clean.split('-')
  if (parts.length !== 3) return null
  const d = parseInt(parts[0], 10),
    m = parseInt(parts[1], 10),
    y = parseInt(parts[2], 10)
  if (isNaN(d) || isNaN(m) || isNaN(y) || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100)
    return null
  return new Date(y, m - 1, d)
}

export function isValidDMY(s) {
  return parseDMY(s) !== null
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
  if (days > 0) mo += 1
  if (mo >= 12) {
    yrs++
    mo = 0
  }
  const totalMo = yrs * 12 + mo
  return { yrs, mo, totalMo, display: yrs + ' yrs ' + mo + ' mo' }
}

export function normDOBValue(v) {
  let val = String(v || '').trim()
  if (!val) return val
  const digits = val.replace(/[-/\s]/g, '')
  if (digits.length === 8) return digits.slice(0, 2) + '-' + digits.slice(2, 4) + '-' + digits.slice(4, 8)
  return val
}

export function sustenancePct(annualGross, cibilGood) {
  if (annualGross <= 300000) return cibilGood ? 0.35 : 0.4
  if (annualGross <= 600000) return 0.35
  if (annualGross <= 1200000) return 0.3
  if (annualGross <= 1800000) return cibilGood ? 0.25 : 0.3
  return cibilGood ? 0.2 : 0.25
}

export function getROI(cibil, vehType, borrowerCat, isEV, secType) {
  if (secType === 'td100') return 7.75

  let base
  const isNTC = cibil === -1
  if (vehType === '4W') {
    if (cibil >= 731) base = 8.75
    else if (cibil >= 700 || isNTC) base = 8.95
    else if (cibil >= 650) base = 9.25
    else base = 9.5
  } else {
    if (cibil >= 700 || isNTC) base = 10.75
    else base = 11.75
  }

  let concession = 0
  if (borrowerCat === 'govt') concession += 0.25
  if (isEV === 'yes') concession += 0.1
  if (secType === 'neglien') concession += 0.5

  concession = Math.min(concession, 0.6)

  return +(base - concession).toFixed(2)
}

export function profLabel(p) {
  return p === 'salaried' ? 'Salaried' : p === 'business' ? 'Business/Self-Employed' : 'Agriculture'
}

export function computeApplicantIncome(a) {
  if (a.prof === 'salaried') {
    const sal = parseFloat(a.grossSalary) || 0
    return { gross: sal * 12, tax: 0 }
  } else if (a.prof === 'business') {
    const g1 = parseFloat(a.ay1g) || 0,
      g2 = parseFloat(a.ay2g) || 0
    const t1 = parseFloat(a.ay1t) || 0,
      t2 = parseFloat(a.ay2t) || 0
    const cnt = [g1, g2].filter((v) => v > 0).length || 1
    return { gross: (g1 + g2) / cnt, tax: (t1 + t2) / cnt }
  } else {
    return { gross: parseFloat(a.agriIncome) || 0, tax: 0 }
  }
}

export function buildROIGridItems({ vehType, applicants, isEV, secType }) {
  const cat = applicants.some((a) => a.prof === 'salaried' && a.borrowerCat === 'govt') ? 'govt' : 'private'
  const incCibils = applicants
    .map((a) => {
      const inc = computeApplicantIncome(a)
      return inc.gross > 0 ? parseInt(a.cibil, 10) || 750 : null
    })
    .filter((c) => c !== null)
  const cibil = incCibils.length > 0 ? Math.min(...incCibils) : 750

  if (secType === 'td100') {
    return {
      mode: 'td100',
      cibil,
      rows: [],
    }
  }

  const brackets =
    vehType === '4W'
      ? [
          { label: 'CIBIL ≥ 731', testActive: (c) => c >= 731 },
          { label: 'CIBIL 700–730 (incl. NTC −1/1–5)', testActive: (c) => (c >= 700 && c <= 730) || c === -1 },
          { label: 'CIBIL 650–699', testActive: (c) => c >= 650 && c <= 699 },
          { label: 'Others (below 650)', testActive: (c) => c > 0 && c < 650 },
        ]
      : [
          { label: 'CIBIL ≥ 700 (incl. NTC)', testActive: (c) => c >= 700 || c === -1 },
          { label: 'CIBIL < 700 & Others', testActive: (c) => c > 0 && c < 700 },
        ]

  const repCibil = vehType === '4W' ? [800, 715, 670, 600] : [750, 600]

  const rows = brackets.map((b, i) => {
    const roi = getROI(repCibil[i], vehType, cat, isEV, secType)
    const active = b.testActive(cibil)
    return { label: b.label, roi, active }
  })

  return { mode: 'grid', cibil, rows }
}

export function computeVehicle({ vehType, applicants, onRoadPrice, isEV, secType }) {
  const issues = []
  const warns = []

  if (!applicants || applicants.length === 0) {
    return { empty: true, alerts: [], roiGrid: buildROIGridItems({ vehType, applicants: [], isEV, secType }) }
  }

  const borrowerCat = applicants.some((a) => a.prof === 'salaried' && a.borrowerCat === 'govt')
    ? 'govt'
    : 'private'

  const isTD = secType === 'td100'
  const marginPctVal = isTD ? 0 : vehType === '2W' ? 25 : 10
  const marginLabel = isTD ? 'Nil (100% Term Deposit)' : vehType === '2W' ? '25% of on-road (2W)' : '10% of on-road (4W)'

  const incomeApplCibils = applicants
    .map((a) => {
      const inc = computeApplicantIncome(a)
      return inc.gross > 0 ? parseInt(a.cibil, 10) || 750 : null
    })
    .filter((c) => c !== null)
  const cibil = incomeApplCibils.length > 0 ? Math.min(...incomeApplCibils) : 750

  const roiGrid = buildROIGridItems({ vehType, applicants, isEV, secType })

  applicants.forEach((a, idx) => {
    const c = parseInt(a.cibil, 10) || 0
    const inc = computeApplicantIncome(a)
    if (inc.gross > 0 && c > 0 && c < 650)
      issues.push(
        (a.name || 'Applicant ' + (idx + 1)) + ': CIBIL ' + c + ' is below minimum 650. New-to-credit: enter -1.',
      )
  })

  const roi = getROI(cibil, vehType, borrowerCat, isEV, secType)
  const r = roi / 12 / 100
  const maxTenByVeh = vehType === '4W' ? 84 : 36

  let totalGross = 0,
    totalTax = 0,
    totalDmo = 0,
    totalEmo = 0,
    totalSusAnn = 0
  let sumH = 0
  const applResults = []

  applicants.forEach((a, idx) => {
    const inc = computeApplicantIncome(a)
    totalGross += inc.gross
    totalTax += inc.tax
    const D = parseFloat(a.existingEmi) || 0
    const E = parseFloat(a.otherOutgoes) || 0
    totalDmo += D
    totalEmo += E
    const netP = Math.max(0, inc.gross - inc.tax)
    const cibilGoodA = (parseInt(a.cibil, 10) || 750) >= 700 || parseInt(a.cibil, 10) === -1
    const susF = inc.gross * sustenancePct(inc.gross, cibilGoodA)
    totalSusAnn += susF
    const availAnnual = Math.max(0, netP - D * 12 - E * 12 - susF)
    const gPerAppl = availAnnual / 12

    let applH = 0,
      applTenMo = maxTenByVeh,
      applTenLabel = 'scheme max'
    if (a.dob && isValidDMY(a.dob)) {
      const age = calcAge(a.dob)
      if (age) {
        if (age.yrs < 18) issues.push((a.name || 'Applicant ' + (idx + 1)) + ': Minimum age is 18 years.')
        const maxAgeYrs = a.prof === 'salaried' && a.borrowerCat !== 'govt' ? 60 : 70
        const moToMax = Math.max(0, maxAgeYrs * 12 - age.totalMo)
        applTenMo = Math.min(maxTenByVeh, moToMax)
        applTenLabel = applTenMo === maxTenByVeh ? 'scheme max' : maxAgeYrs + 'yr age limit'
        if (moToMax <= 0) issues.push((a.name || 'Applicant ' + (idx + 1)) + ': Has reached maximum age — not eligible.')
      }
    }
    if (applTenMo > 0 && gPerAppl > 0 && r > 0) {
      const pow = Math.pow(1 + r, applTenMo)
      applH = (gPerAppl * (pow - 1)) / (r * pow)
    }
    sumH += applH

    const name = a.name || (idx === 0 ? 'Primary Applicant' : 'Co-Applicant ' + idx)
    const nYrsA = Math.floor(applTenMo / 12),
      nMoA = applTenMo % 12
    let note = ''
    if (a.prof === 'salaried') {
      const sal = parseFloat(a.grossSalary) || 0
      note = 'Gross = ' + fmt(sal) + '/mo ×12 = ' + fmt(sal * 12) + '/yr | Tax = ₹0'
    } else if (a.prof === 'business') {
      const g1 = parseFloat(a.ay1g) || 0,
        g2 = parseFloat(a.ay2g) || 0
      note =
        'AY 25-26: ' +
        fmt(g1) +
        ' | AY 24-25: ' +
        fmt(g2) +
        ' → Avg Gross = ' +
        fmt(Math.round(inc.gross)) +
        '/yr | Tax = ' +
        fmt(Math.round(inc.tax)) +
        '/yr'
    } else {
      note = 'Tahsildar cert = ' + fmt(Math.round(inc.gross)) + '/yr | Tax = ₹0 (exempt)'
    }

    applResults.push({ name, applTenMo, applTenLabel, gPerAppl, applH, nYrsA, nMoA, a, inc, netP, D, E, susF, cibilGoodA, note })
  })

  const netIncome = Math.max(0, totalGross - totalTax)
  const totalAvail = applicants.reduce((s, a) => {
    const inc = computeApplicantIncome(a)
    const netP = Math.max(0, inc.gross - inc.tax)
    const D = parseFloat(a.existingEmi) || 0
    const E = parseFloat(a.otherOutgoes) || 0
    const cibilGoodA = (parseInt(a.cibil, 10) || 750) >= 700 || parseInt(a.cibil, 10) === -1
    const susF = inc.gross * sustenancePct(inc.gross, cibilGoodA)
    return s + Math.max(0, netP - D * 12 - E * 12 - susF)
  }, 0)
  const maxEmiMo = totalAvail / 12

  const loanH = sumH
  const sumTenDisplay = applResults
    .map((ar) => (ar.name || 'Appl') + ': ' + (ar.nYrsA > 0 ? ar.nYrsA + 'y ' : '') + ar.nMoA + 'm')
    .join(', ')

  const hFormulaText =
    'Sum of H per applicant = ' + applResults.map((ar) => fmtExact(ar.applH)).join(' + ') + ' = ' + fmtExact(loanH)

  if (vehType === '4W') {
    applicants.forEach((a, idx) => {
      if (a.prof === 'agriculture') {
        const agri = parseFloat(a.agriIncome) || 0
        if (agri > 0 && agri < 300000)
          warns.push(
            (a.name || 'Applicant ' + (idx + 1)) + ': Agriculture income below minimum Rs.3L/yr required for 4-Wheeler loan.',
          )
      }
    })
  }

  const primaryResult = applResults.find((ar) => ar.applTenMo > 0) || applResults[0]
  const n = primaryResult ? primaryResult.applTenMo : maxTenByVeh
  const nYrs = Math.floor(n / 12),
    nMo = n % 12

  const marginAmt = (onRoadPrice * marginPctVal) / 100
  const loanI = Math.max(0, onRoadPrice - marginAmt)
  const loanJ = vehType === '2W' ? 1000000 : Infinity

  const isEligible = issues.length === 0
  let finalLoan = 0,
    limitingFactor = '--'
  if (isEligible) {
    finalLoan = Math.max(0, Math.min(loanH, loanI, loanJ))
    if (loanH <= loanI && loanH <= loanJ) limitingFactor = 'H - Repayment capacity (income)'
    else if (loanI <= loanH && loanI <= loanJ) limitingFactor = 'I - Vehicle cost after margin'
    else limitingFactor = 'J - 2-Wheeler scheme cap Rs.10L'
  }

  let emi = 0,
    totalPay = 0,
    totalInt = 0
  if (finalLoan > 0 && n > 0 && r > 0) {
    const pow = Math.pow(1 + r, n)
    emi = (finalLoan * r * pow) / (pow - 1)
    totalPay = emi * n
    totalInt = totalPay - finalLoan
  }

  const feeLbl = 'Processing fee — 100% WAIVED (Festive Vibes 2.0 Campaign)'

  const alerts = []
  issues.forEach((i) => alerts.push({ type: 'err', text: i }))
  warns.forEach((w) => alerts.push({ type: 'warn', text: w }))

  if (secType === 'td100') {
    alerts.push({
      type: 'ok',
      text: '✓ 100% Term Deposit: Flat ROI 7.75% (no additional concessions, nil margin, no processing fee) — Circular 269 Mod 1 + Circular 316 Note 3.',
    })
  } else {
    const isNTC = cibil === -1
    let baseROI
    if (vehType === '4W') {
      if (cibil >= 731) baseROI = 8.75
      else if (cibil >= 700 || isNTC) baseROI = 8.95
      else if (cibil >= 650) baseROI = 9.25
      else baseROI = 9.5
    } else {
      baseROI = cibil >= 700 || isNTC ? 10.75 : 11.75
    }
    let concLines = []
    let totalConc = 0
    if (borrowerCat === 'govt') {
      concLines.push('Govt/PSU/Pensioner −0.25% (Circ 55 + Circ 269)')
      totalConc += 0.25
    }
    if (isEV === 'yes') {
      concLines.push('Electric/Hybrid −0.10% (Circ 55)')
      totalConc += 0.1
    }
    if (secType === 'neglien') {
      concLines.push('Negative Lien −0.50% (Circ 269)')
      totalConc += 0.5
    }
    if (totalConc > 0.6) {
      concLines.push('<b>Capped at −0.60% max (Circ 316 Note 1)</b>')
      totalConc = 0.6
    }
    const finalROI = (baseROI - totalConc).toFixed(2)
    const roiBreakdownHtml =
      '<b>ROI Breakdown:</b> Base ' +
      baseROI.toFixed(2) +
      '%' +
      (concLines.length ? ' − ' + concLines.join(' − ') : ' (no concessions)') +
      ' = <b>' +
      finalROI +
      '% p.a. (Festive Vibes 2.0)</b> ' +
      (totalConc === 0 ? '' : ' | Concession: −0.' + Math.round(totalConc * 100) + '%')
    alerts.push({ type: 'ok', html: roiBreakdownHtml })
    if (borrowerCat === 'govt')
      alerts.push({
        type: 'ok',
        small: true,
        text: '🏛 Govt/PSU salary credited with bank → processing fee Nil (Circ 269 Mod 5) — superseded by 100% waiver during campaign.',
      })
  }

  if (isEligible && finalLoan > 0)
    alerts.push({
      type: 'ok',
      text: '✓ Festive Vibes 2.0 — Processing fee 100% WAIVED. Sanction by 15/03/2026, disburse by 31/03/2026. RTA registration in AP/Telangana/Yanam only.',
    })

  return {
    empty: false,
    vehType,
    onRoadPrice,
    isEV,
    secType,
    borrowerCat,
    isTD,
    marginPctVal,
    marginLabel,
    marginAmt,
    cibil,
    roi,
    r,
    roiGrid,
    issues,
    warns,
    applResults,
    totalGross,
    totalTax,
    netIncome,
    totalDmo,
    totalEmo,
    totalSusAnn,
    maxEmiMo,
    loanH,
    loanI,
    loanJ,
    sumTenDisplay,
    hFormulaText,
    n,
    nYrs,
    nMo,
    finalLoan,
    limitingFactor,
    isEligible,
    emi,
    totalPay,
    totalInt,
    feeLbl,
    maxTenByVeh,
  }
}
