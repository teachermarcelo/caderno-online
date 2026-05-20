// diagnostico.js - Investigação Completa de Falhas
// Execute no console (F12) para diagnosticar todos os problemas

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

funcoes.forEach(f => {
    if (typeof window[f] === 'function') {
        console.log(`✅ window.${f}() existe`);
    } else {
        console.error(`❌ window.${f}() NÃO EXISTE`);
    }
});

// ============================================
// 3. TESTAR CONEXÃO SUPABASE
// ============================================
console.log('\n📋 3. TESTE DE CONEXÃO SUPABASE\n');

async function testarConexao() {
    try {
        if (!window.getAlunos) {
            console.error('❌ window.getAlunos não está disponível');
            return;
        }

        console.log('Tentando buscar alunos...');
        const alunos = await window.getAlunos();
        
        if (Array.isArray(alunos)) {
            console.log(`✅ Conexão com Supabase OK`);
            console.log(`   Total de alunos: ${alunos.length}`);
            if (alunos.length > 0) {
                console.log(`   Primeiro aluno:`, alunos[0]);
            }
        } else {
            console.error('❌ Resposta não é um array');
        }
    } catch (error) {
        console.error('❌ ERRO NA CONEXÃO:', error.message);
        console.error('   Código:', error.code);
        console.error('   Detalhes:', error);
    }
}

await testarConexao();

// ============================================
// 4. VERIFICAR TABELAS NO BANCO
// ============================================
console.log('\n📋 4. VERIFICAÇÃO DE TABELAS\n');

async function verificarTabelas() {
    try {
        const tabelas = [
            'alunos_caderno',
            'turmas_caderno',
            'agenda_caderno',
            'financeiro_caderno',
            'material_caderno',
            'cefr_caderno'
        ];

        // Tenta uma query simples para cada tabela
        for (const tabela of tabelas) {
            try {
                // Usa a função genérica do Supabase
                const { data, error } = await supabase
                    .from(tabela)
                    .select('*')
                    .limit(1);

                if (error) {
                    console.error(`❌ ${tabela}: ${error.message}`);
                } else {
                    console.log(`✅ ${tabela}: OK (${data?.length || 0} registros)`);
                }
            } catch (e) {
                console.error(`❌ ${tabela}: ${e.message}`);
            }
        }
    } catch (error) {
        console.error('❌ ERRO AO VERIFICAR TABELAS:', error.message);
    }
}

await verificarTabelas();

// ============================================
// 5. VERIFICAR RLS (ROW LEVEL SECURITY)
// ============================================
console.log('\n📋 5. VERIFICAÇÃO DE RLS (ROW LEVEL SECURITY)\n');

console.log('⚠️  RLS não pode ser testado direto via cliente');
console.log('   Vá para: Supabase → Authentication → Policies');
console.log('   Verifique se existem políticas para cada tabela');

// ============================================
// 6. VERIFICAR URLS E CHAVES
// ============================================
console.log('\n📋 6. VERIFICAÇÃO DE URLS E CHAVES\n');

const SUPABASE_URL = 'https://rvgcniaowzmsudzliozf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2NuaWFvd3ptc3Vkemxpb3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjQxNzQsImV4cCI6MjA5MTQwMDE3NH0.uwwKFLuK-XyPoXPrB6_CseRTiD9d-iyMQSPWrFw-l-I';

console.log('URL Supabase:');
console.log(`  ${SUPABASE_URL}`);
console.log(`  ✅ URL válida: ${SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('supabase.co')}`);

console.log('\nChave Anon:');
console.log(`  Comprimento: ${SUPABASE_KEY.length} caracteres`);
console.log(`  ✅ Chave válida: ${SUPABASE_KEY.startsWith('eyJ') && SUPABASE_KEY.length > 100}`);

// ============================================
// 7. VERIFICAR app.js CARREGADO
// ============================================
console.log('\n📋 7. VERIFICAÇÃO DE app.js\n');

const scripts = document.querySelectorAll('script');
let appJsFound = false;

scripts.forEach(script => {
    if (script.src && script.src.includes('app.js')) {
        console.log(`✅ app.js carregado`);
        console.log(`   Atributo type: "${script.type}"`);
        console.log(`   Caminho: ${script.src}`);
        if (script.type === 'module') {
            console.log(`   ✅ type="module" correto`);
        } else {
            console.error(`   ❌ type="${script.type}" - deve ser "module"`);
        }
        appJsFound = true;
    }
});

if (!appJsFound) {
    console.error('❌ app.js NÃO ENCONTRADO no HTML');
}

// ============================================
// 8. VERIFICAR CACHE DO NAVEGADOR
// ============================================
console.log('\n📋 8. VERIFICAÇÃO DE CACHE\n');

console.log('LocalStorage:');
const dbKey = 'cadernoOnlineDB';
const stored = localStorage.getItem(dbKey);
if (stored) {
    try {
        const data = JSON.parse(stored);
        console.log(`✅ localStorage contém dados`);
        console.log(`   Alunos salvos localmente: ${data.alunos?.length || 0}`);
    } catch (e) {
        console.error(`❌ localStorage corrompido: ${e.message}`);
    }
} else {
    console.log(`⚠️  Nenhum dado no localStorage`);
}

// ============================================
// 9. TESTE DE INSERÇÃO
// ============================================
console.log('\n📋 9. TESTE DE INSERÇÃO\n');

async function testeInsercao() {
    try {
        console.log('Tentando inserir aluno de teste...');
        
        const result = await window.addAluno({
            nome: `Teste ${Date.now()}`,
            nivel: 'A1',
            telefone: '11999999999',
            email: 'teste@example.com'
        });

        if (result === false) {
            console.error('❌ Inserção retornou false');
        } else {
            console.log('✅ Aluno inserido com sucesso');
            
            // Tenta buscar para confirmar
            const alunos = await window.getAlunos();
            console.log(`   Total de alunos agora: ${alunos.length}`);
        }
    } catch (error) {
        console.error('❌ ERRO NA INSERÇÃO:', error.message);
        console.error('   Stack:', error.stack);
    }
}

// Descomente para testar inserção
// await testeInsercao();

// ============================================
// 10. RESUMO FINAL
// ============================================
console.log('\n' + '='.repeat(80));
console.log('RESUMO DO DIAGNÓSTICO');
console.log('='.repeat(80));

console.log(`
PASSOS PARA RESOLVER:

1. ✅ Tabela alunos_caderno existe no Supabase
2. 🔄 PRÓXIMO: Limpar cache do navegador
   - Abra DevTools (F12)
   - Application → Storage → Clear All
   - Feche abas do navegador
   - Reabra o site
   
3. 🔄 PRÓXIMO: Recarregar página
   - Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
   
4. 🔄 PRÓXIMO: Verificar console
   - Abra F12 → Console
   - Procure por erros vermelhos
   - Copie a mensagem exata do erro
   
5. 🔄 PRÓXIMO: Se ainda falhar
   - Verifique RLS em Supabase → Authentication → Policies
   - Certifique-se que as 4 políticas existem para alunos_caderno
   - Se não existirem, execute novamente o SQL com as políticas

PROBLEMAS COMUNS:
- Cache sujo do navegador → Solução: Limpar Storage
- app.js sem type="module" → Solução: Adicionar type="module"
- Tabela não criada → Solução: Executar SQL no Supabase
- RLS muito restritivo → Solução: Verificar políticas
- Chave Supabase inválida → Solução: Copiar chave correta
`);

console.log('='.repeat(80));
