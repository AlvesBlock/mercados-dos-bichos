import { getLevel } from "../data/levels.js";
import { button } from "../ui/button.js";
import { syncUnlocks } from "../core/progression.js";
import { characterSvg } from "../assets/vector/characters.js";
import { starIcons } from "../assets/vector/icons.js";

export function renderResult({ app, state, router, params }) {
  syncUnlocks(state.progress);
  state.save();
  const level = getLevel(params.levelId);
  const reward = params.reward ?? { stars: state.progress.starsByLevel[level.id] ?? 1, coins: 0 };
  const totalStars = Object.values(state.progress.starsByLevel).reduce((sum, value) => sum + value, 0);
  const isFinal = level.id === 10;
  const screen = document.createElement("main");
  screen.className = `screen result-screen ${isFinal ? "final-result" : ""}`;
  const panel = document.createElement("section");
  panel.className = "result-panel";
  panel.innerHTML = isFinal ? `
    <div class="confetti" aria-hidden="true"></div>
    <h1>Certificado da Banca Premium</h1>
    <div class="final-friends">
      ${["bento", "nina", "tita", "mia", "paco", "dudu", "olga", "nico", "lila", "pipo"].map((id) => characterSvg(id, "happy", id)).join("")}
    </div>
    <p class="result-lead">Boa, ${state.owner.name}! Sua banca brilhou no grande dia.</p>
    <div class="certificate">
      <strong>Dono(a) da banca</strong>
      <span>${state.owner.name}</span>
      <small>${totalStars} estrelas conquistadas · ${state.economy.coins} moedas guardadas</small>
    </div>
  ` : `
    <h1>Boa, ${state.owner.name}! Sua banca brilhou!</h1>
    <div class="animal happy">${characterSvg(level.characterId, "happy", "Personagem feliz")}</div>
    <p class="stars result-stars">${starIcons(reward.stars)}</p>
    <p>Você ganhou ${reward.coins} moedas.</p>
    <p class="result-lead">${level.id < 10 ? `A fase ${Math.min(10, level.id + 1)} ficou mais perto da feira.` : "A feira está completa."}</p>
  `;
  const actions = document.createElement("div");
  actions.className = "result-actions";
  if (level.id < 10) {
    actions.append(button("Próxima fase", { onClick: () => router.go("market", { levelId: Math.min(10, level.id + 1) }) }));
  }
  actions.append(
    button("Repetir fase", { variant: "secondary", onClick: () => router.go("market", { levelId: level.id }) }),
    button("Mapa", { variant: "secondary", onClick: () => router.go("levels") }),
    button("Menu", { variant: "secondary", onClick: () => router.go("menu") }),
  );
  panel.append(actions);
  screen.append(panel);
  app.append(screen);
}
