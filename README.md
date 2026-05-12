# 🐾 PetGuardian

> A rotina do seu pet, organizada em família.

*Projeto desenvolvido para o 1º Sprint de Mobile Application Development (FIAP).*

---

## 📱 Sobre o Projeto

O **PetGuardian** é um aplicativo mobile desenvolvido em **React Native com Expo**, focado em facilitar e gamificar a rotina de cuidados com animais de estimação. Através da criação de **"Famílias"** (grupos de cuidadores), os tutores podem sincronizar tarefas diárias, registrar o histórico clínico e acompanhar o desenvolvimento do pet de forma colaborativa, evitando falhas no cuidado ou doses duplicadas de medicação.

---

## ✅ Requisitos Atendidos (Sprint 1)

- **Navegação entre telas:** React Navigation com Stack + Bottom Tabs, 9+ rotas navegáveis. ✅
- **Protótipo visual funcional:** Telas refinadas, layout coerente e fluxos lógicos de uso. ✅
- **Manipulação de Estado:** Formulários dinâmicos com useState para Login, Pets, Perfil e Mural. ✅
- **Persistência Local:** Armazenamento avançado com AsyncStorage para Sessão, Pets e XP. ✅
- **Execução Nativa:** Testado e validado em dispositivo físico/emulador e não apenas Web. ✅

---

## 🗺️ Telas e Navegação

O aplicativo utiliza uma arquitetura de navegação híbrida para garantir a melhor experiência:

```
MainStack
├── Welcome       → Ponto de entrada com verificação automática de sessão
├── Login         → Autenticação de usuário com validação de campos
├── Register      → Cadastro de novos usuários e limpeza de dados residuais
└── Tabs (Navegação por Abas Inferiores)
    ├── 🏠 Home        → Painel principal com tarefas dinâmicas, streak e histórico clínico
    ├── 👨‍👩‍👧 Family      → FamilyStack (Gerenciamento de membros e Mural de Recados)
    ├── 🐾 MeuPet      → Perfil detalhado e gerenciamento de múltiplos animais
    ├── 💡 Dicas       → Central de artigos e cuidados curados
    └── 👤 Perfil      → Dados do usuário, ranking da família e suporte técnico
```

---

## 📋 Funcionalidades Principais

### 🏠 Painel Home Inteligente
- **Rotina Semanal Dinâmica:** As tarefas mudam automaticamente conforme o dia da semana.
- **Sistema de XP & Ofensiva:** Ganho de pontos individuais e coletivos, com contador de dias seguidos (Streak).
- **Histórico Clínico Resumido:** Visualização rápida de peso, última vacina e consulta de todos os pets.

### 👨‍👩‍👧 Gestão de Família (Family Pet)
- **Colaboração Real:** Mural de recados com suporte a edição e exclusão de mensagens.
- **Controle de Permissões:** Apenas o "Dono da Família" pode renomear o grupo.
- **Sessão Automática:** O app identifica se você já pertence a uma família e recupera os dados no login.

### 🐶 Meu Pet
- **Ficha Completa:** Cadastro de nome, raça, idade, peso, sexo, status de castração, vacinas e alergias.
- **Multi-Pet:** Suporte para vários animais com carrossel de seleção e avatares customizados.

---

## 📦 Tecnologias Utilizadas

| Tecnologia | Finalidade |
|-----------|-----------|
| React Native | Framework principal do projeto |
| Expo | Plataforma de desenvolvimento e execução nativa |
| React Navigation | Navegação entre telas (Stack e Tabs) |
| AsyncStorage | Banco de dados local para persistência de informações |
| Reanimated 3 | Animações suaves de interface (FadeIn, Zoom) |
| @expo/vector-icons | Biblioteca de ícones vetoriais |

---

## 💾 Dados Persistidos (AsyncStorage)

| Chave | Conteúdo |
|-------|----------|
| `@PetGuardian_UserData` | Dados da conta (Nome, E-mail, Senha) |
| `@PetGuardian_ListaPets` | Lista de todos os animais cadastrados |
| `@Matilha_Cuidadores` | Membros da família e seus respectivos XPs |
| `@Matilha_Recados` | Conteúdo do mural colaborativo |
| `@PetGuardian_OfensivaDias` | Contador de dias consecutivos de cuidado |

---

## 🚀 Como Executar o Projeto

### Pré-requisito

- Aplicativo **Expo Go** instalado no celular físico ou emulador configurado

### Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Acesse a pasta
cd Mobile-Application-Development

# Instale as dependências
npm install

# Inicie o servidor
npx expo start
```

Escaneie o QR Code com o **Expo Go** para visualizar o app.

---

## 👥 Equipe de Desenvolvimento

- **Luna de Carvalho Guimarães** — RM: 562290
- **Enzo Okuizumi Miranda de Souza** — RM: 561432
- **Lucas Barros Gouveia** — RM: 566422
- **Gustavo Keiji Okada** — RM: 563428
- **Milton Jakson de Sousa Marcelino** — RM: 564836

---

## 🎥 Vídeo de Demonstração

📺 [Assista ao vídeo no YouTube](INSERIR_LINK_AQUI)

> O vídeo demonstra o fluxo completo: cadastro, login, criação de família, rotina sincronizada e persistência de dados após reinício.