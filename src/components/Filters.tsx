import React, { useState, useEffect, useCallback } from 'react';
import { 
  Filter, 
  X, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Layers, 
  SlidersHorizontal, 
  Check,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface FilterState {
  years: number[];
  states: string[];
  crops: string[];
  metric: 'production' | 'productivity' | 'area';
  minProductivity: number;
  comparisonMode: boolean;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  availableYears: number[];
  availableStates: string[];
}

export function FilterPanel({ onFilterChange, availableYears, availableStates }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    years: [2026],
    states: availableStates.slice(0, 5),
    crops: ['Café Arábica', 'Café Conillon'],
    metric: 'production',
    minProductivity: 0,
    comparisonMode: false,
  });

  const handleUpdate = useCallback((updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const resetFilters = () => {
    const reset = {
      years: [2026],
      states: availableStates.slice(0, 5),
      crops: ['Café Arábica', 'Café Conillon'],
      metric: 'production' as const,
      minProductivity: 0,
      comparisonMode: false,
    };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border w-full max-w-xs overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm tracking-tight">Filtros Avançados</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Resetar
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <Accordion type="multiple" defaultValue={['years', 'states', 'metrics']} className="w-full">
            <AccordionItem value="years" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Série Temporal</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <YearSelector 
                  years={availableYears} 
                  selected={filters.years} 
                  onChange={(y) => handleUpdate({ years: y })} 
                />
              </AccordionContent>
            </AccordionItem>

            <Separator className="my-2 opacity-50" />

            <AccordionItem value="states" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Abrangência Regional</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <StateSelector 
                  states={availableStates} 
                  selected={filters.states} 
                  onChange={(s) => handleUpdate({ states: s })} 
                />
              </AccordionContent>
            </AccordionItem>

            <Separator className="my-2 opacity-50" />

            <AccordionItem value="metrics" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium">Métricas de Eficiência</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-4">
                <MetricSelector 
                  current={filters.metric} 
                  onChange={(m) => handleUpdate({ metric: m })} 
                />
                <RangeFilter 
                  value={filters.minProductivity} 
                  onChange={(v) => handleUpdate({ minProductivity: v })} 
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="pt-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Modo Comparativo</Label>
                <p className="text-[10px] text-muted-foreground">Análise de bienalidade ativa</p>
              </div>
              <Switch 
                checked={filters.comparisonMode} 
                onCheckedChange={(c) => handleUpdate({ comparisonMode: c })} 
              />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-muted/10">
        <div className="flex flex-wrap gap-1">
          {filters.states.length > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] py-0">
              {filters.states.length} UFs
            </Badge>
          )}
          {filters.years.length > 0 && (
            <Badge variant="secondary" className="bg-accent/10 text-accent border-none text-[10px] py-0">
              {filters.years.length} Anos
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function YearSelector({ years, selected, onChange }: { years: number[], selected: number[], onChange: (y: number[]) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {years.sort((a, b) => b - a).map((year) => (
        <button
          key={year}
          onClick={() => {
            const next = selected.includes(year) 
              ? selected.filter(y => y !== year) 
              : [...selected, year];
            if (next.length > 0) onChange(next);
          }}
          className={cn(
            "px-2 py-1.5 rounded-md text-[11px] font-mono transition-all duration-200 border",
            selected.includes(year) 
              ? "bg-accent text-accent-foreground border-accent" 
              : "bg-background hover:bg-muted border-border text-muted-foreground"
          )}
        >
          {year}
        </button>
      ))}
    </div>
  );
}

export function StateSelector({ states, selected, onChange }: { states: string[], selected: string[], onChange: (s: string[]) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selected.map(s => (
          <Badge key={s} variant="outline" className="gap-1 pl-2 pr-1 py-0.5 text-[10px] rounded-full bg-primary/5 border-primary/20">
            {s}
            <X 
              className="w-3 h-3 cursor-pointer hover:text-destructive"
              onClick={() => onChange(selected.filter(x => x !== s))}
            />
          </Badge>
        ))}
      </div>
      <ScrollArea className="h-[180px] pr-2">
        <div className="space-y-1">
          {states.map((state) => (
            <div 
              key={state} 
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => {
                const next = selected.includes(state) 
                  ? selected.filter(s => s !== state) 
                  : [...selected, state];
                onChange(next);
              }}
            >
              <Checkbox 
                id={`state-${state}`} 
                checked={selected.includes(state)} 
                onCheckedChange={() => {}} // Handled by div click
                className="rounded-sm border-primary/50 data-[state=checked]:bg-primary"
              />
              <label className="text-xs font-medium leading-none cursor-pointer">
                {state}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export function MetricSelector({ current, onChange }: { current: string, onChange: (m: 'production' | 'productivity' | 'area') => void }) {
  const metrics = [
    { id: 'production', label: 'Produção Total', desc: 'Mil sacas de 60kg' },
    { id: 'productivity', label: 'Produtividade', desc: 'kg por hectare' },
    { id: 'area', label: 'Área Plantada', desc: 'Mil hectares' },
  ] as const;

  return (
    <div className="space-y-2">
      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Variável Analítica</Label>
      <div className="space-y-1.5">
        {metrics.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={cn(
              "w-full flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300",
              current === m.id 
                ? "bg-primary/10 border-primary text-primary shadow-sm" 
                : "bg-background border-border hover:border-primary/30"
            )}
          >
            <div className="text-left">
              <p className={cn("text-xs font-bold", current === m.id ? "text-primary" : "text-foreground")}>{m.label}</p>
              <p className="text-[9px] text-muted-foreground">{m.desc}</p>
            </div>
            {current === m.id && <Check className="w-3 h-3" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RangeFilter({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Limiar de Produtividade</Label>
        <span className="text-[11px] font-mono font-bold text-primary">{value} kg/ha</span>
      </div>
      <Slider
        value={[value]}
        max={5000}
        step={100}
        onValueChange={(v) => onChange(v[0])}
        className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
      />
      <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
        <span>0</span>
        <span>2.5k</span>
        <span>5k</span>
      </div>
    </div>
  );
}
