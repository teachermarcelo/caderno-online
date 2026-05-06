// app.js - Núcleo Central do Caderno Online
const DB_KEY = 'cadernoOnlineDB';

// 1. Banco de Dados Padronizado
function getDB() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : {
        alunos: [], turmas: [], agenda: [], financeiro: [], cefr: [], material: []
    };
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // Dispara evento para sincronizar index.html e outras abas
    window.dispatchEvent(new Event('db-updated'));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 2. CRUD COMPLETO (Alunos, Turmas, Agenda, Financeiro, CEFR, Material)
const DB = {
    // ALUNOS
    addAluno(data) {
        const db = getDB();
        if (db.alunos.some(a => a.nome.toLowerCase() === data.nome.toLowerCase())) {
            alert('⚠️ Já existe um aluno com este nome!');
            return false;
        }
        db.alunos.push({ id: generateId(), ...data, created_at: new Date().toISOString() });
        saveDB(db); return true;
    },
    updateAluno(id, newData) {
        const db = getDB();
        const i = db.alunos.findIndex(a => a.id === id);
        if (i !== -1) { db.alunos[i] = { ...db.alunos[i], ...newData }; saveDB(db); return true; }
        return false;
    },
    deleteAluno(id) {
        if (!confirm('Excluir aluno?')) return false;
        const db = getDB(); db.alunos = db.alunos.filter(a => a.id !== id); saveDB(db); return true;
    },

    // TURMAS
    addTurma(data) {
        const db = getDB(); db.turmas.push({ id: generateId(), ...data, created_at: new Date().toISOString() });
        saveDB(db); return true;
    },
    updateTurma(id, newData) {
        const db = getDB(); const i = db.turmas.findIndex(t => t.id === id);
        if (i !== -1) { db.turmas[i] = { ...db.turmas[i], ...newData }; saveDB(db); return true; }
        return false;
    },
    deleteTurma(id) {
        if (!confirm('Excluir turma?')) return false;
        const db = getDB(); db.turmas = db.turmas.filter(t => t.id !== id); saveDB(db); return true;
    },

    // AGENDA
    addAgenda(data) {
        const db = getDB(); db.agenda.push({ id: generateId(), status: 'agendada', ...data, created_at: new Date().toISOString() });
        saveDB(db); return true;
    },
    updateAgenda(id, newData) {
        const db = getDB(); const i = db.agenda.findIndex(a => a.id === id);
        if (i !== -1) { db.agenda[i] = { ...db.agenda[i], ...newData }; saveDB(db); return true; }
        return false;
    },
    deleteAgenda(id) {
        if (!confirm('Excluir aula da agenda?')) return false;
        const db = getDB(); db.agenda = db.agenda.filter(a => a.id !== id); saveDB(db); return true;
    },

    // FINANCEIRO (Agora é um array simples de transações)
    addFinanceiro(data) {
        const db = getDB(); db.financeiro.push({ id: generateId(), ...data, created_at: new Date().toISOString() });
        saveDB(db); return true;
    },
    updateFinanceiro(id, newData) {
        const db = getDB(); const i = db.financeiro.findIndex(f => f.id === id);
        if (i !== -1) { db.financeiro[i] = { ...db.financeiro[i], ...newData }; saveDB(db); return true; }
        return false;
    },
    deleteFinanceiro(id) {
        if (!confirm('Excluir transação?')) return false;
        const db = getDB(); db.financeiro = db.financeiro.filter(f => f.id !== id); saveDB(db); return true;
    },

    // CEFR
    addCEFR(data) {
        const db = getDB(); db.cefr.push({ id: generateId(), ...data, created_at: new Date().toISOString() });
        saveDB(db); return true;
    },
    updateCEFR(id, newData) {
        const db = getDB(); const i = db.cefr.findIndex(c => c.id === id);
        if (i !== -1) { db.cefr[i] = { ...db.cefr[i], ...newData }; saveDB(db); return true; }
        return false;
    },
    deleteCEFR(id) {
        if (!confirm('Excluir aula CEFR?')) return false;
        const db = getDB(); db.cefr = db.cefr.filter(c => c.id !== id); saveDB(db); return true;
    },

    // MATERIAL
    addMaterial(data) {
        const db = getDB(); db.material.push({ id: generateId(), ...data, created_at: new Date().toISOString() });
        saveDB(db); return true;
    },
    updateMaterial(id, newData) {
        const db = getDB(); const i = db.material.findIndex(m => m.id === id);
        if (i !== -1) { db.material[i] = { ...db.material[i], ...newData }; saveDB(db); return true; }
        return false;
    },
    deleteMaterial(id) {
        if (!confirm('Excluir material?')) return false;
        const db = getDB(); db.material = db.material.filter(m => m.id !== id); saveDB(db); return true;
    }
};

// 3. Utilitários
function formatCurrency(v) {
    return parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatDate(d) {
    if (!d) return '-';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
}

// 4. Dashboard Automático (index.html)
function renderDashboard() {
    const db = getDB();
    
    // Stats Básicos
    document.getElementById('stat-alunos') && (document.getElementById('stat-alunos').textContent = db.alunos.length);
    document.getElementById('stat-turmas') && (document.getElementById('stat-turmas').textContent = db.turmas.length);
    document.getElementById('stat-cefr') && (document.getElementById('stat-cefr').textContent = db.cefr.length);
    
    // Agenda Stats
    const ag = db.agenda.filter(a => a.status === 'agendada').length;
    const conc = db.agenda.filter(a => a.status === 'concluida').length;
    const and = db.agenda.filter(a => a.status === 'andamento').length;
    document.getElementById('stat-agendadas') && (document.getElementById('stat-agendadas').textContent = ag);
    document.getElementById('stat-concluidas') && (document.getElementById('stat-concluidas').textContent = conc);
    document.getElementById('stat-andamento') && (document.getElementById('stat-andamento').textContent = and);
    
    // Financeiro Stats (Calcula do array de transações)
    let entradas = 0, saidas = 0;
    db.financeiro.forEach(t => {
        const v = parseFloat(t.valor) || 0;
        if (t.tipo === 'entrada') entradas += v;
        else saidas += v;
    });
    document.getElementById('fin-entradas') && (document.getElementById('fin-entradas').textContent = formatCurrency(entradas));
    document.getElementById('fin-saidas') && (document.getElementById('fin-saidas').textContent = formatCurrency(saidas));
    document.getElementById('fin-saldo') && (document.getElementById('fin-saldo').textContent = formatCurrency(entradas - saidas));
    
    // CEFR Bars
    const counts = { A1:0, A2:0, B1:0, B2:0, C1:0, C2:0 };
    db.alunos.forEach(a => { if(counts[a.nivel] !== undefined) counts[a.nivel]++; });
    const total = Object.values(counts).reduce((a,b)=>a+b,0) || 1;
    ['a1','a2','b1','b2','c1','c2'].forEach(l => {
        document.getElementById(`cefr-${l}`) && (document.getElementById(`cefr-${l}`).textContent = counts[l.toUpperCase()]);
        document.getElementById(`bar-${l}`) && (document.getElementById(`bar-${l}`).style.width = `${(counts[l.toUpperCase()]/total)*100}%`);
    });
}

// Exporta para acesso global em todas as páginas
window.CadernoDB = DB;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    window.addEventListener('db-updated', renderDashboard);
});
