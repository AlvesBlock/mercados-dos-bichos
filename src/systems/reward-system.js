import { completeLevel } from "../core/storage.js";

export function calculateStars(session) {
  if (session.errorCount === 0 && session.helpCount <= 1) return 3;
  if (session.errorCount <= 2 && session.helpCount <= 3) return 2;
  return 1;
}

export function calculateCoinReward(level, session) {
  const base = level.reward?.coins ?? 10;
  const streakBonus = Math.min(10, session.successCount * 2);
  const helpPenalty = session.helpCount;
  const errorPenalty = session.errorCount * 2;
  return Math.max(4, base + streakBonus - helpPenalty - errorPenalty);
}

export function applyLevelReward(state, session) {
  const level = session.level;
  const stars = calculateStars(session);
  const coins = calculateCoinReward(level, session);
  const saved = completeLevel(level.id, {
    stars,
    coins,
    completedOrders: session.successCount,
    score: coins + stars * 25,
  }, state);
  state.replace(saved);
  return { stars, coins };
}
