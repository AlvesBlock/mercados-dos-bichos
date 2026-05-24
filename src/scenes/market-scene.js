import { getAnimal } from "../data/animals.js";
import { getAllowedItems, getItem } from "../data/items.js";
import { getLevel } from "../data/levels.js";
import { createLevelSession } from "../core/game-state.js";
import { generateOrder, getBasketTotal, validateBasket } from "../systems/math-engine.js";
import { positiveFeedback, guidanceFeedback, characterMoodLine } from "../systems/feedback-system.js";
import { applyLevelReward } from "../systems/reward-system.js";
import { enableDragSource } from "../systems/drag-drop-system.js";
import { playSound } from "../systems/audio-system.js";
import { characterSvg } from "../assets/vector/characters.js";
import { itemSvg } from "../assets/vector/items.js";
import { starIcons } from "../assets/vector/icons.js";

export function renderMarket({ app, state, router, params }) {
  const level = getLevel(params.levelId ?? state.progress.currentLevelId);
  state.currentLevel = level;
  state.progress.currentLevelId = level.id;
  state.progress.lastPlayedLevelId = level.id;
  state.session = createLevelSession(level);
  state.save();

  const screen = document.createElement("main");
  screen.className = `screen market-screen level-${level.id}`;
  screen.innerHTML = `
    <div class="topbar game-topbar screen-inner">
      <button class="btn secondary compact" type="button" data-action="levels">Fases</button>
      <div class="pill owner-pill">Dono da banca: ${state.owner.name}</div>
      <div class="pill">${level.title}</div>
      <div class="pill" data-progress>Pedido 1/${level.numberOfOrders}</div>
      <div class="pill">Moedas ${state.economy.coins}</div>
    </div>
    <section class="screen-inner market-layout">
      <aside class="shelf">
        <h2 class="shelf-title">Prateleira</h2>
        <div class="items-grid"></div>
        <div class="cash-zone">
          <strong>Moedas</strong>
          <div class="coins-grid"></div>
        </div>
      </aside>
      <div class="market-scene">
        <div class="customer-row">
          <div class="animal"></div>
          <div class="speech"></div>
        </div>
        <div class="feedback" aria-live="polite">Toque ou arraste para a cesta.</div>
        <div class="basket-shell">
          <div class="basket" data-drop-zone="basket" aria-label="Cesta"></div>
        </div>
      </div>
      <aside class="basket-zone">
        <h2 class="basket-title">Cesta da banca</h2>
        <div class="counter"><span>Total</span><strong class="total">0</strong></div>
        <div class="stars mini-stars">${starIcons(state.progress.starsByLevel[level.id] ?? 0)}</div>
        <div class="group-track"></div>
        <div class="market-actions">
          <button class="btn" type="button" data-action="confirm">Confirmar</button>
          <button class="btn secondary" type="button" data-action="help">Dica</button>
        </div>
      </aside>
    </section>
  `;

  app.append(screen);

  const session = state.session;
  const basketElement = screen.querySelector(".basket");
  const totalElement = screen.querySelector(".total");
  const speechElement = screen.querySelector(".speech");
  const feedbackElement = screen.querySelector(".feedback");
  const animalElement = screen.querySelector(".animal");
  const itemGrid = screen.querySelector(".items-grid");
  const groupTrack = screen.querySelector(".group-track");
  const coinsGrid = screen.querySelector(".coins-grid");
  const progressElement = screen.querySelector("[data-progress]");

  screen.querySelector('[data-action="levels"]').addEventListener("click", () => router.go("levels"));
  screen.querySelector('[data-action="confirm"]').addEventListener("click", confirmOrder);
  screen.querySelector('[data-action="help"]').addEventListener("click", showHelp);

  renderShelf();
  nextOrder();

  function renderShelf() {
    itemGrid.innerHTML = "";
    for (const item of getAllowedItems(level.allowedItems)) {
      if (item.type === "coin") continue;
      const tile = createItemTile(item);
      enableDragSource(tile, () => ({ kind: "item", itemId: item.id, value: item.value }), handleDrop);
      tile.addEventListener("click", () => addToBasket({ kind: "item", itemId: item.id, value: item.value }));
      itemGrid.append(tile);
    }

    coinsGrid.innerHTML = "";
    for (const coinId of ["coin1", "coin5", "coin10", "note10"]) {
      const coin = getItem(coinId);
      const tile = createCoinTile(coin);
      enableDragSource(tile, () => ({ kind: "coin", itemId: coin.id, value: coin.value }), handleDrop);
      tile.addEventListener("click", () => addToBasket({ kind: "coin", itemId: coin.id, value: coin.value }));
      coinsGrid.append(tile);
    }
  }

  function nextOrder() {
    if (session.orderIndex >= level.numberOfOrders) {
      const reward = applyLevelReward(state, session);
      router.go("result", { levelId: level.id, reward });
      return;
    }

    session.basket = [];
    session.currentOrder = generateOrder(level, state);
    progressElement.textContent = `Pedido ${session.orderIndex + 1}/${level.numberOfOrders}`;
    const animal = getAnimal(level.characterId);
    session.currentAnimal = animal;
    seedBasket(session.currentOrder);
    animalElement.innerHTML = characterSvg(animal.id, "neutral", animal.name);
    animalElement.classList.remove("happy", "unsure");
    speechElement.innerHTML = `<strong>${animal.name}</strong><span>${session.currentOrder.prompt}</span><small>${characterMoodLine(animal, "neutral")}</small>`;
    feedbackElement.textContent = session.currentOrder.type === "payment_exact" || session.currentOrder.type === "change"
      ? "Use moedas para formar o valor pedido."
      : "Toque, arraste ou tire itens da cesta.";
    updateBasket();
  }

  function seedBasket(order) {
    if (!["add_join", "subtract_remove", "complete_missing"].includes(order.type)) return;
    const item = getItem(order.itemId);
    for (let i = 0; i < order.start; i += 1) {
      session.basket.push({ itemId: item.id, value: item.value });
    }
  }

  function handleDrop(payload, target) {
    if (!target?.closest('[data-drop-zone="basket"], .basket-zone')) return;
    addToBasket(payload);
  }

  function addToBasket(payload) {
    const order = session.currentOrder;
    const moneyOrder = order.type === "payment_exact" || order.type === "change";
    if (payload.kind === "coin" && !moneyOrder) return;
    if (payload.kind === "item" && moneyOrder) return;
    const item = getItem(payload.itemId);
    session.basket.push({ itemId: item.id, value: payload.value });
    playSound(payload.kind === "coin" ? "coin" : "drop", state);
    updateBasket(true);
  }

  function removeBasketItem(index) {
    session.basket.splice(index, 1);
    playSound("click", state);
    updateBasket();
  }

  function confirmOrder() {
    const result = validateBasket(session.currentOrder, session.basket);
    if (result.ok) {
      session.successCount += 1;
      session.orderIndex += 1;
      feedbackElement.textContent = positiveFeedback();
      basketElement.classList.add("ready");
      animalElement.classList.add("happy");
      animalElement.innerHTML = characterSvg(session.currentAnimal.id, "happy", session.currentAnimal.name);
      playSound("success", state);
      setTimeout(() => {
        basketElement.classList.remove("ready");
        nextOrder();
      }, state.settings.reducedMotion ? 80 : 760);
      return;
    }

    session.errorCount += 1;
    feedbackElement.textContent = guidanceFeedback(result, session.currentOrder);
    speechElement.querySelector("small").textContent = characterMoodLine(session.currentAnimal, "unsure");
    animalElement.innerHTML = characterSvg(session.currentAnimal.id, "unsure", session.currentAnimal.name);
    basketElement.classList.add("shake");
    renderGhostSlots(result.missing);
    playSound("error", state);
    setTimeout(() => basketElement.classList.remove("shake"), 380);
  }

  function showHelp() {
    session.helpCount += 1;
    const result = validateBasket(session.currentOrder, session.basket);
    feedbackElement.textContent = guidanceFeedback(result, session.currentOrder);
    renderGhostSlots(result.missing);
    highlightCorrectTile();
    playSound("guide", state);
  }

  function updateBasket(animated = false) {
    basketElement.innerHTML = "";
    const compact = session.currentOrder?.compact && session.basket.length > 22;
    if (compact) renderCompactBasket();
    else {
      session.basket.forEach((entry, index) => {
        const item = getItem(entry.itemId);
        const element = document.createElement("button");
        element.className = "basket-item";
        element.type = "button";
        element.title = "Tirar da cesta";
        element.innerHTML = itemSvg(item?.id ?? "apple", item?.name ?? "Item");
        element.addEventListener("click", () => removeBasketItem(index));
        basketElement.append(element);
      });
    }
    const total = getBasketTotal(session.basket);
    totalElement.textContent = total;
    renderGroups(total);
    if (animated) basketElement.classList.add("ready");
    setTimeout(() => basketElement.classList.remove("ready"), 240);
  }

  function renderCompactBasket() {
    const total = getBasketTotal(session.basket);
    const tens = Math.floor(total / 10);
    const ones = total % 10;
    for (let i = 0; i < tens; i += 1) basketElement.append(createBasketButton("crate10", () => removeMany(10)));
    for (let i = 0; i < ones; i += 1) basketElement.append(createBasketButton(session.currentOrder.itemId, () => removeBasketItem(session.basket.length - 1)));
  }

  function createBasketButton(itemId, onClick) {
    const item = getItem(itemId);
    const block = document.createElement("button");
    block.className = "basket-item";
    block.type = "button";
    block.innerHTML = itemSvg(itemId, item?.name ?? "Item");
    block.addEventListener("click", onClick);
    return block;
  }

  function removeMany(amount) {
    session.basket.splice(Math.max(0, session.basket.length - amount), amount);
    updateBasket();
  }

  function renderGhostSlots(count) {
    if (!count || count > 20) return;
    for (let i = 0; i < count; i += 1) {
      const slot = document.createElement("div");
      slot.className = "ghost-slot";
      slot.textContent = "+";
      basketElement.append(slot);
    }
  }

  function renderGroups(total) {
    groupTrack.innerHTML = "";
    const tens = Math.floor(total / 10);
    const units = total % 10;
    for (let i = 0; i < tens; i += 1) {
      const dot = document.createElement("span");
      dot.className = "ten-block";
      dot.textContent = "10";
      groupTrack.append(dot);
    }
    for (let i = 0; i < units; i += 1) {
      const dot = document.createElement("span");
      dot.className = "group-dot";
      groupTrack.append(dot);
    }
  }

  function highlightCorrectTile() {
    const moneyOrder = ["payment_exact", "change"].includes(session.currentOrder.type);
    const selector = moneyOrder ? ".coin-tile" : ".item-tile";
    screen.querySelectorAll(selector).forEach((tile) => tile.classList.add("highlight"));
    setTimeout(() => screen.querySelectorAll(".highlight").forEach((tile) => tile.classList.remove("highlight")), 1300);
  }

  function createItemTile(item) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "item-tile";
    tile.dataset.itemId = item.id;
    tile.innerHTML = `<span class="item-visual">${itemSvg(item.id, item.name)}</span><span class="item-name">${item.name}</span>`;
    return tile;
  }

  function createCoinTile(item) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "coin-tile";
    tile.innerHTML = itemSvg(item.id, item.name);
    return tile;
  }
}
