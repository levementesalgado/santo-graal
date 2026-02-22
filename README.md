# Stack Tecnológico

Este projeto utiliza o seguinte stack tecnológico:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

# Fluxo de Desenvolvimento

1. Consultar os requisitos do usuário e ajustar o estilo do tema em `src/index.css` e `tailwind.config.ts`
2. Com base nos requisitos do usuário, dividir as páginas que precisam ser implementadas
3. Organizar as funcionalidades a serem implementadas em cada página e criar a pasta correspondente em `pages` com seu arquivo de entrada `Index.tsx`
4. Criar as configurações de rota em `App.tsx`, importando os arquivos de entrada `Index.tsx` de cada página
5. Com base nos requisitos organizados anteriormente, se os requisitos forem simples, todo o trabalho da página pode ser feito diretamente em `Index.tsx`
6. Se os requisitos forem complexos, a página pode ser dividida em vários componentes, com a seguinte estrutura de diretórios:
   - `Index.tsx` (entrada)
   - `/components/` (componentes)
   - `/hooks/` (hooks)
   - `/stores/` (se houver necessidade de comunicação complexa, pode-se usar zustand para a comunicação)
7. Após concluir os requisitos, é necessário executar `pnpm i` para instalar as dependências e usar `npm run lint` & `npx tsc --noEmit -p tsconfig.app.json --strict` para verificar e corrigir os problemas

# Integração com Backend
- Quando for necessário adicionar uma nova interface ou operar o supabase, primeiro deve-se adicionar o arquivo de API correspondente em `src/api` e exportar os tipos de dados correspondentes. Pode-se consultar o arquivo `src/demo.ts`. Se for supabase, também é necessário implementar adequadamente
- Tanto o frontend quanto a implementação com supabase devem ser feitos estritamente de acordo com os tipos de dados, evitando ao máximo modificar os tipos de dados definidos. Se houver alterações, é necessário verificar todos os arquivos que referenciam esses tipos