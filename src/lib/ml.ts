export interface MLPrediction {
  targetYear: number
  predictedValue: number
  lowerBound: number
  upperBound: number
  growthRate: number
  confidenceScore: number
  models: string[]
}

function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; rSquared: number } {
  const n = x.length
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 }

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0)
  const sumXX = x.reduce((s, xi) => s + xi * xi, 0)
  const sumYY = y.reduce((s, yi) => s + yi * yi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const meanY = sumY / n
  const ssRes = y.reduce((s, yi, i) => s + (yi - (slope * x[i] + intercept)) ** 2, 0)
  const ssTot = y.reduce((s, yi) => s + (yi - meanY) ** 2, 0)
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0

  return { slope, intercept, rSquared: Math.max(0, Math.min(1, rSquared)) }
}

function polynomialRegression(x: number[], y: number[], degree: number = 2): {
  coefficients: number[]
  predict: (xval: number) => number
  rSquared: number
} {
  const n = x.length
  const m = degree + 1

  const X: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => x[i] ** j)
  )

  const Xt = X[0].map((_, i) => X.map(row => row[i]))
  const XtX = Xt.map(row => X[0].map((_, j) => row.reduce((s, _, k) => s + Xt[row.length > 0 ? k : 0][j] * row[k], 0)))

  // Actually compute properly
  const XtX_mat: number[][] = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) =>
      X.reduce((s, row) => s + row[i] * row[j], 0)
    )
  )
  const XtY: number[] = Array.from({ length: m }, (_, i) =>
    X.reduce((s, row, k) => s + row[i] * y[k], 0)
  )

  // Gaussian elimination
  const augmented = XtX_mat.map((row, i) => [...row, XtY[i]])
  for (let col = 0; col < m; col++) {
    let maxRow = col
    for (let row = col + 1; row < m; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) maxRow = row
    }
    ;[augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]]
    const pivot = augmented[col][col]
    if (Math.abs(pivot) < 1e-10) continue
    for (let j = col; j <= m; j++) augmented[col][j] /= pivot
    for (let row = 0; row < m; row++) {
      if (row !== col) {
        const factor = augmented[row][col]
        for (let j = col; j <= m; j++) augmented[row][j] -= factor * augmented[col][j]
      }
    }
  }
  const coefficients = augmented.map(row => row[m])

  const predict = (xval: number): number =>
    coefficients.reduce((s, c, i) => s + c * xval ** i, 0)

  const meanY = y.reduce((a, b) => a + b, 0) / n
  const ssRes = y.reduce((s, yi, i) => s + (yi - predict(x[i])) ** 2, 0)
  const ssTot = y.reduce((s, yi) => s + (yi - meanY) ** 2, 0)
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 1

  return { coefficients, predict, rSquared: Math.max(0, Math.min(1, rSquared)) }
}

function movingAverage(data: number[], window: number = 3): number[] {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const slice = data.slice(start, i + 1)
    return slice.reduce((s, v) => s + v, 0) / slice.length
  })
}

export function ensemblePredict(
  historicalData: number[],
  periods: number = 1,
  baseYear: number = new Date().getFullYear()
): MLPrediction[] {
  if (historicalData.length < 3) return []

  const n = historicalData.length
  const x = historicalData.map((_, i) => i)

  // Modelo 1: Regressão linear
  const lin = linearRegression(x, historicalData)

  // Modelo 2: Regressão polinomial grau 2
  const poly2 = polynomialRegression(x, historicalData, 2)

  // Modelo 3: Regressão polinomial grau 3 (precisa de 4+ pontos)
  const poly3 = n >= 4
    ? polynomialRegression(x, historicalData, 3)
    : null

  // Modelo 4: Média móvel + regressão no smoothed
  const smoothed = movingAverage(historicalData, 3)
  const smoothLin = linearRegression(x, smoothed)

  const predictions: MLPrediction[] = []
  const lastValue = historicalData[n - 1]

  for (let i = 1; i <= periods; i++) {
    const xPred = n + i - 1

    const vLin = lin.slope * xPred + lin.intercept
    const vPoly2 = poly2.predict(xPred)
    const vPoly3 = poly3 ? poly3.predict(xPred) : vPoly2
    const vSmooth = smoothLin.slope * xPred + smoothLin.intercept

    const models = [vLin, vPoly2, vPoly3, vSmooth]
    const validModels = models.filter(v => v > 0 && isFinite(v))
    
    const predictedValue = validModels.length > 0
      ? validModels.reduce((s, v) => s + v, 0) / validModels.length
      : vLin

    const modelVariance = validModels.length > 1
      ? validModels.reduce((s, v) => s + (v - predictedValue) ** 2, 0) / validModels.length
      : 0

    const rSquaredAvg = (
      lin.rSquared +
      poly2.rSquared +
      (poly3 ? poly3.rSquared : 0) +
      smoothLin.rSquared
    ) / (3 + (poly3 ? 1 : 0))

    const horizonDecay = Math.max(0, 1 - (i - 1) * 0.15)
    const agreementScore = Math.max(0, 1 - modelVariance / (predictedValue + 1) * 5)
    const confidence = Math.round(
      Math.min(rSquaredAvg * horizonDecay * agreementScore, 0.99) * 1000
    ) / 1000

    const growthRate = lastValue !== 0
      ? ((predictedValue - lastValue) / lastValue) * 100
      : 0

    const spread = (1 - rSquaredAvg) * 0.4 + 0.06

    predictions.push({
      targetYear: baseYear + i,
      predictedValue: Math.max(0, predictedValue),
      lowerBound: Math.max(0, predictedValue * (1 - spread)),
      upperBound: predictedValue * (1 + spread),
      growthRate,
      confidenceScore: Math.max(0, confidence),
      models: [
        `Linear: ŷ = ${lin.intercept.toFixed(1)} + ${lin.slope.toFixed(3)}x (R²=${lin.rSquared.toFixed(3)})`,
        `Polinomial²: R²=${poly2.rSquared.toFixed(3)}`,
        ...(poly3 ? [`Polinomial³: R²=${poly3.rSquared.toFixed(3)}`] : []),
        `Suavizado: R²=${smoothLin.rSquared.toFixed(3)}`,
      ],
    })
  }

  return predictions
}
