export const STORAGE_KEY = "mercadoDosBichinhos:v2";
export const LEGACY_STORAGE_KEY = "mercadoDosBichinhos.progress.v1";
export const STORAGE_VERSION = 2;

export function createDefaultState(now = new Date().toISOString()) {
  return {
    version: STORAGE_VERSION,
    owner: {
      name: "",
      createdAt: null,
      updatedAt: null,
    },
    progress: {
      unlockedLevelIds: [1],
      completedLevelIds: [],
      currentLevelId: 1,
      lastPlayedLevelId: 1,
      starsByLevel: {},
      bestScoreByLevel: {},
      completedOrdersByLevel: {},
    },
    economy: {
      coins: 0,
      totalCoinsEarned: 0,
    },
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      reducedMotion: false,
      highContrast: false,
      fontScale: "normal",
    },
    learning: {
      tutorialSeen: false,
      lastTipShownAt: null,
    },
    session: {
      lastScene: "menu",
      lastSavedAt: now,
    },
  };
}

export const defaultGameState = createDefaultState();
export const defaultProgress = defaultGameState.progress;

export function loadGameState() {
  const storage = getStorage();
  if (!storage) return createDefaultState();

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) return sanitizeGameState(JSON.parse(raw));

    const legacyRaw = storage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const migrated = migrateStorage(JSON.parse(legacyRaw));
      saveGameState(migrated);
      return migrated;
    }
  } catch {
    return createDefaultState();
  }

  return createDefaultState();
}

export function saveGameState(partialState = {}) {
  const storage = getStorage();
  const current = partialState.version ? createDefaultState() : loadGameState();
  const merged = sanitizeGameState(deepMerge(current, partialState));
  merged.session.lastSavedAt = new Date().toISOString();
  if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function migrateStorage(oldData) {
  const next = createDefaultState();
  if (!oldData || typeof oldData !== "object") return next;

  const currentLevelId = normalizeLevelId(oldData.currentLevelId) ?? 1;
  const unlockedLevelIds = normalizeIdList(oldData.unlockedLevels);
  const starsByLevel = normalizeRecord(oldData.starsByLevel);

  next.progress.currentLevelId = currentLevelId;
  next.progress.lastPlayedLevelId = currentLevelId;
  next.progress.unlockedLevelIds = unlockedLevelIds.length ? unlockedLevelIds : [1];
  next.progress.completedLevelIds = Object.keys(starsByLevel).map(Number).filter((id) => starsByLevel[id] > 0);
  next.progress.starsByLevel = starsByLevel;
  next.economy.coins = clampNumber(oldData.marketCoins, 0, 99999, 0);
  next.economy.totalCoinsEarned = next.economy.coins;
  next.settings.soundEnabled = Boolean(oldData.settings?.sound ?? true);
  next.settings.musicEnabled = Boolean(oldData.settings?.music ?? true);
  next.settings.reducedMotion = Number(oldData.settings?.animationSpeed ?? 1) < 0.9;
  next.learning.tutorialSeen = Boolean(oldData.hasSeenTutorial);
  return sanitizeGameState(next);
}

export function sanitizeGameState(value) {
  const fallback = createDefaultState();
  if (!value || typeof value !== "object") return fallback;

  const ownerName = sanitizeOwnerName(value.owner?.name ?? "");
  const createdAt = validDate(value.owner?.createdAt) ? value.owner.createdAt : ownerName ? fallback.session.lastSavedAt : null;
  const updatedAt = validDate(value.owner?.updatedAt) ? value.owner.updatedAt : createdAt;
  const unlockedLevelIds = normalizeIdList(value.progress?.unlockedLevelIds);
  const completedLevelIds = normalizeIdList(value.progress?.completedLevelIds);

  return {
    version: STORAGE_VERSION,
    owner: {
      name: ownerName,
      createdAt,
      updatedAt,
    },
    progress: {
      unlockedLevelIds: unlockedLevelIds.length ? unlockedLevelIds : [1],
      completedLevelIds,
      currentLevelId: normalizeLevelId(value.progress?.currentLevelId) ?? 1,
      lastPlayedLevelId: normalizeLevelId(value.progress?.lastPlayedLevelId) ?? 1,
      starsByLevel: normalizeRecord(value.progress?.starsByLevel),
      bestScoreByLevel: normalizeRecord(value.progress?.bestScoreByLevel),
      completedOrdersByLevel: normalizeRecord(value.progress?.completedOrdersByLevel),
    },
    economy: {
      coins: clampNumber(value.economy?.coins, 0, 99999, 0),
      totalCoinsEarned: clampNumber(value.economy?.totalCoinsEarned, 0, 999999, 0),
    },
    settings: {
      soundEnabled: value.settings?.soundEnabled !== false,
      musicEnabled: value.settings?.musicEnabled !== false,
      reducedMotion: Boolean(value.settings?.reducedMotion),
      highContrast: Boolean(value.settings?.highContrast),
      fontScale: value.settings?.fontScale === "large" ? "large" : "normal",
    },
    learning: {
      tutorialSeen: Boolean(value.learning?.tutorialSeen),
      lastTipShownAt: validDate(value.learning?.lastTipShownAt) ? value.learning.lastTipShownAt : null,
    },
    session: {
      lastScene: typeof value.session?.lastScene === "string" ? value.session.lastScene : "menu",
      lastSavedAt: validDate(value.session?.lastSavedAt) ? value.session.lastSavedAt : fallback.session.lastSavedAt,
    },
  };
}

export function updateOwnerName(name, state = loadGameState()) {
  const cleanName = sanitizeOwnerName(name);
  if (cleanName.length < 2) throw new Error("owner_name_invalid");
  const now = new Date().toISOString();
  return saveGameState({
    ...state,
    owner: {
      name: cleanName,
      createdAt: state.owner?.createdAt ?? now,
      updatedAt: now,
    },
  });
}

export function resetProgressKeepingOwner(state = loadGameState()) {
  const fresh = createDefaultState();
  return saveGameState({
    ...fresh,
    owner: state.owner,
    settings: state.settings,
  });
}

export function clearAllGameData() {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(LEGACY_STORAGE_KEY);
  }
  return createDefaultState();
}

export function unlockNextLevel(currentLevelId, state = loadGameState()) {
  const id = normalizeLevelId(currentLevelId) ?? 1;
  const nextId = Math.min(10, id + 1);
  const unlocked = new Set(state.progress.unlockedLevelIds);
  unlocked.add(1);
  unlocked.add(nextId);
  return saveGameState({
    ...state,
    progress: {
      ...state.progress,
      unlockedLevelIds: [...unlocked].sort((a, b) => a - b),
      currentLevelId: nextId,
    },
  });
}

export function completeLevel(levelId, result = {}, state = loadGameState()) {
  const id = normalizeLevelId(levelId) ?? 1;
  const stars = clampNumber(result.stars, 1, 3, 1);
  const coins = clampNumber(result.coins, 0, 999, 0);
  const unlocked = new Set(state.progress.unlockedLevelIds);
  const completed = new Set(state.progress.completedLevelIds);
  completed.add(id);
  unlocked.add(1);
  if (id < 10) unlocked.add(id + 1);

  return saveGameState({
    ...state,
    progress: {
      ...state.progress,
      unlockedLevelIds: [...unlocked].sort((a, b) => a - b),
      completedLevelIds: [...completed].sort((a, b) => a - b),
      currentLevelId: Math.min(10, id + 1),
      lastPlayedLevelId: id,
      starsByLevel: {
        ...state.progress.starsByLevel,
        [id]: Math.max(state.progress.starsByLevel[id] ?? 0, stars),
      },
      bestScoreByLevel: {
        ...state.progress.bestScoreByLevel,
        [id]: Math.max(state.progress.bestScoreByLevel[id] ?? 0, result.score ?? coins),
      },
      completedOrdersByLevel: {
        ...state.progress.completedOrdersByLevel,
        [id]: Math.max(state.progress.completedOrdersByLevel[id] ?? 0, result.completedOrders ?? 0),
      },
    },
    economy: {
      coins: state.economy.coins + coins,
      totalCoinsEarned: state.economy.totalCoinsEarned + coins,
    },
  });
}

export function loadProgress() {
  return loadGameState().progress;
}

export function saveProgress(progress) {
  return saveGameState({ progress }).progress;
}

export function resetProgress() {
  return resetProgressKeepingOwner().progress;
}

export function sanitizeProgress(value) {
  return sanitizeGameState({ progress: value }).progress;
}

export function sanitizeOwnerName(name) {
  return String(name ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

function normalizeIdList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(normalizeLevelId).filter(Boolean))].sort((a, b) => a - b);
}

function normalizeLevelId(value) {
  if (Number.isInteger(value)) return clampNumber(value, 1, 10, 1);
  if (typeof value === "string") {
    const direct = Number(value);
    if (Number.isInteger(direct)) return clampNumber(direct, 1, 10, 1);
    const match = value.match(/\d+/);
    if (match) return clampNumber(Number(match[0]), 1, 10, 1);
  }
  return null;
}

function normalizeRecord(value) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entry]) => [String(normalizeLevelId(key)), clampNumber(entry, 0, 999999, 0)])
      .filter(([key]) => key !== "null"),
  );
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function validDate(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function getStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object") return base;
  const output = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = deepMerge(base?.[key] ?? {}, value);
    } else {
      output[key] = value;
    }
  }
  return output;
}
