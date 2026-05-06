// app.js - Sistema Central Caderno Online
const DB_KEY = 'cadernoOnlineDB';

// 1. Inicialização do Banco de Dados
function getDB() {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
        // Estrutura inicial correta (Financeiro agora é uma lista de transações)
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

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // Dispara evento para atualizar outras páginas (ex: Dashboard)
    window.dispatchEvent(new Event('db-update'));
}

// 2. Funções CRUD para TODOS os módulos (Global)

// --- ALUNOS ---
window.addAluno = function(data) {
    const db = getDB();
    if (db.alunos.some(a => a.nome.toLowerCase() === data.nome.toLowerCase())) {
        alert('⚠️ Já existe um aluno com este nome!');
        return false;
    }
    data.id = Date.now().toString();
    db.alunos.push(data);
    saveDB(db);
    return true;
};

window.deleteAluno = function(id) {
    if (!confirm('Excluir aluno?')) return;
    const db = getDB();
    db.alunos = db.alunos.filter(a => a.id !== id);
    saveDB(db);
    location.reload(); // Recarrega para atualizar lista
};

// --- TURMAS ---
window.addTurma = function(data) {
    const db = getDB();
    data.id = Date.now().toString();
    db.turmas.push(data);
    saveDB(db);
    return true;
};

window.deleteTurma = function(id) {
    if (!confirm('Excluir turma?')) return;
    const db = getDB();
    db.turmas = db.turmas.filter(t => t.id !== id);
    saveDB(db);
    location.reload();
};

// --- AGENDA ---
window.addAgenda = function(data) {
    const db = getDB();
    data.id = Date.now().toString();
    data.status = data.status || 'agendada';
    db.agenda.push(data);
    saveDB(db);
    return true;
};

window.deleteAgenda = function(id) {
    if (!confirm('Excluir aula da agenda?')) return;
    const db = getDB();
    db.agenda = db.agenda.filter(a => a.id !== id);
    saveDB(db);
    location.reload();
};

window.updateAgendaStatus = function(id, newStatus) {
    const db = getDB();
    const index = db.agenda.findIndex(a => a.id === id);
    if (index !== -1) {
        db.agenda[index].status = newStatus;
        saveDB(db);
        location.reload();
    }
};

// --- FINANCEIRO ---
window.addFinanceiro = function(data) {
    const db = getDB();
    data.id = Date.now().toString();
    // data.tipo deve ser 'entrada' ou 'saida'
    db.financeiro.push(data);
    saveDB(db);
    return true;
};

window.deleteFinanceiro = function(id) {
    if (!confirm('Excluir transação?')) return;
    const db = getDB();
    db.financeiro = db.financeiro.filter(f => f.id !== id);
    saveDB(db);
    location.reload();
};

// --- MATERIAL ---
window.addMaterial = function(data) {
    const db = getDB();
    data.id = Date.now().toString();
    db.material.push(data);
    saveDB(db);
    return true;
};

window.deleteMaterial = function(id) {
    if (!confirm('Excluir material?')) return;
    const db = getDB();
    db.material = db.material.filter(m => m.id !== id);
    saveDB(db);
    location.reload();
};

// --- CEFR ---
window.addCefr = function(data) {
    const db = getDB();
    data.id = Date.now().toString();
    db.cefr.push(data);
    saveDB(db);
    return true;
};

window.deleteCefr = function(id) {
    if (!confirm('Excluir aula CEFR?')) return;
    const db = getDB();
    db.cefr = db.cefr.filter(c => c.id !== id);
    saveDB(db);
    location.reload();
};

// 3. Atualização do Dashboard (Index.html)
function updateDashboard() {
    const db = getDB();

    // Contadores Simples
    if (document.getElementById('dash-alunos')) document.getElementById('dash-alunos').textContent = db.alunos.length;
    if (document.getElementById('dash-turmas')) document.getElementById('dash-turmas').textContent = db.turmas.length;
    if (document.getElementById('dash-cefr')) document.getElementById('dash-cefr').textContent = db.cefr.length;
    
    // Agenda Contagem
    if (document.getElementById('dash-agenda')) {
        const agendadas = db.agenda.filter(a => a.status === 'agendada').length;
        document.getElementById('dash-agenda').textContent = agendadas;
    }

    // Financeiro Cálculo Real
    let totalEntradas = 0;
    let totalSaidas = 0;
    
    db.financeiro.forEach(trans => {
        const val = parseFloat(trans.valor) || 0;
        if (trans.tipo === 'entrada') totalEntradas += val;
        else if (trans.tipo === 'saida') totalSaidas += val;
    });

    const saldo = totalEntradas - totalSaidas;

    if (document.getElementById('dash-entradas')) document.getElementById('dash-entradas').textContent = `R$ ${totalEntradas.toFixed(2)}`;
    if (document.getElementById('dash-saidas')) document.getElementById('dash-saidas').textContent = `R$ ${totalSaidas.toFixed(2)}`;
    if (document.getElementById('dash-saldo')) document.getElementById('dash-saldo').textContent = `R$ ${saldo.toFixed(2)}`;
}

// Inicializa ao carregar
document.addEventListener('DOMContentLoaded', updateDashboard);
window.addEventListener('db-update', updateDashboard);
