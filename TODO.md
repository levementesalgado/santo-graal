# Santo Graal — TODO

## 🔴 Alto
- [ ] **postMessage CSRF corrigido** — validação de origin adicionada
- [ ] **Error Boundary adicionado** — captura crashes sem tela branca
- [ ] **CSP adicionado** — Content-Security-Policy no index.html
- [ ] **R² é fake** — gerado com Math.random(), precisa calcular de verdade
- [ ] **Score de Confiança hardcoded** — 85.4% fixo, precisa vir dos dados
- [ ] **CSV export com escaping** — valores agora escapados corretamente

## 🟡 Médio
- [ ] **public/images/ criado** — assets de heatmap ainda precisam ser adicionados
- [ ] **React 19 types com React 18 runtime** — downgrade types ou upgrade react
- [ ] **ESLint ignora .ts/.tsx** — config precisa incluir TypeScript
- [ ] **Ano 2026 hardcoded** — precisa ser dinâmico
- [ ] **Divisão por zero** — efficiency matrix produz NaN se currentData vazio
- [ ] **axios, d3, babel, @iconify/react — dependências não usadas**

## 🔵 Baixo
- [ ] **"Estado Líder" sempre 0** — MetricsCard com value hardcoded
- [ ] **Labels truncadas** — "Regr", "Fronteir", "Anomali"
- [ ] **sem erro de dados** — falha do Supabase fica silenciosa
- [ ] **Charts: showPredictions ignorado** — prop não é desestruturada
- [ ] **Testes** — adicionar teste pro parser CONAB
