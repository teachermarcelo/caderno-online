// diagnostico.js - Investigação Completa de Falhas (VERSÃO CORRIGIDA)
// Copie e cole no Console (F12) do navegador

(async () => {

console.log('='.repeat(80));
console.log('DIAGNÓSTICO COMPLETO - CADERNO ONLINE');
console.log('='.repeat(80));

// ============================================
// 1. VERIFICAR SUPABASE INICIALIZADO
// ============================================
console.log('\n📋 1. VERIFICAÇÃO DO SUPABASE\n');

if (typeof supabase === 'undefined') {
    console.error('❌ SUPABASE NÃO INICIALIZADO');
    console.log('   Motivo: A variável global "supabase" não existe');
    console.log('   Solução: Verifique se app.js foi carregado com type="module"');
} else {
    console.log('✅ Supabase inicializado');
    console.log('   URL:', supabase?.supabaseUrl || 'NÃO DEFINIDA');
}

// ============================================
// 2. VERIFICAR FUNÇÕES GLOBAIS
// ============================================
console.log('\n📋 2. VERIFICAÇÃO DE FUNÇÕES GLOBAIS\n');

const funcoes = [
    'addAluno',
    'getAlunos',
    'updateAluno',
    'deleteAluno',
    'addTurma',
    'getTurmas',
    'addAgenda',
    'getAgenda',
    'addFinanceiro',
    'getFinanceiro',
    'addMaterial',
    'getMaterial',
    'addCefr',
    'getCefr',
    'formatCurrency'
];

let funcionesOK = 0;
funcoes.forEach(f => {
    if (typeof window[f] === 'function') {
        console.log(`✅ window.${f}()`);
        funcionesOK++;
    } else {
        console.error(`❌ window.${f}() NÃO EXISTE`);
    }
});

console.log(`\nTotal: ${funcionesOK}/${funcoes.length} funções carregadas`);

// ============================================
// 3. TESTAR CONEXÃO SUPABASE
// ============================================
console.log('\n📋 3. TESTE DE CONEXÃO SUPABASE\n');

try {
    if (!window.getAlunos) {
        console.error('❌ window.getAlunos não está disponível');
    } else {
        console.log('⏳ Tentando buscar alunos...');
        const alunos = await window.getAlunos();
        
        if (Array.isArray(alunos)) {
            console.log(`✅ Conexão com Supabase OK`);
            console.log(`   Total de alunos: ${alunos.length}`);
            if (alunos.length > 0) {
                console.log(`   Exemplo:`, {
                    id: alunos[0].id?.substring(0, 8) + '...',
                    nome: alunos[0].nome,
                    nivel: alunos[0].nivel
                });
            }
        } else {
            console.error('❌ Resposta não é um array:', typeof alunos);
        }
    }
} catch (error) {
    console.error('❌ ERRO NA CONEXÃO:', error.message);
    if (error.code) console.error('   Código do erro:', error.code);
    if (error.details) console.error('   Detalhes:', error.details);
}

// ============================================
// 4. VERIFICAR TABELAS NO BANCO
// ============================================
console.log('\n📋 4. VERIFICAÇÃO DE TABELAS\n');

const tabelas = [
    'alunos_caderno',
    'turmas_caderno',
    'agenda_caderno',
    'financeiro_caderno',
    'material_caderno',
    'cefr_caderno'
];

let tabelasOK = 0;

for (const tabela of tabelas) {
    try {
        if (typeof supabase === 'undefined') {
            console.error(`❌ ${tabela}: Supabase não inicializado`);
            continue;
        }

        const { data, error } = await supabase
            .from(tabela)
            .select('id')
            .limit(1);

        if (error) {
            console.error(`❌ ${tabela}: ${error.message}`);
        } else {
            console.log(`✅ ${tabela}: Acessível`);
            tabelasOK++;
        }
    } catch (e) {
        console.error(`❌ ${tabela}: ${e.message}`);
    }
}

console.log(`\nTotal: ${tabelasOK}/${tabelas.length} tabelas acessíveis`);

// ============================================
// 9. TESTE DE INSERÇÃO
// ============================================
console.log('\n📋 9. TESTE DE INSERÇÃO\n');

try {
    if (window.addAluno) {
        console.log('⏳ Tentando inserir aluno de teste...');
        
        const result = await window.addAluno({
            nome: `Teste ${new Date().getTime()}`,
            nivel: 'A1',
            telefone: '11999999999',
            email: 'teste@example.com'
        });

        if (result === false) {
            console.error('❌ Inserção retornou false (nome duplicado?)');
        } else if (result === true) {
            console.log('✅ Aluno inserido com sucesso!');
            
            const alunos = await window.getAlunos();
            console.log(`   Total de alunos agora: ${alunos.length}`);
        } else {
            console.log('⚠️  Resultado inesperado:', result);
        }
    }
} catch (error) {
    console.error('❌ ERRO NA INSERÇÃO:', error.message);
}

console.log('\n' + '='.repeat(80));
console.log('FIM DO DIAGNÓSTICO');
console.log('='.repeat(80) + '\n');

})();
