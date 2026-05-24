import { button } from "../ui/button.js";
import { getAnimal } from "../data/animals.js";
import { getItem } from "../data/items.js";
import { playSound } from "../systems/audio-system.js";
import { itemSvg } from "../assets/vector/items.js";
import { characterSvg } from "../assets/vector/characters.js";

const steps = [
  { text: "O Coelho Bento já colocou 1 maçã na cesta. Agora ele quer mais 2.", target: 3, item: "apple" },
  { text: "Agora vamos tirar 1 maçã para deixar a cesta certinha.", target: 2, item: "apple", remove: true },
  { text: "Paco quer pagar 5 moedas pelo brinquedo.", target: 5, item: "coin5", money: true },
  { text: "Olga usa uma caixa de 10 e mais 3 unidades para fazer 13.", target: 13, item: "crate10", tens: true },
];

export function renderTutorial({ app, state, router }) {
  let step = 0;
  const basketEntries = [{ itemId: "apple", value: 1 }];
  const bento = getAnimal("bento");
  const screen = document.createElement("main");
  screen.className = "screen market-screen tutorial-screen";
  screen.innerHTML = `
    <div class="topbar screen-inner">
      <button class="btn secondary compact" type="button">Menu</button>
      <div class="pill">Modo Aprendizagem</div>
    </div>
    <section class="screen-inner market-layout">
      <aside class="shelf">
        <h2 class="shelf-title">Prateleira</h2>
        <div class="items-grid">
          ${["apple", "crate10", "coin1", "coin5"].map((id) => tileMarkup(id)).join("")}
        </div>
      </aside>
      <div class="market-scene">
        <div class="customer-row">
          <div class="animal">${characterSvg("bento", "neutral", bento.name)}</div>
          <div class="speech"></div>
        </div>
        <div class="feedback">Siga a mãozinha. Você também pode tocar nos itens.</div>
        <div class="basket-shell"><div class="basket" data-drop-zone="basket"></div></div>
      </div>
      <aside class="basket-zone">
        <h2 class="basket-title">Cesta de treino</h2>
        <div class="counter"><span>Total</span><strong class="total">1</strong></div>
        <button class="btn" type="button" data-action="next">Próximo</button>
        <button class="btn secondary" type="button" data-action="repeat">Repetir</button>
        <button class="btn secondary" type="button" data-action="play">Jogar agora</button>
      </aside>
    </section>
    <div class="tutorial-overlay"><div class="hand">⌄</div></div>
  `;

  const basket = screen.querySelector(".basket");
  const total = screen.querySelector(".total");
  const speech = screen.querySelector(".speech");
  const feedback = screen.querySelector(".feedback");
  const hand = screen.querySelector(".hand");

  screen.querySelector(".topbar button").addEventListener("click", () => router.go("menu"));
  screen.querySelector('[data-action="next"]').addEventListener("click", nextStep);
  screen.querySelector('[data-action="repeat"]').addEventListener("click", reset);
  screen.querySelector('[data-action="play"]').addEventListener("click", () => {
    state.learning.tutorialSeen = true;
    state.save();
    router.go("levels");
  });
  screen.querySelectorAll(".item-tile").forEach((tile) => {
    tile.addEventListener("click", () => act(tile.dataset.itemId));
  });

  app.append(screen);
  update();

  function act(itemId) {
    const current = steps[step];
    if (current.remove) {
      basketEntries.pop();
    } else if (current.tens && itemId === "crate10") {
      basketEntries.push({ itemId: "crate10", value: 10 }, { itemId: "apple", value: 1 }, { itemId: "apple", value: 1 });
    } else {
      const item = getItem(itemId);
      basketEntries.push({ itemId: item.id, value: item.value });
    }
    playSound(current.money ? "coin" : "drop", state);
    const sum = basketEntries.reduce((acc, entry) => acc + entry.value, 0);
    if (sum >= current.target || current.remove) nextStep();
    update();
  }

  function nextStep() {
    step = Math.min(step + 1, steps.length - 1);
    if (step === steps.length - 1) {
      state.learning.tutorialSeen = true;
      state.save();
      feedback.textContent = "Treino salvo. Você pode repetir quando quiser.";
    }
    update();
  }

  function reset() {
    step = 0;
    basketEntries.splice(0, basketEntries.length, { itemId: "apple", value: 1 });
    update();
  }

  function update() {
    const current = steps[step];
    speech.innerHTML = `<strong>${bento.name}</strong><span>${current.text}</span><small>Sem pressa. Vamos praticar brincando.</small>`;
    basket.innerHTML = basketEntries.map((entry) => `<button class="basket-item" type="button">${itemSvg(entry.itemId, "Item")}</button>`).join("");
    total.textContent = basketEntries.reduce((acc, entry) => acc + entry.value, 0);
    const active = screen.querySelector(`[data-item-id="${current.item}"]`) ?? screen.querySelector(".item-tile");
    const rect = active.getBoundingClientRect();
    hand.style.left = `${rect.left + rect.width * 0.55}px`;
    hand.style.top = `${rect.top + rect.height * 0.2}px`;
  }
}

function tileMarkup(id) {
  const item = getItem(id);
  return `<button class="item-tile" type="button" data-item-id="${id}">
    <span class="item-visual">${itemSvg(id, item.name)}</span>
    <span class="item-name">${item.name}</span>
  </button>`;
}
