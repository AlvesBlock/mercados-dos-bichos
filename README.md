# Mercado dos Bichinhos

Jogo educativo 2D para crianças praticarem soma, subtração, completar quantidades, dezenas/unidades, moedas e troco dentro de uma feira de animais.

## Como rodar

```bash
npm start
```

Depois acesse `http://localhost:4173`.

## Testes

```bash
npm test
```

Os testes cobrem storage v2, cadastro do dono da banca, reset parcial/total, migração v1, progressão de fases, recompensas, geração de pedidos, validação da cesta, soma, subtração, completar quantidade, moedas, troco e dezenas/unidades.

## Deploy no Netlify

Este projeto está pronto para deploy estático via Git no Netlify.

1. Suba o repositório para GitHub, GitLab ou Bitbucket.
2. No Netlify, escolha **Add new site** > **Import an existing project**.
3. Conecte o repositório.
4. Mantenha as configurações do `netlify.toml`:
   - Build command: `npm test`
   - Publish directory: `.`
5. Finalize em **Deploy site**.

Como o jogo usa JavaScript puro e arquivos estáticos, não há etapa de build gerando `dist`.

## Estrutura

- `src/data`: animais, itens e 10 fases configuráveis.
- `src/core`: estado, progresso e armazenamento versionado em `localStorage`.
- `src/systems`: lógica matemática, recompensas, feedback, áudio e arrastar e soltar.
- `src/scenes`: cadastro do dono da banca, menu, tutorial, seleção, mercado, resultado e configurações.
- `src/ui`: componentes simples de interface.
- `src/assets/vector`: personagens, itens, moedas e ícones em SVG interno.
- `src/assets/images/menu_inicial.png`: arte premium usada como fundo responsivo do menu inicial.
- `docs/AI_CODING_GUIDE.md`: documentação para orientar codificação assistida por IA.

## Arte do menu inicial

A tela inicial usa `src/assets/images/menu_inicial.png` apenas como cenário de fundo. O título, o texto dinâmico `Banca do(a) [nome]`, os botões e todas as interações continuam sendo renderizados por HTML, CSS e JavaScript.

Para trocar a imagem futuramente, substitua o arquivo `src/assets/images/menu_inicial.png` mantendo a proporção 16:9 e deixando áreas livres no topo central e no centro inferior para as camadas HTML do menu.

## Expansão

Para adicionar fases, edite `src/data/levels.js`. Para evoluir a arte, mantenha os mesmos `id` dos animais e itens e ajuste os SVGs em `src/assets/vector`.

Sons estão preparados em `src/systems/audio-system.js` com fallback Web Audio após a primeira interação do usuário.
