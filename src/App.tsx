import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ROUTE_PATHS } from "@/lib/index";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Regional = lazy(() => import("@/pages/Regional"));
const Predictions = lazy(() => import("@/pages/Predictions"));
const DataManagement = lazy(() => import("@/pages/DataManagement"));

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
            <ErrorBoundary>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-sm font-medium">Carregando...</span>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path={ROUTE_PATHS.DASHBOARD} element={<Dashboard />} />
                  <Route path={ROUTE_PATHS.ANALYTICS} element={<Analytics />} />
                  <Route path={ROUTE_PATHS.REGIONAL} element={<Regional />} />
                  <Route path={ROUTE_PATHS.PREDICTIONS} element={<Predictions />} />
                  <Route path={ROUTE_PATHS.DATA_MANAGEMENT} element={<DataManagement />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
