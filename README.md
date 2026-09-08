# Carona Universitária — Backend

API da aplicação Carona Universitária, desenvolvida com NestJS, Prisma e
PostgreSQL.

## Pré-requisitos

Para executar em desenvolvimento:

- Node.js 24;
- pnpm 10;
- PostgreSQL.

Para executar a stack completa com containers:

- Docker;
- Docker Compose.

## Desenvolvimento local

Neste modo, backend e frontend são iniciados separadamente. Antes de iniciar a
API, deixe uma instância do PostgreSQL em execução.

### 1. Configure o ambiente

Na pasta `carona-backend`, crie o arquivo `.env` a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Em Linux ou macOS:

```bash
cp .env.example .env
```

Revise principalmente as variáveis `POSTGRES_*`, `JWT_*`,
`ENCRYPTION_PASSWORD` e `ENCRYPTION_SALT`. Nunca envie o arquivo `.env` ou
segredos reais para o repositório.

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Prepare o banco de dados

```bash
pnpm db:generate
pnpm db:migrate
```

Para inserir os dados iniciais, execute opcionalmente:

```bash
pnpm db:seed:dev
```

### 4. Inicie o backend

```bash
pnpm dev
```

A API e a documentação Swagger ficam disponíveis em
<http://localhost:3000/api>.

Para iniciar também a interface, siga as instruções de desenvolvimento no
`README.md` do diretório `carona-frontend`.

## Produção com Docker

O arquivo `compose.yaml` deste diretório inicia PostgreSQL, backend e frontend.
As pastas `carona-backend` e `carona-frontend` devem permanecer lado a lado.

### 1. Configure o ambiente

Na pasta `carona-backend`, crie o arquivo `.env`, caso ele ainda não exista:

```powershell
Copy-Item .env.example .env
```

Em Linux ou macOS:

```bash
cp .env.example .env
```

O Compose lê esse arquivo automaticamente e distribui apenas as variáveis
necessárias para cada container. Preencha os segredos antes de iniciar. Para o
Geoapify, use uma chave limitada a Map Tiles em `GEOAPIFY_MAP_TILES_KEY` e
mantenha `GEOAPIFY_SERVER_KEY` restrita ao backend.

### 2. Construa e inicie os containers

```bash
docker compose up --build -d
```

Depois que os health checks terminarem:

- frontend: <http://localhost:3001>;
- backend e Swagger: <http://localhost:3000/api>;
- PostgreSQL: `localhost:5433`, ou a porta definida em
  `POSTGRES_HOST_PORT`.

As migrations existentes são aplicadas automaticamente na inicialização do
backend. Para executar o seed:

```bash
docker compose exec backend pnpm exec prisma db seed
```

### Comandos úteis

Acompanhar os logs:

```bash
docker compose logs -f backend frontend
```

Parar a aplicação:

```bash
docker compose down
```

Parar a aplicação e apagar também os dados locais do PostgreSQL:

```bash
docker compose down -v
```

> Atenção: `down -v` remove o volume do banco e seus dados.

## Validação

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

## Observação sobre produção

Os Dockerfiles possuem estágios `production`, mas o `compose.yaml` atual usa os
estágios `development`, volumes com o código-fonte e hot reload. Portanto, o
Compose atual serve para executar a stack completa localmente e ainda não é
uma configuração otimizada para deploy em produção.
