# Ambiente local com Docker

O Compose executa PostgreSQL, backend NestJS e frontend Next.js em containers
separados. Ele pressupõe que `carona-backend` e `carona-frontend` sejam pastas
irmãs.

## Preparação

Na pasta `carona-backend`, copie `compose.env.example` para `compose.env` e
altere os segredos locais se o arquivo for compartilhado entre máquinas.
Gere chaves novas no Geoapify: `GEOAPIFY_MAP_TILES_KEY` deve ter apenas acesso
a Map Tiles e `GEOAPIFY_SERVER_KEY` deve ficar restrita ao backend para
Autocomplete e Routing. A chave enviada em mensagens ou commits deve ser
revogada.

No PowerShell:

```powershell
Copy-Item compose.env.example compose.env
```

## Comandos

```bash
# Construir as imagens e iniciar toda a aplicação
docker compose --env-file compose.env up --build

# Iniciar em segundo plano
docker compose --env-file compose.env up --build -d

# Acompanhar frontend e backend
docker compose --env-file compose.env logs -f backend frontend

# Executar o seed quando necessário
docker compose --env-file compose.env exec backend pnpm exec prisma db seed

# Parar os containers
docker compose --env-file compose.env down

# Parar e apagar também o banco de dados local
docker compose --env-file compose.env down -v
```

O frontend fica disponível em <http://localhost:3001>, o backend e o Swagger
em <http://localhost:3000/api> e o PostgreSQL na porta definida por
`POSTGRES_HOST_PORT`.

Alterações no código possuem hot reload. Depois de alterar `package.json` ou o
lockfile de um projeto, reconstrua sua imagem:

```bash
docker compose --env-file compose.env build backend
docker compose --env-file compose.env build frontend
docker compose --env-file compose.env up
```

O backend aplica as migrations existentes ao iniciar. A criação de novas
migrations continua sendo uma ação explícita de desenvolvimento.
