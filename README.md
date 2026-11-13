# TryIT

Laboratório de exercícios de programação em múltiplas linguagens.

| Workspace | Responsabilidade |
|---|---|
| `apps/web` | SPA Vue, TypeScript e Vite. Tela única com enunciado, CodeMirror e resultado. |
| `apps/api` | API Hono para Cloudflare Workers. Seleciona casos, chama o executor e compara a saída. |
| `packages/contracts` | Tipos da API e metadados de linguagem compartilhados. |
| `content/exercises` | Enunciados, exemplos e casos adicionais usados pela API. |

A tela compõe as features `exercises`, `editor` e `evaluation`. Os estilos compartilhados ficam em `shared/ui`. A API usa um adaptador Piston. Casos adicionais ficam fora da resposta HTTP, mas são visíveis no repositório.

## Desenvolvimento local

Use Node.js 24 LTS.

```sh
npm ci
npm run dev:api
```

Em outro terminal, execute `npm run dev`. O Vite encaminha `/api` para o Worker local na porta 8787. Use `npm run build` para checar os tipos e gerar os dois builds.

Para executar código, copie `apps/api/.dev.vars.example` para `apps/api/.dev.vars` e informe o endereço base da API v2 do Piston e as versões instaladas de Java e JavaScript. Sem essa configuração, o exercício e o editor funcionam e a API retorna indisponibilidade ao executar ou submeter.

## Deploy na Cloudflare

A configuração de produção publica o build Vue como Workers Static Assets e executa a API Hono no mesmo Worker. A SPA e as rotas `/api/*` compartilham a mesma origem.

Com o Wrangler autenticado na conta de destino, execute da raiz:

```sh
npm ci
npm run deploy:cloudflare
```

Para Workers Builds conectado ao GitHub, use a raiz do repositório e Node.js 24. Configure o build como `npm run build` e o deploy como `npm run deploy -w @tryit/api`.

O catálogo e o editor funcionam sem o Piston. A execução depende de uma VM separada, das configurações do executor e de limites de acesso e concorrência. O provisionamento Terraform segue pendente.
