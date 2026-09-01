# GuardianX Lab Orchestrator — Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
EXPOSE 3004
CMD ["bun", "run", "index.ts"]
