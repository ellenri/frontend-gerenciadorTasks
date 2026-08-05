# Missão Recompensa - Frontend

Sistema frontend para gamificação de tarefas infantis, desenvolvido com Astro e Tailwind CSS. Transforme tarefas diárias em missões épicas com recompensas!

## 🎯 Conceito

O **Missão Recompensa** transforma tarefas cotidianas em "missões épicas" que as crianças completam para ganhar recompensas. Cada tarefa se torna uma aventura com:

- 🗡️ **Missões** - Tarefas com nomes temáticos e divertidos
- ⭐ **XP e Níveis** - Sistema de pontos por missão completada
- 🏆 **Recompensas** - Prêmios desbloqueados com XP acumulado
- 📅 **Agendamento** - Notificações no horário de cada missão

## 🎨 Paleta de Cores

| Cor       | Hex     | Uso                            |
|-----------|---------|--------------------------------|
| Primary   | #6C8AE5 | Cabeçalhos, navegação          |
| Surface   | #F9F1EC | Backgrounds, cards             |
| Highlight | #B5F966 | Detalhes, hover states         |
| Action    | #D171EA | Botões principais, alertas     |
| Secondary | #F7B53B | Tags, badges                   |
| Dark      | #4C4C5F | Textos, contraste              |

- Node.js 18+
- npm ou yarn

## 🚀 Instalação

```bash
# Instalar as dependências
npm install
```

## 🛠️ Desenvolvimento

```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```

O site estará disponível em `http://localhost:4321`

## 🏗️ Build

```bash
# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

## 🧪 Testes

```bash
# Executar testes unitários
npm run test

# Executar testes com interface visual
npm run test:ui

# Executar testes E2E
npm run test:e2e
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/          # Componentes reutilizáveis (Button, Input, etc.)
│   └── layout/      # Componentes de layout (Header, Footer)
├── layouts/         # Layouts base
├── pages/           # Páginas da aplicação
├── styles/          # Estilos globais
├── lib/             # Utilitários e tipos TypeScript
└── test/            # Configuração de testes
```

## 📄 Páginas

- `/` - Página inicial (Hero com features)
- `/cadastro-tarefas` - Formulário de criação de missões
- `/tarefas` - Lista de missões ativas

## 🎯 Funcionalidades Implementadas

- ✅ Cadastro de missões temáticas para crianças
- ✅ Seleção de prioridade (Baixa, Média, Alta)
- ✅ Seleção de categoria (Escola, Tarefas de Casa, etc.)
- ✅ Agendamento com data e horário
- ✅ Design responsivo (Mobile e Desktop)
- ✅ Acessibilidade (ARIA labels, navegação por teclado)
- ✅ Paleta de cores consistente

## 🔄 Próximas Etapas

- [ ] Implementar persistência de dados (LocalStorage/Backend)
- [ ] Sistema de XP e níveis para gamificação
- [ ] Sistema de notificações para missões
- [ ] Página da criança (visualização de missões)
- [ ] Loja de recompensas
- [ ] Dashboard para pais com relatórios

## 📝 Licença

MIT

---

💪 **Desenvolvido para transformar responsabilidades em aventuras épicas!**
