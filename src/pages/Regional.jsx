import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  TrendingUp,
  Award,
  Zap,
  Calculator,
  Info,
  Filter,
  BarChart3,
  Loader2
} from 'lucide-react';
import {
} from '@/lib/index';
import {
  calculateEfficiencyMatrix,
  generateRegionalRecommendations
} from '@/lib/analytics';
import {
  RegionalBarChart,
  ProductivityScatter,
} from '@/components/Charts';
import { MetricsTable } from '@/components/DataTable';
import { IMAGES } from '@/assets/images';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAllConabData } from '@/hooks/useConabData';

const springProps = {
  type,
  stiffness,
  damping: 30
};

export default function Regional() {
  const [selectedRegion, setSelectedRegion] = useState('TODAS');
  const [selectedState, setSelectedState] = useState(null);

  const { data: allData = [], isLoading } = useAllConabData();

  const efficiencyMatrix = useMemo(() => calculateEfficiencyMatrix(allData), [allData]);

  const regions = ['TODAS', 'NORTE', 'NORDESTE', 'CENTRO-OESTE', 'SUDESTE', 'SUL'];

  const filteredMatrix = useMemo(() => {
    if (selectedRegion === 'TODAS') return efficiencyMatrix;
    return efficiencyMatrix.filter(item => item.region === selectedRegion);
  }, [selectedRegion, efficiencyMatrix]);

  const activeStateData = useMemo(() => {
    if (!selectedState) return null;
    return efficiencyMatrix.find(s => s.state === selectedState);
  }, [selectedState, efficiencyMatrix]);

  const recommendations = useMemo(() => {
    if (!selectedState) return [];
    return generateRegionalRecommendations(selectedState, allData);
  }, [selectedState, allData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="animate-spin" />
        <span className="text-sm font-medium">Carregando análise regional...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity, x: -20 }}
            animate={{ opacity, x: 0 }}
            className="text-3xl font-bold tracking-tight text-foreground"
          >
            Análise Regional de Performance
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento de eficiência produtiva e diagnóstico geo-econômico por UF (Dados CONAB).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                selectedRegion === region
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMatrix.slice(0, 4).map((item, idx) => (
            <motion.div
              key={item.state}
              layout
              initial={{ opacity, y: 20 }}
              animate={{ opacity, y: 0 }}
              transition={{ delay: idx * 0.1, ...springProps }}
            >
              <Card
                className={`p-6 cursor-pointer border-2 transition-all hover:shadow-xl ${
                  selectedState === item.state ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-border/50'
                }`}
                onClick={() => setSelectedState(item.state)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-background rounded-lg shadow-inner">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant={item.efficiencyIndex > 1 ? 'default' : 'secondary'}>
                    Rank #{item.rank}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold">{item.state}</h3>
                <p className="text-xs text-muted-foreground mb-4">{item.region}</p>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-muted-foreground">Produtividade</span>
                    <span className="font-mono font-bold">{item.avgProductivity.toLocaleString()} <small className="font-sans text-[10px]">kg/ha</small></span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (item.efficiencyIndex / 2) * 100)}%` }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <Tabs defaultValue="comparison" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="comparison" className="gap-2">
                  <BarChart3 className="w-4 h-4" /> Comparação Regional
                </TabsTrigger>
                <TabsTrigger value="efficiency" className="gap-2">
                  <Zap className="w-4 h-4" /> Matriz de Eficiência
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="comparison" className="mt-0">
              <Card className="p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Evolução e Produtividade</h2>
                </div>
                <div className="h-[400px] w-full">
                  <RegionalBarChart data={allData} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="efficiency" className="mt-0">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Correlação Produção x Eficiência</h2>
                </div>
                <div className="h-[400px] w-full">
                  <ProductivityScatter data={allData} />
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Tabela Detalhada de Performance</h2>
            </div>
            <MetricsTable data={allData} />
          </Card>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeStateData ? (
              <motion.div
                key={activeStateData.state}
                initial={{ opacity, scale: 0.95 }}
                animate={{ opacity, scale: 1 }}
                exit={{ opacity, scale: 0.95 }}
                className="space-y-6"
              >
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-primary">Ficha Técnica: {activeStateData.state}</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-background rounded-lg border border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Eficiência Relativa</p>
                        <p className="text-lg font-mono font-bold">{activeStateData.efficiencyIndex.toFixed(2)}x</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg border border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Anomalias</p>
                        <p className="text-lg font-mono font-bold">{activeStateData.anomaliesDetected}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Calculator className="w-4 h-4" /> Diagnóstico Técnico
                      </h3>
                      {recommendations.map((rec, i) => (
                        <motion.div
                          key={i}
                          initial={{ x, opacity: 0 }}
                          animate={{ x, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-xs p-3 bg-background rounded-lg border-l-4 border-primary shadow-sm leading-relaxed"
                        >
                          {rec}
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                      <h4 className="text-[10px] font-bold uppercase text-secondary mb-2 tracking-widest">Modelo Matemático Aplicado</h4>
                      <div className="space-y-1 font-mono text-[11px] text-secondary">
                        <p>E_{activeStateData.state} = P_y / P_avg</p>
                        <p>N_ha = P_y * 0.12</p>
                        <p className="text-muted-foreground italic mt-2">Regressão linear de múltiplos períodos</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 overflow-hidden">
                  <h3 className="text-sm font-bold mb-4">Visualização Geográfica (Reference)</h3>
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
                    <img
                      src={IMAGES.PRODUTIVIDADE_MEDIA_UF_5}
                      alt="Mapa de Produtividade"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-4">
                      <p className="text-[10px] text-muted-foreground italic">Mapa de Calor: Concentração de Safra</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
                <div className="p-4 bg-muted rounded-full">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">Selecione um Estado</h3>
                  <p className="text-sm text-muted-foreground">Escolha uma UF no grid ao lado para ver diagnósticos específicos e recomendações técnicas.</p>
                </div>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Matriz de Intensidade Temporal</h2>
            <p className="text-muted-foreground text-sm">Visão panorâmica de produtividade histórica por estado.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-[10px] text-muted-foreground">Baixa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span className="text-[10px] text-muted-foreground">Média</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-[10px] text-muted-foreground">Alta</span>
            </div>
          </div>
        </div>

        <div className="h-[450px] w-full bg-card/50 rounded-xl">
          <EfficiencyHeatmap data={allData} />
        </div>
      </Card>
    </div>
  );
}
