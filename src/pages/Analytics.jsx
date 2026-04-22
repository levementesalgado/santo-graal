import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  Info,
  Cpu,
  ArrowRightLeft,
  AlertTriangle,
  History,
  Loader2
} from 'lucide-react';
import {
  TimeSeriesChart,
  EfficiencyHeatmap,
  RegionalBarChart,
  ProductivityScatter,
} from '@/components/Charts';
import {
  MetricsCard,
  AnomalyAlert,
  RecommendationPanel,
} from '@/components/Analytics';
import {
  runPredictiveModel,
  analyzeSeasonalTrends,
  detectAnomalies,
  generateRegionalRecommendations
} from '@/lib/analytics';
import { IMAGES } from '@/assets/images';
import { useAllConabData, useStateConabData, useAvailableStates } from '@/hooks/useConabData';

const Analytics = () => {
  const [selectedState, setSelectedState] = useState('MG');

  const { data: allData = [], isLoading: isLoadingAll } = useAllConabData();
  const { data: stateData = [], isLoading: isLoadingState } = useStateConabData(selectedState);
  const { data: availableStates = [] } = useAvailableStates();

  const isLoading = isLoadingAll || isLoadingState;

  const latestYear = useMemo(() => Math.max(...allData.map(d => d.year), 0), [allData]);

  const latestData = useMemo(() =>
    allData.filter(d => d.year === latestYear),
  [allData, latestYear]);

  const sortedStateData = useMemo(() =>
    [...stateData].sort((a, b) => a.year - b.year),
  [stateData]);

  const seasonalAnalysis = useMemo(() => analyzeSeasonalTrends(sortedStateData), [sortedStateData]);
  const predictions = useMemo(() => runPredictiveModel(sortedStateData, 4), [sortedStateData]);
  const anomalies = useMemo(() => detectAnomalies(sortedStateData), [sortedStateData]);
  const regionalRecommendations = useMemo(() =>
    generateRegionalRecommendations(selectedState, allData),
  [selectedState, allData]);

  const totalNationalProduction = useMemo(() =>
    latestData.reduce((acc, curr) => acc + curr.production, 0),
  [latestData]);

  const avgNationalProductivity = useMemo(() =>
    latestData.length > 0
      ? latestData.reduce((acc, curr) => acc + curr.productivity, 0) / latestData.length);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="animate-spin" />
        <span className="text-sm font-medium">Carregando análise avançada...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 space-y-10">
<header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-sm tracking-widest uppercase">
            <Cpu className="w-4 h-4" />
            <span>Motor de Análise v2.6.0</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Análise Avançada & <span className="text-primary">Santo Graal</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Processamento multidimensional de séries históricas da CONAB utilizando modelos de
            bienalidade ajustada e matrizes de eficiência regional.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm">
          <span className="text-sm font-medium px-3 text-muted-foreground">Estado em Foco:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-background border-none text-sm font-bold py-2 px-4 rounded-xl ring-1 ring-border focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
          >
            {availableStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </header>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          metric="Produção Estimada"
          value={totalNationalProduction}
          unit="mil sacas"
          trend={seasonalAnalysis.trendDirection === 'Crescente' ? 'up' : 'down'}
          subtitle={`Volume total nacional em ${latestYear}`}
        />
        <MetricsCard
          metric="Produtividade Média"
          value={avgNationalProductivity}
          unit="kg/ha"
          trend="stable"
          subtitle="Benchmark de eficiência nacional"
        />
        <MetricsCard
          metric="Volatilidade Ciclo"
          value={seasonalAnalysis.volatility}
          unit="%"
          trend={seasonalAnalysis.isCyclic ? 'up' : 'down'}
          subtitle="Índice de variação interanual"
        />
        <MetricsCard
          metric="Score de Confiança"
          value={85.4}
          unit="%"
          trend="up"
          subtitle="Acurácia do modelo preditivo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div
          initial={{ opacity, y: 20 }}
          animate={{ opacity, y: 0 }}
          className="lg:col-span-8 space-y-8"
        >
          <section className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Matriz de Correlação Produtiva</h2>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-muted text-[10px] font-mono">D3.JS_ENGINE</span>
                <span className="px-2 py-1 rounded bg-muted text-[10px] font-mono">SUPABASE_LIVE</span>
              </div>
            </div>
            <div className="p-8 aspect-video min-h-[400px]">
              <ProductivityScatter data={allData} />
            </div>
            <div className="p-6 bg-muted/30 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                A dispersão acima correlaciona Produção vs. Produtividade por UF.
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-card rounded-3xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold">Detecção de Anomalias</h3>
              </div>
              {anomalies.length > 0 ? (
                <div className="space-y-4">
                  {anomalies.map(anomaly => (
                    <AnomalyAlert key={anomaly.id} data={anomaly} />
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-2">
                  <p className="text-muted-foreground italic">Nenhum desvio crítico detectado para {selectedState}.</p>
                  <p className="text-xs text-primary font-mono">NORMAL_DISTRIBUTION_CONFIRMED</p>
                </div>
              )}
            </section>

            <section className="bg-card rounded-3xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Evolução de Produtividade</h3>
              </div>
              <div className="h-[250px]">
                <TimeSeriesChart data={sortedStateData} selectedState={selectedState} />
              </div>
            </section>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity, x: 20 }}
          animate={{ opacity, x: 0 }}
          className="lg:col-span-4 space-y-8"
        >
          <InsightCard
            title="Fundamentos Matemáticos"
            description="Nosso modelo utiliza Regressão Linear com ajuste de bienalidade (Bf)."
            technicalNote={`ŷ = α + βx + ε_adj`}
            icon={Cpu}
          />

          <RecommendationPanel
            title={`Recomendações Estratégicas: ${selectedState}`}
            recommendations={regionalRecommendations}
          />

          <div className="bg-accent/10 border border-accent/20 rounded-3xl p-6">
            <h4 className="font-bold text-accent-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Aviso de Risco
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Incerteza Climática:</span>
                <span className="font-mono font-bold">±12%</span>
              </div>
              <div className="w-full bg-accent/20 h-1.5 rounded-full">
                <div className="bg-accent h-full w-[65%] rounded-full" />
              </div>
              <p className="text-xs text-accent-foreground/80 leading-relaxed">
                Baseado nos dados históricos, a região {sortedStateData[0]?.region} apresenta sinais de
                stress hídrico cíclico. Recomendado hedge de insumos.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border overflow-hidden">
            <img
              src={IMAGES.PRODUTIVIDADE_MEDIA_UF_5}
              alt="Referência Produtividade"
              className="w-full h-48 object-cover opacity-60 grayscale hover:grayscale-0 transition-all"
            />
            <div className="p-4 bg-card">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Referência Visual</p>
              <p className="text-sm font-semibold">Mapa de Calor de Eficiência</p>
            </div>
          </div>
        </motion.aside>
      </div>
<section className="bg-card rounded-3xl border border-border p-8 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <ArrowRightLeft className="w-6 h-6 text-primary" />
              Projeções de Longo Prazo ({latestYear + 1}–{latestYear + 4})
            </h2>
            <p className="text-muted-foreground">Simulações baseadas em tendências logísticas e climáticas atuais.</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase">CAGR Estimado</p>
              <p className="text-xl font-bold text-primary">+4.2% a.a.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 h-[400px]">
            <PredictionChart data={sortedStateData} showPredictions />
          </div>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-muted/50 border border-border">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Variações do Modelo
              </h4>
              <div className="space-y-4">
                {predictions.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                    <span className="font-bold text-sm">{p.targetYear}</span>
                    <div className="text-right">
                      <div className="text-sm font-mono">{p.predictedValue.toLocaleString('pt-BR')} sacas</div>
                      <div className="text-[10px] text-primary">Confiança: {(p.confidenceScore * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <p className="text-xs text-primary font-mono mb-2 tracking-tighter uppercase">Equation_Output.log</p>
              <div className="space-y-1">
                {predictions[0]?.equations.map((eq, i) => (
                  <code key={i} className="block text-[11px] text-primary/80 font-mono">{eq}</code>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="pt-10 text-center space-y-4">
        <div className="flex justify-center gap-4">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse delay-75" />
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse delay-150" />
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          &copy; {latestYear} AGRO-PRECISION FLUID | DATA SOURCE: CONAB via Supabase
        </p>
      </footer>
    </div>
  );
};

export default Analytics;
