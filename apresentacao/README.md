# Apresentação — Ponte

`slides.md` é um deck em formato **Marp** (Markdown vira slides). Ideia central da apresentação:

> Comunidade aberta conectando profissionais experientes a pessoas em início ou transição de carreira — em qualquer idade. Mentorados acumulam contribuições públicas recomendadas por mentores; empresas buscam talento com evidência real e também podem atuar como mentoras.

## Como editar

Cada slide é separado por `---`. Opções:

- **VS Code + extensão "Marp for VS Code"**: preview ao vivo e exporta para **PPTX, PDF ou HTML** (a extensão sugere instalação ao abrir o arquivo).
- **Sem instalar nada**: `npx @marp-team/marp-cli slides.md --pptx` (ou `--pdf`).
- **Canva / Google Slides / PowerPoint**: copie a estrutura — cada `---` vira um slide.

## Sugestões de melhoria

- **Identidade visual**: o app usa roxo (`#6d28d9` / violet-700) sobre fundo claro — vale manter essa paleta.
- **Screenshots**: capture a demo ao vivo (link no 1º slide) — landing, lista de mentores, perfil de mentorado com recomendações. Se o link temporário cair, rodar `npm install && npm run dev` na pasta do projeto.
- **Público-alvo**: ajustar o CTA final conforme a plateia (investidor, comunidade, empresa parceira).
- Se faltar dados de mercado, posso ajudar a levantar estatísticas sobre mentoria/transição de carreira.
