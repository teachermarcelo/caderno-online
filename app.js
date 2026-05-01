// app.js - Lógica Central e "API Local"

const DB_KEY = 'cadernoOnlineDB';

// 1. Banco de Dados
function getDB() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : {
        alunos: [],
        turmas: [],
        cefr: [],
        material: [],
        agenda: [],
        financeiro: { entradas: 0, saidas: 0, transacoes: [] }
    };
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // Atualiza o dashboard automaticamente se estivermos na home
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        renderDashboard();
    }
}

// 2. Funções de Alunos (CRUD)
function addAluno(data) {
    const db = getDB();
    // Evita duplicatas pelo nome
    if (db.alunos.some(a => a.nome.toLowerCase() === data.nome.toLowerCase())) {
        alert('⚠️ Erro: Já existe um aluno com este nome!');
        return false;
    }
    data.id = Date.now().toString(); // Gera ID único
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
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
    const db = getDB();
    db.alunos = db.alunos.filter(a => a.id !== id);
    saveDB(db);
    return true;
}

// 3. Utilitários
function formatCurrency(value) {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// 4. Dashboard (Atualiza os cards do index.html)
function renderDashboard() {
    const db = getDB();
    
    // Atualiza contadores
    const elAlunos = document.getElementById('dash-alunos');
    if (elAlunos) elAlunos.textContent = db.alunos.length;
    
    const elTurmas = document.getElementById('dash-turmas');
    if (elTurmas) elTurmas.textContent = db.turmas.length;

    const elCefr = document.getElementById('dash-cefr');
    if (elCefr) elCefr.textContent = db.cefr.length;

    // Atualiza financeiro
    const saldo = db.financeiro.entradas - db.financeiro.saidas;
    const elSaldo = document.getElementById('dash-saldo');
    if (elSaldo) elSaldo.textContent = formatCurrency(saldo);
}

// Inicializa ao carregar qualquer página
document.addEventListener('DOMContentLoaded', renderDashboard);
