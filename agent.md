# AGENT.md

Última atualização: 2026-05-22T18:18

## 1) Contexto do Challenge (Escopo Acadêmico)
Este é o projeto móvel do **PetGuardian** desenvolvido para a disciplina de **Mobile Application Development (FIAP)**.
Diferente de sistemas com sincronização remota complexa, este aplicativo é projetado para operar **100% no cliente (local-only)**:
- Usa **AsyncStorage** como o banco de dados embarcado principal e único ponto de verdade no dispositivo.
- Simula colaborações de "Família" e "Cuidadores" diretamente no armazenamento local do dispositivo.
- Valida formulários rigorosamente no frontend utilizando **Zod**.
- Oferece uma experiência de usuário rica com animações em **Reanimated 3** e componentes customizados.

Este arquivo serve como o guia definitivo de arquitetura e continuidade para novos agentes/desenvolvedores trabalhando nesta branch.

---

## 2) Essência do Produto (North Star)
O **PetGuardian** ajuda a organizar a rotina diária de cuidados com pets e registrar o histórico clínico dos animais de forma estruturada:
1. **Unidade Familiar:** As tarefas e o mural de recados são compartilhados entre os cuidadores do mesmo dispositivo (simulando a família do pet).
2. **Prevenção de Falhas:** O status de tarefas de alimentação, medicamentos e vacinas é atualizado em tempo real na interface, evitando cuidados duplicados ou esquecidos.
3. **Streak & Gamificação:** XP e dias seguidos de cuidado (Ofensivas) engajam os tutores e mostram quem é o cuidador mais ativo no ranking interno da família.

---

## 3) Arquitetura e Fluxo do Código

### 3.1 Navegação (`src/routes/`)
O aplicativo utiliza uma estrutura híbrida com o **React Navigation**:
- **`MainStack.tsx` (Ponto de Entrada):**
  - `Welcome`: Verifica automaticamente se há uma sessão ativa (`@PetGuardian_Logado` === `'sim'`). Se houver, navega direto para `Tabs`; caso contrário, exibe a tela inicial.
  - `Login`: Autenticação básica via conferência de dados com o AsyncStorage.
  - `Register`: Cadastro de novos usuários.
  - `Tabs`: Direciona para as abas principais após login.
- **`tabs.tsx` (Abas do App):**
  - `Home`: Dashboard principal com rotina diária, XP, streak de ofensiva e histórico de saúde consolidado dos pets.
  - `Family`: Aninha a `FamilyStack` (navegação entre `FamilyPetScreen` e `AddMemberScreen`).
  - `MeuPet`: Ficha clínica e gerenciamento do carrossel de animais cadastrados.
  - `Dicas`: Conteúdo educativo estático sobre cuidados animais.
  - `Perfil`: Dados da conta, ranking de cuidadores, FAQ modal e formulário de suporte.

### 3.2 Camada de Serviços
Nesta branch local-only, o único serviço centralizado e isolado é:
- **`TaskService.ts` (`src/services/`):**
  - Gerencia as tarefas da família e calcula o progresso dinâmico diário.
  - `carregarTarefasHoje()`: Verifica se já existe uma lista instanciada para a data corrente (`@PetGuardian_Progresso_<DataHoje>`). Se não houver, carrega as tarefas padrão filtradas pelo dia da semana atual (`getDay()`) com status resetado (`concluida: false`).
  - `adicionarTarefaFamilia()`: Insere a nova tarefa na lista geral e na lista específica do progresso do dia corrente.
  - `atualizarStatusTarefaHoje()`: Atualiza e salva o booleano de conclusão da tarefa para o dia de hoje.

Os demais fluxos (mural de recados, membros, perfil e animais) realizam leitura/escrita direta no AsyncStorage de dentro de suas respectivas telas para maximizar simplicidade e performance em modo offline.

### 3.3 Ajustes Técnicos e Hardening Recentes
- **Correção de Casing do Import:** Corrigido o caminho do import do `StreakCard` no arquivo `HomeScreen.tsx` para coincidir com a capitalização real da pasta (`StreakCard` vs `streakCard`), evitando erros de compilação em sistemas de arquivos sensíveis a maiúsculas/minúsculas.
- **Tipagem ZodError:** Corrigida a propriedade `error.errors` para `error.issues` nos arquivos `LoginScreen.tsx`, `RegisterScreen.tsx` e `UserProfileScreen.tsx`, resolvendo os avisos de tipo implícito `any` e garantindo conformidade com a tipagem estrita do Zod.

---

## 4) Dados Persistidos (Dicionário de Chaves AsyncStorage)

As chaves de persistência estão declaradas em `src/constants/Keys.ts` (`STORAGE_KEYS`):

| Chave | Conteúdo dos Dados |
| :--- | :--- |
| `@PetGuardian_UserData` | JSON contendo os dados do usuário atualmente logado (nome, email, senha) |
| `@PetGuardian_Logado` | String flag (`'sim'` ou `'nao'`) que dita se a sessão está ativa |
| `@PetGuardian_ListaPets` | JSON Array de todos os pets criados (nome, raca, idade, peso, vacinas, consultas, etc.) |
| `@PetGuardian_FamiliaAtiva` | String flag (`'sim'` ou `'nao'`) indicando se o usuário já criou/entrou em uma família |
| `@PetGuardian_NomeFamilia` | String correspondente ao nome da família ativa (ex: "Casa do Bob") |
| `@PetGuardian_CodigoFamilia` | String do código de convite gerado aleatoriamente (ex: `PET-7492`) |
| `@Familia_Cuidadores` | JSON Array de cuidadores vinculados à família (id, nome, funcao, xp) |
| `@Familia_Recados` | JSON Array de mensagens do mural colaborativo (id, texto, hora, autor) |
| `@PetGuardian_PontosXP` | XP acumulado do usuário atual |
| `@PetGuardian_OfensivaDias` | Inteiro que guarda o contador de dias consecutivos (Streak) |
| `@PetGuardian_DataUltimaOfensiva` | String do dia do último incremento da ofensiva para evitar repetição no mesmo dia |
| `@PetGuardian_FamiliaTarefas` | JSON Array de todas as tarefas cadastradas na rotina da família |
| `@PetGuardian_Progresso_<data>` | JSON Array do status das tarefas do dia (chave sufixada com `toDateString()`) |

---

## 5) Regras de Negócio Importantes

### 5.1 Streak e Ofensivas
- Ao marcar qualquer tarefa como concluída na Home, o sistema valida se a ofensiva já foi incrementada hoje.
- Se o último acesso registrado (`@PetGuardian_DataUltimaOfensiva`) for igual ao dia de hoje, a ofensiva é mantida. Se for ontem, incrementa-se em `+1`. Caso contrário (passou mais de um dia), o streak é resetado para `1`.

### 5.2 Fluxo Familiar e Permissões
- **Dono da Família:** O usuário que cria a família recebe o papel de `"Dono(a) da Família"`.
- **Governança:** Apenas o dono tem permissão visual para renomear o grupo ou remover membros através do mural/lista.
- **Entrada via Código:** Para entrar em uma família na aba Family, o código digitado pelo usuário deve bater com o código armazenado localmente na chave `@PetGuardian_CodigoFamilia` (simulando a verificação de código compartilhado).

### 5.3 Validações com Zod
- **Registro/Edição de Conta:** Utiliza esquemas estritos (ex: `ProfileEditSchema` em `src/utils/schemas.ts`) exigindo e-mail válido, nome com comprimento mínimo e confirmação idêntica de senha.

---

## 6) Matriz de Aderência Técnica do Challenge

Status: `OK` | `PENDENTE`

- **Navegação Híbrida (Stack + Tab Navigation):** **OK**
- **Banco Local com AsyncStorage:** **OK**
- **Validação de Formulários via Zod:** **OK**
- **Interações e Animações com Reanimated 3:** **OK**
- **Execução livre de erros TypeScript (`npx tsc --noEmit`):** **OK**

---

## 7) Checklist de Definition of Done (DoD)

Ao criar ou editar qualquer recurso no projeto:
1. **Preservar o Escopo Local:** Não adicione dependências de rede complexas ou chamadas a APIs REST externas sem alinhamento prévio. O foco principal é a fidelidade local do protótipo acadêmico.
2. **Conformidade TypeScript:** Certifique-se de que os modelos em `src/types/models.ts` reflitam com precisão as propriedades modificadas. Nenhuma modificação deve introduzir erros no `npx tsc --noEmit`.
3. **Limpeza de AsyncStorage:** Ao realizar logout do usuário, garanta que os estados de sessão (`LOGADO` e `UserData`) sejam devidamente limpos sem corromper as tabelas globais (`ListaPets`, `Users`).
