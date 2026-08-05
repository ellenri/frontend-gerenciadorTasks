# Missão Recompensa — Frontend

Frontend **SSR (Astro 5 + React + Tailwind)** do app **Missão Recompensa**: um
gerenciador de tarefas infantil com gamificação. Transforma tarefas em missões
épicas que crianças completam para ganhar pontos e resgatar recompensas.

> Consome a API .NET (repositório `GerenciadorTasks`). Funciona com **login**
> (cookie HttpOnly) — todas as telas de dados exigem autenticação.

---

## ✨ Funcionalidades

- 🔐 **Login/registro** de responsável (cookie HttpOnly via backend)
- 🧒 **Cadastro de crianças** com avatar
- ✅ **Missões**: criar, concluir (gamificação de pontos por prioridade)
- 🏆 **Ranking** por pontos
- 🎁 **Recompensas**: criar e **resgatar** (desconta pontos da criança)
- 🔔 **Notificações** automáticas (sininho com contador de não-lidas)

---

## 🎨 Paleta de Cores

| Cor       | Hex     | Uso                            |
|-----------|---------|--------------------------------|
| Primary   | #6C8AE5 | Cabeçalhos, navegação          |
| Surface   | #F9F1EC | Backgrounds, cards             |
| Highlight | #B5F966 | Detalhes, hover states         |
| Action    | #D171EA | Botões principais, alertas     |
| Secondary | #F7B53B | Tags, badges                   |
| Dark      | #4C4C5F | Textos, contraste              |

---

## 🧱 Stack

- **Astro 5** em modo **SSR** (`output: 'server'`, adapter `@astrojs/node`)
- **React 19** (ilhas interativas) + **Tailwind CSS**
- **Vite** com **proxy `/api`** → backend (cookie same-origin no dev)
- TypeScript

> Por que SSR? As páginas buscam dados no frontmatter, que roda no servidor a
> cada request com acesso ao cookie do navegador — necessário para a autenticação
> e para dados dinâmicos funcionarem fora do `astro dev`.

---

## 🚀 Como rodar (desenvolvimento)

Pré-requisitos: **Node.js 18+** e o **backend** rodando em `http://localhost:5104`.

```bash
npm install
npm run dev      # http://localhost:4321
```

O `astro.config.mjs` configura o **proxy** `/api` → `http://localhost:5104`, então
o frontend e a API compartilham a mesma origem (`localhost:4321`) e o cookie de
auth funciona sem problema de `SameSite` cross-origin.

**Credenciais de desenvolvimento** (criadas pelo seed do backend):
```
E-mail:  responsavel@exemplo.com
Senha:   123456
```

### Variável de ambiente (opcional)
```
PUBLIC_API_BASE   # default: '' no cliente (proxy), 'http://localhost:5104' no SSR.
                  # Em produção cross-origin, defina para a URL pública da API.
```

---

## 📦 Build de produção

```bash
npm run build    # gera dist/server/entry.mjs (servidor Node standalone)
node ./dist/server/entry.mjs   # sobe o servidor (define HOST/PORT conforme o adapter)
```

> Em produção, sirva o frontend e a API no mesmo domínio (ou configure
> `PUBLIC_API_BASE` + `SameSite=None;Secure` no cookie para cross-domain).

---

## 🗂️ Estrutura

```
src/
├── components/
│   ├── layout/Header.astro        # navegação + sininho (contador de notificações)
│   └── ui/                        # Button, Input, TaskForm, ChildSelector, ...
├── layouts/BaseLayout.astro
├── lib/
│   ├── api.ts                     # cliente HTTP (SSR-aware: repassa cookie)
│   ├── auth.ts                    # getSession(Astro) → redirect /login
│   └── types.ts
└── pages/
    ├── index.astro                # home (pública)
    ├── login.astro / registro.astro
    ├── tarefas.astro              # missões (protegida)
    ├── ranking.astro              # ranking (protegida)
    ├── cadastro-tarefas.astro / cadastro-criancas.astro / cadastro-recompensas.astro
    ├── recompensas.astro          # recompensas + resgate (protegida)
    └── notificacoes.astro         # notificações (protegida)
```

---

## 🧪 Testes

```bash
npm test           # Vitest (componentes)
npm run test:e2e   # Playwright (end-to-end)
```

---

## 🔌 Endpoints consumidos

Ver `src/lib/api.ts`. Os principais: `/api/auth/*`, `/api/children`,
`/api/tasks` (+ `/complete`), `/api/rewards` (+ `/redeem`), `/api/notifications`.
Detalhes completos no README do backend.
