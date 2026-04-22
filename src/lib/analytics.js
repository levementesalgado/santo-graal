import { predictTrends } from './index';

export const runPredictiveModel = (data, horizon = 3) => {
  const values = data.sort((a, b) => a.year - b.year).map(d => d.production);
  const years = data.map(d => d.year);
  const lastYear = Math.max(...years);

  const basePredictions = predictTrends(values, horizon);

  return basePredictions.map((pred, idx) => {
    const targetYear = lastYear + idx + 1;
    const isArabica = data[0]?.crop.toLowerCase().includes('arábica');
    const biennialFactor = isArabica ? (targetYear % 2 === 0 ? 1.15 : 0.85) : 1.0;
    const adjustedValue = pred.predictedValue * biennialFactor;

    return {
      ...pred,
      targetYear,
      predictedValue: adjustedValue,
      equations: [
        ...pred.equations,
        `B_f = ${biennialFactor.toFixed(2)} (Ajuste Safra ${targetYear % 2 === 0 ? 'Alta' : 'Baixa'})`,
        `Ŷ_adj = Ŷ * B_f`,
      ],
    };
  });
};

export const calculateEfficiencyMatrix = (data) => {
  const latestYear = 2026;
  const currentData = data.filter(d => d.year === latestYear);
  const avgNationalProd = currentData.reduce((acc, curr) => acc + curr.productivity, 0) / currentData.length;

  return currentData
    .map(d => {
      const efficiencyIndex = d.productivity / avgNationalProd;
      const historicalStateData = data.filter(h => h.state === d.state);
      const anomalies = detectAnomalies(historicalStateData).length;
      return {
        state: d.state,
        region: d.region,
        avgProductivity: d.productivity,
        totalProduction: d.production,
        efficiencyIndex,
        rank: 0,
        anomaliesDetected: anomalies,
      };
    })
    .sort((a, b) => b.efficiencyIndex - a.efficiencyIndex)
    .map((item, index) => ({ ...item, rank: index + 1 }));
};

export const generateRegionalRecommendations = (state, data) => {
  const stateLatest = data.filter(d => d.state === state).sort((a, b) => b.year - a.year)[0];
  if (!stateLatest) return ['Dados insuficientes para análise regional.'];

  const recommendations = [];
  const yieldPerArea = stateLatest.production / stateLatest.area;

  if (yieldPerArea < 20) {
    recommendations.push(`[ALERTA] Baixa densidade produtiva em ${state}. Recomendado adensamento de plantio e renovação genética.`);
  }
  if (stateLatest.region === 'NORTE' || stateLatest.region === 'NORDESTE') {
    recommendations.push('Investimento em sistemas de irrigação por gotejamento para mitigar estresse hídrico severo.');
  }
  if (stateLatest.productivity > 3000) {
    recommendations.push('Alta performance detectada. Focar em certificações de cafés especiais e rastreabilidade para agregação de valor.');
  }
  const nitroNeed = (stateLatest.productivity * 0.12).toFixed(2);
  recommendations.push(`Cálculo de Reposição Nutricional: Estimado ${nitroNeed}kg de N/ha para manter patamar produtivo.`);
  return recommendations;
};

export const analyzeSeasonalTrends = (data) => {
  const sorted = [...data].sort((a, b) => a.year - b.year);
  const changes = sorted.map((d, i) => {
    if (i === 0) return 0;
    return ((d.production - sorted[i - 1].production) / sorted[i - 1].production) * 100;
  });
  const avgVolatility = Math.sqrt(changes.reduce((sq, n) => sq + n * n, 0) / changes.length);
  return {
    volatility: avgVolatility,
    trendDirection: changes[changes.length - 1] > 0 ? 'Crescente' : 'Decrescente',
    isCyclic: avgVolatility > 15,
  };
};

export const detectAnomalies = (data) => {
  if (data.length < 4) return [];
  const values = data.map(d => d.production).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  return data.filter(d => d.production < lowerBound || d.production > upperBound);
};
