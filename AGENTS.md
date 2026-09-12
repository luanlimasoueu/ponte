<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Deploy atual (temporário)

O site público não está em Railway/Render — é um **túnel Cloudflare efêmero** apontando para o dev server local:

- `npx next start -p 3000` serve produção em `localhost:3000` (log em `/tmp/next-prod.log`)
- `cloudflared tunnel --url http://localhost:3000` expõe na URL pública (log em `/tmp/cloudflared.log`)
- URL ativa: https://primarily-compression-personalized-lakes.trycloudflare.com
- **Morre quando a máquina desliga ou o processo para.** A cada execução o trycloudflare gera URL nova — não dá para reutilizar.
- Para recriar: `npm run dev` + `cloudflared tunnel --url http://localhost:3000`, pegar a URL nova no log e atualizar `apresentacao/slides.md` (2 menções).

Deploy permanente: Dockerfile pronto (multi-stage, `output: "standalone"`, volume em `/app/data` via `DATABASE_PATH`) — basta conta no Railway/Render/Fly.io.
