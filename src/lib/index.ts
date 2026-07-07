import type { Prediction } from '@/types'

export const ROUTE_PATHS: Record<string, string> = {
  DASHBOARD: '/',
  ANALYTICS: '/analise-avancada',
  REGIONAL: '/analise-regional',
  PREDICTIONS: '/modelos-preditivos',
  DATA_MANAGEMENT: '/gerenciamento-dados',
}

export const calculateProductivity = (production: number, area: number): number => {
  if (area === 0) return 0
  return (production * 60) / area
}

export const predictTrends = (historicalData: number[], periods: number = 1, baseYear: number = new Date().getFullYear()): Prediction[] => {
  if (historicalData.length < 2) return []

  const n = historicalData.length
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += historicalData[i]
    sumXY += i * historicalData[i]
    sumXX += i * i
    sumYY += historicalData[i] ** 2
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const meanY = sumY / n
  let ssRes = 0, ssTot = 0
  for (let i = 0; i < n; i++) {
    const yHat = slope * i + intercept
    ssRes += (historicalData[i] - yHat) ** 2
    ssTot += (historicalData[i] - meanY) ** 2
  }
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0

  const predictions: Prediction[] = []
  const lastValue = historicalData[n - 1]

  for (let i = 1; i <= periods; i++) {
    const x = n + i - 1
    const predictedValue = slope * x + intercept
    const growthRate = lastValue !== 0 ? ((predictedValue - lastValue) / lastValue) * 100 : 0
    const horizonDecay = Math.max(0, 1 - (i - 1) * 0.12)
    const confidence = Math.round(Math.min(rSquared * horizonDecay, 0.99) * 1000) / 1000

    predictions.push({
      targetYear: baseYear + i,
      predictedValue: Math.max(0, predictedValue),
      lowerBound: Math.max(0, predictedValue * (1 - (1 - rSquared) * 0.5)),
      upperBound: predictedValue * (1 + (1 - rSquared) * 0.5),
      growthRate,
      confidenceScore: confidence,
      equations: [
        `ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}x`,
        `R² = ${rSquared.toFixed(4)}`,
      ],
    })
  }

  return predictions
}

export const generateRecommendations = (data: {
  productivity: number
  area: number
  region: string
  crop: string
}): string[] => {
  const recommendations: string[] = []

  if (data.productivity < 1500) {
    recommendations.push('Adoção de sistemas de irrigação e renovação de parque cafeeiro para aumentar produtividade base.')
  }

  if (data.area > 500 && data.productivity < 2500) {
    recommendations.push('Intensificação do manejo nutricional em áreas extensas para otimização de custos fixos.')
  }

  if (data.region === 'SUDESTE' && data.crop.toLowerCase().includes('arábica')) {
    recommendations.push('Monitoramento rigoroso de variáveis climáticas para mitigação de riscos de geada e seca prolongada.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Manutenção de protocolos atuais e investimento em certificações de sustentabilidade.')
  }

  return recommendations
}
