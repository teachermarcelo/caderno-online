// app/page.tsx
"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookMarked,
  Calendar,
  ChartColumn,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  Link2,
  Loader2,
  Moon,
  Plus,
  RefreshCw,
  Sun,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import {
  addAgenda,
  addAluno,
  addCefr,
  addFinanceiro,
  addMaterial,
  addTurma,
  formatCurrency,
  getAgenda,
  getAlunos,
  getCefr,
  getDashboardStats,
  getFinanceiro,
  getMaterial,
  getTurmas,
  normalizeServiceError,
  type Agenda,
  type Aluno,
  type Cefr,
  type DashboardStats,
  type Financeiro,
  type Material,
  type NivelCEFR,
  type StatusAgenda,
  type TipoFinanceiro,
  type Turma,
} from "@/lib/cadernoService";

type TabId = "home" | "alunos" | "turmas" | "cefr" | "material" | "agenda" | "financeiro";

const levels: NivelCEFR[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "alunos", label: "Alunos", icon: Users },
  { id: "turmas", label: "Turmas", icon: GraduationCap },
  { id: "cefr", label: "CEFR", icon: BookMarked },
  { id: "material", label: "Material", icon: Link2 },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "financeiro", label: "Financeiro", icon: Wallet },
];

const emptyStats: DashboardStats = {
  alunos: 0,
  turmas: 0,
  cefr: 0,
  agenda: { agendadas: 0, andamento: 0, concluidas: 0 },
  financeiro: { entradas: 0, saidas: 0, saldo: 0 },
  cefrDistribution: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [cefr, setCefr] = useState<Cefr[]>([]);
  const [material, setMaterial] = useState<Material[]>([]);
  const [agenda, setAgenda] = useState<Agenda[]>([]);
  const [financeiro, setFinanceiro] = useState<Financeiro[]>([]);

  const showMessage = useCallback((type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccess(message);
      setError("");
    } else {
      setError(message);
      setSuccess("");
    }

    window.setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4500);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardStats,
        alunosData,
        turmasData,
        cefrData,
        materialData,
        agendaData,
        financeiroData,
      ] = await Promise.all([
        getDashboardStats(),
        getAlunos(),
        getTurmas(),
        getCefr(),
        getMaterial(),
        getAgenda(),
        getFinanceiro(),
      ]);

      setStats(dashboardStats);
      setAlunos(alunosData);
      setTurmas(turmasData);
      setCefr(cefrData);
      setMaterial(materialData);
      setAgenda(agendaData);
      setFinanceiro(financeiroData);
    } catch (err) {
      showMessage("error", normalizeServiceError(err));
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (saved === "dark" || (!saved && prefersDark)) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const statCards = useMemo(
    () => [
      { label: "Alunos", value: stats.alunos, icon: Users, gradient: "from-purple-500 to-pink-500" },
      { label: "Turmas", value: stats.turmas, icon: GraduationCap, gradient: "from-blue-500 to-cyan-500" },
      { label: "Aulas CEFR", value: stats.cefr, icon: BookMarked, gradient: "from-green-500 to-teal-500" },
      { label: "Agendadas", value: stats.agenda.agendadas, icon: Calendar, gradient: "from-amber-500 to-orange-500" },
      { label: "Concluídas", value: stats.agenda.concluidas, icon: TrendingUp, gradient: "from-green-500 to-teal-500", highlightColor: "text-green-600 dark:text-green-400" },
      { label: "Em Andamento", value: stats.agenda.andamento, icon: ChartColumn, gradient: "from-amber-500 to-orange-500", highlightColor: "text-amber-600 dark:text-amber-400" },
    ],
    [stats]
  );

  async function handleSubmit(action: () => Promise<void>, message: string) {
    try {
      setSaving(true);
      await action();
      showMessage("success", message);
      await loadData();
    } catch (err) {
      showMessage("error", normalizeServiceError(err));
    } finally {
      setSaving(false);
    }
  }

  async function submitAluno(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await handleSubmit(
      () =>
        addAluno({
          nome: String(form.get("nome") || ""),
          nivel: String(form.get("nivel") || "A1") as NivelCEFR,
          telefone: String(form.get("telefone") || ""),
          email: String(form.get("email") || ""),
        }),
      "Aluno salvo com sucesso."
    );

    event.currentTarget.reset();
  }

  async function submitTurma(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await handleSubmit(
      () =>
        addTurma({
          nome: String(form.get("nome") || ""),
          descricao: String(form.get("descricao") || ""),
        }),
      "Turma salva com sucesso."
    );

    event.currentTarget.reset();
  }

  async function submitCefr(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await handleSubmit(
      () =>
        addCefr({
          nivel: String(form.get("nivel") || "A1") as NivelCEFR,
          descricao: String(form.get("descricao") || ""),
        }),
      "CEFR salvo com sucesso."
    );

    event.currentTarget.reset();
  }

  async function submitMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await handleSubmit(
      () =>
        addMaterial({
          titulo: String(form.get("titulo") || ""),
          url: String(form.get("url") || ""),
          descricao: String(form.get("descricao") || ""),
        }),
      "Material salvo com sucesso."
    );

    event.currentTarget.reset();
  }

  async function submitAgenda(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await handleSubmit(
      () =>
        addAgenda({
          titulo: String(form.get("titulo") || ""),
          data: String(form.get("data") || ""),
          horario: String(form.get("horario") || ""),
          status: String(form.get("status") || "agendada") as StatusAgenda,
          alunoId: String(form.get("alunoId") || ""),
        }),
      "Aula salva na agenda."
    );

    event.currentTarget.reset();
  }

  async function submitFinanceiro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await handleSubmit(
      () =>
        addFinanceiro({
          tipo: String(form.get("tipo") || "entrada") as TipoFinanceiro,
          valor: Number(form.get("valor") || 0),
          descricao: String(form.get("descricao") || ""),
          data: String(form.get("data") || ""),
        }),
      "Transação salva com sucesso."
    );

    event.currentTarget.reset();
  }

  const upcomingClasses = agenda
    .filter((item) => item.status !== "concluida")
    .slice(0, 5);

  const recentStudents = alunos.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
              <BookMarked className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
                Caderno Online
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Conectado com Supabase</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="rounded-lg p-2 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-900"
              title="Atualizar dados"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setIsDark((value) => !value)}
              className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <nav className="mb-6 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-7">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition sm:text-sm ${
                    active
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {(success || error) && (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
              success
                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {success || error}
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {activeTab === "home" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Visão Geral</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Métricas principais puxadas diretamente do Supabase.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                  {statCards.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.highlightColor || ""}`}>{stat.value}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FinancialCard
                    title="Entradas"
                    value={stats.financeiro.entradas}
                    icon={ArrowUpRight}
                    className="border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
                  />
                  <FinancialCard
                    title="Saídas"
                    value={stats.financeiro.saidas}
                    icon={ArrowDownRight}
                    className="border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                  />
                  <FinancialCard
                    title="Saldo"
                    value={stats.financeiro.saldo}
                    icon={DollarSign}
                    className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-300"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-4 flex items-center gap-2 font-bold">
                      <ChartColumn className="h-5 w-5 text-purple-500" />
                      Distribuição CEFR
                    </h3>
                    <div className="space-y-3">
                      {levels.map((level) => {
                        const total = Object.values(stats.cefrDistribution).reduce((sum, value) => sum + value, 0);
                        const count = stats.cefrDistribution[level] || 0;
                        const percentage = total > 0 ? (count / total) * 100 : 0;

                        return (
                          <div key={level} className="flex items-center gap-3">
                            <span className="w-8 text-xs font-bold">{level}</span>
                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className="h-full rounded-full bg-purple-500 transition-all duration-700"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs font-bold">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <ListCard title="Alunos recentes" icon={Users}>
                    {recentStudents.length === 0 ? (
                      <EmptyMessage text="Nenhum aluno cadastrado ainda." />
                    ) : (
                      recentStudents.map((aluno) => (
                        <div key={aluno.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                          <p className="font-semibold">{aluno.nome}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{aluno.nivel}</p>
                        </div>
                      ))
                    )}
                  </ListCard>

                  <ListCard title="Próximas aulas" icon={Calendar}>
                    {upcomingClasses.length === 0 ? (
                      <EmptyMessage text="Nenhuma aula agendada." />
                    ) : (
                      upcomingClasses.map((item) => (
                        <div key={item.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                          <p className="font-semibold">{item.titulo}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.data} {item.horario ? `às ${item.horario}` : ""} • {item.status}
                          </p>
                        </div>
                      ))
                    )}
                  </ListCard>
                </div>
              </section>
            )}

            {activeTab === "alunos" && (
              <ManagementSection
                title="Alunos"
                description="Cadastre e visualize os alunos salvos no Supabase."
                form={
                  <form onSubmit={submitAluno} className="grid gap-3 md:grid-cols-5">
                    <Input name="nome" placeholder="Nome do aluno" required />
                    <Select name="nivel" defaultValue="A1">
                      {levels.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </Select>
                    <Input name="telefone" placeholder="Telefone" />
                    <Input name="email" placeholder="E-mail" type="email" />
                    <SubmitButton saving={saving} label="Salvar aluno" />
                  </form>
                }
              >
                <SimpleTable
                  headers={["Nome", "Nível", "Telefone", "E-mail"]}
                  rows={alunos.map((item) => [item.nome, item.nivel, item.telefone || "-", item.email || "-"])}
                  empty="Nenhum aluno cadastrado."
                />
              </ManagementSection>
            )}

            {activeTab === "turmas" && (
              <ManagementSection
                title="Turmas"
                description="Cadastre turmas e acompanhe a lista ativa."
                form={
                  <form onSubmit={submitTurma} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
                    <Input name="nome" placeholder="Nome da turma" required />
                    <Input name="descricao" placeholder="Descrição" />
                    <SubmitButton saving={saving} label="Salvar turma" />
                  </form>
                }
              >
                <SimpleTable
                  headers={["Nome", "Descrição"]}
                  rows={turmas.map((item) => [item.nome, item.descricao || "-"])}
                  empty="Nenhuma turma cadastrada."
                />
              </ManagementSection>
            )}

            {activeTab === "cefr" && (
              <ManagementSection
                title="CEFR"
                description="Cadastre conteúdos ou descrições por nível."
                form={
                  <form onSubmit={submitCefr} className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
                    <Select name="nivel" defaultValue="A1">
                      {levels.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </Select>
                    <Input name="descricao" placeholder="Descrição da aula CEFR" />
                    <SubmitButton saving={saving} label="Salvar CEFR" />
                  </form>
                }
              >
                <SimpleTable
                  headers={["Nível", "Descrição"]}
                  rows={cefr.map((item) => [item.nivel, item.descricao || "-"])}
                  empty="Nenhum conteúdo CEFR cadastrado."
                />
              </ManagementSection>
            )}

            {activeTab === "material" && (
              <ManagementSection
                title="Material"
                description="Cadastre links e materiais de apoio."
                form={
                  <form onSubmit={submitMaterial} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                    <Input name="titulo" placeholder="Título" required />
                    <Input name="url" placeholder="URL" />
                    <Input name="descricao" placeholder="Descrição" />
                    <SubmitButton saving={saving} label="Salvar material" />
                  </form>
                }
              >
                <SimpleTable
                  headers={["Título", "URL", "Descrição"]}
                  rows={material.map((item) => [item.titulo, item.url || "-", item.descricao || "-"])}
                  empty="Nenhum material cadastrado."
                />
              </ManagementSection>
            )}

            {activeTab === "agenda" && (
              <ManagementSection
                title="Agenda"
                description="Agende aulas e acompanhe seus status."
                form={
                  <form onSubmit={submitAgenda} className="grid gap-3 md:grid-cols-[1fr_160px_140px_160px_1fr_auto]">
                    <Input name="titulo" placeholder="Título da aula" required />
                    <Input name="data" type="date" required />
                    <Input name="horario" type="time" />
                    <Select name="status" defaultValue="agendada">
                      <option value="agendada">Agendada</option>
                      <option value="andamento">Andamento</option>
                      <option value="concluida">Concluída</option>
                    </Select>
                    <Select name="alunoId" defaultValue="">
                      <option value="">Sem aluno</option>
                      {alunos.map((aluno) => (
                        <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                      ))}
                    </Select>
                    <SubmitButton saving={saving} label="Salvar aula" />
                  </form>
                }
              >
                <SimpleTable
                  headers={["Título", "Data", "Horário", "Status"]}
                  rows={agenda.map((item) => [item.titulo, item.data, item.horario || "-", item.status])}
                  empty="Nenhuma aula cadastrada."
                />
              </ManagementSection>
            )}

            {activeTab === "financeiro" && (
              <ManagementSection
                title="Financeiro"
                description="Cadastre entradas e saídas."
                form={
                  <form onSubmit={submitFinanceiro} className="grid gap-3 md:grid-cols-[160px_160px_1fr_160px_auto]">
                    <Select name="tipo" defaultValue="entrada">
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                    </Select>
                    <Input name="valor" placeholder="Valor" type="number" step="0.01" required />
                    <Input name="descricao" placeholder="Descrição" />
                    <Input name="data" type="date" />
                    <SubmitButton saving={saving} label="Salvar" />
                  </form>
                }
              >
                <SimpleTable
                  headers={["Tipo", "Valor", "Descrição", "Data"]}
                  rows={financeiro.map((item) => [
                    item.tipo,
                    formatCurrency(Number(item.valor)),
                    item.descricao || "-",
                    item.data,
                  ])}
                  empty="Nenhuma transação cadastrada."
                />
              </ManagementSection>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando dados do Supabase...
      </div>
    </div>
  );
}

function FinancialCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  className: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold uppercase">{title}</p>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-3xl font-bold">{formatCurrency(value)}</p>
    </div>
  );
}

function ListCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 flex items-center gap-2 font-bold">
        <Icon className="h-5 w-5 text-purple-500" />
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">{text}</p>;
}

function ManagementSection({
  title,
  description,
  form,
  children,
}: {
  title: string;
  description: string;
  form: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {form}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {children}
      </div>
    </section>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-950"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-950"
    />
  );
}

function SubmitButton({ saving, label }: { saving: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      {label}
    </button>
  );
}

function SimpleTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <EmptyMessage text={empty} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {headers.map((header) => (
              <th key={header} className="px-3 py-3 font-bold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
