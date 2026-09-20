/**
 * Pure mathematical utilities for statistical computations.
 * Implements Lanczos log-gamma and regularized incomplete beta functions
 * for exact two-tailed Student's/Welch's t-distribution p-value evaluation.
 */

/**
 * Natural logarithm of the Gamma function via Lanczos approximation (g=7, n=9).
 */
export function logGamma(z: number): number {
  if (z <= 0) {
    throw new Error(`logGamma is only defined for positive real numbers, received: ${z}`)
  }

  const p = [
    0.99999999999980993, 676.5209381280397, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109583115912, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ]

  let x = p[0] ?? 1
  for (let i = 1; i < 9; i++) {
    x += (p[i] ?? 0) / (z + i - 1)
  }

  const t = z + 7.5 - 1
  return Math.log(Math.sqrt(2 * Math.PI)) + Math.log(x) - t + (z - 0.5) * Math.log(t)
}

/**
 * Continued fraction evaluation for the incomplete beta function (Lentz's method).
 */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const MAX_ITER = 200
  const EPS = 1e-14
  const FPMIN = 1e-30

  const qab = a + b
  const qap = a + 1
  const qam = a - 1

  let c = 1
  let d = 1 - (qab * x) / qap
  if (Math.abs(d) < FPMIN) d = FPMIN
  d = 1 / d
  let h = d

  for (let m = 1; m <= MAX_ITER; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    h *= d * c

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) <= EPS) break
  }

  return h
}

/**
 * Regularized Incomplete Beta Function: I_x(a, b).
 */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x < 0 || x > 1) {
    throw new Error(`Incomplete Beta argument x must be in [0, 1], received ${x}`)
  }
  if (a <= 0 || b <= 0) {
    throw new Error(`Parameters a and b must be positive, received a=${a}, b=${b}`)
  }
  if (x === 0) return 0
  if (x === 1) return 1

  // Factor before continued fraction: exp(ln(x^a * (1-x)^b / (a * Beta(a,b))))
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  )

  // Symmetry transformation for faster convergence
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betaContinuedFraction(a, b, x)) / a
  }
  return 1 - (bt * betaContinuedFraction(b, a, 1 - x)) / b
}

/**
 * Calculates the two-tailed p-value for Student's / Welch's t-distribution.
 * @param t - The t-statistic
 * @param df - Degrees of freedom
 */
export function computeTTestPValue(t: number, df: number): number {
  if (df <= 0) return Number.NaN
  if (!Number.isFinite(t)) return 0
  if (t === 0) return 1

  const x = df / (df + t * t)
  const a = df / 2
  const b = 0.5

  const p = regularizedIncompleteBeta(x, a, b)
  return Math.min(Math.max(p, 0), 1)
}

/**
 * Linear interpolation quantile (matching NumPy/SciPy method='linear', method 7).
 */
export function quantile(sortedValues: number[], q: number): number {
  if (sortedValues.length === 0) return 0
  if (sortedValues.length === 1) return sortedValues[0] ?? 0
  if (q <= 0) return sortedValues[0] ?? 0
  if (q >= 1) return sortedValues[sortedValues.length - 1] ?? 0

  const index = (sortedValues.length - 1) * q
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower

  const valLower = sortedValues[lower] ?? 0
  const valUpper = sortedValues[upper] ?? 0

  return valLower + weight * (valUpper - valLower)
}
