import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  Map, 
  BrainCircuit, 
  Database, 
  Menu, 
  X, 
  Search, 
  Cpu, 
  Terminal, 
  ChevronDown, 
  Settings,
  Bell,
  Layers
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: ROUTE_PATHS.DASHBOARD, label: 'Visão Geral', icon: LayoutDashboard },
  { path: ROUTE_PATHS.ANALYTICS, label: 'Análise Avançada', icon: BarChart3 },
  { path: ROUTE_PATHS.REGIONAL, label: 'Análise Regional', icon: Map },
  { path: ROUTE_PATHS.PREDICTIONS, label: 'Modelos Preditivos', icon: BrainCircuit },
  { path: ROUTE_PATHS.DATA_MANAGEMENT, label: 'Gestão de Dados', icon: Database },
];

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border hidden lg:flex flex-col z-40">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="text-primary-foreground w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sidebar-foreground leading-tight tracking-tight text-lg">AgroPrecision</span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">CONAB Engine v4.0</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-sidebar-border">
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Layers className="w-4 h-4 text-secondary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold">Status do Sistema</span>
                <span className="text-[10px] text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  Operacional
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs rounded-lg">
              <Settings className="w-3.5 h-3.5" />
              Configurações
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header with Filters */}
        <header 
          ref={headerRef} 
          className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur-md"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>

              <div className="relative max-w-md w-full hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar safras, estados ou modelos..." 
                  className="pl-10 bg-muted/30 border-none focus-visible:ring-primary rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 mr-4">
                <Select defaultValue="2026">
                  <SelectTrigger className="w-[100px] bg-muted/30 border-none rounded-lg h-9">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="nacional">
                  <SelectTrigger className="w-[140px] bg-muted/30 border-none rounded-lg h-9">
                    <SelectValue placeholder="Região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacional">Nacional</SelectItem>
                    <SelectItem value="sudeste">Sudeste</SelectItem>
                    <SelectItem value="sul">Sul</SelectItem>
                    <SelectItem value="centro-oeste">Centro-Oeste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main 
          className="flex-1 p-6 md:p-8"
          style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>

        {/* Technical Footer */}
        <footer className="border-t border-border bg-muted/10 py-8 px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-medium tracking-tight">DATA_ANALYTICS_CORE_v4.2.1_STABLE</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Plataforma avançada de análise preditiva agrícola baseada nos dados consolidados da CONAB.
                Processamento estatístico em tempo real via R Engine & SQL Hybrid Layer.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-xs font-mono">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground uppercase">Latência de Cálculo</span>
                <span className="text-foreground font-bold">12.4ms</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground uppercase">Integridade dos Dados</span>
                <span className="text-primary font-bold">99.98%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground uppercase">Última Extração</span>
                <span className="text-foreground font-bold">21-02-2026 02:33</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium">
              © 2026 AgroPrecision CONAB Intelligence. Todos os direitos reservados.
            </span>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-primary transition-colors">API Documentation</a>
              <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border z-50 lg:hidden p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Cpu className="text-primary w-6 h-6" />
                  <span className="font-bold text-lg">AgroPrecision</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-4 rounded-2xl transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-semibold">{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto">
                <Button className="w-full rounded-2xl h-12 gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
