// app.js - Sistema Central Robusto (v2.0)
const DB_KEY = 'cadernoOnlineDB';

// 1. Inicialização e Migração do Banco de Dados
function getDB() {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
        // Cria estrutura nova limpa
        const initial = {
            alunos: [],
            turmas: [],
            cefr: [],
            material: [],
            agenda: [],
            financeiro: [] // Agora é uma lista simples de transações
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initial));
        return initial;
    }
    
    // Verificação de migração (caso tenha dados antigos)
    const db = JSON.parse(data);
    
    // Se 'financeiro' for um objeto antigo {entradas:..., saidas:...}, converte para lista
    if (db.financeiro && typeof db.financeiro === 'object' && !Array.isArray(db.financeiro)) {
        db.financeiro = db.financeiro.transacoes || [];
        saveDB(db);
    }
    
    return db;
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // Dispara um sinal para atualizar o dashboard ou outras abas
    window.dispatchEvent(new Event('db-update'));
}

// ==========================================
// 2. FUNÇÕES GLOBAIS DE CRUD (Alunos)
// ==========================================
window.addAluno = function(data) {
    const db = getDB();
    if (db.alunos.some(a => a.nome.toLowerCase() === data.nome.toLowerCase())) {
        alert('⚠️ Erro: Já existe um aluno com este nome!');
        return false;
    }
    data.id = Date.now().toString();
    db.alunos.push(data);
    saveDB(db);
    return true;
};

window.updateAluno = function(id, newData) {
    const db = getDB();
    const index = db.alunos.findIndex(a => a.id === id);
    if (index !== -1) {
        db.alunos[index] = { ...db.alunos[index], ...newData };
        saveDB(db);
        return true;
    }
    return false;
};

window.deleteAluno = function(id) {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
    const db = getDB();
    db.alunos = db.alunos.filter(a => a.id !== id);
    saveDB(db);
    location.reload();
};

// ==========================================
// 3. FUNÇÕES GLOBAIS DE CRUD (Turmas)
// ==========================================
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

// ==========================================
// 4. FUNÇÕES GLOBAIS DE CRUD (Agenda)
// ==========================================
window.addAgenda = function(data) {
    const db = getDB();
    data.id = Date.now().toString();
    data.status = data.status || 'agendada'; // Padrão
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

// ==========================================
// 5. FUNÇÕES GLOBAIS DE CRUD (Financeiro)
// ==========================================
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

// ==========================================
// 6. FUNÇÕES GLOBAIS DE CRUD (Material)
// ==========================================
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

// ==========================================
// 7. FUNÇÕES GLOBAIS DE CRUD (CEFR)
// ==========================================
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

// ==========================================
// 8. LÓGICA DO DASHBOARD (Index)
// ==========================================
function updateDashboard() {
    // Só roda se estiver na página principal (index)
    if (!document.getElementById('dash-alunos') && !document.getElementById('stat-alunos')) return;

    const db = getDB();

    // Atualiza Contadores Simples
    const elAlunos = document.getElementById('dash-alunos') || document.getElementById('stat-alunos');
    if (elAlunos) elAlunos.textContent = db.alunos.length;

    const elTurmas = document.getElementById('dash-turmas') || document.getElementById('stat-turmas');
    if (elTurmas) elTurmas.textContent = db.turmas.length;

    const elCefr = document.getElementById('dash-cefr') || document.getElementById('stat-cefr');
    if (elCefr) elCefr.textContent = db.cefr.length;

    // Agenda (Só Agendadas)
    const elAgenda = document.getElementById('dash-agenda') || document.getElementById('stat-agendadas');
    if (elAgenda) elAgenda.textContent = db.agenda.filter(a => a.status === 'agendada').length;

    // Financeiro (Cálculo Dinâmico)
    let totalEntradas = 0;
    let totalSaidas = 0;

    // Garante que financeiro é lista
    const financList = Array.isArray(db.financeiro) ? db.financeiro : [];

    financList.forEach(t => {
        const val = parseFloat(t.valor) || 0;
        if (t.tipo === 'entrada') totalEntradas += val;
        else totalSaidas += val;
    });

    const elEntradas = document.getElementById('dash-entradas') || document.getElementById('fin-entradas');
    if (elEntradas) elEntradas.textContent = `R$ ${totalEntradas.toFixed(2)}`;

    const elSaidas = document.getElementById('dash-saidas') || document.getElementById('fin-saidas');
    if (elSaidas) elSaidas.textContent = `R$ ${totalSaidas.toFixed(2)}`;

    const elSaldo = document.getElementById('dash-saldo') || document.getElementById('fin-saldo');
    if (elSaldo) elSaldo.textContent = `R$ ${(totalEntradas - totalSaidas).toFixed(2)}`;
}

// Inicialização
document.addEventListener('DOMContentLoaded', updateDashboard);
window.addEventListener('db-update', updateDashboard);
