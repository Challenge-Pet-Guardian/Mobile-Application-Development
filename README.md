# 🐾 PetGuardian

> A rotina do seu pet, organizada em família.

*Projeto desenvolvido para o 1º Sprint de Mobile Application Development (FIAP).*

---

## Repositório Github

[Repositório Github](https://github.com/Challenge-Pet-Guardian/Mobile-Application-Development)

## Vídeo de Demonstração

[Vídeo Youtube](https://youtu.be/mh-b1xhxOx0)

## 📱 Sobre o Projeto

O **PetGuardian** é um aplicativo mobile desenvolvido em **React Native com Expo**, focado em facilitar e gamificar a rotina de cuidados com animais de estimação. Através da criação de **"Famílias"** (grupos de cuidadores), os tutores podem sincronizar tarefas diárias, registrar o histórico clínico e acompanhar o desenvolvimento do pet de forma colaborativa, evitando falhas no cuidado ou doses duplicadas de medicação.

---

## 🗺️ Telas e Navegação

O aplicativo utiliza uma arquitetura de navegação híbrida para garantir a melhor experiência:

```
MainStack
├── Welcome       → Ponto de entrada com verificação automática de sessão
├── Login         → Autenticação de usuário com validação de campos (Zod)
├── Register      → Cadastro de novos usuários com reset de sessão anterior no AsyncStorage
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
- **Rotina Semanal Dinâmica:** As tarefas são filtradas automaticamente pelo dia da semana via `TaskService`.
- **Sistema de XP & Ofensiva:** Ganho de pontos individuais e coletivos ao concluir tarefas, com contador de dias seguidos (Streak).
- **Histórico Clínico Resumido:** Visualização rápida de peso, última vacina e consulta de todos os pets da família.
- **Criação de Tarefas:** Formulário inline com overlay para adicionar novas tarefas diretamente na Home.

### 👨‍👩‍👧 Gestão de Família (Family Pet)
- **Criar ou Entrar:** O usuário pode criar uma nova família ou entrar em uma existente via código de convite.
- **Colaboração Real:** Mural de recados com suporte a criação, edição e exclusão de mensagens.
- **Controle de Permissões:** Apenas o "Dono da Família" pode renomear o grupo e remover membros.
- **Sessão Automática:** O app identifica se o usuário já pertence a uma família e recupera os dados automaticamente.

### 🐶 Meu Pet
- **Ficha Completa:** Cadastro de nome, raça, idade, peso, sexo, castração, vacinas, consultas, veterinário, alergias e medicamentos.
- **Multi-Pet:** Suporte para vários animais com carrossel de seleção e avatares customizados (cachorro, gato, coelho).

### 👤 Perfil do Usuário
- **Ranking Individual:** Posição do usuário dentro da família com base no XP acumulado.
- **Edição de Perfil:** Modal com validação Zod que atualiza o nome em todas as referências do AsyncStorage (cuidadores e recados).
- **FAQ e Suporte:** Modais de perguntas frequentes e envio de feedback para a equipe.

---

## 📦 Tecnologias Utilizadas

| Tecnologia | Finalidade |
|-----------|-----------|
| React Native | Framework principal do projeto |
| Expo | Plataforma de desenvolvimento e execução nativa |
| React Navigation | Navegação entre telas (Stack e Tabs) |
| AsyncStorage | Banco de dados local para persistência de informações |
| Zod | Validação de formulários (Login, Register e edição de perfil) |
| Reanimated 3 | Animações suaves de interface (FadeInDown, ZoomIn) |
| @expo/vector-icons | Biblioteca de ícones vetoriais |

---

## 💾 Dados Persistidos (AsyncStorage)

| Chave | Conteúdo |
|-------|----------|
| `@PetGuardian_UserData` | Dados da conta (Nome, E-mail, Senha) |
| `@PetGuardian_Logado` | Status da sessão ativa |
| `@PetGuardian_ListaPets` | Lista de todos os animais cadastrados |
| `@Familia_Cuidadores` | Membros da família e seus respectivos XPs |
| `@Familia_Recados` | Conteúdo do mural colaborativo |
| `@PetGuardian_FamiliaAtiva` | Se o usuário pertence a uma família |
| `@PetGuardian_NomeFamilia` | Nome da família |
| `@PetGuardian_CodigoFamilia` | Código de convite gerado |
| `@PetGuardian_PontosXP` | XP total acumulado pelo usuário |
| `@PetGuardian_OfensivaDias` | Contador de dias consecutivos de cuidado |
| `@PetGuardian_FamiliaTarefas` | Tarefas criadas para a Familia |
| `@PetGuardian_Progresso_<data>` | Progresso diário das tarefas (reset automático) |

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


<table>
<tr>
<th>Nome</th>
<th>RM</th>
<th>Turma</th>
<th>GitHub</th>
<th>LinkedIn</th>
</tr>

<tr>
<td>Enzo Okuizumi</td>
<td>561432</td>
<td>2TDSPG</td>
<td><a href="https://github.com/EnzoOkuizumiFiap">EnzoOkuizumiFiap</a></td>
<td><a href="https://www.linkedin.com/in/enzo-okuizumi-b60292256/">Enzo Okuizumi</a></td>
</tr>

<tr>
<td>Lucas Barros Gouveia</td>
<td>566422</td>
<td>2TDSPG</td>
<td><a href="https://github.com/LuzBGouveia">LuzBGouveia</a></td>
<td><a href="https://www.linkedin.com/in/lucas-barros-gouveia-09b147355/">Lucas Barros Gouveia</a></td>
</tr>

<tr>
<td>Milton Marcelino</td>
<td>564836</td>
<td>2TDSPG</td>
<td><a href="https://github.com/MiltonMarcelino">MiltonMarcelino</a></td>
<td><a href="http://linkedin.com/in/milton-marcelino-250298142">Milton Marcelino</a></td>
</tr>

<tr>
<td>Luna de Carvalho Guimarães</td>
<td>562290</td>
<td>2TDSPG</td>
<td><a href="https://github.com/lunaguima">lunaguima</a></td>
<td><a href="https://www.linkedin.com/in/luna-m-guimar%C3%A3es-1850ab173/">Luna M. Guimarães</a></td>
</tr>

<tr>
<td>Gustavo Okada</td>
<td>563428</td>
<td>2TDSPG</td>
<td><a href="https://github.com/Gdev3356">GustavoOkada7268</a></td>
<td><a href="https://www.linkedin.com/in/gustavo-okada-53a3b8359/">Gustavo Okada</a></td>
</tr>

</table>