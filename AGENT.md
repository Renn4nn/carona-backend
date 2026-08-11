# AGENT.md

Guia para agentes e colaboradores que forem alterar o backend da aplicação **Carona Universitária**.

Este arquivo deve ser lido antes de qualquer mudança no código. Ele descreve o contexto do projeto, a arquitetura esperada, padrões de implementação, autenticação atual e decisões de domínio para o MVP.

## 1. Contexto do projeto

Este repositório contém o backend da Carona Universitária, uma plataforma para conectar estudantes que desejam oferecer ou solicitar caronas relacionadas à rotina acadêmica.

Stack atual:

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- nestjs-zod
- pnpm
- JWT
- bcrypt

Objetivo do MVP:

- autenticação;
- cadastro e gerenciamento de usuários;
- perfil acadêmico;
- cadastro de veículos;
- publicação de caronas;
- busca de caronas;
- solicitação de vagas;
- aprovação ou recusa de passageiros;
- conclusão e cancelamento de viagens;
- avaliações entre participantes;
- estrutura de autorização preparada para um painel administrativo futuro.

Pagamentos não serão processados pela plataforma no MVP. O valor pode ser informado na carona, mas qualquer pagamento deve ser combinado diretamente entre os participantes.

## 2. Estado atual do backend

Models Prisma implementados atualmente:

- `User`
- `Role`

Features existentes:

- `src/user`
- `src/auth`
- `src/utils/schemas`
- `src/utils/selects`
- `src/utils/types`
- `src/utils/filters`
- `src/utils/extensions`
- `src/utils/crypto`

Autenticação existente:

- `POST /auth/signup`
- `POST /auth/signin`
- `POST /auth/refresh`
- `POST /auth/logout`
- access token JWT retornado no corpo da resposta;
- refresh token JWT salvo em cookie `httpOnly`;
- refresh token rotacionado no endpoint `/auth/refresh`;
- estratégia JWT via Passport usando Bearer token;
- payload atual contém `sub`, `login`, `role`, `type` e `jti`.


## 3. Regras gerais para agentes

Ao gerar ou modificar código:

1. Não alterar a arquitetura existente sem necessidade.
2. Não criar abstrações genéricas prematuramente.
3. Não criar funcionalidades que não foram solicitadas.
4. Não adicionar dependências sem justificar.
5. Usar TypeScript com tipagem clara e segura.
6. Evitar `any`, `unknown` sem narrowing e casts desnecessários.
7. Usar nomes de arquivos, classes, métodos e variáveis em inglês.
8. Usar mensagens de validação e respostas visíveis em português do Brasil.
9. Manter cada feature isolada em sua própria pasta.
10. Reutilizar schemas, selects, tipos, filtros e helpers existentes.
11. Não retornar senha, tokens sensíveis ou dados sigilosos em respostas da API.
12. Não acessar Prisma diretamente pelo controller.
13. Não colocar regra de negócio no controller.
14. Não colocar regra HTTP no repository.
15. Usar DTOs criados a partir de schemas Zod.
16. Usar `z.strictObject` para schemas de objetos.
17. Usar `satisfies z.ZodType<Prisma.*>` quando o schema representar diretamente um input ou model do Prisma.
18. Não modificar arquivos gerados em `generated/prisma`.
19. Manter compatibilidade com o padrão de resposta da API.
20. Ao encontrar divergência entre este arquivo e o código, preservar o comportamento funcional e apontar a divergência.

## 4. Estrutura de feature

Cada feature deve seguir, por padrão:

```text
feature.controller.ts
feature.service.ts
feature.repository.ts
feature.module.ts
```

Arquivos extras só devem ser criados quando houver necessidade real:

```text
feature.constants.ts
feature.types.ts
feature.mapper.ts
feature.helper.ts
```

Responsabilidades:

- controller: rotas, params, query, body, guards, pipes e padrão de resposta;
- service: regras de negócio, permissões, ownership, transações e exceções de domínio;
- repository: acesso ao banco, selects, filtros, ordenação, paginação e operações atômicas;
- module: composição da feature e exports somente quando outra feature precisar.

## 5. Fluxo para criar uma feature

Ordem recomendada:

1. Confirmar ou criar o model no Prisma.
2. Criar ou atualizar migration.
3. Rodar `pnpm prisma generate`.
4. Criar schema Zod em `src/utils/schemas`.
5. Criar tipos com `z.infer`.
6. Criar DTOs com `createZodDto`.
7. Criar select centralizado em `src/utils/selects`.
8. Criar repository.
9. Criar service.
10. Criar controller.
11. Criar module.
12. Registrar module no `AppModule`, quando necessário.
13. Validar com lint, typecheck e build.

## 6. Schemas, DTOs e tipos

Regras para Zod:

- usar `z.strictObject`, nunca `z.object`, para objetos;
- usar mensagens de erro em português;
- usar `z.coerce.date()` para datas recebidas via JSON;
- usar `z.uuid()` para IDs UUID;
- aplicar `trim()` em strings quando fizer sentido;
- definir tamanhos mínimos e máximos para strings;
- definir limites numéricos;
- não aceitar campos extras no payload;
- não incluir campos gerados pelo banco em schemas de criação;
- não permitir campos administrativos sem autorização.

Exemplo:

```ts
export const createUserSchema = z.strictObject({
  login: z.string({ error: 'Campo Login é obrigatório' }).min(3),
  password: z.string({ error: 'Campo Senha é obrigatório' }).min(6),
}) satisfies z.ZodType<Prisma.UserCreateInput>;

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export class CreateUserDto extends createZodDto(createUserSchema) {}
```

Schemas de atualização devem ser derivados do schema de criação:

```ts
export const updateUserSchema = createUserSchema.partial();
```

Não permitir atualização direta de:

- IDs;
- `createdAt`;
- `updatedAt`;
- status administrativos;
- flags de aprovação;
- campos de auditoria;
- dados de outro usuário.

## 7. Selects Prisma

Toda consulta que retorna entidade deve usar select centralizado.

Exemplo:

```ts
export const USER_SELECT = {
  id: true,
  login: true,
  role: {
    select: {
      id: true,
      code: true,
      name: true,
      active: true,
    },
  },
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;
```

Regras:

- nunca retornar `password`;
- não repetir selects completos em vários repositories;
- criar selects relacionais específicos quando necessário;
- evitar `include: true` indiscriminado;
- selecionar apenas campos necessários;
- usar `satisfies Prisma.ModelSelect` sempre que possível.

## 8. Padrão de resposta da API

Toda resposta de sucesso deve seguir:

```ts
export type ApiSuccessResponse<T> = {
  data: T;
};
```

Exemplo:

```json
{
  "data": {
    "id": "uuid"
  }
}
```

Mensagens simples também devem vir dentro de `data`:

```json
{
  "data": "Sessão encerrada com sucesso!"
}
```

Não retornar objetos fora desse padrão sem justificativa.

## 9. Autenticação atual

Arquivos principais:

- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/auth.repository.ts`
- `src/auth/token.service.ts`
- `src/auth/guards/JwtGuard.ts`
- `src/auth/guards/JwtStrategy.ts`
- `src/utils/types/auth/auth.ts`

Fluxo atual:

1. `signup` valida o payload com `RegisterUserDto`.
2. O service verifica se o login já existe.
3. O repository cria o usuário com hash bcrypt.
4. `TokenService` gera access token e refresh token.
5. O access token volta no corpo da resposta.
6. O refresh token é gravado em cookie `refreshToken` com `httpOnly`, `sameSite: strict` e `secure` em produção.
7. `signin` repete o fluxo de geração de tokens após validar senha com bcrypt.
8. `refresh` lê o cookie, valida token do tipo `refresh`, consulta o usuário e gera novo par de tokens.
9. `logout` limpa o cookie `refreshToken`.

Regras para auth:

- usar `bcrypt` para senha;
- nunca salvar senha em texto puro;
- nunca retornar senha em selects públicos;
- nunca registrar senha ou token em logs;
- não enviar senha em mensagens de erro;
- manter mensagens de credencial inválida genéricas;
- não confiar em `userId` recebido pelo body em rotas privadas;
- obter usuário autenticado pelo JWT;
- proteger rotas privadas com `JwtAuthGuard`;
- usar access token via header `Authorization: Bearer <token>`;
- usar refresh token apenas para renovar sessão;
- manter access e refresh com secrets diferentes;
- manter `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN` e `JWT_REFRESH_EXPIRES_IN` no ambiente;
- se adicionar revogação ou lista de bloqueio, tratar isso explicitamente como nova regra de segurança.

Payload atual:

```ts
export type JwtPayload = {
  sub: string;
  login: string;
  role: string;
  type: 'access' | 'refresh';
  jti: string;
};
```

Implementação de autorização:

- adotar `Role` como fonte única de verdade para autorização;
- cada `User` deve possuir exatamente uma `Role` por meio de `roleId`;
- não criar `UserRole`, pois não haverá múltiplas roles por usuário;
- não recriar `User.admin`, evitando fontes concorrentes de verdade;
- carregar `role: string` no JWT;
- para ações sensíveis, prefira confirmar permissões atuais no banco.

## 10. Autorização

Autenticação responde: quem é o usuário?

Autorização responde: o usuário pode executar esta ação?

Regras:

- validar ownership no service;
- validar permissões administrativas no service;
- não permitir que um usuário altere outro usuário sem permissão;
- não permitir criação de carona com veículo de outro usuário;
- não permitir solicitação de vaga na própria carona;
- não permitir avaliação de usuário que não participou da carona;
- não permitir ações em entidade inativa quando a regra exigir entidade ativa.

### Decisão de roles e administração

A autorização deve usar uma tabela `Role` separada, com apenas os códigos:

```text
USER
ADMIN
```

Regras:

- a relação é muitos usuários para uma role;
- cada `User` deve possuir uma única role obrigatória;
- a role deve ser associada diretamente a `User`, e não a `StudentProfile`, pois autorização pertence à identidade da conta e não aos dados acadêmicos;
- novos usuários cadastrados pelo fluxo público devem receber `USER` por padrão;
- o payload de cadastro e atualização comum nunca pode aceitar `roleId`, `roleCode` ou qualquer campo que permita autoatribuição de `ADMIN`;
- somente um fluxo administrativo protegido ou uma operação interna controlada pode promover ou rebaixar usuários;
- inicialmente, a aplicação terá apenas um ou dois usuários com a role `ADMIN`;
- a quantidade de administradores é uma regra operacional, não uma restrição fixa do banco, para evitar bloqueio da administração e permitir expansão futura;
- rotas do futuro painel administrativo devem exigir autenticação e role `ADMIN`;
- em ações administrativas sensíveis, validar a role atual no banco para que uma alteração de permissão tenha efeito sem depender da expiração do JWT;
- não usar roles `DRIVER` ou `PASSENGER`: esses são comportamentos assumidos pelo usuário em cada carona, não permissões permanentes.

O painel administrativo não faz parte da implementação atual. Quando for criado, deverá apresentar registros de ações relevantes do sistema. A auditoria deve ser modelada separadamente de `Role`, preservando ao menos:

- administrador ou usuário responsável pela ação;
- tipo da ação;
- entidade e identificador afetados;
- data e hora;
- metadados necessários para investigação, sem armazenar senha, token ou outros segredos.

Os registros de auditoria não devem ser alteráveis por usuários comuns e não devem depender apenas de logs de aplicação efêmeros.

## 11. Entidades planejadas para o MVP

O modelo geral do MVP considera:

- `User`
- `Role`
- `University`
- `Course`
- `StudentProfile`
- `Vehicle`
- `RideStatus`
- `Ride`
- `ParticipantStatus`
- `RideParticipant`
- `Review`

Decisão implementada: usar `Role` com relação direta `User.roleId`. Cada usuário possui exatamente uma role e `User.admin` não existe mais.

Grupos de domínio:

```text
Identidade e acesso
- User
- Role

Dados acadêmicos
- University
- Course
- StudentProfile

Operação de caronas
- Vehicle
- Ride
- RideStatus
- RideParticipant
- ParticipantStatus

Reputação
- Review
```

## 12. Regras de domínio

Usuário:

- usuário precisa estar ativo para usar recursos privados;
- usuário pode atuar como motorista e passageiro;
- motorista e passageiro não são roles fixas;
- usuário atua como motorista ao criar uma carona;
- usuário atua como passageiro ao solicitar ou participar de uma carona.

Perfil acadêmico:

- cada usuário pode possuir no máximo um perfil acadêmico;
- perfil deve estar associado a curso e universidade;
- se `StudentProfile` tiver `courseId` e `universityId`, o service deve validar que o curso pertence à universidade;
- uma alternativa mais normalizada é manter apenas `courseId` e obter a universidade pelo curso;
- matrícula e e-mail institucional podem ser opcionais no MVP;
- verificação acadêmica pode ser adicionada depois.

Veículo:

- veículo pertence a um único usuário;
- placa deve ser única;
- apenas proprietário pode atualizar ou desativar;
- veículo inativo não pode ser usado em nova carona;
- veículo selecionado na carona deve pertencer ao motorista;
- para histórico, prefira `onDelete: Restrict` e desativação lógica.

Carona:

- carona pertence a um motorista;
- carona utiliza um veículo do motorista;
- data de saída deve ser futura na criação;
- número de vagas deve ser maior que zero;
- `availableSeats` não pode ser maior que `totalSeats`;
- carona cancelada não aceita novas solicitações;
- carona lotada não aceita novas solicitações;
- carona em andamento não deve ser editada livremente;
- carona finalizada não deve voltar para aberta;
- carona cancelada deve registrar motivo e data.

Participante:

- solicitação é representada por `RideParticipant`;
- passageiro só pode possuir uma participação por carona;
- participação inicia como pendente;
- apenas motorista pode aceitar ou recusar;
- ao aceitar, reduzir `availableSeats` de forma atômica;
- ao cancelar uma participação aceita, devolver a vaga;
- não aceitar passageiro quando não houver vagas;
- aceite e liberação de vaga devem usar transação.

Avaliação:

- nota deve ser inteira entre 1 e 5;
- usuário não pode avaliar a si mesmo;
- apenas participantes de carona concluída podem avaliar;
- motorista pode avaliar passageiros;
- passageiros podem avaliar o motorista;
- mesma pessoa não pode avaliar o mesmo usuário duas vezes na mesma carona;
- comentários devem ter limite de tamanho;
- service deve validar participação antes de criar avaliação.

## 13. Status como tabelas

Status configuráveis devem ser tabelas, não enums do Prisma.

Valores iniciais sugeridos para `RideStatus`:

```text
OPEN
FULL
IN_PROGRESS
COMPLETED
CANCELED
```

Valores iniciais sugeridos para `ParticipantStatus`:

```text
PENDING
ACCEPTED
REJECTED
CANCELED
COMPLETED
```

Valores iniciais definidos para `Role`:

```text
USER
ADMIN
```

Use `code` para regras internas e `name` para exibição.

## 14. Transações

Usar transações quando duas ou mais mudanças precisam ocorrer como uma única operação.

Exemplo: aceitar passageiro.

```text
1. Verificar se a carona possui vaga.
2. Atualizar RideParticipant para ACCEPTED.
3. Reduzir availableSeats.
4. Alterar RideStatus para FULL se não restarem vagas.
```

Essas operações devem ocorrer em uma única transação.

## 15. Exclusão de dados

Preferir desativação lógica para registros importantes.

Usar `active` para:

- usuários;
- veículos;
- universidades;
- cursos;
- roles;
- status.

Não excluir fisicamente:

- carona concluída;
- avaliações vinculadas a histórico;
- veículos usados em caronas históricas;
- usuários com histórico relevante, salvo regra administrativa explícita.

Exclusão física pode ser usada para dados temporários ou registros sem impacto histórico.

## 16. Tratamento de erros

Antes de criar novo padrão de erro, olhar:

- `src/utils/filters`
- `src/utils/errors`
- `src/utils/extensions`

Regras:

- service pode lançar exceções NestJS de negócio;
- repository não deve lançar exceções HTTP por regra de negócio;
- filtros globais devem manter respostas consistentes;
- mensagens expostas devem estar em português;
- não vazar dados internos, senha, token, stack trace ou detalhes sensíveis.

## 17. Convenções

Arquivos:

```text
user.controller.ts
user.service.ts
user.repository.ts
user.module.ts
user.schema.ts
user.select.ts
```

Classes:

```text
UserController
UserService
UserRepository
UserModule
CreateUserDto
UpdateUserDto
```

Métodos:

```text
findById
findByLogin
findMany
create
update
delete
activate
deactivate
acceptParticipant
rejectParticipant
cancelRide
completeRide
```

Evitar nomes vagos como `process`, `handle`, `execute`, `doAction` e `manage`.

Rotas:

- preferir recursos no plural em novas features;
- manter consistência com rotas existentes quando estiver alterando uma feature já criada;
- não misturar padrões sem necessidade.

Exemplos:

```text
/users
/users/:id
/rides
/rides/:id
/rides/:id/participants
/rides/:id/cancel
```

## 18. Imports

Usar aliases e padrões existentes.

Exemplos:

```ts
import type { Prisma } from 'generated/prisma/client';
import { CreateUserDto } from 'src/utils/schemas/user.schema';
import { USER_SELECT } from 'src/utils/selects';
```

Regras:

- usar `import type` quando o import for apenas tipo;
- evitar caminhos relativos longos;
- não importar arquivos internos de outra feature sem necessidade;
- não criar dependências circulares;
- organizar imports conforme lint do projeto.

## 19. Validação antes de concluir

Antes de considerar uma implementação concluída:

```bash
pnpm lint
pnpm check-types
pnpm build
```

Quando houver alteração no Prisma:

```bash
pnpm prisma format
pnpm prisma generate
pnpm prisma migrate dev
```

Em produção:

```bash
pnpm prisma migrate deploy
```

Nunca criar migration destrutiva sem revisar o SQL gerado.

## 20. Critérios de conclusão

Uma feature só está concluída quando:

- schema Zod foi criado;
- tipos foram inferidos;
- DTOs foram criados;
- select foi definido;
- repository foi implementado;
- service contém as regras de negócio;
- controller segue o padrão de resposta;
- module foi registrado;
- campos sensíveis não são retornados;
- senhas e dados sensíveis são tratados corretamente;
- transações foram usadas onde há concorrência;
- lint passa;
- typecheck passa;
- build passa.

## 21. Orientações finais ao Codex

Se mexer no schema do prisma no final da implementação rode esses comandos que estão nos scripts do projeto:
"db:generate": "dotenv -e ./.env -e ./.env.production -e ./.env.development -- prisma generate",
"db:migrate": "dotenv -e ./.env -e ./.env.production -e ./.env.development -- prisma migrate dev",
"db:seed:dev": "dotenv -e ./.env -e ./.env.production -e ./.env.development -- prisma db seed",

Ao receber uma tarefa:

1. Ler este arquivo antes de alterar código.
2. Analisar arquivos existentes relacionados.
3. Respeitar o padrão já adotado no projeto.
4. Informar quais arquivos serão criados ou alterados.
5. Implementar apenas o necessário.
6. Não substituir código funcional por arquitetura totalmente diferente.
7. Não remover funcionalidades existentes sem solicitação.
8. Não adicionar comentários redundantes.
9. Não entregar pseudocódigo ou TODO como resultado final.
10. Verificar tipos gerados pelo Prisma antes de escrever `satisfies`.
11. Garantir que schemas Zod sejam compatíveis com Prisma quando aplicável.
12. Garantir que selects não exponham informações sensíveis.
13. Garantir que regras concorrentes usem transação.
14. Apontar divergências relevantes entre documentação e código.
15. Apresentar resumo objetivo das alterações realizadas.

# 22. FUTURE
Um usuário possui no máximo um perfil e um curso atual. Múltiplos cursos ou histórico futuro serão modelados por uma entidade Enrollment, não por muitos-para-muitos direto no MVP.