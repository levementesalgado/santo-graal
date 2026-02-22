import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ROUTE_PATHS } from "@/lib/index";

// Page Imports
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Regional from "@/pages/Regional";
import Predictions from "@/pages/Predictions";
import DataManagement from "@/pages/DataManagement";

// Initializing the query client for data fetching management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * Componente Raiz da Aplicação AgroPrecision CONAB
 * Gerencia o estado global, roteamento e provedores de UI.
 * 
 * @copyright 2026 AgroPrecision Data Systems
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton richColors />
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Dashboard Principal: Visão Geral e KPIs */}
              <Route 
                path={ROUTE_PATHS.DASHBOARD} 
                element={<Dashboard />} 
              />
              
              {/* Análise Avançada: Matrizes de Eficiência e Correlações */}
              <Route 
                path={ROUTE_PATHS.ANALYTICS} 
                element={<Analytics />} 
              />
              
              {/* Análise Regional: Detalhamento por UF e Mapas */}
              <Route 
                path={ROUTE_PATHS.REGIONAL} 
                element={<Regional />} 
              />
              
              {/* Modelos Preditivos: Séries Temporais e Projeções 2026+ */}
              <Route 
                path={ROUTE_PATHS.PREDICTIONS} 
                element={<Predictions />} 
              />
              
              {/* Gerenciamento de Dados: Web Scraping CONAB e Pipelines ETL */}
              <Route 
                path={ROUTE_PATHS.DATA_MANAGEMENT} 
                element={<DataManagement />} 
              />

              {/* Redirecionamento padrão para Dashboard em rotas não encontradas */}
              <Route 
                path="*" 
                element={<Dashboard />} 
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
