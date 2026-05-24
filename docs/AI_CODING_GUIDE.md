# Guia para Codificação Assistida por IA

Use este documento como contexto principal ao pedir alterações para uma IA. Um bom pedido pode começar com: "Leia `docs/AI_CODING_GUIDE.md` e implemente...".

## Resumo do Projeto

`Mercado dos Bichinhos` é um jogo educativo 2D, estático, feito com HTML, CSS e JavaScript puro em módulos ES. O jogo ajuda crianças a praticarem soma, subtração, completar quantidades, dezenas/unidades, moedas e troco em uma feira com personagens animais.

Não há framework frontend, bundler ou etapa de build. O `index.html` carrega diretamente `src/main.js` e `src/styles/main.css`.

## Comandos

```bash
npm start
```

Inicia o servidor estático local em `http://localhost:4173`.

```bash
npm test
```

Executa os testes de lógica, estado, progressão, recompensas e geração/validação de pedidos.

## Deploy

O deploy no Netlify está configurado em `netlify.toml`.

- Build command: `npm test`
- Publish directory: `.`

Como o projeto é estático, o Netlify publica a raiz do repositório após os testes passarem.

## Estrutura

- `index.html`: entrada HTML do app.
- `src/main.js`: inicializa estado, router, classes globais de acessibilidade e primeira tela.
- `src/styles/main.css`: estilos globais, telas, componentes, responsividade e modos de acessibilidade.
- `src/data/levels.js`: mundos, fases, objetivos, exemplos, recompensas e desbloqueios.
- `src/data/items.js`: frutas, brinquedos, caixas e moedas.
- `src/data/animals.js`: personagens, falas, preferências e personalidade.
- `src/core/storage.js`: estado persistido, migração, sanitização, progresso, reset e dono da banca.
- `src/core/game-state.js`: objeto de estado em memória e sessão de fase.
- `src/core/progression.js`: regras de dificuldade e desbloqueio.
- `src/systems/math-engine.js`: geração de pedidos e validação da cesta.
- `src/systems/reward-system.js`: estrelas, moedas e conclusão de fase.
- `src/systems/feedback-system.js`: mensagens positivas e dicas.
- `src/systems/drag-drop-system.js`: interação de arrastar e soltar.
- `src/systems/audio-system.js`: sons via Web Audio com fallback após interação.
- `src/scenes/*`: telas renderizadas por funções.
- `src/ui/*`: componentes simples reutilizáveis.
- `src/assets/vector/*`: SVGs internos de personagens, itens e ícones.
- `tests/math-engine.test.js`: suíte atual de testes.

## Fluxo do App

1. `src/main.js` cria o estado com `createGameState()`.
2. O router de `src/scenes/router.js` decide qual função de tela renderizar.
3. Se não existe dono da banca, abre `profile`.
4. Se o tutorial ainda não foi visto, abre `tutorial`.
5. Caso contrário, abre `menu`.
6. A fase escolhida abre `market`.
7. `market` cria uma sessão com `createLevelSession(level)`.
8. A cada pedido, `generateOrder(level, state)` cria o desafio.
9. A cesta é validada por `validateBasket(order, basket)`.
10. Ao terminar a fase, `applyLevelReward(state, session)` calcula recompensa, salva progresso e abre `result`.

## Modelo de Estado

O estado persistido fica em `localStorage` na chave `mercadoDosBichinhos:v2`.

Campos principais:

- `owner`: nome e datas do dono da banca.
- `progress`: fases desbloqueadas, concluídas, estrelas e pontuações.
- `economy`: moedas atuais e total de moedas ganhas.
- `settings`: som, música, movimento reduzido, alto contraste e tamanho da fonte.
- `learning`: tutorial e dicas.
- `session`: metadados da última sessão salva.

Sempre use as funções de `src/core/storage.js` para salvar, migrar, resetar ou sanitizar dados. Evite manipular `localStorage` diretamente fora desse módulo.

## Regras de Fases

As fases vivem em `src/data/levels.js`. Cada fase tem:

- `id`, `worldId`, `title`, `subtitle`, `objective`, `description`.
- `characterId`: personagem de `src/data/animals.js`.
- `operationType`: tipo de desafio usado pelo motor matemático.
- `minValue` e `maxValue`: limites numéricos.
- `numberOfOrders`: quantidade de pedidos na fase.
- `allowedItems`: ids de itens disponíveis.
- `reward`: moedas base.
- `unlockCondition`: condição para liberar a fase.
- `examples`: exemplos usados para gerar pedidos.

Tipos de operação suportados em `math-engine.js`:

- `add_join`: soma simples.
- `subtract_remove`: subtração removendo itens.
- `mixed_change`: soma e subtração combinadas.
- `payment_exact`: pagamento com valor exato.
- `change`: troco.
- `tens_units`: dezenas e unidades.
- `large_add`: soma maior.
- `fluency`: sequência de soma/subtração.
- `grand_final`: mistura tipos usando `examples` com `type`.

Ao adicionar uma fase nova, ajuste também testes se houver nova regra matemática ou novo intervalo relevante.

## Regras de Itens

Itens ficam em `src/data/items.js`.

- Itens normais geralmente têm `value: 1`.
- `crate10` representa uma dezena e tem `value: 10`.
- Moedas e nota usam `type: "coin"` e valores monetários.
- `getAllowedItems(ids)` filtra os ids válidos para a fase.

Se adicionar um item visual novo, adicione também sua representação em `src/assets/vector/items.js`.

## Regras de Personagens

Personagens ficam em `src/data/animals.js`.

Cada personagem precisa de:

- `id` único.
- `name`, `species`, `color`.
- `favoriteItems`, `personality`, `preference`, `patience`.
- `lines.neutral`, `lines.happy`, `lines.unsure`.

Se adicionar personagem novo, adicione o SVG correspondente em `src/assets/vector/characters.js`.

## Convenções de Código

- Use módulos ES com `import` e `export`.
- Prefira funções puras para regras de negócio e deixe DOM dentro de `src/scenes` ou `src/ui`.
- Não introduza framework ou bundler sem necessidade explícita.
- Preserve JavaScript simples e legível para manutenção fácil.
- Use nomes claros em inglês no código e textos de interface em português.
- Ao editar telas, siga o padrão de `renderNomeDaTela({ app, state, router, params })`.
- Ao salvar progresso, use `state.save()`, `state.replace(saved)` ou funções de `storage.js`.
- Ao criar lógica testável, coloque em `src/core` ou `src/systems`, não dentro de listeners de DOM.

## Convenções de UI

- O público principal são crianças; textos devem ser curtos, positivos e claros.
- O tom deve ser acolhedor, sem punição por erro.
- Mantenha acessibilidade: botões reais, `aria-live` quando feedback muda, contraste e suporte a movimento reduzido.
- Não esconda informação essencial apenas em cor.
- Preserve classes globais de acessibilidade em `body`: `reduced-motion`, `high-contrast`, `font-large`.
- Ao adicionar controles, garanta que funcionem por clique/toque e não apenas por drag.

## Onde Alterar Cada Tipo de Pedido

- Nova fase: `src/data/levels.js`, possivelmente `tests/math-engine.test.js`.
- Nova regra matemática: `src/systems/math-engine.js` e testes.
- Nova recompensa ou estrelas: `src/systems/reward-system.js` e testes.
- Nova tela: criar `src/scenes/nova-scene.js` e registrar em `src/scenes/router.js`.
- Ajuste visual: `src/styles/main.css`.
- Novo item: `src/data/items.js` e `src/assets/vector/items.js`.
- Novo personagem: `src/data/animals.js` e `src/assets/vector/characters.js`.
- Persistência, reset ou migração: `src/core/storage.js` e testes.
- Desbloqueio/dificuldade: `src/core/progression.js` e testes.
- Sons: `src/systems/audio-system.js`.

## Checklist Antes de Finalizar Mudanças

1. Rodar `npm test`.
2. Se alterou UI, rodar `npm start` e testar no navegador.
3. Verificar fluxo principal: cadastro, tutorial, seleção de fase, mercado, resultado.
4. Verificar que o estado salvo antigo continua sanitizado/migrado.
5. Verificar que textos continuam em português.
6. Verificar que o deploy estático segue funcionando sem depender de arquivos gerados.

## Cuidados Importantes

- Não edite dados salvos diretamente no navegador como parte da lógica da aplicação.
- Não remova migração `LEGACY_STORAGE_KEY` sem necessidade.
- Não altere ids existentes de fases, itens ou personagens sem atualizar todos os usos.
- Não adicione dependências pesadas para problemas simples.
- Não crie uma pasta `dist` como origem do app sem mudar `netlify.toml`.
- Não coloque regras matemáticas importantes apenas no DOM; elas precisam ser testáveis.
- Não transforme feedback infantil em mensagens longas ou negativas.

## Prompt Base para IA

```text
Leia docs/AI_CODING_GUIDE.md antes de alterar o projeto.
Tarefa: [descreva a mudança].
Preserve a arquitetura atual em JavaScript puro.
Atualize testes quando a regra de negócio mudar.
Rode npm test ao final e me diga o resultado.
```

## Exemplos de Prompts Úteis

```text
Leia docs/AI_CODING_GUIDE.md e adicione uma nova fase 11 focada em troco até 20.
Atualize os testes para cobrir a nova faixa.
```

```text
Leia docs/AI_CODING_GUIDE.md e crie um novo personagem para uma fase de dezenas.
Adicione dados, SVG e use esse personagem na fase indicada.
```

```text
Leia docs/AI_CODING_GUIDE.md e melhore a tela de resultado com mais feedback visual,
sem mudar as regras de recompensa.
```

```text
Leia docs/AI_CODING_GUIDE.md e refatore a lógica de validação de moedas para ficar mais testável.
Não altere o comportamento do usuário.
```

## Critérios de Aceite Recomendados

Ao pedir uma mudança para IA, inclua critérios objetivos. Exemplo:

```text
Critérios de aceite:
- A fase aparece na seleção quando desbloqueada.
- O pedido gerado nunca passa do valor máximo.
- A validação aceita apenas cesta com total exato.
- npm test passa.
- O deploy no Netlify continua usando publish ".".
```

## Glossário Rápido

- Cesta: lista de entradas escolhidas pelo jogador em `session.basket`.
- Pedido: objeto gerado por `generateOrder`.
- Target: total esperado para validar a cesta.
- Start: quantidade inicial sem ação do jogador.
- Help count: quantidade de dicas usadas na sessão.
- Error count: quantidade de confirmações incorretas.
- Stars: nota de 1 a 3 calculada no fim da fase.
- Coins: recompensa calculada por fase.
