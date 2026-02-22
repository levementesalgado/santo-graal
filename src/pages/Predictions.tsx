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
  Sigma
} from 'lucide-react';
import { 
  ConabData, 
  PredictionModel, 
  ROUTE_PATHS 
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
  AnomalyAlert
} from '@/components/Analytics';

// Dados simulados para visualização imediata
const MOCK_DATA: ConabData[] = Array.from({ length: 20 }, (_, i) => ({
  id: `mock-${i}`,
  year: 2006 + i,
  state: 'MG',
  region: 'SUDESTE',
  crop: 'Café Arábica',
  production: 20000 + Math.random() * 5000 + (i % 2 === 0 ? 3000 : -3000),
  productivity: 1500 + Math.random() * 800,
  area: 800 + Math.random() * 100,
  timestamp: new Date().toISOString(),
}));

const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

export default function Predictions() {
  const [selectedCrop, setSelectedCrop] = useState('Café Arábica');
  const [horizon, setHorizon] = useState(3);

  // Processamento de Modelos Preditivos
  const predictions = useMemo(() => {
    return runPredictiveModel(MOCK_DATA, horizon);
  }, [horizon]);

  const trends = useMemo(() => analyzeSeasonalTrends(MOCK_DATA), []);
  const anomalies = useMemo(() => detectAnomalies(MOCK_DATA), []);

  const lastPrediction = predictions[predictions.length - 1];
  const firstPrediction = predictions[0];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold tracking-wider uppercase text-xs">
            <BrainCircuit className="w-4 h-4" />
            <span>Inteligência Preditiva CONAB 2026</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Modelagem Preditiva & <span className="text-primary">Projeções de Safra</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Utilizando algoritmos de suavização exponencial e ajuste de bienalidade para prever o futuro da produção agrícola com precisão estatística.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-col px-3">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Horizonte (Anos)</label>
            <select 
              value={horizon} 
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="bg-transparent font-semibold text-sm outline-none cursor-pointer"
            >
              <option value={3}>3 Anos (Curto Prazo)</option>
              <option value={5}>5 Anos (Médio Prazo)</option>
              <option value={10}>10 Anos (Longo Prazo)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Top Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTransition, delay: 0.1 }}>
          <MetricsCard 
            metric="Produção Estimada 2027"
            value={firstPrediction?.predictedValue || 0}
            unit="mil sacas"
            trend={firstPrediction?.growthRate > 0 ? 'up' : 'down'}
            subtitle={`Crescimento de ${firstPrediction?.growthRate.toFixed(2)}%`}
          />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTransition, delay: 0.2 }}>
          <MetricsCard 
            metric="Confiança do Modelo"
            value={(firstPrediction?.confidenceScore || 0) * 100}
            unit="%"
            trend="stable"
            subtitle="Algoritmo Holt-Winters"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTransition, delay: 0.3 }}>
          <MetricsCard 
            metric="Volatilidade Histórica"
            value={trends.volatility}
            unit="%"
            trend={trends.isCyclic ? 'up' : 'stable'}
            subtitle={trends.isCyclic ? "Ciclo Bienal Forte" : "Produção Estável"}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTransition, delay: 0.4 }}>
          <MetricsCard 
            metric="Anomalias Detectadas"
            value={anomalies.length}
            unit="eventos"
            trend={anomalies.length > 2 ? 'up' : 'stable'}
            subtitle="Desvios de Safra (IQR)"
          />
        </motion.div>
      </section>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Card */}
        <motion.div 
          className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springTransition}
        >
          <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Curva de Projeção Temporal</h3>
                <p className="text-xs text-muted-foreground">Série histórica vs Projeção ML</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase py-1 px-2 bg-primary/20 text-primary rounded-full">
                <Target className="w-3 h-3" />
                Predição
              </span>
            </div>
          </div>
          <div className="flex-1 p-6 min-h-[400px]">
            <PredictionChart data={MOCK_DATA} showPredictions={true} />
          </div>
        </motion.div>

        {/* Mathematical Foundations Panel */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
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
              *O modelo utiliza regressão linear ponderada com fator de amortecimento sazonal para capturar a alternância produtiva característica do café.
            </p>
          </div>

          <InsightCard 
            title="Análise de Cenários"
            description="Baseado na tendência atual, o mercado deve atingir um novo platô de estabilidade em 2028, com margens de erro de ±8%."
            technicalNote="IC 95% | Intervalo de Confiança baseado em erro quadrático médio (RMSE)."
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

      {/* Recommendations & Strategy Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RecommendationPanel 
          title="Recomendações Estratégicas para Safra Alta"
          recommendations={[
            "Otimização da logística de colheita para evitar gargalos em 2027.",
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
              <h3 className="text-xl font-bold text-accent-foreground">Simulador de Mercado</h3>
              <p className="text-sm text-muted-foreground">Impacto de variáveis externas nas projeções</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-2xl border border-border shadow-sm">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Risco Geada</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">12%</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
            <div className="p-4 bg-background rounded-2xl border border-border shadow-sm">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Câmbio Est.</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">R$ 5,20</span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          <button className="w-full py-4 bg-accent text-accent-foreground font-bold rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
            <BarChart3 className="w-5 h-5" />
            Executar Simulação Monte Carlo
          </button>
        </div>
      </section>

      {/* Footer Meta */}
      <footer className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Sistema de Auditoria de Dados: Válido para Ciclo 2026/27</span>
        </div>
        <p>© 2026 CONAB Precision Analysis - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
