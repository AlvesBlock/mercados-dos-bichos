import assert from "node:assert/strict";
import { levels } from "../src/data/levels.js";
import {
  clearAllGameData,
  completeLevel,
  createDefaultState,
  loadGameState,
  migrateStorage,
  resetProgressKeepingOwner,
  sanitizeOwnerName,
  sanitizeProgress,
  updateOwnerName,
} from "../src/core/storage.js";
import { isLevelUnlocked } from "../src/core/progression.js";
import { calculateStars, calculateCoinReward } from "../src/systems/reward-system.js";
import { calculateChange, calculateMissing, generateOrder, splitTensUnits, validateBasket } from "../src/systems/math-engine.js";

installLocalStorageMock();

const initial = createDefaultState();
assert.equal(initial.version, 2);
assert.deepEqual(initial.progress.unlockedLevelIds, [1]);
assert.equal(initial.owner.name, "");

for (const level of levels) {
  for (let index = 0; index < 12; index += 1) {
    const order = generateOrder(level, initial);
    assert.ok(order.target >= 0, `${level.id} target negativo`);
    assert.ok(order.target <= level.maxValue, `${level.id} target fora da faixa`);
    assert.equal(validateBasket(order, [{ value: order.target }]).ok, true);
    assert.equal(validateBasket(order, [{ value: order.target + 1 }]).ok, false);
  }
}

assert.equal(levels.length, 10);
assert.equal(calculateMissing(8, 5), 3);
assert.equal(calculateMissing(5, 8), 0);
assert.equal(calculateChange(10, 4), 6);
assert.equal(calculateChange(4, 10), 0);
assert.deepEqual(splitTensUnits(23), { tens: 2, units: 3 });
assert.equal(sanitizeProgress(null).currentLevelId, 1);
assert.equal(sanitizeProgress({ unlockedLevelIds: [] }).unlockedLevelIds[0], 1);
assert.equal(sanitizeOwnerName("  Ana   Clara  "), "Ana Clara");
assert.equal(sanitizeOwnerName("a".repeat(40)).length, 24);

let saved = updateOwnerName("  Carlos  ");
assert.equal(saved.owner.name, "Carlos");
assert.equal(loadGameState().owner.name, "Carlos");

saved.settings.highContrast = true;
saved.settings.fontScale = "large";
saved = loadGameState();
saved.settings.highContrast = true;
saved.settings.fontScale = "large";
saved = updateOwnerName("Carlos Lima", saved);
assert.equal(saved.settings.highContrast, true);
assert.equal(saved.settings.fontScale, "large");

let completed = completeLevel(1, { stars: 3, coins: 12, completedOrders: 4 }, saved);
assert.equal(completed.progress.starsByLevel[1], 3);
assert.ok(completed.progress.unlockedLevelIds.includes(2));
assert.equal(completed.economy.coins, 12);
assert.equal(isLevelUnlocked(levels[1], completed.progress), true);

completed = completeLevel(2, { stars: 2, coins: 8, completedOrders: 5 }, completed);
assert.ok(completed.progress.completedLevelIds.includes(2));
assert.equal(completed.progress.starsByLevel[2], 2);
assert.equal(completed.economy.totalCoinsEarned, 20);

const reset = resetProgressKeepingOwner(completed);
assert.equal(reset.owner.name, "Carlos Lima");
assert.deepEqual(reset.progress.unlockedLevelIds, [1]);
assert.equal(reset.economy.coins, 0);
assert.equal(reset.settings.highContrast, true);

const cleared = clearAllGameData();
assert.equal(cleared.owner.name, "");
assert.equal(globalThis.localStorage.getItem("mercadoDosBichinhos:v2"), null);

globalThis.localStorage.setItem("mercadoDosBichinhos:v2", "{bad json");
assert.equal(loadGameState().progress.currentLevelId, 1);

const migrated = migrateStorage({
  currentLevelId: "5-1",
  unlockedLevels: ["1-1", "5-1"],
  starsByLevel: { "1-1": 3 },
  marketCoins: 40,
  hasSeenTutorial: true,
  settings: { sound: false, music: true, animationSpeed: 0.8 },
});
assert.equal(migrated.progress.currentLevelId, 5);
assert.ok(migrated.progress.unlockedLevelIds.includes(5));
assert.equal(migrated.progress.starsByLevel[1], 3);
assert.equal(migrated.economy.coins, 40);
assert.equal(migrated.learning.tutorialSeen, true);
assert.equal(migrated.settings.soundEnabled, false);
assert.equal(migrated.settings.reducedMotion, true);

assert.equal(calculateStars({ errorCount: 0, helpCount: 1 }), 3);
assert.equal(calculateStars({ errorCount: 2, helpCount: 3 }), 2);
assert.equal(calculateStars({ errorCount: 4, helpCount: 0 }), 1);
assert.equal(calculateCoinReward({ reward: { coins: 10 } }, { successCount: 3, errorCount: 1, helpCount: 1 }), 13);

const paymentLevel = levels.find((level) => level.operationType === "payment_exact");
const paymentOrder = generateOrder(paymentLevel, initial);
assert.equal(paymentOrder.type, "payment_exact");
assert.equal(validateBasket(paymentOrder, [{ value: paymentOrder.target }]).ok, true);

const tensLevel = levels.find((level) => level.operationType === "tens_units");
const tensOrder = generateOrder(tensLevel, initial);
assert.equal(tensOrder.type, "tens_units");
assert.equal(validateBasket(tensOrder, [{ value: Math.floor(tensOrder.target / 10) * 10 }, { value: tensOrder.target % 10 }]).ok, true);

console.log("Todos os testes passaram.");

function installLocalStorageMock() {
  const store = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}
