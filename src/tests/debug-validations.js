import { levels } from "../data/levels.js";
import { generateOrder, validateBasket, calculateChange, calculateMissing } from "../systems/math-engine.js";
import { defaultGameState, sanitizeProgress } from "../core/storage.js";

export function runDebugValidations() {
  const failures = [];
  for (const level of levels) {
    for (let i = 0; i < 10; i += 1) {
      const order = generateOrder(level, defaultGameState);
      if (order.target < 0) failures.push(`${level.id}: alvo negativo`);
      if (order.target > level.maxValue && !["change", "payment_exact"].includes(level.operationType)) failures.push(`${level.id}: alvo fora da fase`);
      if (order.type === "change" && calculateChange(order.paid, order.price) < 0) failures.push(`${level.id}: troco negativo`);
      const result = validateBasket(order, [{ value: order.target }]);
      if (!result.ok) failures.push(`${level.id}: validação falhou`);
    }
  }

  if (calculateMissing(8, 5) !== 3) failures.push("falta 8-5 falhou");
  if (calculateChange(10, 4) !== 6) failures.push("troco 10-4 falhou");
  if (!sanitizeProgress("{bad").unlockedLevelIds) failures.push("storage corrompido falhou");

  return {
    ok: failures.length === 0,
    failures,
  };
}
