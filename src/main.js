import { createGameState } from "./core/game-state.js";
import { createRouter } from "./scenes/router.js";
import { runDebugValidations } from "./tests/debug-validations.js";
import { unlockAudio } from "./systems/audio-system.js";

const app = document.querySelector("#app");
const state = createGameState();
const router = createRouter(app, state);

window.MercadoDosBichinhos = {
  state,
  go: router.go,
  debug: runDebugValidations,
};

document.addEventListener("pointerdown", unlockAudio, { once: true });
document.body.classList.toggle("reduced-motion", state.settings.reducedMotion);
document.body.classList.toggle("high-contrast", state.settings.highContrast);
document.body.classList.toggle("font-large", state.settings.fontScale === "large");

if (!state.owner.name) {
  router.go("profile", { next: "tutorial" });
} else if (!state.learning.tutorialSeen) {
  router.go("tutorial");
} else {
  router.go("menu");
}
