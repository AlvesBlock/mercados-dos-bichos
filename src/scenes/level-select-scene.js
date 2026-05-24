import { levels, getWorld } from "../data/levels.js";
import { getAnimal } from "../data/animals.js";
import { button } from "../ui/button.js";
import { isLevelUnlocked, syncUnlocks } from "../core/progression.js";
import { characterSvg } from "../assets/vector/characters.js";
import { lockIcon, starIcons } from "../assets/vector/icons.js";

export function renderLevelSelect({ app, state, router }) {
  syncUnlocks(state.progress);
  state.save();

  const screen = document.createElement("main");
  screen.className = "screen map-screen";
  const inner = document.createElement("section");
  inner.className = "screen-inner map-inner";
  inner.innerHTML = `
    <div class="topbar">
      <button class="btn secondary" type="button">Voltar</button>
      <div class="pill">Moedas ${state.economy.coins}</div>
      <div class="pill">Estrelas ${totalStars(state.progress)}</div>
    </div>
    <header class="map-header">
      <h1>Mapa da feira</h1>
      <p>Escolha a próxima banca e ajude os bichinhos a contar.</p>
    </header>
  `;
  inner.querySelector("button").addEventListener("click", () => router.go("menu"));

  const path = document.createElement("div");
  path.className = "progress-map";
  for (const level of levels) {
    const world = getWorld(level.worldId);
    const animal = getAnimal(level.characterId);
    const unlocked = isLevelUnlocked(level, state.progress);
    const stars = state.progress.starsByLevel[level.id] ?? 0;
    const card = document.createElement("button");
    card.type = "button";
    card.className = `map-node ${unlocked ? "unlocked" : "locked"} ${state.progress.currentLevelId === level.id ? "current" : ""}`;
    card.disabled = !unlocked;
    card.style.setProperty("--node-color", world.color);
    card.innerHTML = `
      <span class="node-number">${level.id}</span>
      <span class="node-character">${characterSvg(animal.id, unlocked ? "neutral" : "unsure", animal.name)}</span>
      <span class="node-copy">
        <strong>${level.title}</strong>
        <small>${level.subtitle}</small>
        <small>${unlocked ? level.description : `Desbloqueia após a fase ${level.unlockCondition?.levelId ?? 1}`}</small>
      </span>
      <span class="stars">${unlocked ? starIcons(stars) : lockIcon()}</span>
    `;
    card.addEventListener("click", () => router.go("market", { levelId: level.id }));
    path.append(card);
  }

  inner.append(path);
  screen.append(inner);
  app.append(screen);
}

function totalStars(progress) {
  return Object.values(progress.starsByLevel).reduce((sum, stars) => sum + stars, 0);
}
