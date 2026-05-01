// app.js - Lógica Central do Caderno Online

const DB_KEY = 'cadernoOnlineDB';

// --- SISTEMA DE DADOS (Banco Local) ---

// Carrega dados do navegador
function getDB() {
  const data = localStorage.getItem(DB_KEY);
  if (data) {
    return JSON.parse(data);
  }
  // Se não existir nada, retorna a estrutura vazia inicial
  return {
    alunos: [],
    turmas: [],
    cefr: [],
    material: [],
    agenda: [],
    financeiro: { entradas: 0, saidas: 0, transacoes: [] }
  };
}

// Salva dados no navegador
function saveDB(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  // Força a atualização da tela se estivermos na página inicial
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    renderDashboard();
  }
}

// --- FUNÇÕES GLOBAIS ---

// Formata moeda
function formatCurrency(value) {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Limpa o formulário
function clearForm(formId) {
  document.getElementById(formId).reset();
  const hidden = document.getElementById('editId');
  if (hidden) hidden.value = '';
}

// --- SISTEMA DE ABAS (Tabs) ---
function openTab(tabName, element) {
  // Esconde todo o conteúdo
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  // Remove classe ativa dos botões
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-white', 'text-purple-600', 'font-semibold');
    btn.classList.add('text-gray-600');
  });

  // Mostra a aba certa
  document.getElementById(tabName).classList.add('active');
  
  // Ativa o botão clicado
  element.classList.add('bg-white', 'text-purple-600', 'font-semibold');
  element.classList.remove('text-gray-600');
}

// --- RENDERIZAÇÃO DO DASHBOARD (Index) ---
// Esta função atualiza os cards do index.html automaticamente
function renderDashboard() {
  // Se não estivermos no index, não faz nada para evitar erro
  const dashContainer = document.getElementById('dash-alunos');
  if (!dashContainer) return; 

  const db = getDB();

  // Atualiza números
  document.getElementById('dash-alunos').textContent = db.alunos.length;
  document.getElementById('dash-turmas').textContent = db.turmas.length;
  document.getElementById('dash-cefr').textContent = db.cefr.length;
  
  const saldo = db.financeiro.entradas - db.financeiro.saidas;
  document.getElementById('dash-saldo').textContent = formatCurrency(saldo);
  document.getElementById('fin-entradas').textContent = formatCurrency(db.financeiro.entradas);
  document.getElementById('fin-saidas').textContent = formatCurrency(db.financeiro.saidas);
  document.getElementById('fin-saldo').textContent = formatCurrency(saldo);

  // Atualiza listas resumidas
  renderStudentList(db.alunos);
  renderTransactionList(db.financeiro.transacoes);
}

function renderStudentList(alunos) {
  const container = document.getElementById('lista-alunos-dashboard');
  if (!container) return;
  
  if (alunos.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum aluno encontrado.</p>';
    return;
  }

  container.innerHTML = alunos.slice(-5).reverse().map(a => `
    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
          ${a.nome.charAt(0)}
        </div>
        <p class="text-sm font-medium">${a.nome}</p>
      </div>
      <span class="text-xs text-gray-500">${a.nivel || '-'}</span>
    </div>
  `).join('');
}

function renderTransactionList(transacoes) {
  const container = document.getElementById('lista-transacoes');
  if (!container) return;

  if (transacoes.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhuma transação.</p>';
    return;
  }

  container.innerHTML = transacoes.slice(-5).reverse().map(t => `
    <div class="flex items-center justify-between p-3 ${t.tipo === 'entrada' ? 'bg-green-50' : 'bg-red-50'} rounded-lg">
      <p class="text-sm font-medium">${t.descricao}</p>
      <p class="font-bold text-sm ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}">
        ${t.tipo === 'entrada' ? '+' : '-'} ${formatCurrency(t.valor)}
      </p>
    </div>
  `).join('');
}

// Inicializa tudo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
});
