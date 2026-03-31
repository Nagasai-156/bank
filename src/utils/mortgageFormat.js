export function fmt(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

export function fmtExact(n) {
  return '₹' + Math.floor(n).toLocaleString('en-IN') + '.' + String(Math.round((n % 1) * 100)).padStart(2, '0')
}

export function fmtK(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr'
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L'
  return fmt(n)
}
