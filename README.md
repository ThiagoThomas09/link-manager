# Password Manager

Projeto acadêmico de um **Gerenciador de Senhas**, usando **Next.js + TypeScript + Docker + Postgres**.  

---

## Pré-requisitos

- [Node.js](https://nodejs.org) (apenas se quiser rodar fora do Docker)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Rodando com Docker

Subir a aplicação (Next.js + Postgres):

1. Clone o projeto
2. Entre na pasta do projeto pelo terminal
3. Crie o arquivo .env e configure com base no .env.example
4. Execute `docker compose up --build`
5. Acesse no navegador:
    - http://localhost:3000
    - http://localhost:3000/api/health
