import { levels } from "../data/levels.js";
import { loadGameState, saveGameState } from "./storage.js";

export function createGameState() {
  const data = loadGameState();
  return {
    ...data,
    currentLevel: levels.find((level) => level.id === data.progress.currentLevelId) ?? levels[0],
    session: null,
    save() {
      const saved = saveGameState({
        version: this.version,
        owner: this.owner,
        progress: this.progress,
        economy: this.economy,
        settings: this.settings,
        learning: this.learning,
        session: this.sessionMeta ?? this.session,
      });
      this.version = saved.version;
      this.owner = saved.owner;
      this.progress = saved.progress;
      this.economy = saved.economy;
      this.settings = saved.settings;
      this.learning = saved.learning;
    },
    replace(next) {
      this.version = next.version;
      this.owner = next.owner;
      this.progress = next.progress;
      this.economy = next.economy;
      this.settings = next.settings;
      this.learning = next.learning;
      this.sessionMeta = next.session;
      this.currentLevel = levels.find((level) => level.id === next.progress.currentLevelId) ?? levels[0];
    },
  };
}

export function createLevelSession(level) {
  return {
    level,
    orderIndex: 0,
    successCount: 0,
    helpCount: 0,
    errorCount: 0,
    basket: [],
    coinBasket: [],
    currentOrder: null,
    completed: false,
  };
}
