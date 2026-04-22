import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Map,
  Zap,
  BarChart3,
  Layers,
  Calendar,
  ChevronRight,
  Activity,
  Target,
  Loader2
} from 'lucide-react';
import {
  ROUTE_PATHS,
  ConabData,
  generateRecommendations
} from '@/lib/index';
import {
  TimeSeriesChart,
  EfficiencyHeatmap,
} from '@/components/Charts';
import {
  MetricsCard,
  AnomalyAlert,
  InsightCard,
} from '@/components/Analytics';
import { FilterPanel, FilterState } from '@/components/Filters';
import { Link } from 'react-router-dom';
import { useAllConabData, useFilteredConabData, useAvailableYears, useAvailableStates } from '@/hooks/useConabData';

const Dashboard = () => {
  const [filters, setFilters] = useState({
    years,
    states,
    crops,
    metric,
    minProductivity,
    comparisonMode: false
  });

  const { data: allData = [], isLoading: isLoadingAll } = useAllConabData();
  const { data: filteredData = [], isLoading: isLoadingFiltered } = useFilteredConabData({
    years,
    states,
    crops,
  });
  const { data: availableYears = [] } = useAvailableYears();
  const { data: availableStates = [] } = useAvailableStates();

  const isLoading = isLoadingAll || isLoadingFiltered;

  const activeData = (filters.years.length === 0 && filters.states.length === 0 && filters.crops.length === 0)
    ? allData
    : filteredData;

  const stats = useMemo(() => {
    const totalProduction = activeData.reduce((acc, curr) => acc + curr.production, 0);
    const avgProductivity = activeData.length > 0
      ? activeData.reduce((acc, curr) => acc + curr.productivity, 0) / activeData.length
      : 0;
    const totalArea = activeData.reduce((acc, curr) => acc + curr.area, 0);

    const stateTotals = activeData.reduce((acc, curr) => {
      acc[curr.state] = (acc[curr.state] || 0) + curr.production;
      return acc;
    }, {});

    const leader = Object.entries(stateTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const lastSync = activeData[0]?.timestamp
      ? new Date(activeData[0].timestamp).toLocaleString('pt-BR')
      : '—';

    return { totalProduction, avgProductivity, totalArea, leader, lastSync };
  }, [activeData]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 space-y-8">
<header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity, x: -20 }}
          animate={{ opacity, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Activity className="text-primary h-8 w-8" />
            Painel de Monitoramento CONAB
          </h1>
          <p className="text-muted-foreground font-medium">
            Análise multidimensional de safras, produtividade e modelagem preditiva de alta precisão.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity, scale: 0.95 }}
          animate={{ opacity, scale: 1 }}
          className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm"
        >
          <div className="px-4 py-2 border-r border-border">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Última Atualização</p>
            <p className="text-sm font-mono font-semibold">
              {isLoading ? '...' : stats.lastSync}
            </p>
          </div>
          <Link
            to={ROUTE_PATHS.DATA_MANAGEMENT}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-primary"
            title="Gerenciar Dados"
          >
            <Layers size={20} />
          </Link>
        </motion.div>
      </header>
{isLoading && (
        <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
          <Loader2 className="animate-spin" />
          <span className="text-sm font-medium">Carregando dados da CONAB...</span>
        </div>
      )}

      {!isLoading && (
        <>
<section className="relative z-10">
            <FilterPanel
              availableYears={availableYears}
              availableStates={availableStates}
              onFilterChange={handleFilterChange}
            />
          </section>
<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              metric="Produção Total"
              value={stats.totalProduction}
              unit="Mil Sacas"
              trend="up"
              subtitle="Volume consolidado no período selecionado"
            />
            <MetricsCard
              metric="Produtividade Média"
              value={stats.avgProductivity}
              unit="Kg/Ha"
              trend="stable"
              subtitle="Eficiência técnica por hectare plantado"
            />
            <MetricsCard
              metric="Área Total"
              value={stats.totalArea}
              unit="Mil Ha"
              trend="up"
              subtitle="Extensão territorial de cultivo ativo"
            />
            <MetricsCard
              metric="Estado Líder"
              value={0}
              subtitle={`Principal polo: ${stats.leader}`}
              unit="Top Volume"
            />
          </section>
<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            <motion.div
              initial={{ opacity, y: 20 }}
              whileInView={{ opacity, y: 0 }}
              viewport={{ once: true }}
              className="xl:col-span-2 space-y-6"
            >
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-chart-1" />
                    <h3 className="text-lg font-bold">Evolução Histórica e Tendências</h3>
                  </div>
                  <Link to={ROUTE_PATHS.ANALYTICS} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                    Ver Análise Detalhada <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="h-[400px] w-full">
                  <TimeSeriesChart data={activeData} selectedYear={filters.years[0]} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Map className="text-chart-4" />
                    <h3 className="text-lg font-bold">Distribuição Regional</h3>
                  </div>
                  <div className="h-[300px]">
                    <RegionalBarChart data={activeData} />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="text-accent" />
                    <h3 className="text-lg font-bold">Insights Algorítmicos</h3>
                  </div>
                  <div className="flex-1 space-y-4">
                    <InsightCard
                      title="Bienalidade do Café"
                      description="Observa-se um padrão cíclico de produção no Sudeste, com flutuações de ~30% entre anos de safra alta e baixa."
                      technicalNote="Equação de Ajuste Sazonal: S(t) = P(t) / MA(t)"
                      icon={BarChart3}
                    />
                    <InsightCard
                      title="Otimização de Produtividade"
                      description="Estados do Norte apresentam crescimento linear na eficiência devido à mecanização acelerada."
                      technicalNote="Taxa de Crescimento Composta (CAGR): 4.2% a.a."
                      icon={Zap}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity, x: 20 }}
              whileInView={{ opacity, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm h-fit">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="text-primary" />
                  <h3 className="text-lg font-bold">Matriz de Eficiência (Heatmap)</h3>
                </div>
                <div className="h-[350px]">
                  <EfficiencyHeatmap data={allData} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2">Alertas e Recomendações</h4>
                {activeData.length > 0 && (
                  <>
                    <AnomalyAlert data={activeData[0]} />
                    <RecommendationPanel
                      title="Diretrizes Estratégicas"
                      recommendations={generateRecommendations(activeData[0])}
                    />
                  </>
                )}
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <p className="text-xs font-mono text-primary/80 leading-relaxed">
                    * Sistema de apoio à decisão baseado em modelagem econométrica. Dados em tempo real via Supabase.
                  </p>
                </div>
              </div>

              <Link
                to={ROUTE_PATHS.PREDICTIONS}
                className="flex items-center justify-between w-full p-6 bg-secondary text-secondary-foreground rounded-3xl hover:opacity-90 transition-all group"
              >
                <div>
                  <p className="text-xs font-bold opacity-70 uppercase">Próximo Passo</p>
                  <h4 className="text-xl font-bold">Explorar Projeções</h4>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:translate-x-1 transition-transform">
                  <ChevronRight />
                </div>
              </Link>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
