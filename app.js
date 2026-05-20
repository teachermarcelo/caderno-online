// app.js - Sistema Central Compatível (v3.0)
// Suporta localStorage (fallback) + Supabase (principal)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

// ============================================
// 1. INICIALIZAÇÃO SUPABASE (COM FALLBACK)
// ============================================
const SUPABASE_URL = 'https://rvgcniaowzmsudzliozf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2NuaWFvd3ptc3Vkemxpb3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjQxNzQsImV4cCI6MjA5MTQwMDE3NH0.uwwKFLuK-XyPoXPrB6_CseRTiD9d-iyMQSPWrFw-l-I';

let supabase = null;
let useSupabase = false;

try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    useSupabase = true;
    console.log('✅ Supabase conectado');
} catch (error) {
    console.warn('⚠️ Supabase indisponível, usando localStorage', error);
}

// ============================================
// 2. FALLBACK: localStorage
// ============================================
const DB_KEY = 'cadernoOnlineDB';

function getDBLocal() {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
        const initial = {
            alunos: [],
            turmas: [],
            cefr: [],
            material: [],
            agenda: [],
            financeiro: []
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(data);
}

function saveDBLocal(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    window.dispatchEvent(new Event('db-update'));
}

// ============================================
// 3. FUNÇÕES ALUNOS
// ============================================

window.addAluno = async function(data) {
    try {
        if (useSupabase) {
            // Verifica duplicata
            const { data: existing } = await supabase
                .from('alunos_caderno')
                .select('id')
                .eq('nome', data.nome)
                .single();

            if (existing) {
                alert('⚠️ Erro: Já existe um aluno com este nome!');
                return false;
            }

            const { error } = await supabase
                .from('alunos_caderno')
                .insert([{
                    nome: data.nome,
                    nivel: data.nivel || 'A1',
                    telefone: data.telefone || null,
                    email: data.email || null
                }]);

            if (error) throw error;
        } else {
            // Fallback localStorage
            const db = getDBLocal();
            if (db.alunos.some(a => a.nome.toLowerCase() === data.nome.toLowerCase())) {
                alert('⚠️ Erro: Já existe um aluno com este nome!');
                return false;
            }
            data.id = Date.now().toString();
            db.alunos.push(data);
            saveDBLocal(db);
        }

        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro ao adicionar aluno:', error.message);
        alert('Erro: ' + error.message);
        return false;
    }
};

window.updateAluno = async function(id, newData) {
    try {
        if (useSupabase) {
            const { error } = await supabase
                .from('alunos_caderno')
                .update(newData)
                .eq('id', id);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            const index = db.alunos.findIndex(a => a.id === id);
            if (index !== -1) {
                db.alunos[index] = { ...db.alunos[index], ...newData };
                saveDBLocal(db);
            }
        }
        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro ao atualizar:', error.message);
        return false;
    }
};

window.deleteAluno = async function(id) {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
    try {
        if (useSupabase) {
            const { error } = await supabase
                .from('alunos_caderno')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            db.alunos = db.alunos.filter(a => a.id !== id);
            saveDBLocal(db);
        }
        location.reload();
    } catch (error) {
        console.error('Erro ao excluir:', error.message);
    }
};

window.getAlunos = async function() {
    try {
        if (useSupabase) {
            const { data, error } = await supabase
                .from('alunos_caderno')
                .select('*')
                .eq('ativo', true)
                .order('nome');
            if (error) throw error;
            return data || [];
        } else {
            return getDBLocal().alunos;
        }
    } catch (error) {
        console.error('Erro ao buscar alunos:', error.message);
        return [];
    }
};

// ============================================
// 4. FUNÇÕES TURMAS
// ============================================

window.addTurma = async function(data) {
    try {
        if (useSupabase) {
            const { error } = await supabase
                .from('turmas_caderno')
                .insert([{ nome: data.nome, descricao: data.descricao || null }]);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            data.id = Date.now().toString();
            db.turmas.push(data);
            saveDBLocal(db);
        }
        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro:', error.message);
        return false;
    }
};

window.deleteTurma = async function(id) {
    if (!confirm('Excluir turma?')) return;
    try {
        if (useSupabase) {
            const { error } = await supabase.from('turmas_caderno').delete().eq('id', id);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            db.turmas = db.turmas.filter(t => t.id !== id);
            saveDBLocal(db);
        }
        location.reload();
    } catch (error) {
        console.error('Erro:', error.message);
    }
};

window.getTurmas = async function() {
    try {
        if (useSupabase) {
            const { data, error } = await supabase
                .from('turmas_caderno')
                .select('*')
                .eq('ativo', true)
                .order('nome');
            if (error) throw error;
            return data || [];
        } else {
            return getDBLocal().turmas;
        }
    } catch (error) {
        console.error('Erro:', error.message);
        return [];
    }
};

// ============================================
// 5. FUNÇÕES AGENDA
// ============================================

window.addAgenda = async function(data) {
    try {
        if (useSupabase) {
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
        } else {
            const db = getDBLocal();
            data.id = Date.now().toString();
            data.status = data.status || 'agendada';
            db.agenda.push(data);
            saveDBLocal(db);
        }
        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro:', error.message);
        return false;
    }
};

window.deleteAgenda = async function(id) {
    if (!confirm('Excluir aula da agenda?')) return;
    try {
        if (useSupabase) {
            const { error } = await supabase.from('agenda_caderno').delete().eq('id', id);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            db.agenda = db.agenda.filter(a => a.id !== id);
            saveDBLocal(db);
        }
        location.reload();
    } catch (error) {
        console.error('Erro:', error.message);
    }
};

window.getAgenda = async function(status = null) {
    try {
        if (useSupabase) {
            let query = supabase.from('agenda_caderno').select('*').order('data');
            if (status) query = query.eq('status', status);
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } else {
            let agenda = getDBLocal().agenda;
            if (status) agenda = agenda.filter(a => a.status === status);
            return agenda;
        }
    } catch (error) {
        console.error('Erro:', error.message);
        return [];
    }
};

// ============================================
// 6. FUNÇÕES FINANCEIRO
// ============================================

window.addFinanceiro = async function(data) {
    try {
        if (useSupabase) {
            const { error } = await supabase
                .from('financeiro_caderno')
                .insert([{
                    tipo: data.tipo,
                    valor: parseFloat(data.valor),
                    descricao: data.descricao || null,
                    data: data.data || new Date().toISOString().split('T')[0]
                }]);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            data.id = Date.now().toString();
            db.financeiro.push(data);
            saveDBLocal(db);
        }
        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro:', error.message);
        return false;
    }
};

window.deleteFinanceiro = async function(id) {
    if (!confirm('Excluir transação?')) return;
    try {
        if (useSupabase) {
            const { error } = await supabase.from('financeiro_caderno').delete().eq('id', id);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            db.financeiro = db.financeiro.filter(f => f.id !== id);
            saveDBLocal(db);
        }
        location.reload();
    } catch (error) {
        console.error('Erro:', error.message);
    }
};

window.getFinanceiro = async function() {
    try {
        if (useSupabase) {
            const { data, error } = await supabase
                .from('financeiro_caderno')
                .select('*')
                .order('data', { ascending: false });
            if (error) throw error;
            return data || [];
        } else {
            return getDBLocal().financeiro;
        }
    } catch (error) {
        console.error('Erro:', error.message);
        return [];
    }
};

window.getFinanceiroSummary = async function() {
    try {
        let entradas = 0;
        let saidas = 0;

        if (useSupabase) {
            const { data, error } = await supabase
                .from('financeiro_caderno')
                .select('tipo, valor');
            if (error) throw error;

            (data || []).forEach(t => {
                const valor = parseFloat(t.valor) || 0;
                if (t.tipo === 'entrada') entradas += valor;
                else saidas += valor;
            });
        } else {
            getDBLocal().financeiro.forEach(t => {
                const valor = parseFloat(t.valor) || 0;
                if (t.tipo === 'entrada') entradas += valor;
                else saidas += valor;
            });
        }

        return { entradas, saidas, saldo: entradas - saidas };
    } catch (error) {
        console.error('Erro:', error.message);
        return { entradas: 0, saidas: 0, saldo: 0 };
    }
};

// ============================================
// 7. FUNÇÕES MATERIAL
// ============================================

window.addMaterial = async function(data) {
    try {
        if (useSupabase) {
            const { error } = await supabase
                .from('material_caderno')
                .insert([{
                    titulo: data.titulo,
                    url: data.url || null,
                    descricao: data.descricao || null
                }]);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            data.id = Date.now().toString();
            db.material.push(data);
            saveDBLocal(db);
        }
        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro:', error.message);
        return false;
    }
};

window.deleteMaterial = async function(id) {
    if (!confirm('Excluir material?')) return;
    try {
        if (useSupabase) {
            const { error } = await supabase.from('material_caderno').delete().eq('id', id);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            db.material = db.material.filter(m => m.id !== id);
            saveDBLocal(db);
        }
        location.reload();
    } catch (error) {
        console.error('Erro:', error.message);
    }
};

window.getMaterial = async function() {
    try {
        if (useSupabase) {
            const { data, error } = await supabase
                .from('material_caderno')
                .select('*')
                .eq('ativo', true)
                .order('titulo');
            if (error) throw error;
            return data || [];
        } else {
            return getDBLocal().material;
        }
    } catch (error) {
        console.error('Erro:', error.message);
        return [];
    }
};

// ============================================
// 8. FUNÇÕES CEFR
// ============================================

window.addCefr = async function(data) {
    try {
        if (useSupabase) {
            const { error } = await supabase
                .from('cefr_caderno')
                .insert([{
                    nivel: data.nivel,
                    descricao: data.descricao || null
                }]);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            data.id = Date.now().toString();
            db.cefr.push(data);
            saveDBLocal(db);
        }
        window.dispatchEvent(new Event('db-update'));
        return true;
    } catch (error) {
        console.error('Erro:', error.message);
        return false;
    }
};

window.deleteCefr = async function(id) {
    if (!confirm('Excluir nível CEFR?')) return;
    try {
        if (useSupabase) {
            const { error } = await supabase.from('cefr_caderno').delete().eq('id', id);
            if (error) throw error;
        } else {
            const db = getDBLocal();
            db.cefr = db.cefr.filter(c => c.id !== id);
            saveDBLocal(db);
        }
        location.reload();
    } catch (error) {
        console.error('Erro:', error.message);
    }
};

window.getCefr = async function() {
    try {
        if (useSupabase) {
            const { data, error } = await supabase
                .from('cefr_caderno')
                .select('*')
                .order('nivel');
            if (error) throw error;
            return data || [];
        } else {
            return getDBLocal().cefr;
        }
    } catch (error) {
        console.error('Erro:', error.message);
        return [];
    }
};

// ============================================
// 9. DASHBOARD (compatível com ambos)
// ============================================

async function updateDashboard() {
    if (!document.getElementById('dash-alunos') && !document.getElementById('stat-alunos')) return;

    try {
        const alunos = await window.getAlunos();
        const turmas = await window.getTurmas();
        const cefr = await window.getCefr();
        const agenda = await window.getAgenda();
        const financial = await window.getFinanceiroSummary();

        document.getElementById('dash-alunos') && (document.getElementById('dash-alunos').textContent = alunos.length);
        document.getElementById('stat-alunos') && (document.getElementById('stat-alunos').textContent = alunos.length);

        document.getElementById('dash-turmas') && (document.getElementById('dash-turmas').textContent = turmas.length);
        document.getElementById('stat-turmas') && (document.getElementById('stat-turmas').textContent = turmas.length);

        document.getElementById('dash-cefr') && (document.getElementById('dash-cefr').textContent = cefr.length);
        document.getElementById('stat-cefr') && (document.getElementById('stat-cefr').textContent = cefr.length);

        const agendadas = agenda.filter(a => a.status === 'agendada').length;
        document.getElementById('dash-agenda') && (document.getElementById('dash-agenda').textContent = agendadas);
        document.getElementById('stat-agendadas') && (document.getElementById('stat-agendadas').textContent = agendadas);

        document.getElementById('dash-entradas') && (document.getElementById('dash-entradas').textContent = `R$ ${financial.entradas.toFixed(2)}`);
        document.getElementById('fin-entradas') && (document.getElementById('fin-entradas').textContent = `R$ ${financial.entradas.toFixed(2)}`);

        document.getElementById('dash-saidas') && (document.getElementById('dash-saidas').textContent = `R$ ${financial.saidas.toFixed(2)}`);
        document.getElementById('fin-saidas') && (document.getElementById('fin-saidas').textContent = `R$ ${financial.saidas.toFixed(2)}`);

        document.getElementById('dash-saldo') && (document.getElementById('dash-saldo').textContent = `R$ ${financial.saldo.toFixed(2)}`);
        document.getElementById('fin-saldo') && (document.getElementById('fin-saldo').textContent = `R$ ${financial.saldo.toFixed(2)}`);
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

window.formatCurrency = function(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
};

document.addEventListener('DOMContentLoaded', updateDashboard);
window.addEventListener('db-update', updateDashboard);

console.log('✅ app.js carregado (' + (useSupabase ? 'Supabase' : 'localStorage') + ')');
