// app-supabase.js - Sistema Central com Supabase (v2.0)
// Substitui localStorage por Supabase PostgreSQL

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

// ============================================
// 1. INICIALIZAÇÃO SUPABASE
// ============================================
const SUPABASE_URL = 'https://rvgcniaowzmsudzliozf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2NuaWFvd3ptc3Vkemxpb3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjQxNzQsImV4cCI6MjA5MTQwMDE3NH0.uwwKFLuK-XyPoXPrB6_CseRTiD9d-iyMQSPWrFw-l-I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// 2. FUNÇÕES GLOBAIS DE CRUD (ALUNOS)
// ============================================

window.addAluno = async function(data) {
    try {
        // Valida duplicata
        const { data: existing } = await supabase
            .from('alunos_caderno')
            .select('id')
            .eq('nome', data.nome)
            .single();

        if (existing) {
            alert('⚠️ Erro: Já existe um aluno com este nome!');
            return false;
        }

        // Insere novo aluno
        const { data: newAluno, error } = await supabase
            .from('alunos_caderno')
            .insert([{
                nome: data.nome,
                nivel: data.nivel || 'A1',
                telefone: data.telefone || null,
                email: data.email || null
            }])
            .select();

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro ao adicionar aluno:', error.message);
        alert('Erro ao adicionar aluno: ' + error.message);
        return false;
    }
};

window.updateAluno = async function(id, newData) {
    try {
        const { error } = await supabase
            .from('alunos_caderno')
            .update(newData)
            .eq('id', id);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error.message);
        return false;
    }
};

window.deleteAluno = async function(id) {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;

    try {
        const { error } = await supabase
            .from('alunos_caderno')
            .delete()
            .eq('id', id);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        location.reload();
    } catch (error) {
        console.error('Erro ao excluir aluno:', error.message);
        alert('Erro ao excluir aluno: ' + error.message);
    }
};

window.getAlunos = async function() {
    try {
        const { data, error } = await supabase
            .from('alunos_caderno')
            .select('*')
            .eq('ativo', true)
            .order('nome');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar alunos:', error.message);
        return [];
    }
};

// ============================================
// 3. FUNÇÕES GLOBAIS DE CRUD (TURMAS)
// ============================================

window.addTurma = async function(data) {
    try {
        const { error } = await supabase
            .from('turmas_caderno')
            .insert([{
                nome: data.nome,
                descricao: data.descricao || null
            }]);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro ao adicionar turma:', error.message);
        return false;
    }
};

window.deleteTurma = async function(id) {
    if (!confirm('Excluir turma?')) return;

    try {
        const { error } = await supabase
            .from('turmas_caderno')
            .delete()
            .eq('id', id);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        location.reload();
    } catch (error) {
        console.error('Erro ao excluir turma:', error.message);
    }
};

window.getTurmas = async function() {
    try {
        const { data, error } = await supabase
            .from('turmas_caderno')
            .select('*')
            .eq('ativo', true)
            .order('nome');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar turmas:', error.message);
        return [];
    }
};

// ============================================
// 4. FUNÇÕES GLOBAIS DE CRUD (AGENDA)
// ============================================

window.addAgenda = async function(data) {
    try {
        const { error } = await supabase
            .from('agenda_caderno')
            .insert([{
                titulo: data.titulo,
                data: data.data,
                horario: data.horario || null,
                status: data.status || 'agendada',
                aluno_id: data.alunoId || null
            }]);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro ao adicionar agenda:', error.message);
        return false;
    }
};

window.deleteAgenda = async function(id) {
    if (!confirm('Excluir aula da agenda?')) return;

    try {
        const { error } = await supabase
            .from('agenda_caderno')
            .delete()
            .eq('id', id);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        location.reload();
    } catch (error) {
        console.error('Erro ao excluir agenda:', error.message);
    }
};

window.getAgenda = async function(status = null) {
    try {
        let query = supabase.from('agenda_caderno').select('*').order('data');

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar agenda:', error.message);
        return [];
    }
};

// ============================================
// 5. FUNÇÕES GLOBAIS DE CRUD (FINANCEIRO)
// ============================================

window.addFinanceiro = async function(data) {
    try {
        const { error } = await supabase
            .from('financeiro_caderno')
            .insert([{
                tipo: data.tipo, // 'entrada' ou 'saida'
                valor: parseFloat(data.valor),
                descricao: data.descricao || null,
                data: data.data || new Date().toISOString().split('T')[0]
            }]);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro ao adicionar transação:', error.message);
        return false;
    }
};

window.deleteFinanceiro = async function(id) {
    if (!confirm('Excluir transação?')) return;

    try {
        const { error } = await supabase
            .from('financeiro_caderno')
            .delete()
            .eq('id', id);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        location.reload();
    } catch (error) {
        console.error('Erro ao excluir transação:', error.message);
    }
};

window.getFinanceiro = async function() {
    try {
        const { data, error } = await supabase
            .from('financeiro_caderno')
            .select('*')
            .order('data', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar financeiro:', error.message);
        return [];
    }
};

window.getFinanceiroSummary = async function() {
    try {
        const { data, error } = await supabase
            .from('financeiro_caderno')
            .select('tipo, valor');

        if (error) throw error;

        let entradas = 0;
        let saidas = 0;

        (data || []).forEach(t => {
            const valor = parseFloat(t.valor) || 0;
            if (t.tipo === 'entrada') entradas += valor;
            else saidas += valor;
        });

        return { entradas, saidas, saldo: entradas - saidas };
    } catch (error) {
        console.error('Erro ao calcular resumo financeiro:', error.message);
        return { entradas: 0, saidas: 0, saldo: 0 };
    }
};

// ============================================
// 6. FUNÇÕES GLOBAIS DE CRUD (MATERIAL)
// ============================================

window.addMaterial = async function(data) {
    try {
        const { error } = await supabase
            .from('material_caderno')
            .insert([{
                titulo: data.titulo,
                url: data.url || null,
                descricao: data.descricao || null
            }]);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro ao adicionar material:', error.message);
        return false;
    }
};

window.deleteMaterial = async function(id) {
    if (!confirm('Excluir material?')) return;

    try {
        const { error } = await supabase
            .from('material_caderno')
            .delete()
            .eq('id', id);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        location.reload();
    } catch (error) {
        console.error('Erro ao excluir material:', error.message);
    }
};

window.getMaterial = async function() {
    try {
        const { data, error } = await supabase
            .from('material_caderno')
            .select('*')
            .eq('ativo', true)
            .order('titulo');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar material:', error.message);
        return [];
    }
};

// ============================================
// 7. FUNÇÕES GLOBAIS DE CRUD (CEFR)
// ============================================

window.addCefr = async function(data) {
    try {
        const { error } = await supabase
            .from('cefr_caderno')
            .insert([{
                nivel: data.nivel,
                descricao: data.descricao || null
            }]);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro ao adicionar CEFR:', error.message);
        return false;
    }
};

window.deleteCefr = async function(id) {
    if (!confirm('Excluir nível CEFR?')) return;

    try {
        const { error } = await supabase
            .from('cefr_caderno')
            .delete()
            .eq('id', id);

        if (error) throw error;

        window.dispatchEvent(new Event('db-update'));
        location.reload();
    } catch (error) {
        console.error('Erro ao excluir CEFR:', error.message);
    }
};

window.getCefr = async function() {
    try {
        const { data, error } = await supabase
            .from('cefr_caderno')
            .select('*')
            .order('nivel');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar CEFR:', error.message);
        return [];
    }
};

// ============================================
// 8. FUNÇÃO DASHBOARD - ESTATÍSTICAS
// ============================================

window.getDashboardStats = async function() {
    try {
        // Busca contagens
        const { count: alunosCount } = await supabase
            .from('alunos_caderno')
            .select('id', { count: 'exact' })
            .eq('ativo', true);

        const { count: turmasCount } = await supabase
            .from('turmas_caderno')
            .select('id', { count: 'exact' })
            .eq('ativo', true);

        const { count: cefrCount } = await supabase
            .from('cefr_caderno')
            .select('id', { count: 'exact' });

        const { data: agendaData } = await supabase
            .from('agenda_caderno')
            .select('status');

        const agendadas = (agendaData || []).filter(a => a.status === 'agendada').length;
        const concluidas = (agendaData || []).filter(a => a.status === 'concluida').length;
        const andamento = (agendaData || []).filter(a => a.status === 'andamento').length;

        const financial = await window.getFinanceiroSummary();

        // Distribuição CEFR por alunos
        const { data: alunosData } = await supabase
            .from('alunos_caderno')
            .select('nivel')
            .eq('ativo', true);

        const cefrDistribution = {};
        ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach(level => {
            cefrDistribution[level] = (alunosData || []).filter(a => a.nivel === level).length;
        });

        return {
            alunos: alunosCount || 0,
            turmas: turmasCount || 0,
            cefr: cefrCount || 0,
            agenda: { agendadas, concluidas, andamento },
            financeiro: financial,
            cefrDistribution
        };
    } catch (error) {
        console.error('Erro ao buscar stats:', error.message);
        return null;
    }
};

// ============================================
// 9. FUNÇÕES AUXILIARES
// ============================================

window.formatCurrency = function(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
};

// Escuta mudanças em tempo real (opcional)
window.subscribeToChanges = function(table, callback) {
    return supabase
        .channel(`public:${table}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: table },
            callback
        )
        .subscribe();
};

// Inicializa app
window.CadernoDB = {
    supabase,
    getDashboardStats: window.getDashboardStats
};

console.log('✅ Supabase integrado com sucesso!');
