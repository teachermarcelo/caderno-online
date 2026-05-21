// lib/cadernoService.ts
import { supabase } from "./supabaseClient";

export type NivelCEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type StatusAgenda = "agendada" | "andamento" | "concluida";
export type TipoFinanceiro = "entrada" | "saida";

export interface Aluno {
  id: string;
  nome: string;
  nivel: NivelCEFR;
  telefone?: string | null;
  email?: string | null;
  ativo?: boolean;
  created_at?: string;
}

export interface Turma {
  id: string;
  nome: string;
  descricao?: string | null;
  ativo?: boolean;
  created_at?: string;
}

export interface Cefr {
  id: string;
  nivel: NivelCEFR;
  descricao?: string | null;
}

export interface Agenda {
  id: string;
  titulo: string;
  data: string;
  horario?: string | null;
  status: StatusAgenda;
  aluno_id?: string | null;
  created_at?: string;
}

export interface Financeiro {
  id: string;
  tipo: TipoFinanceiro;
  valor: number;
  descricao?: string | null;
  data: string;
  created_at?: string;
}

export interface Material {
  id: string;
  titulo: string;
  url?: string | null;
  descricao?: string | null;
  ativo?: boolean;
  created_at?: string;
}

export interface DashboardStats {
  alunos: number;
  turmas: number;
  cefr: number;
  agenda: {
    agendadas: number;
    andamento: number;
    concluidas: number;
  };
  financeiro: {
    entradas: number;
    saidas: number;
    saldo: number;
  };
  cefrDistribution: Record<NivelCEFR, number>;
}

const CEFR_LEVELS: NivelCEFR[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Erro desconhecido.";
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

// ALUNOS
export async function getAlunos(): Promise<Aluno[]> {
  const { data, error } = await supabase
    .from("alunos_caderno")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as Aluno[];
}

export async function addAluno(input: {
  nome: string;
  nivel?: NivelCEFR;
  telefone?: string;
  email?: string;
}) {
  const nome = input.nome.trim();

  if (!nome) throw new Error("Informe o nome do aluno.");

  const { data: existing, error: existingError } = await supabase
    .from("alunos_caderno")
    .select("id")
    .ilike("nome", nome)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing) throw new Error("Já existe um aluno com esse nome.");

  const { error } = await supabase.from("alunos_caderno").insert([
    {
      nome,
      nivel: input.nivel || "A1",
      telefone: input.telefone || null,
      email: input.email || null,
      ativo: true,
    },
  ]);

  if (error) throw new Error(error.message);
}

// TURMAS
export async function getTurmas(): Promise<Turma[]> {
  const { data, error } = await supabase
    .from("turmas_caderno")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as Turma[];
}

export async function addTurma(input: { nome: string; descricao?: string }) {
  const nome = input.nome.trim();

  if (!nome) throw new Error("Informe o nome da turma.");

  const { error } = await supabase.from("turmas_caderno").insert([
    {
      nome,
      descricao: input.descricao || null,
      ativo: true,
    },
  ]);

  if (error) throw new Error(error.message);
}

// CEFR
export async function getCefr(): Promise<Cefr[]> {
  const { data, error } = await supabase
    .from("cefr_caderno")
    .select("*")
    .order("nivel", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as Cefr[];
}

export async function addCefr(input: { nivel: NivelCEFR; descricao?: string }) {
  const { error } = await supabase.from("cefr_caderno").insert([
    {
      nivel: input.nivel,
      descricao: input.descricao || null,
    },
  ]);

  if (error) throw new Error(error.message);
}

// MATERIAL
export async function getMaterial(): Promise<Material[]> {
  const { data, error } = await supabase
    .from("material_caderno")
    .select("*")
    .eq("ativo", true)
    .order("titulo", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as Material[];
}

export async function addMaterial(input: {
  titulo: string;
  url?: string;
  descricao?: string;
}) {
  const titulo = input.titulo.trim();

  if (!titulo) throw new Error("Informe o título do material.");

  const { error } = await supabase.from("material_caderno").insert([
    {
      titulo,
      url: input.url || null,
      descricao: input.descricao || null,
      ativo: true,
    },
  ]);

  if (error) throw new Error(error.message);
}

// AGENDA
export async function getAgenda(status?: StatusAgenda): Promise<Agenda[]> {
  let query = supabase
    .from("agenda_caderno")
    .select("*")
    .order("data", { ascending: true })
    .order("horario", { ascending: true });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as Agenda[];
}

export async function addAgenda(input: {
  titulo: string;
  data: string;
  horario?: string;
  status?: StatusAgenda;
  alunoId?: string;
}) {
  const titulo = input.titulo.trim();

  if (!titulo) throw new Error("Informe o título da aula.");
  if (!input.data) throw new Error("Informe a data da aula.");

  const { error } = await supabase.from("agenda_caderno").insert([
    {
      titulo,
      data: input.data,
      horario: input.horario || null,
      status: input.status || "agendada",
      aluno_id: input.alunoId || null,
    },
  ]);

  if (error) throw new Error(error.message);
}

// FINANCEIRO
export async function getFinanceiro(): Promise<Financeiro[]> {
  const { data, error } = await supabase
    .from("financeiro_caderno")
    .select("*")
    .order("data", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as Financeiro[];
}

export async function addFinanceiro(input: {
  tipo: TipoFinanceiro;
  valor: number;
  descricao?: string;
  data?: string;
}) {
  if (!input.tipo) throw new Error("Informe o tipo da transação.");
  if (!input.valor || Number.isNaN(input.valor)) throw new Error("Informe um valor válido.");

  const { error } = await supabase.from("financeiro_caderno").insert([
    {
      tipo: input.tipo,
      valor: Number(input.valor),
      descricao: input.descricao || null,
      data: input.data || new Date().toISOString().split("T")[0],
    },
  ]);

  if (error) throw new Error(error.message);
}

// DASHBOARD
export async function getDashboardStats(): Promise<DashboardStats> {
  const [alunos, turmas, cefr, agenda, financeiro] = await Promise.all([
    getAlunos(),
    getTurmas(),
    getCefr(),
    getAgenda(),
    getFinanceiro(),
  ]);

  const entradas = financeiro
    .filter((item) => item.tipo === "entrada")
    .reduce((sum, item) => sum + Number(item.valor || 0), 0);

  const saidas = financeiro
    .filter((item) => item.tipo === "saida")
    .reduce((sum, item) => sum + Number(item.valor || 0), 0);

  const cefrDistribution = CEFR_LEVELS.reduce((acc, level) => {
    acc[level] = alunos.filter((aluno) => aluno.nivel === level).length;
    return acc;
  }, {} as Record<NivelCEFR, number>);

  return {
    alunos: alunos.length,
    turmas: turmas.length,
    cefr: cefr.length,
    agenda: {
      agendadas: agenda.filter((item) => item.status === "agendada").length,
      andamento: agenda.filter((item) => item.status === "andamento").length,
      concluidas: agenda.filter((item) => item.status === "concluida").length,
    },
    financeiro: {
      entradas,
      saidas,
      saldo: entradas - saidas,
    },
    cefrDistribution,
  };
}

export function normalizeServiceError(error: unknown) {
  return getErrorMessage(error);
}
