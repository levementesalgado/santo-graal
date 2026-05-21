import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ROUTE_PATHS } from "@/lib/index";

import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Regional from "@/pages/Regional";
import Predictions from "@/pages/Predictions";
import DataManagement from "@/pages/DataManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton richColors />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path={ROUTE_PATHS.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTE_PATHS.ANALYTICS} element={<Analytics />} />
              <Route path={ROUTE_PATHS.REGIONAL} element={<Regional />} />
              <Route path={ROUTE_PATHS.PREDICTIONS} element={<Predictions />} />
              <Route path={ROUTE_PATHS.DATA_MANAGEMENT} element={<DataManagement />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
