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

O desenho de produção prevê Cloudflare Pages, Cloudflare Workers e Piston em uma VM Linux separada. A produção precisa encaminhar `/api` ao Worker e aplicar limites de acesso e concorrência antes de conectar um executor público. A escolha da VM e o provisionamento Terraform seguem pendentes.
