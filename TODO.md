# Santo Graal — TODO

## ✅ Resolvidos
- [x] **postMessage CSRF corrigido** — origin validado em ambos os lados
- [x] **Error Boundary adicionado** — captura crashes sem tela branca
- [x] **CSP adicionado** — Content-Security-Policy no index.html (font-src, form-action, frame-ancestors)
- [x] **R² é fake** — agora calculado de verdade (1 - SS_res/SS_tot)
- [x] **Score de Confiança hardcoded** — agora baseado no R² × horizonte
- [x] **CSV export com escaping** — valores com `,` `"` `\n` escapados
- [x] **public/images/ criado** — placeholders PNG para assets de heatmap
- [x] **React 19 types com React 18 runtime** — downgrade `@types/react` → ^18.3.12
- [x] **ESLint** — agora cobre `.ts,.tsx`
- [x] **Ano 2026 hardcoded** — todos dinâmicos
- [x] **Divisão por zero** — efficiency matrix guardada com `|| 1`
- [x] **axios, d3, babel, @iconify/react** — removidos
- [x] **"Estado Líder" sempre 0** — mostra produção real do líder
- [x] **Labels truncadas** — "Regras de Validação", "Fronteiras de Confiança", "Anomalias Detectadas"
- [x] **Supabase failure silent** — toast.error em falhas de query
- [x] **Charts: showPredictions** — prop desestruturada e funcional
- [x] **Code-splitting** — React.lazy + Suspense em todas as rotas

## 🔵 Pendentes (baixa prioridade)
- [ ] **Testes** — adicionar teste pro parser CONAB
