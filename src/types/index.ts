export interface ConabRecord {
  id: string
  year: number
  state: string
  region: string
  crop: string
  production: number
  productivity: number
  area: number
  timestamp: string
}

export interface ConabFilters {
  years: number[]
  states: string[]
  crops: string[]
  metric: string
  minProductivity: number
  comparisonMode: boolean
}

export interface Prediction {
  targetYear: number
  predictedValue: number
  lowerBound: number
  upperBound: number
  growthRate: number
  confidenceScore: number
  equations: string[]
}

export interface SeasonalTrend {
  volatility: number
  trendDirection: string
  isCyclic: boolean
}

export interface EfficiencyEntry {
  state: string
  region: string
  avgProductivity: number
  totalProduction: number
  efficiencyIndex: number
  rank: number
  anomaliesDetected: number
}

export interface ValidationReport {
  isValid: boolean
  errors: string[]
}
