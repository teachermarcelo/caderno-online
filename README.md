# Caderno Online - Next.js + Supabase

Arquivos gerados para substituir a versão mockada do dashboard.

## Onde colocar

- `app/page.tsx` -> substitua seu arquivo atual
- `lib/supabaseClient.ts` -> crie dentro da pasta `lib`
- `lib/cadernoService.ts` -> crie dentro da pasta `lib`

## Instalação

```bash
npm install @supabase/supabase-js lucide-react
```

## Variáveis de ambiente recomendadas

Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rvgcniaowzmsudzliozf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
```

O código já tem fallback com a chave que estava nos arquivos enviados, mas o ideal é usar `.env.local`.

## Importante

Garanta que as tabelas tenham a coluna `ativo` com padrão `true` ou use os inserts deste código, que já enviam `ativo: true` para alunos, turmas e material.
