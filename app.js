// app.js - Sistema Completo Caderno Online
const DB_KEY = 'cadernoOnlineDB';

// ===== BANCO DE DADOS =====
function getDB() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : {
        alunos: [],
        turmas: [],
        cefr: [],
        material: [],
        agenda: [],
        financeiro: []
    };
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    window.dispatchEvent(new Event('db-updated'));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== ALUNOS =====
function addAluno(data) {
    const db = getDB();
    if (db.alunos.some(a => a.nome.toLowerCase() === data.nome.toLowerCase())) {
        alert('Já existe um aluno com este nome!');
        return false;
    }
    data.id = generateId();
    data.created_at = new Date().toISOString();
    db.alunos.push(data);
    saveDB(db);
    return true;
}

function updateAluno(id, newData) {
    const db = getDB();
    const index = db.alunos.findIndex(a => a.id === id);
    if (index !== -1) {
        db.alunos[index] = { ...db.alunos[index], ...newData };
        saveDB(db);
        return true;
    }
    return false;
}

function deleteAluno(id) {
    if (!confirm('Excluir este aluno?')) return false;
    const db = getDB();
    db.alunos = db.alunos.filter(a => a.id !== id);
    saveDB(db);
    return true;
}

// ===== AGENDA =====
function addAgenda(data) {
    const db = getDB();
    data.id = generateId();
    data.status = data.status || 'agendada';
    data.created_at = new Date().toISOString();
    db.agenda.push(data);
    saveDB(db);
    return true;
}

function updateAgenda(id, newData) {
    const db = getDB();
    const index = db.agenda.findIndex(a => a.id === id);
    if (index !== -1) {
        db.agenda[index] = { ...db.agenda[index], ...newData };
        saveDB(db);
        return true;
    }
    return false;
}

function deleteAgenda(id) {
    if (!confirm('Excluir esta aula?')) return false;
    const db = getDB();
    db.agenda = db.agenda.filter(a => a.id !== id);
    saveDB(db);
    return true;
}

// ===== FINANCEIRO =====
function addFinanceiro(data) {
    const db = getDB();
    data.id = generateId();
    data.tipo = data.tipo || 'entrada';
    data.created_at = new Date().toISOString();
    db.financeiro.push(data);
    saveDB(db);
    return true;
}

function updateFinanceiro(id, newData) {
    const db = getDB();
    const index = db.financeiro.findIndex(f => f.id === id);
    if (index !== -1) {
        db.financeiro[index] = { ...db.financeiro[index], ...newData };
        saveDB(db);
        return true;
    }
    return false;
}

function deleteFinanceiro(id) {
    if (!confirm('Excluir esta transação?')) return false;
    const db = getDB();
    db.financeiro = db.financeiro.filter(f => f.id !== id);
    saveDB(db);
    return true;
}

// ===== TURMAS =====
function addTurma(data) {
    const db = getDB();
    data.id = generateId();
    data.created_at = new Date().toISOString();
    db.turmas.push(data);
    saveDB(db);
    return true;
}

function updateTurma(id, newData) {
    const db = getDB();
    const index = db.turmas.findIndex(t => t.id === id);
    if (index !== -1) {
        db.turmas[index] = { ...db.turmas[index], ...newData };
        saveDB(db);
        return true;
    }
    return false;
}

function deleteTurma(id) {
    if (!confirm('Excluir esta turma?')) return false;
    const db = getDB();
    db.turmas = db.turmas.filter(t => t.id !== id);
    saveDB(db);
    return true;
}

// ===== CEFR =====
function addCEFR(data) {
    const db = getDB();
    data.id = generateId();
    data.created_at = new Date().toISOString();
    db.cefr.push(data);
    saveDB(db);
    return true;
}

function deleteCEFR(id) {
    const db = getDB();
    db.cefr = db.cefr.filter(c => c.id !== id);
    saveDB(db);
    return true;
}

// ===== MATERIAL =====
function addMaterial(data) {
    const db = getDB();
    data.id = generateId();
    data.created_at = new Date().toISOString();
    db.material.push(data);
    saveDB(db);
    return true;
}

function deleteMaterial(id) {
    const db = getDB();
    db.material = db.material.filter(m => m.id !== id);
    saveDB(db);
    return true;
}

// ===== UTILITÁRIOS =====
function formatCurrency(value) {
    return parseFloat(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}/${y}`;
}

// ===== DASHBOARD =====
function renderDashboard() {
    const db = getDB();
    
    // Atualiza contadores
    const elAlunos = document.getElementById('stat-alunos');
    if (elAlunos) elAlunos.textContent = db.alunos.length;
    
    const elTurmas = document.getElementById('stat-turmas');
    if (elTurmas) elTurmas.textContent = db.turmas.length;
    
    const elCefr = document.getElementById('stat-cefr');
    if (elCefr) elCefr.textContent = db.cefr.length;
    
    // Agenda
    const agendadas = db.agenda.filter(a => a.status === 'agendada').length;
    const concluidas = db.agenda.filter(a => a.status === 'concluida').length;
    const andamento = db.agenda.filter(a => a.status === 'andamento').length;
    
    const elAgendadas = document.getElementById('stat-agendadas');
    if (elAgendadas) elAgendadas.textContent = agendadas;
    
    const elConcluidas = document.getElementById('stat-concluidas');
    if (elConcluidas) elConcluidas.textContent = concluidas;
    
    const elAndamento = document.getElementById('stat-andamento');
    if (elAndamento) elAndamento.textContent = andamento;
    
    // Financeiro
    let totalEntradas = 0;
    let totalSaidas = 0;
    
    db.financeiro.forEach(t => {
        const val = parseFloat(t.valor) || 0;
        if (t.tipo === 'entrada') totalEntradas += val;
        else totalSaidas += val;
    });
    
    const elEntradas = document.getElementById('fin-entradas');
    const elSaidas = document.getElementById('fin-saidas');
    const elSaldo = document.getElementById('fin-saldo');
    
    if (elEntradas) elEntradas.textContent = formatCurrency(totalEntradas);
    if (elSaidas) elSaidas.textContent = formatCurrency(totalSaidas);
    if (elSaldo) elSaldo.textContent = formatCurrency(totalEntradas - totalSaidas);
    
    // CEFR Distribution
    updateCefrBars(db.alunos);
    
    // Listas recentes
    updateRecentLists(db);
}

function updateCefrBars(alunos) {
    const counts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    alunos.forEach(a => { if (counts[a.nivel] !== undefined) counts[a.nivel]++; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    
    ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].forEach(level => {
        const count = counts[level.toUpperCase()];
        const elCount = document.getElementById(`cefr-${level}`);
        const elBar = document.getElementById(`bar-${level}`);
        
        if (elCount) elCount.textContent = count;
        if (elBar) elBar.style.width = `${(count / total) * 100}%`;
    });
}

function updateRecentLists(db) {
    // Alunos Recentes
    const recentContainer = document.getElementById('recent-students');
    if (recentContainer) {
        const recent = db.alunos.slice(0, 5);
        if (recent.length > 0) {
            recentContainer.innerHTML = recent.map(a => `
                <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        ${a.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-semibold text-sm text-gray-900">${a.nome}</p>
                        <p class="text-xs text-gray-500">${a.nivel}</p>
                    </div>
                </div>
            `).join('');
        } else {
            recentContainer.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">Nenhum aluno cadastrado</p>';
        }
    }
    
    // Próximas Aulas
    const upcomingContainer = document.getElementById('upcoming-classes');
    if (upcomingContainer) {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = db.agenda
            .filter(a => a.data >= today && a.status === 'agendada')
            .sort((a, b) => a.data.localeCompare(b.data))
            .slice(0, 5);
            
        if (upcoming.length > 0) {
            upcomingContainer.innerHTML = upcoming.map(a => `
                <div class="p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <p class="font-semibold text-sm text-gray-900">${a.titulo}</p>
                    <p class="text-xs text-gray-600 mt-1">${formatDate(a.data)} • ${a.horario || ''}</p>
                </div>
            `).join('');
        } else {
            upcomingContainer.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">Nenhuma aula agendada</p>';
        }
    }
}

// Exporta funções globalmente
window.CadernoDB = {
    getDB,
    saveDB,
    generateId,
    formatCurrency,
    formatDate,
    // Alunos
    addAluno,
    updateAluno,
    deleteAluno,
    // Agenda
    addAgenda,
    updateAgenda,
    deleteAgenda,
    // Financeiro
    addFinanceiro,
    updateFinanceiro,
    deleteFinanceiro,
    // Turmas
    addTurma,
    updateTurma,
    deleteTurma,
    // CEFR
    addCEFR,
    deleteCEFR,
    // Material
    addMaterial,
    deleteMaterial
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
});

// Escuta mudanças em outras abas
window.addEventListener('storage', renderDashboard);
window.addEventListener('db-updated', renderDashboard);
