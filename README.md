# ASPMM — Associação dos Servidores Públicos Municipais de Marília

Site institucional e painel administrativo da ASPMM, desenvolvido com React, TypeScript, Supabase e TailwindCSS.

---

## 🚀 Tecnologias

- **React** + **TypeScript** + **Vite**
- **Supabase** (banco de dados, autenticação, storage e edge functions)
- **TailwindCSS** + **shadcn/ui**
- **Framer Motion** (animações)
- **React Router DOM** (roteamento)

---

## ✨ Funcionalidades

### Site Público

- Banner com carrossel de imagens gerenciado pelo admin
- Seção de espaços com carrossel de fotos e solicitação de reserva via WhatsApp
- Página de eventos com confirmação de presença via WhatsApp
- Galeria de fotos organizada em álbuns
- Página de convênios com filtro por categoria
- FAQ e regulamento do clube
- Seção de equipe/diretoria na página inicial
- Avisos dinâmicos
- Formulário de contato
- Login com e-mail ou CPF
- Recuperação e redefinição de senha

### Painel Administrativo

- Dashboard com métricas e próximos eventos
- Gestão completa de usuários/associados
- Gestão de eventos com upload de imagem
- Gestão de espaços com múltiplas imagens e controle de reservas
- Galeria com álbuns e upload de fotos
- Gestão de convênios com flyer/imagem
- Gestão de equipe com redes sociais
- Caixa de mensagens com notificações em tempo real
- Conteúdo do site (banner, textos, estatísticas, avisos, carrossel)
- Informações (FAQ e regulamento)

---

## 🔧 Configuração

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Supabase CLI (para deploy das Edge Functions)

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key
```

> ⚠️ **Nunca** adicione a Service Role Key no frontend.

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Deploy da Edge Function

```bash
supabase functions deploy criar-associado
```

---

## 🗄️ Banco de Dados

O projeto utiliza as seguintes tabelas no Supabase:

| Tabela             | Descrição                              |
| ------------------ | -------------------------------------- |
| `profiles`         | Dados dos associados                   |
| `user_roles`       | Papéis dos usuários (admin/user)       |
| `events`           | Eventos da associação                  |
| `facilities`       | Espaços disponíveis                    |
| `facility_images`  | Imagens dos espaços                    |
| `photo_albums`     | Álbuns da galeria                      |
| `photos`           | Fotos dos álbuns                       |
| `announcements`    | Avisos do site                         |
| `partnerships`     | Convênios/parceiros                    |
| `staff`            | Equipe/diretoria                       |
| `hero_images`      | Imagens do carrossel do banner         |
| `site_settings`    | Configurações e textos do site         |
| `contact_messages` | Mensagens do formulário de contato     |
| `faq`              | Perguntas frequentes                   |
| `info_settings`    | Configurações da página de informações |

---

## 🔐 Autenticação

- Login com **e-mail** ou **CPF**
- Novos associados cadastrados pelo admin recebem uma **senha provisória**
- No primeiro acesso, o usuário é redirecionado para **trocar a senha**
- Suporte a **recuperação de senha** por e-mail

---

## 📁 Estrutura do Projeto

```
src/
├── assets/          # Imagens e recursos estáticos
├── components/      # Componentes reutilizáveis
│   ├── admin-layout/    # Layout do painel admin
│   ├── admin-shared/    # Componentes compartilhados do admin
│   └── ui/              # Componentes shadcn/ui
├── contexts/        # Contextos React (Auth)
├── integrations/    # Configuração do Supabase
├── lib/             # Utilitários e helpers
└── pages/           # Páginas da aplicação
    └── admin/       # Páginas do painel administrativo
supabase/
└── functions/
    └── criar-associado/  # Edge Function para cadastro de associados
```

---

## 👨‍💻 Desenvolvido por

**Geison Nunes**
[WhatsApp](https://wa.me/5514996242035?text=Olá%20Geison!%20Vi%20o%20site%20da%20ASPMM%20e%20fiquei%20impressionado%20com%20o%20trabalho.%20Tenho%20interesse%20em%20desenvolver%20um%20site%20para%20mim%20também.%20Podemos%20conversar%3F)

---

© 2026 ASPMM — Todos os direitos reservados.
