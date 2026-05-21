/**
 * diagnostico-supabase-poderoso.js
 * Diagnóstico profundo do Caderno Online + Supabase
 *
 * Como usar:
 * 1. Abra seu site.
 * 2. Aperte F12 > Console.
 * 3. Cole este código inteiro no console e aperte Enter.
 */

(async function diagnosticoSupabasePoderoso() {
  console.clear();

  const CONFIG = {
    // URL base do Supabase, SEM /rest/v1
    SUPABASE_URL: "https://vhzuisrsrnxofuxyymfa.supabase.co",

    // Sua anon public key
    SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoenVpc3Jzcm54b2Z1eHl5bWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDQ4NzYsImV4cCI6MjA5NDg4MDg3Nn0.x49X7CGO0Qill0a6wZ1HDQIZY4rjkzt60J1lzGfxj1o",

    TESTAR_INSERT_DELETE: true,
    TEST_PREFIX: "__DIAGNOSTICO_SUPABASE__",
  };

  const EXPECTED = {
    alunos_caderno: {
      required: ["id", "nome", "nivel", "telefone", "email", "ativo", "created_at"],
      sampleInsert: () => ({
        nome: `${CONFIG.TEST_PREFIX} Aluno ${Date.now()}`,
        nivel: "A1",
        telefone: "11999999999",
        email: "diagnostico@example.com",
        ativo: true,
      }),
      select: "id,nome,nivel,telefone,email,ativo,created_at",
    },
    turmas_caderno: {
      required: ["id", "nome", "descricao", "ativo", "created_at"],
      sampleInsert: () => ({
        nome: `${CONFIG.TEST_PREFIX} Turma ${Date.now()}`,
        descricao: "Registro temporário de diagnóstico",
        ativo: true,
      }),
      select: "id,nome,descricao,ativo,created_at",
    },
    cefr_caderno: {
      required: ["id", "nivel", "descricao", "created_at"],
      sampleInsert: () => ({
        nivel: "A1",
        descricao: `${CONFIG.TEST_PREFIX} Registro temporário de diagnóstico`,
      }),
      select: "id,nivel,descricao,created_at",
    },
    material_caderno: {
      required: ["id", "titulo", "url", "descricao", "ativo", "created_at"],
      sampleInsert: () => ({
        titulo: `${CONFIG.TEST_PREFIX} Material ${Date.now()}`,
        url: "https://example.com",
        descricao: "Registro temporário de diagnóstico",
        ativo: true,
      }),
      select: "id,titulo,url,descricao,ativo,created_at",
    },
    agenda_caderno: {
      required: ["id", "titulo", "data", "horario", "status", "aluno_id", "created_at"],
      sampleInsert: () => ({
        titulo: `${CONFIG.TEST_PREFIX} Aula ${Date.now()}`,
        data: new Date().toISOString().slice(0, 10),
        horario: "12:00",
        status: "agendada",
        aluno_id: null,
      }),
      select: "id,titulo,data,horario,status,aluno_id,created_at",
    },
    financeiro_caderno: {
      required: ["id", "tipo", "valor", "descricao", "data", "created_at"],
      sampleInsert: () => ({
        tipo: "entrada",
        valor: 1.99,
        descricao: `${CONFIG.TEST_PREFIX} Registro temporário de diagnóstico`,
        data: new Date().toISOString().slice(0, 10),
      }),
      select: "id,tipo,valor,descricao,data,created_at",
    },
  };

  const state = {
    passed: 0,
    failed: 0,
    warnings: 0,
    results: [],
  };

  const line = () => console.log("=".repeat(90));

  const group = (title) => {
    console.log("");
    line();
    console.log(title);
    line();
  };

  const ok = (title, detail = "") => {
    state.passed++;
    state.results.push({ status: "OK", title, detail });
    console.log(`✅ ${title}${detail ? "\n   " + detail : ""}`);
  };

  const fail = (title, detail = "") => {
    state.failed++;
    state.results.push({ status: "FALHA", title, detail });
    console.error(`❌ ${title}${detail ? "\n   " + detail : ""}`);
  };

  const warn = (title, detail = "") => {
    state.warnings++;
    state.results.push({ status: "AVISO", title, detail });
    console.warn(`⚠️ ${title}${detail ? "\n   " + detail : ""}`);
  };

  function normalizeUrl(url) {
    return String(url || "")
      .trim()
      .replace(/\/rest\/v1\/?$/, "")
      .replace(/\/$/, "");
  }

  function decodeJwt(token) {
    try {
      const payload = token.split(".")[1];
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }

  function restUrl(path) {
    return `${normalizeUrl(CONFIG.SUPABASE_URL)}/rest/v1/${path}`;
  }

  async function request(path, options = {}) {
    const url = path.startsWith("http") ? path : restUrl(path);

    const headers = {
      apikey: CONFIG.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    };

    const started = performance.now();

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const ms = Math.round(performance.now() - started);
      const rawText = await response.text();

      let body = null;
      try {
        body = rawText ? JSON.parse(rawText) : null;
      } catch {
        body = rawText;
      }

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body,
        rawText,
        ms,
        url,
      };
    } catch (error) {
      return {
        ok: false,
        networkError: true,
        status: 0,
        statusText: "NETWORK_ERROR",
        body: null,
        rawText: "",
        ms: Math.round(performance.now() - started),
        url,
        error,
      };
    }
  }

  function explainSupabaseError(res) {
    const body = res?.body || {};
    const msg = body.message || body.msg || res.statusText || "Erro desconhecido";
    const code = body.code ? `Código: ${body.code}. ` : "";
    const details = body.details ? `Detalhes: ${body.details}. ` : "";
    const hint = body.hint ? `Hint: ${body.hint}. ` : "";

    let diagnosis = "";

    if (String(msg).includes("schema cache")) {
      diagnosis =
        "Diagnóstico provável: tabela não existe no projeto conectado OU o cache do PostgREST não recarregou. Rode no SQL Editor: notify pgrst, 'reload schema'; e confirme se URL/chave são do mesmo projeto onde a tabela foi criada.";
    } else if (res.status === 401 || res.status === 403) {
      diagnosis =
        "Diagnóstico provável: chave anon errada, Authorization inválido ou política RLS bloqueando a operação.";
    } else if (res.status === 404) {
      diagnosis =
        "Diagnóstico provável: endpoint/tabela não encontrada neste projeto Supabase.";
    } else if (String(msg).includes("permission denied")) {
      diagnosis =
        "Diagnóstico provável: RLS/políticas ausentes ou permissão insuficiente para anon.";
    } else if (String(msg).includes("column") && String(msg).includes("does not exist")) {
      diagnosis =
        "Diagnóstico provável: alguma coluna esperada pelo código não existe na tabela.";
    }

    return `${code}${details}${hint}Mensagem: ${msg}${diagnosis ? "\n   " + diagnosis : ""}`;
  }

  group("🚀 DIAGNÓSTICO PODEROSO - CADERNO ONLINE + SUPABASE");

  console.log("Página atual:", location.href);
  console.log("URL configurada:", CONFIG.SUPABASE_URL);
  console.log("URL normalizada:", normalizeUrl(CONFIG.SUPABASE_URL));
  console.log("REST URL:", `${normalizeUrl(CONFIG.SUPABASE_URL)}/rest/v1`);
  console.log("Testar INSERT/DELETE:", CONFIG.TESTAR_INSERT_DELETE ? "SIM" : "NÃO");

  group("1. VALIDAÇÃO DA CONFIGURAÇÃO");

  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_URL.includes(".supabase.co")) {
    fail("SUPABASE_URL inválida", "Use algo como https://xxxx.supabase.co, sem /rest/v1.");
  } else if (CONFIG.SUPABASE_URL.includes("/rest/v1")) {
    fail("SUPABASE_URL contém /rest/v1", "No createClient e neste diagnóstico use apenas https://xxxx.supabase.co.");
  } else {
    ok("SUPABASE_URL parece válida", normalizeUrl(CONFIG.SUPABASE_URL));
  }

  if (!CONFIG.SUPABASE_ANON_KEY) {
    fail("SUPABASE_ANON_KEY não foi configurada");
  } else {
    const jwt = decodeJwt(CONFIG.SUPABASE_ANON_KEY);

    if (!jwt) {
      fail("Chave anon não parece ser um JWT válido", "Copie novamente a anon public key do Supabase.");
    } else {
      ok("Chave anon decodificada", `role=${jwt.role || "?"}, ref=${jwt.ref || "?"}, exp=${jwt.exp || "?"}`);

      const urlRef = normalizeUrl(CONFIG.SUPABASE_URL).split("https://")[1]?.split(".")[0];

      if (jwt.ref && urlRef && jwt.ref !== urlRef) {
        fail(
          "URL do Supabase e anon key parecem ser de projetos diferentes",
          `URL ref=${urlRef} | JWT ref=${jwt.ref}. Corrija lib/supabaseClient.ts e variáveis da Vercel.`
        );
      } else if (jwt.ref && urlRef && jwt.ref === urlRef) {
        ok("URL e chave anon são do mesmo projeto", `ref=${jwt.ref}`);
      } else {
        warn("Não foi possível comparar ref da URL com ref do JWT");
      }
    }
  }

  group("2. TESTE DE CONECTIVIDADE REST API");

  const root = await request("");

  if (root.ok || root.status === 200 || root.status === 404) {
    ok("REST API respondeu", `status=${root.status}, tempo=${root.ms}ms`);
  } else {
    fail("REST API não respondeu corretamente", explainSupabaseError(root));
  }

  group("3. VERIFICAÇÃO DAS TABELAS E SCHEMA CACHE");

  const tableResults = {};

  for (const [table, spec] of Object.entries(EXPECTED)) {
    console.log("");
    console.log(`📌 Tabela: ${table}`);

    const res = await request(`${table}?select=${encodeURIComponent(spec.select)}&limit=1`);

    tableResults[table] = {
      select: res,
      insert: null,
      delete: null,
    };

    if (res.ok) {
      ok(`${table}: leitura SELECT funcionando`, `status=${res.status}, tempo=${res.ms}ms`);

      if (Array.isArray(res.body)) {
        ok(`${table}: resposta veio como array`, `registros retornados=${res.body.length}`);
      } else {
        warn(`${table}: resposta não veio como array`, JSON.stringify(res.body).slice(0, 500));
      }
    } else {
      fail(`${table}: falha no SELECT`, explainSupabaseError(res));
    }
  }

  group("4. TESTE ESPECÍFICO DE COLUNAS");

  for (const [table, spec] of Object.entries(EXPECTED)) {
    console.log("");
    console.log(`📌 Colunas esperadas em ${table}: ${spec.required.join(", ")}`);

    for (const column of spec.required) {
      const res = await request(`${table}?select=${encodeURIComponent(column)}&limit=1`);

      if (res.ok) {
        ok(`${table}.${column}: coluna acessível`);
      } else {
        fail(`${table}.${column}: coluna faltando ou inacessível`, explainSupabaseError(res));
      }
    }
  }

  group("5. TESTE DE INSERT E DELETE COM RLS");

  if (!CONFIG.TESTAR_INSERT_DELETE) {
    warn("Teste de insert/delete pulado", "CONFIG.TESTAR_INSERT_DELETE está false.");
  } else {
    for (const [table, spec] of Object.entries(EXPECTED)) {
      console.log("");
      console.log(`📌 Insert/Delete: ${table}`);

      const payload = spec.sampleInsert();

      const insertRes = await request(table, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      tableResults[table].insert = insertRes;

      if (!insertRes.ok) {
        fail(`${table}: INSERT falhou`, explainSupabaseError(insertRes));
        continue;
      }

      ok(`${table}: INSERT funcionando`, `status=${insertRes.status}`);

      const inserted = Array.isArray(insertRes.body) ? insertRes.body[0] : null;
      const insertedId = inserted?.id;

      if (insertedId) {
        ok(`${table}: INSERT retornou ID`, insertedId);

        const deleteRes = await request(`${table}?id=eq.${encodeURIComponent(insertedId)}`, {
          method: "DELETE",
        });

        tableResults[table].delete = deleteRes;

        if (deleteRes.ok) {
          ok(`${table}: DELETE funcionando`, `registro temporário removido: ${insertedId}`);
        } else {
          fail(`${table}: DELETE falhou`, explainSupabaseError(deleteRes));
          warn(`${table}: registro temporário pode ter ficado no banco`, `Apague manualmente onde id = ${insertedId}`);
        }
      } else {
        warn(
          `${table}: INSERT funcionou, mas não retornou ID`,
          "Pode ser configuração do Prefer/return ou política. Verifique se o registro foi criado."
        );
      }
    }
  }

  group("6. TESTE DAS FUNÇÕES GLOBAIS ANTIGAS, SE EXISTIREM");

  const oldGlobals = [
    "addAluno",
    "getAlunos",
    "updateAluno",
    "deleteAluno",
    "addTurma",
    "getTurmas",
    "addAgenda",
    "getAgenda",
    "addFinanceiro",
    "getFinanceiro",
    "addMaterial",
    "getMaterial",
    "addCefr",
    "getCefr",
    "formatCurrency",
  ];

  let oldGlobalCount = 0;

  for (const fn of oldGlobals) {
    if (typeof window[fn] === "function") {
      oldGlobalCount++;
      ok(`window.${fn} existe`);
    } else {
      warn(`window.${fn} não existe`, "Normal em Next.js. Só seria problema se você ainda estivesse usando HTML/JS antigo.");
    }
  }

  if (oldGlobalCount === 0) {
    ok(
      "Nenhuma função global antiga encontrada",
      "Isso é normal na versão Next.js nova. O sistema deve usar lib/cadernoService.ts."
    );
  }

  group("7. DIAGNÓSTICO DO ERRO 'schema cache'");

  const alunosTest = tableResults.alunos_caderno?.select;

  if (alunosTest?.ok) {
    ok(
      "alunos_caderno está acessível pela mesma URL/chave deste diagnóstico",
      "Se seu site ainda mostra schema cache, então o site publicado está usando outra URL/chave, cache antigo ou build antigo."
    );
  } else {
    fail(
      "alunos_caderno não está acessível pela URL/chave deste diagnóstico",
      explainSupabaseError(alunosTest)
    );
  }

  console.log("");
  console.log("🔎 Checklist se o site ainda falhar:");
  console.log("1. Verifique lib/supabaseClient.ts.");
  console.log("2. Verifique .env.local, se existir.");
  console.log("3. Verifique Vercel > Settings > Environment Variables.");
  console.log("4. A URL deve ser SEM /rest/v1.");
  console.log("5. A anon key precisa ter ref igual ao projeto da URL.");
  console.log("6. Rode no SQL Editor: notify pgrst, 'reload schema';");
  console.log("7. Faça Redeploy na Vercel depois de trocar variáveis.");
  console.log("8. Limpe cache do navegador com Ctrl + F5.");

  group("8. RESUMO FINAL");

  console.table(state.results);

  const summary = {
    aprovados: state.passed,
    falhas: state.failed,
    avisos: state.warnings,
    url_configurada: normalizeUrl(CONFIG.SUPABASE_URL),
    tabelas_testadas: Object.keys(EXPECTED).length,
    data_hora: new Date().toISOString(),
  };

  console.log("Resumo:", summary);

  if (state.failed === 0) {
    console.log("✅ RESULTADO FINAL: Supabase parece estar funcionando corretamente.");
    console.log("Se o site ainda falha, o problema está no deploy/build/env do site, não no banco testado aqui.");
  } else {
    console.error("❌ RESULTADO FINAL: Foram encontradas falhas. Veja a tabela acima e os detalhes por seção.");
  }

  window.__DIAGNOSTICO_CADERNO_ONLINE__ = {
    summary,
    results: state.results,
    tableResults,
  };

  console.log("");
  console.log("Objeto salvo em window.__DIAGNOSTICO_CADERNO_ONLINE__");
  console.log("Você pode copiar o resumo com:");
  console.log("copy(JSON.stringify(window.__DIAGNOSTICO_CADERNO_ONLINE__.summary, null, 2))");
})();
