import { levels } from "../data/levels.js";

export function isLevelUnlocked(level, progress) {
  if (progress.unlockedLevelIds?.includes(level.id)) return true;
  if (!level.unlockCondition) return true;
  return (progress.starsByLevel[level.unlockCondition.levelId] ?? 0) >= level.unlockCondition.stars;
}

export function syncUnlocks(progress) {
  const unlocked = new Set(progress.unlockedLevelIds ?? [1]);
  for (const level of levels) {
    if (isLevelUnlocked(level, progress)) unlocked.add(level.id);
  }
  progress.unlockedLevelIds = [...unlocked].sort((a, b) => a - b);
  return progress;
}

export function getDifficultyForPlayer(stateOrProgress, level) {
  const progress = stateOrProgress.progress ?? stateOrProgress;
  const stars = progress.starsByLevel?.[level.id] ?? 0;
  const misses = stateOrProgress.session?.errorCount ?? 0;
  const streak = stateOrProgress.session?.successCount ?? 0;
  if (streak >= 3 || stars >= 3) return "harder";
  if (misses >= 3) return "gentle";
  return "normal";
}

export function getNextLevelId(levelId) {
  const index = levels.findIndex((level) => level.id === Number(levelId));
  return levels[Math.min(index + 1, levels.length - 1)]?.id ?? Number(levelId);
}
