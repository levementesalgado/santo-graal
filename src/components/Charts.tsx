import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Cell,
  ZAxis,
  TooltipProps
} from 'recharts';
import { motion } from 'framer-motion';
import { ConabData, PredictionModel } from '@/lib/index';
import { runPredictiveModel, calculateEfficiencyMatrix } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { springPresets } from '@/lib/motion';

interface ChartsProps {
  data: ConabData[];
  selectedYear?: number;
  selectedState?: string;
  showPredictions?: boolean;
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/90 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl">
        <p className="text-sm font-bold text-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground font-medium">{entry.name}:</span>
            <span className="font-mono font-bold">{entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TimeSeriesChart({ data, selectedState }: ChartsProps) {
  const chartData = useMemo(() => {
    const years = Array.from(new Set(data.map(d => d.year))).sort();
    const states = selectedState ? [selectedState] : Array.from(new Set(data.map(d => d.state))).slice(0, 5);
    
    return years.map(year => {
      const entry: any = { year };
      states.forEach(state => {
        const record = data.find(d => d.year === year && d.state === state);
        if (record) entry[state] = record.production;
      });
      return entry;
    });
  }, [data, selectedState]);

  const states = selectedState ? [selectedState] : Array.from(new Set(data.map(d => d.state))).slice(0, 5);

  return (
    <Card className="w-full h-full bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          Evolução da Produção
          <span className="text-xs font-normal text-muted-foreground">(mil sacas)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            {states.map((state, idx) => (
              <Line
                key={state}
                type="monotone"
                dataKey={state}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: 'var(--card)' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EfficiencyHeatmap({ data }: ChartsProps) {
  const heatmapData = useMemo(() => {
    const states = Array.from(new Set(data.map(d => d.state))).sort();
    const years = Array.from(new Set(data.map(d => d.year))).sort().slice(-6);
    
    return states.map(state => {
      const row: any = { state };
      years.forEach(year => {
        const record = data.find(d => d.year === year && d.state === state);
        row[`y${year}`] = record ? record.productivity : 0;
      });
      return row;
    });
  }, [data]);

  const years = Array.from(new Set(data.map(d => d.year))).sort().slice(-6);

  const getColor = (value: number) => {
    if (value === 0) return 'transparent';
    const intensity = Math.min(Math.max(value / 3500, 0.1), 1);
    return `oklch(0.62 ${0.17 * intensity} 163 / ${0.3 + intensity * 0.7})`;
  };

  return (
    <Card className="w-full bg-card/50 border-border/50 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Matriz de Eficiência (kg/ha)</CardTitle>
        <CardDescription>Performance produtiva por UF e Período</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto pb-6">
        <div className="min-w-[600px]">
          <div className="flex mb-2">
            <div className="w-24" />
            {years.map(year => (
              <div key={year} className="flex-1 text-center text-xs font-mono text-muted-foreground">{year}</div>
            ))}
          </div>
          {heatmapData.map((row, i) => (
            <div key={row.state} className="flex h-10 items-center border-b border-border/20 last:border-0">
              <div className="w-24 text-sm font-bold text-foreground">{row.state}</div>
              {years.map(year => (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...springPresets.snappy, delay: i * 0.05 }}
                  className="flex-1 h-8 m-1 rounded-md flex items-center justify-center text-[10px] font-mono font-medium transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: getColor(row[`y${year}`]), color: row[`y${year}`] > 2000 ? 'white' : 'var(--foreground)' }}
                  title={`${row.state} - ${year}: ${row[`y${year}`].toFixed(0)} kg/ha`}
                >
                  {row[`y${year}`] > 0 ? Math.round(row[`y${year}`]) : '-'}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RegionalBarChart({ data, selectedYear = 2026 }: ChartsProps) {
  const chartData = useMemo(() => {
    return data
      .filter(d => d.year === selectedYear)
      .sort((a, b) => b.production - a.production)
      .slice(0, 10);
  }, [data, selectedYear]);

  return (
    <Card className="w-full h-full bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Produção Total por UF ({selectedYear})</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
            <XAxis type="number" axisLine={false} tickLine={false} hide />
            <YAxis 
              dataKey="state" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="production" 
              radius={[0, 10, 10, 0]} 
              barSize={24}
              animationDuration={2000}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ProductivityScatter({ data }: ChartsProps) {
  const chartData = useMemo(() => {
    return data.filter(d => d.year === 2026).map(d => ({
      x: d.area,
      y: d.productivity,
      z: d.production,
      name: d.state,
      region: d.region
    }));
  }, [data]);

  return (
    <Card className="w-full h-full bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Matriz Área x Produtividade (2026)</CardTitle>
        <CardDescription>Tamanho da bolha representa produção total</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Área" 
              unit=" mil ha" 
              axisLine={false} 
              tickLine={false}
              label={{ value: 'Área Plantada', position: 'insideBottom', offset: -10, fill: 'var(--muted-foreground)' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Produtividade" 
              unit=" kg/ha" 
              axisLine={false} 
              tickLine={false}
              label={{ value: 'Produtividade', angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)' }}
            />
            <ZAxis type="number" dataKey="z" range={[100, 3000]} name="Produção" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Scatter name="Estados" data={chartData} fill="var(--primary)" animationDuration={1500}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  fillOpacity={0.6} 
                  stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                  strokeWidth={2} 
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PredictionChart({ data, selectedState = 'MG' }: ChartsProps) {
  const stateData = useMemo(() => data.filter(d => d.state === selectedState), [data, selectedState]);
  const predictions = useMemo(() => runPredictiveModel(stateData, 4), [stateData]);
  
  const chartData = useMemo(() => {
    const historical = stateData.map(d => ({
      year: d.year,
      production: d.production,
      type: 'Histórico'
    }));

    const predicted = predictions.map(p => ({
      year: p.targetYear,
      production: p.predictedValue,
      lower: p.lowerBound,
      upper: p.upperBound,
      type: 'Projeção'
    }));

    return [...historical, ...predicted].sort((a, b) => a.year - b.year);
  }, [stateData, predictions]);

  return (
    <Card className="w-full h-full bg-card/50 border-primary/20 shadow-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Modelo Preditivo: {selectedState}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Real</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-accent border border-dashed" />
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Predição</span>
            </div>
          </div>
        </CardTitle>
        <div className="mt-2 p-2 bg-muted/30 rounded font-mono text-[10px] text-primary/80">
          {predictions[0]?.equations[0]}
        </div>
      </CardHeader>
      <CardContent className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="transparent"
              fill="var(--accent)"
              fillOpacity={0.1}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="transparent"
              fill="var(--background)"
              fillOpacity={1}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="production"
              stroke="var(--primary)"
              strokeWidth={4}
              dot={{ r: 5, fill: 'var(--card)', strokeWidth: 2 }}
              animationDuration={2500}
            />
            <Line
              type="monotone"
              dataKey="production"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }}
              data={chartData.filter(d => d.type === 'Projeção')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
