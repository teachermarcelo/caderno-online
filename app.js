// app.js - Camada de Dados Centralizada
const DB_KEY = 'cadernoOnlineDB';

// Inicializa o banco de dados
function initDB() {
    const existing = localStorage.getItem(DB_KEY);
    if (!existing) {
        const initialDB = {
            alunos: [],
            turmas: [],
            cefr: [],
            material: [],
            agenda: [],
            financeiro: []
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
        return initialDB;
    }
    return JSON.parse(existing);
}

// Obtém dados do localStorage
function getDB() {
    try {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : initDB();
    } catch (error) {
        console.error('Erro ao ler banco de dados:', error);
        return initDB();
    }
}

// Salva dados no localStorage
function saveDB(data) {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
        // Dispara evento personalizado para outras páginas saberem
        window.dispatchEvent(new Event('db-updated'));
        return true;
    } catch (error) {
        console.error('Erro ao salvar banco de dados:', error);
        return false;
    }
}

// === ALUNOS ===
function addAluno(alunoData) {
    const db = getDB();
    
    // Verifica duplicata
    if (db.alunos.some(a => a.nome.toLowerCase() === alunoData.nome.toLowerCase())) {
        return { success: false, message: 'Já existe um aluno com este nome!' };
    }
    
    const novoAluno = {
        id: Date.now().toString(),
        nome: alunoData.nome.trim(),
        nivel: alunoData.nivel,
        telefone: alunoData.telefone?.trim() || '',
        links: alunoData.links || [],
        created_at: new Date().toISOString()
    };
    
    db.alunos.push(novoAluno);
    saveDB(db);
    
    return { success: true, data: novoAluno };
}

function updateAluno(id, alunoData) {
    const db = getDB();
    const index = db.alunos.findIndex(a => a.id === id);
    
    if (index === -1) {
        return { success: false, message: 'Aluno não encontrado!' };
    }
    
    // Verifica duplicata (exceto o próprio aluno sendo editado)
    if (db.alunos.some(a => a.nome.toLowerCase() === alunoData.nome.toLowerCase() && a.id !== id)) {
        return { success: false, message: 'Já existe um aluno com este nome!' };
    }
    
    db.alunos[index] = {
        ...db.alunos[index],
        nome: alunoData.nome.trim(),
        nivel: alunoData.nivel,
        telefone: alunoData.telefone?.trim() || '',
        links: alunoData.links || [],
        updated_at: new Date().toISOString()
    };
    
    saveDB(db);
    return { success: true, data: db.alunos[index] };
}

function deleteAluno(id) {
    const db = getDB();
    const initialLength = db.alunos.length;
    db.alunos = db.alunos.filter(a => a.id !== id);
    
    if (db.alunos.length === initialLength) {
        return { success: false, message: 'Aluno não encontrado!' };
    }
    
    saveDB(db);
    return { success: true };
}

function getAlunos() {
    return getDB().alunos;
}

function getAlunoById(id) {
    return getDB().alunos.find(a => a.id === id);
}

// === UTILITÁRIOS ===
function formatCurrency(value) {
    return parseFloat(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Inicializa o DB quando o script carrega
initDB();

// Exporta funções globalmente
window.CadernoDB = {
    getDB,
    saveDB,
    addAluno,
    updateAluno,
    deleteAluno,
    getAlunos,
    getAlunoById,
    formatCurrency,
    formatDate
};
