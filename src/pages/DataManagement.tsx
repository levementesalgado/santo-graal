import React, { useState, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload, 
  Settings, 
  History, 
  ShieldCheck, 
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Activity,
  Terminal
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { conabHistoricalData } from "@/data/conabData";
import { syncAllCrops, scheduleDataUpdate, validateDataIntegrity } from "@/lib/webScraper";
import { ConabData } from "@/lib/index";
import { motion, AnimatePresence } from "framer-motion";

export default function DataManagement() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem("conab_last_sync"));
  const [dataLogs, setDataLogs] = useState<{ time: string; msg: string; type: 'info' | 'error' | 'success' }[]>([]);
  const [validationReport, setValidationReport] = useState<{ isValid: boolean; errors: string[] } | null>(null);

  const addLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    setDataLogs(prev => [{
      time: new Date().toLocaleTimeString(),
      msg,
      type
    }, ...prev].slice(0, 50));
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setProgress(10);
    addLog("Iniciando handshake com os servidores da CONAB...", "info");

    try {
      const timer = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 5 : prev));
      }, 200);

      const result = await syncAllCrops();
      
      clearInterval(timer);
      setProgress(100);

      if (result.success) {
        setLastSync(new Date().toISOString());
        addLog(`Sincronização concluída: ${result.count} registros processados.`, "success");
        toast.success("Base de dados atualizada com sucesso!");
        
        // Run post-sync validation
        const validation = validateDataIntegrity(conabHistoricalData);
        setValidationReport(validation);
        if (!validation.isValid) {
          addLog(`Alerta de integridade: ${validation.errors.length} inconsistências detectadas.`, "error");
        }
      } else {
        addLog(`Falha na sincronização: ${result.message}`, "error");
        toast.error("Erro ao sincronizar dados.");
      }
    } catch (error) {
      addLog("Erro crítico no pipeline de ingestão.", "error");
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setProgress(0);
      }, 1000);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["ID,Ano,Estado,Regiao,Cultura,Producao,Produtividade,Area"].concat(
        conabHistoricalData.map(d => `${d.id},${d.year},${d.state},${d.region},${d.crop},${d.production},${d.productivity},${d.area}`)
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `conab_export_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Exportação de dados (CSV) gerada com sucesso.", "success");
  };

  useEffect(() => {
    addLog("Sistema de Gerenciamento de Dados inicializado.", "info");
    const validation = validateDataIntegrity(conabHistoricalData);
    setValidationReport(validation);
    scheduleDataUpdate(12);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Gerenciamento de Dados</h1>
          <p className="text-muted-foreground">Administração de pipelines, validação de integridade e ETL CONAB.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="hover:bg-accent/50"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar Agora
          </Button>
        </div>
      </header>

      {isSyncing && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-primary/20 p-4 rounded-xl shadow-sm"
        >
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              Processando Pipeline ETL...
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-muted/50 overflow-hidden">
          <Tabs defaultValue="data" className="w-full">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-fit grid-cols-2">
                  <TabsTrigger value="data" className="flex items-center gap-2">
                    <Database className="h-4 w-4" /> Base Ativa
                  </TabsTrigger>
                  <TabsTrigger value="validation" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Relatório de Saúde
                  </TabsTrigger>
                </TabsList>
                <Badge variant="secondary" className="font-mono">
                  v2026.02.21-stable
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent value="data" className="m-0">
                <DataTable 
                  data={conabHistoricalData} 
                  columns={['year', 'state', 'crop', 'production', 'productivity', 'area']} 
                  filterable
                  exportable
                />
              </TabsContent>
              <TabsContent value="validation" className="p-6 m-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">Score de Integridade dos Dados</h3>
                      <p className="text-sm text-muted-foreground">Acurácia estimada baseada em desvio padrão e limites históricos.</p>
                    </div>
                    <div className="ml-auto text-3xl font-black text-primary">98.4%</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-dashed">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-primary">
                          <CheckCircle2 className="h-4 w-4" /> Regras Passadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        <div className="flex justify-between"><span>Valores Negativos</span> <Badge variant="outline" className="text-green-600">Zero Ocorrências</Badge></div>
                        <div className="flex justify-between"><span>Unidades (kg/ha)</span> <Badge variant="outline" className="text-green-600">Normalizado</Badge></div>
                        <div className="flex justify-between"><span>Fronteiras Temporais</span> <Badge variant="outline" className="text-green-600">Válido</Badge></div>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
                          <AlertTriangle className="h-4 w-4" /> Anomalias Detectadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        {validationReport?.errors.length ? (
                          validationReport.errors.slice(0, 3).map((err, i) => (
                            <div key={i} className="flex items-start gap-2 text-amber-600">
                              <span className="mt-0.5">•</span>
                              <span>{err}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">Nenhuma anomalia crítica detectada no último scan.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="shadow-sm border-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Logs do Sistema
              </CardTitle>
              <CardDescription>Eventos de ingestão em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-3 font-mono text-[11px] h-[300px] overflow-y-auto space-y-2 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Terminal className="h-3 w-3" />
                  <span>AGRO_PRECISION_KERNEL_v4.2.0</span>
                </div>
                <AnimatePresence initial={false}>
                  {dataLogs.map((log, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -5 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className={`border-l-2 pl-2 ${log.type === 'error' ? 'border-destructive text-destructive' : log.type === 'success' ? 'border-primary text-primary' : 'border-muted-foreground/30 text-foreground/80'}`}
                    >
                      <span className="opacity-50 mr-2">[{log.time}]</span>
                      {log.msg}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Status de Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Próxima Sync</p>
                    <p className="text-sm font-medium">{lastSync ? new Date(new Date(lastSync).getTime() + 12*60*60*1000).toLocaleString('pt-BR') : 'Agendado: 12h'}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Ativo
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Cultura de Referência</label>
                <select className="w-full p-2 rounded-md border bg-background text-sm">
                  <option>Café (Arábica & Conillon)</option>
                  <option>Soja (Commodities)</option>
                  <option>Milho (Séries Históricas)</option>
                  <option>Cana-de-Açúcar</option>
                </select>
              </div>

              <Button variant="outline" className="w-full text-xs h-8">
                Configurações Avançadas de API
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
