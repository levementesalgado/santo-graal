# Santo Graal — Análise de Dados Agrícolas CONAB

Primeira ferramenta pública com análises automáticas dos dados oficiais da CONAB, desenvolvida por devs anônimos da ASTL.

## Stack Tecnológico

- **Vite** — build tool e dev server
- **TypeScript** — tipagem estática
- **React** — interface de usuário
- **shadcn-ui** — componentes de UI
- **Tailwind CSS** — estilização
- **Supabase** — banco de dados e autenticação
- **React Query** — gerenciamento de estado assíncrono

## Configuração do Ambiente

1. Copie o arquivo de exemplo e preencha com suas credenciais do Supabase:
   ```bash
   cp .env.example .env
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   ```

3. Rode o projeto:
   ```bash
   pnpm dev
   ```

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |

## Fonte de Dados

Os dados são obtidos diretamente do portal de informações da CONAB:
- **Série Histórica Café** — atualizada quadrimestralmente
- Endpoint: `portaldeinformacoes.conab.gov.br/download-arquivos.html`

Para sincronizar os dados reais, acesse a página **Gerenciamento de Dados** dentro do app e clique em **Sincronizar Agora**.

## Fluxo de Desenvolvimento

1. Ajustar o estilo do tema em `src/index.css` e `tailwind.config.ts`
2. Dividir as páginas a serem implementadas com base nos requisitos
3. Criar a pasta correspondente em `pages` com seu arquivo de entrada `Index.tsx`
4. Configurar as rotas em `App.tsx` importando os `Index.tsx` de cada página
5. Para requisitos simples, todo o trabalho pode ser feito diretamente em `Index.tsx`
6. Para requisitos complexos, dividir a página em:
   - `Index.tsx` — entrada
   - `/components/` — componentes
   - `/hooks/` — hooks
   - `/stores/` — estado global com Zustand (quando necessário)
7. Após concluir, rodar `pnpm i` e verificar com:
   ```bash
   npm run lint
   npx tsc --noEmit -p tsconfig.app.json --strict
   ```

## Integração com Backend

- Para novas interfaces com Supabase, criar o arquivo de API correspondente em `src/api/` e exportar os tipos
- Consultar `src/api/supabase.ts` como referência de implementação
- Seguir estritamente os tipos definidos em `src/lib/index.ts`, evitando modificações que quebrem referências existentes
- Os hooks de acesso ao banco ficam em `src/hooks/useConabData.ts`

## Deploy

O projeto faz deploy automático no GitHub Pages via GitHub Actions a cada push na branch `main`. As variáveis de ambiente devem ser configuradas em **Settings → Secrets and variables → Actions → Variables** no repositório.