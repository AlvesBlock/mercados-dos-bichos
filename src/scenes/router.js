import { renderMenu } from "./menu-scene.js";
import { renderTutorial } from "./tutorial-scene.js";
import { renderLevelSelect } from "./level-select-scene.js";
import { renderMarket } from "./market-scene.js";
import { renderResult } from "./result-scene.js";
import { renderSettings } from "./settings-scene.js";
import { renderProfile } from "./profile-scene.js";

export function createRouter(app, state) {
  const router = {
    go(scene, params = {}) {
      app.innerHTML = "";
      const context = { app, state, router, params };
      const scenes = {
        menu: renderMenu,
        tutorial: renderTutorial,
        levels: renderLevelSelect,
        market: renderMarket,
        result: renderResult,
        settings: renderSettings,
        profile: renderProfile,
      };
      scenes[scene](context);
    },
  };
  return router;
}
