import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ConabData } from '@/lib/index';

interface MetricsCardProps {
  metric: string;
  value: number;
  trend?: 'up' | 'down' | 'stable';
  recommendation?: string;
  unit?: string;
  subtitle?: string;
}

export function MetricsCard({ 
  metric, 
  value, 
  trend, 
  recommendation, 
  unit = '', 
  subtitle 
}: MetricsCardProps) {
  const formattedValue = new Intl.NumberFormat('pt-BR').format(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {metric}
          </CardTitle>
          <TrendIndicator trend={trend} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <div className="text-3xl font-bold tracking-tighter text-foreground font-mono">
              {formattedValue}
              <span className="text-lg ml-1 font-normal text-muted-foreground">{unit}</span>
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
            )}
            {recommendation && (
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 flex gap-2 items-start">
                <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary-foreground/80 leading-relaxed font-medium">
                  {recommendation}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TrendIndicator({ trend }: { trend?: 'up' | 'down' | 'stable' }) {
  if (!trend) return null;

  const configs = {
    up: {
      icon: ArrowUpRight,
      color: 'text-emerald-500 bg-emerald-500/10',
      label: 'Crescente'
    },
    down: {
      icon: ArrowDownRight,
      color: 'text-rose-500 bg-rose-500/10',
      label: 'Decrescente'
    },
    stable: {
      icon: Minus,
      color: 'text-amber-500 bg-amber-500/10',
      label: 'Estável'
    }
  };

  const config = configs[trend];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("px-2 py-0.5 flex items-center gap-1 border-none font-semibold", config.color)}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] uppercase tracking-tighter">{config.label}</span>
    </Badge>
  );
}

export function AnomalyAlert({ data }: { data: ConabData }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex gap-4 items-start"
    >
      <div className="p-2 rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-bold text-destructive uppercase tracking-wide">Anomalia Detectada</h4>
        <p className="text-sm text-foreground/80">
          O registro de <span className="font-bold">{data.state} ({data.year})</span> apresenta desvio estatístico significativo.
          Produção de <span className="font-mono">{data.production} mil sacas</span> fora do intervalo normal (Z-Score &gt; 2.0).
        </p>
        <div className="mt-2 flex gap-2">
          <Badge variant="outline" className="text-[10px] bg-white/50 border-destructive/20">Verificar Metodologia</Badge>
          <Badge variant="outline" className="text-[10px] bg-white/50 border-destructive/20">Ajustar Modelo</Badge>
        </div>
      </div>
    </motion.div>
  );
}

export function RecommendationPanel({ title, recommendations }: { title: string, recommendations: string[] }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-bold">Insights & Recomendações Automáticas</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">{title}</p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={idx}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-3 p-3 rounded-lg bg-card border border-border/40 items-start hover:border-primary/30 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
            </div>
            <p className="text-sm leading-snug text-foreground/90">
              {rec}
            </p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

export function InsightCard({ title, description, technicalNote, icon: Icon = Info }: { 
  title: string, 
  description: string, 
  technicalNote?: string,
  icon?: React.ElementType
}) {
  return (
    <div className="p-5 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-all">
      <div className="flex gap-4">
        <div className="p-2.5 rounded-xl bg-background border border-border/40 shadow-sm">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-bold text-base tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          {technicalNote && (
            <div className="pt-2 border-t border-border/40">
              <p className="text-[11px] font-mono text-muted-foreground/80 leading-tight italic">
                <span className="font-bold uppercase">Nota Técnica:</span> {technicalNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}