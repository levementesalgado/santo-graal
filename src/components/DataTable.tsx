import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConabData } from "@/lib/index";
import { springPresets } from "@/lib/motion";

interface DataTableProps {
  data: ConabData[];
  columns: (keyof ConabData)[];
  filterable?: boolean;
  exportable?: boolean;
}

const COLUMN_LABELS: Record<string, string> = {
  year: "Safra",
  state: "UF",
  region: "Região",
  crop: "Cultura",
  production: "Produção (Mil Sacas)",
  productivity: "Produtividade (kg/ha)",
  area: "Área (Mil ha)",
  timestamp: "Sincronização"
};

export function DataTable({ data, columns, filterable = true, exportable = true }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof ConabData; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleSort = (key: keyof ConabData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(item => 
        item.state.toLowerCase().includes(lowerSearch) ||
        item.crop.toLowerCase().includes(lowerSearch) ||
        item.region.toLowerCase().includes(lowerSearch) ||
        item.year.toString().includes(lowerSearch)
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, sortConfig]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const exportToCSV = () => {
    const headers = columns.map(c => COLUMN_LABELS[c] || c).join(",");
    const rows = filteredData.map(item => 
      columns.map(c => item[c as keyof ConabData]).join(",")
    ).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `conab_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {filterable && (
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Pesquisar por UF, Cultura ou Região..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border rounded-xl focus-visible:ring-primary/20"
            />
          </div>
        )}
        <div className="flex gap-2 w-full md:w-auto">
          {exportable && (
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="rounded-xl border-border hover:bg-muted text-foreground gap-2 w-full md:w-auto"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              {columns.map((col) => (
                <TableHead 
                  key={col} 
                  className="font-semibold text-foreground cursor-pointer select-none"
                  onClick={() => handleSort(col as keyof ConabData)}
                >
                  <div className="flex items-center gap-2">
                    {COLUMN_LABELS[col] || col}
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {paginatedData.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="group border-border hover:bg-muted/30 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell key={`${item.id}-${col}`} className="py-4 font-mono text-sm">
                      {renderCellContent(col, item[col as keyof ConabData])}
                    </TableCell>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{paginatedData.length}</span> de <span className="font-semibold text-foreground">{filteredData.length}</span> registros
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="rounded-lg border-border"
          >
            Anterior
          </Button>
          <div className="flex items-center gap-1 px-2">
            <span className="text-sm font-medium">{currentPage}</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{totalPages || 1}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="rounded-lg border-border"
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}

function renderCellContent(col: string, value: any) {
  if (col === 'region') {
    const regionColors: Record<string, string> = {
      'SUDESTE': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      'NORTE': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      'NORDESTE': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      'CENTRO-OESTE': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
      'SUL': 'bg-chart-5/10 text-chart-5 border-chart-5/20'
    };
    return <Badge variant="outline" className={`rounded-md font-sans font-medium ${regionColors[value as string] || ''}`}>{value}</Badge>;
  }

  if (col === 'production' || col === 'productivity' || col === 'area') {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  if (col === 'timestamp') {
    return new Date(value).toLocaleDateString('pt-BR');
  }

  return value;
}

export function MetricsTable({ data }: { data: ConabData[] }) {
  const metrics = useMemo(() => {
    const statsByState = data.reduce((acc, curr) => {
      if (!acc[curr.state]) acc[curr.state] = { prod: [], yield: [], area: 0 };
      acc[curr.state].prod.push(curr.production);
      acc[curr.state].yield.push(curr.productivity);
      acc[curr.state].area += curr.area;
      return acc;
    }, {} as Record<string, { prod: number[], yield: number[], area: number }>);

    return Object.entries(statsByState).map(([state, values]) => ({
      state,
      avgProd: values.prod.reduce((a, b) => a + b, 0) / values.prod.length,
      avgYield: values.yield.reduce((a, b) => a + b, 0) / values.yield.length,
      trend: values.yield[values.yield.length - 1] > values.yield[values.yield.length - 2] ? 'up' : 'down'
    }));
  }, [data]);

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead>Estado</TableHead>
            <TableHead>Produção Média</TableHead>
            <TableHead>Produtividade Média</TableHead>
            <TableHead>Tendência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((m) => (
            <TableRow key={m.state} className="border-border">
              <TableCell className="font-bold">{m.state}</TableCell>
              <TableCell className="font-mono">{m.avgProd.toFixed(2)} Mil Sacas</TableCell>
              <TableCell className="font-mono">{m.avgYield.toFixed(2)} kg/ha</TableCell>
              <TableCell>
                {m.trend === 'up' ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                    <TrendingUp className="w-3 h-3" /> Alta
                  </Badge>
                ) : (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                    <TrendingDown className="w-3 h-3" /> Queda
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ComparisonTable({ data, states, years }: { data: ConabData[], states: string[], years: number[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {states.map(state => (
          <div key={state} className="p-4 rounded-2xl border border-border bg-card shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Análise Comparativa: {state}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead>
                  <TableHead>Produtividade</TableHead>
                  <TableHead>Área</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.filter(d => d.state === state && years.includes(d.year)).map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-semibold">{d.year}</TableCell>
                    <TableCell className="font-mono text-primary">{d.productivity} kg/ha</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{d.area} k/ha</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  );
}
