// app.js - Lógica Central e "API Local" para Caderno Online
const DB_KEY = 'cadernoOnlineDB';

// 1. Inicialização e Banco de Dados
function getDB() {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
        return JSON.parse(data);
    }
    
    // Estrutura inicial padrão
    const initialDB = {
        alunos: [],
        turmas: [],
        cefr: [],
        material: [],
        agenda: [],
        financeiro: [] // Agora é um array de transações (entradas e saídas mistas)
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
    return initialDB;
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // Dispara um evento para atualizar outras abas/páginas automaticamente
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('db-updated'));
}

// 2. Funções Genéricas
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(value) {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// 3. CRUD: ALUNOS
function addAluno(data) {
    const db = getDB();
    // Verifica duplicata
    if (db.alunos.some(a => a.nome.toLowerCase() === data.nome.toLowerCase())) {
        alert('⚠️ Erro: Já existe um aluno com este nome!');
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
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return false;
    const db = getDB();
    db.alunos = db.alunos.filter(a => a.id !== id);
    saveDB(db);
    return true;
}

// 4. CRUD: TURMAS
function addTurma(data) {
    const db = getDB();
    data.id = generateId();
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

// 5. CRUD: AGENDA
function addAgenda(data) {
    const db = getDB();
    data.id = generateId();
    data.status = data.status || 'agendada';
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
    if (!confirm('Excluir esta aula da agenda?')) return false;
    const db = getDB();
    db.agenda = db.agenda.filter(a => a.id !== id);
    saveDB(db);
    return true;
}

// 6. CRUD: FINANCEIRO (Transações)
// O financeiro agora é uma lista única de transações com 'tipo' (entrada/saida)
function addFinanceiro(data) {
    const db = getDB();
    data.id = generateId();
    data.tipo = data.tipo || 'entrada'; // padrão
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

// 7. CRUD: CEFR & MATERIAL (Genéricos)
function addCEFR(data) {
    const db = getDB();
    data.id = generateId();
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

function addMaterial(data) {
    const db = getDB();
    data.id = generateId();
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

// 8. Dashboard (Atualiza o index.html)
function renderDashboard() {
    // Só executa se estivermos na página index
    if (!document.getElementById('stat-alunos')) return;

    const db = getDB();

    // Atualiza contadores simples
    document.getElementById('stat-alunos').textContent = db.alunos.length;
    document.getElementById('stat-turmas').textContent = db.turmas.length;
    document.getElementById('stat-cefr').textContent = db.cefr.length;

    // Conta status da agenda
    const agendadas = db.agenda.filter(a => a.status === 'agendada').length;
    const concluidas = db.agenda.filter(a => a.status === 'concluida').length;
    const andamento = db.agenda.filter(a => a.status === 'andamento').length;

    document.getElementById('stat-agendadas').textContent = agendadas;
    document.getElementById('stat-concluidas').textContent = concluidas;
    document.getElementById('stat-andamento').textContent = andamento;

    // Calcula Financeiro
    let totalEntradas = 0;
    let totalSaidas = 0;

    db.financeiro.forEach(t => {
        const val = parseFloat(t.valor) || 0;
        if (t.tipo === 'entrada') {
            totalEntradas += val;
        } else {
            totalSaidas += val;
        }
    });

    // Atualiza cards de resumo financeiro no index (se existirem os IDs)
    const elEntradas = document.getElementById('fin-entradas');
    const elSaidas = document.getElementById('fin-saidas');
    const elSaldo = document.getElementById('fin-saldo');

    if (elEntradas) elEntradas.textContent = formatCurrency(totalEntradas);
    if (elSaidas) elSaidas.textContent = formatCurrency(totalSaidas);
    if (elSaldo) elSaldo.textContent = formatCurrency(totalEntradas - totalSaidas);
    
    // Atualiza barras de progresso CEFR se existirem
    updateCefrBars(db.alunos);
    
    // Atualiza listas de "Alunos Recentes" e "Próximas Aulas" se existirem
    updateRecentLists(db);
}

function updateCefrBars(alunos) {
    const counts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    alunos.forEach(a => { if (counts[a.nivel] !== undefined) counts[a.nivel]++; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    
    ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].forEach(level => {
        const key = level.toUpperCase();
        const count = counts[key];
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
        recentContainer.innerHTML = recent.length ? recent.map(a => `
            <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">${a.nome.charAt(0)}</div>
                <div><p class="font-semibold text-sm">${a.nome}</p><p class="text-xs text-gray-500">${a.nivel}</p></div>
            </div>
        `).join('') : '<p class="text-center py-4 text-gray-400 text-sm">Nenhum aluno</p>';
    }

    // Próximas Aulas
    const upcomingContainer = document.getElementById('upcoming-classes');
    if (upcomingContainer) {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = db.agenda.filter(a => a.data >= today && a.status === 'agendada')
                                  .sort((a,b) => a.data.localeCompare(b.data))
                                  .slice(0, 5);
        upcomingContainer.innerHTML = upcoming.length ? upcoming.map(a => `
            <div class="p-4 rounded-xl bg-purple-50 border border-purple-100 mb-2">
                <p class="font-semibold text-sm">${a.titulo}</p>
                <p class="text-xs text-gray-600">${a.data} • ${a.horario || ''}</p>
            </div>
        `).join('') : '<p class="text-center py-4 text-gray-400 text-sm">Nenhuma aula</p>';
    }
}

// 9. Inicialização Global
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o dashboard se estiver na home
    renderDashboard();
});

// Escuta mudanças em outras abas (para sincronizar index ao adicionar aluno em alunos.html)
window.addEventListener('storage', renderDashboard);
window.addEventListener('db-updated', renderDashboard);

// Exporta para uso nos outros arquivos
window.CadernoDB = {
    getDB,
    saveDB,
    generateId,
    formatCurrency,
    // Alunos
    addAluno,
    updateAluno,
    deleteAluno,
    // Turmas
    addTurma,
    updateTurma,
    deleteTurma,
    // Agenda
    addAgenda,
    updateAgenda,
    deleteAgenda,
    // Financeiro
    addFinanceiro,
    updateFinanceiro,
    deleteFinanceiro,
    // Outros
    addCEFR,
    deleteCEFR,
    addMaterial,
    deleteMaterial
};
