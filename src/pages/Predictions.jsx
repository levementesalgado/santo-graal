import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Zap,
  Target,
  ShieldCheck,
  Info,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Sigma,
  Loader2
} from 'lucide-react';
import {
  ConabData,
} from '@/lib/index';
import {
  runPredictiveModel,
  analyzeSeasonalTrends,
  detectAnomalies
} from '@/lib/analytics';
import { PredictionChart, TimeSeriesChart } from '@/components/Charts';
import {
  MetricsCard,
  InsightCard,
  RecommendationPanel,
} from '@/components/Analytics';
import { useAllConabData, useStateConabData, useAvailableStates } from '@/hooks/useConabData';

const springTransition = {
  type,
  stiffness,
  damping: 30
};

export default function Predictions() {
  const [selectedCrop, setSelectedCrop] = useState('Café Arábica');
  const [selectedState, setSelectedState] = useState('MG');
  const [horizon, setHorizon] = useState(3);

  const { data: allData = [], isLoading: isLoadingAll } = useAllConabData();
  const { data: stateData = [], isLoading: isLoadingState } = useStateConabData(selectedState);
  const { data: availableStates = [] } = useAvailableStates();

  const isLoading = isLoadingAll || isLoadingState;

  const cropFilteredData = useMemo(() => {
    const base = stateData.filter(d => d.crop === selectedCrop);

    return base.length > 0 ? base : stateData;
  }, [stateData, selectedCrop]);

  const sortedData = useMemo(() =>
    [...cropFilteredData].sort((a, b) => a.year - b.year),
  [cropFilteredData]);

  const availableCrops = useMemo(() =>
    Array.from(new Set(allData.map(d => d.crop))).sort(),
  [allData]);

  const predictions = useMemo(() => runPredictiveModel(sortedData, horizon), [sortedData, horizon]);
  const trends = useMemo(() => analyzeSeasonalTrends(sortedData), [sortedData]);
  const anomalies = useMemo(() => detectAnomalies(sortedData), [sortedData]);

  const lastPrediction = predictions[predictions.length - 1];
  const firstPrediction = predictions[0];

  const latestYear = useMemo(() => Math.max(...allData.map(d => d.year), 2026), [allData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="animate-spin" />
        <span className="text-sm font-medium">Carregando modelos preditivos...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold tracking-wider uppercase text-xs">
            <BrainCircuit className="w-4 h-4" />
            <span>Inteligência Preditiva CONAB</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Modelagem Preditiva & <span className="text-primary">Projeções de Safra</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Algoritmos de suavização exponencial e ajuste de bienalidade aplicados sobre dados reais da CONAB.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border border-border shadow-sm flex-wrap">
          <div className="flex flex-col px-3">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Estado</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent font-semibold text-sm outline-none cursor-pointer"
            >
              {availableStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col px-3 border-l border-border">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Cultura</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-transparent font-semibold text-sm outline-none cursor-pointer"
            >
              {availableCrops.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col px-3 border-l border-border">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Horizonte</label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="bg-transparent font-semibold text-sm outline-none cursor-pointer"
            >
              <option value={3}>3 Anos</option>
              <option value={5}>5 Anos</option>
              <option value={10}>10 Anos</option>
            </select>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity, y: 20 }} animate={{ opacity, y: 0 }} transition={{ ...springTransition, delay: 0.1 }}>
          <MetricsCard
            metric={`Produção Estimada ${latestYear + 1}`}
            value={firstPrediction?.predictedValue || 0}
            unit="mil sacas"
            trend={firstPrediction?.growthRate > 0 ? 'up' : 'down'}
            subtitle={`Crescimento de ${firstPrediction?.growthRate.toFixed(2) ?? '0'}%`}
          />
        </motion.div>

        <motion.div initial={{ opacity, y: 20 }} animate={{ opacity, y: 0 }} transition={{ ...springTransition, delay: 0.2 }}>
          <MetricsCard
            metric="Confiança do Modelo"
            value={(firstPrediction?.confidenceScore || 0) * 100}
            unit="%"
            trend="stable"
            subtitle="Algoritmo Holt-Winters"
          />
        </motion.div>

        <motion.div initial={{ opacity, y: 20 }} animate={{ opacity, y: 0 }} transition={{ ...springTransition, delay: 0.3 }}>
          <MetricsCard
            metric="Volatilidade Histórica"
            value={trends.volatility}
            unit="%"
            trend={trends.isCyclic ? 'up' : 'stable'}
            subtitle={trends.isCyclic ? "Ciclo Bienal Forte" : "Produção Estável"}
          />
        </motion.div>

        <motion.div initial={{ opacity, y: 20 }} animate={{ opacity, y: 0 }} transition={{ ...springTransition, delay: 0.4 }}>
          <MetricsCard
            metric="Anomalias Detectadas"
            value={anomalies.length}
            unit="eventos"
            trend={anomalies.length > 2 ? 'up' : 'stable'}
            subtitle="Desvios de Safra (IQR)"
          />
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col"
          initial={{ opacity, scale: 0.95 }}
          animate={{ opacity, scale: 1 }}
          transition={springTransition}
        >
          <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Curva de Projeção Temporal</h3>
                <p className="text-xs text-muted-foreground">{selectedState} — {selectedCrop} | Dados reais CONAB</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase py-1 px-2 bg-primary/20 text-primary rounded-full">
              <Target className="w-3 h-3" />
              Predição
            </span>
          </div>
          <div className="flex-1 p-6 min-h-[400px]">
            <PredictionChart data={sortedData} showPredictions={true} />
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity, x: 20 }}
          animate={{ opacity, x: 0 }}
          transition={springTransition}
        >
          <div className="bg-secondary/10 rounded-3xl p-6 border border-secondary/20 space-y-4">
            <div className="flex items-center gap-2 text-secondary">
              <Sigma className="w-5 h-5" />
              <h3 className="font-bold text-lg">Base Matemática</h3>
            </div>
            <div className="space-y-4">
              {firstPrediction?.equations.map((eq, i) => (
                <div key={i} className="p-3 bg-background/50 rounded-xl border border-border/50">
                  <code className="text-sm font-mono text-foreground block">{eq}</code>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              *Regressão linear ponderada com fator de amortecimento sazonal aplicado a dados históricos reais.
            </p>
          </div>

          <InsightCard
            title="Análise de Cenários"
            description={`Baseado nos dados históricos de ${selectedState}, o modelo aponta tendência ${trends.trendDirection.toLowerCase()} com volatilidade de ${trends.volatility.toFixed(1)}%.`}
            technicalNote="IC 95% | RMSE aplicado."
            icon={Info}
          />

          {anomalies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Alertas de Integridade
              </h4>
              {anomalies.slice(0, 2).map((a, i) => (
                <AnomalyAlert key={i} data={a} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RecommendationPanel
          title="Recomendações Estratégicas para Safra Alta"
          recommendations={[
            "Otimização da logística de colheita para evitar gargalos no próximo pico.",
            "Planejamento de hedge financeiro para proteção contra volatilidade de preços.",
            "Investimento em capacidade de secagem e armazenamento antecipado.",
            "Análise de fertilidade para reposição massiva pós-safra recorde."
          ]}
        />

        <div className="bg-accent/5 rounded-3xl p-8 border border-accent/20 flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-accent-foreground">Previsões do Modelo</h3>
              <p className="text-sm text-muted-foreground">Projeções para os próximos {horizon} anos</p>
            </div>
          </div>

          <div className="space-y-3">
            {predictions.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border shadow-sm">
                <span className="font-bold">{p.targetYear}</span>
                <div className="text-right">
                  <div className="font-mono font-bold">{p.predictedValue.toLocaleString('pt-BR')} sacas</div>
                  <div className="text-[10px] text-primary">↑ {p.growthRate.toFixed(1)}% | {(p.confidenceScore * 100).toFixed(0)}% conf.</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Dados em tempo real via Supabase — CONAB Open Data</span>
        </div>
        <p>© {latestYear} CONAB Precision Analysis</p>
      </footer>
    </div>
  );
}
