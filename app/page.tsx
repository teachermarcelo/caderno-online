// app/page.tsx
// Página principal do Dashboard - Caderno Online
// Função: Exibir visão geral com estatísticas e navegação por tabs

"use client";

import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookMarked,
  Link2,
  Calendar,
  Wallet,
  LayoutDashboard,
  Moon,
  Sun,
  TrendingUp,
  ChartColumn,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";

// Types para melhor organização e type safety
type TabId = "home" | "alunos" | "turmas" | "cefr" | "material" | "agenda" | "financeiro";

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  highlightColor?: string;
}

interface FinancialData {
  entradas: number;
  saidas: number;
  saldo: number;
}

interface CEFRData {
  level: string;
  count: number;
  color: string;
}

export default function DashboardPage() {
  // Estado para a tab ativa
  const [activeTab, setActiveTab] = useState<TabId>("home");
  
  // Estado para o tema (claro/escuro)
  const [isDark, setIsDark] = useState(false);

  // Efeito para aplicar o tema no HTML
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    // Salvar preferência no localStorage
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Carregar tema salvo ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
    }
  }, []);

  // Dados mockados (serão substituídos por API/DB depois)
  const stats: StatCard[] = [
    { label: "Alunos", value: 0, icon: Users, gradient: "from-purple-500 to-pink-500" },
    { label: "Turmas", value: 0, icon: GraduationCap, gradient: "from-blue-500 to-cyan-500" },
    { label: "Aulas CEFR", value: 0, icon: BookMarked, gradient: "from-green-500 to-teal-500" },
    { label: "Agendadas", value: 0, icon: Calendar, gradient: "from-amber-500 to-orange-500" },
    { label: "Concluídas", value: 0, icon: TrendingUp, gradient: "from-green-500 to-teal-500", highlightColor: "text-green-600 dark:text-green-400" },
    { label: "Em Andamento", value: 0, icon: ChartColumn, gradient: "from-amber-500 to-orange-500", highlightColor: "text-amber-600 dark:text-amber-400" },
  ];

  const financial: FinancialData = { entradas: 0, saidas: 0, saldo: 0 };

  const cefrLevels: CEFRData[] = [
    { level: "A1", count: 0, color: "bg-red-500" },
    { level: "A2", count: 0, color: "bg-orange-500" },
    { level: "B1", count: 0, color: "bg-yellow-500" },
    { level: "B2", count: 0, color: "bg-lime-500" },
    { level: "C1", count: 0, color: "bg-green-500" },
    { level: "C2", count: 0, color: "bg-emerald-500" },
  ];

  // Configuração das tabs
  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "alunos", label: "Alunos", icon: Users },
    { id: "turmas", label: "Turmas", icon: GraduationCap },
    { id: "cefr", label: "CEFR", icon: BookMarked },
    { id: "material", label: "Material", icon: Link2 },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "financeiro", label: "Financeiro", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header fixo com navegação e tema */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse-slow">
              <BookMarked className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Caderno Online
            </h1>
          </div>

          {/* Toggle de tema flutuante */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="group relative inline-flex items-center justify-center size-9 rounded-full 
                       bg-muted hover:bg-accent transition-all duration-300 hover:scale-110 
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            <Sun className={`h-5 w-5 transition-all duration-300 ${isDark ? "rotate-90 opacity-0 absolute" : "opacity-100"}`} />
            <Moon className={`h-5 w-5 transition-all duration-300 ${isDark ? "opacity-100" : "-rotate-90 opacity-0 absolute"}`} />
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {/* Navegação por Tabs */}
        <div className="flex flex-col gap-4 w-full mb-8">
          <div 
            role="tablist"
            className="bg-muted/50 rounded-xl p-1 grid grid-cols-4 sm:grid-cols-7 gap-1"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg 
                    text-xs sm:text-sm font-medium transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-purple-500/50
                    ${isActive 
                      ? "bg-background shadow-sm text-foreground scale-105" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo da Tab HOME */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="group bg-card rounded-xl border p-4 
                               hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                               cursor-default"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.gradient} 
                                      flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.highlightColor || ""}`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                <Wallet className="h-4 w-4 text-purple-500" />
                Resumo Financeiro
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Entradas */}
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Entradas</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    R$ {financial.entradas.toFixed(2)}
                  </p>
                </div>
                {/* Saídas */}
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Saídas</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    R$ {financial.saidas.toFixed(2)}
                  </p>
                </div>
                {/* Saldo */}
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Saldo</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    R$ {financial.saldo.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Distribuição CEFR */}
            <div className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                <ChartColumn className="h-4 w-4 text-purple-500" />
                Distribuição CEFR
              </h3>
              <div className="space-y-3">
                {cefrLevels.map((level) => {
                  const total = cefrLevels.reduce((acc, l) => acc + l.count, 0);
                  const percentage = total > 0 ? (level.count / total) * 100 : 0;
                  return (
                    <div key={level.level} className="flex items-center gap-3">
                      <span className="text-xs font-semibold w-8 shrink-0">{level.level}</span>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className={`${level.color} h-full rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs w-6 text-right font-medium shrink-0">{level.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cards: Alunos Recentes e Próximas Aulas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-purple-500" />
                  Alunos Recentes
                </h3>
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhum aluno cadastrado ainda.
                </p>
              </div>
              <div className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  Próximas Aulas
                </h3>
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhuma aula agendada.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Placeholder para outras tabs (serão desenvolvidas em seguida) */}
        {activeTab !== "home" && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                          flex items-center justify-center mb-4 animate-bounce-slow">
              {tabs.find(t => t.id === activeTab)?.icon && 
                (() => { const Icon = tabs.find(t => t.id === activeTab)!.icon; return <Icon className="h-8 w-8 text-purple-500" />; })()
              }
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Esta seção está em desenvolvimento. Em breve você poderá gerenciar {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} aqui.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-background/80 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Caderno Online — Plataforma de Ensino de Idiomas
        </div>
      </footer>

      {/* Estilos de animação personalizados (inline para standalone) */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
