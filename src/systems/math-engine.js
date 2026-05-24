import { getAllowedItems } from "../data/items.js";
import { getDifficultyForPlayer } from "../core/progression.js";

let orderCounter = 0;

export function generateOrder(level, stateOrProgress = {}) {
  const difficulty = getDifficultyForPlayer(stateOrProgress, level);
  const example = level.examples[orderCounter % level.examples.length];
  const item = pick(getAllowedItems(level.allowedItems).filter((entry) => entry.type !== "coin")) ?? getAllowedItems(level.allowedItems)[0];
  orderCounter += 1;

  if (level.operationType === "grand_final") {
    return generateOrder({ ...level, operationType: example.type, examples: [example] }, stateOrProgress);
  }

  if (level.operationType === "mixed_change" || level.operationType === "fluency") {
    return example.b < 0
      ? subtractOrder(level, item, example.a, Math.abs(example.b))
      : addOrder(level, item, example.a, example.b + (difficulty === "harder" ? 1 : 0));
  }

  if (level.operationType === "add_join" || level.operationType === "large_add") {
    if (Number.isFinite(example.target)) return completeOrder(level, item, example.current, example.target);
    return addOrder(level, item, example.a, example.b + (difficulty === "harder" ? 1 : 0));
  }

  if (level.operationType === "subtract_remove") return subtractOrder(level, item, example.a, example.b);
  if (level.operationType === "complete_missing") return completeOrder(level, item, example.current, example.target);
  if (level.operationType === "payment_exact") return paymentOrder(level, item, example.price);
  if (level.operationType === "change") return changeOrder(level, item, example.paid, example.price);
  if (level.operationType === "tens_units") return tensOrder(level, item, example.target);

  throw new Error(`Tipo de fase desconhecido: ${level.operationType}`);
}

export function validateBasket(order, basket) {
  if (!order || !Array.isArray(basket)) return { ok: false, reason: "basket_invalid" };
  const total = getBasketTotal(basket);
  if (!Number.isFinite(total) || total < 0) return { ok: false, reason: "basket_invalid" };
  return {
    ok: total === order.target,
    total,
    missing: Math.max(0, order.target - total),
    extra: Math.max(0, total - order.target),
  };
}

export function calculateMissing(target, current) {
  return Math.max(0, target - current);
}

export function calculateChange(paid, price) {
  return Math.max(0, paid - price);
}

export function splitTensUnits(value) {
  return {
    tens: Math.floor(value / 10),
    units: value % 10,
  };
}

export function getBasketTotal(basket) {
  return basket.reduce((sum, entry) => sum + getEntryValue(entry), 0);
}

function addOrder(level, item, startValue, changeValue) {
  const start = clamp(startValue, 0, level.maxValue);
  const change = clamp(changeValue, 1, level.maxValue);
  const target = clamp(start + change, level.minValue, level.maxValue);
  return {
    id: createId(),
    type: "add_join",
    itemId: item.id,
    start: Math.max(0, target - change),
    change: target - Math.max(0, target - change),
    target,
    prompt: `Eu já tenho ${Math.max(0, target - change)} ${item.name.toLowerCase()}. Pode colocar mais ${target - Math.max(0, target - change)} para mim?`,
    hint: `A cesta precisa terminar com ${target}.`,
  };
}

function subtractOrder(level, item, startValue, removeValue) {
  const start = clamp(startValue, level.minValue, level.maxValue);
  const remove = clamp(removeValue, 1, start);
  return {
    id: createId(),
    type: "subtract_remove",
    itemId: item.id,
    start,
    remove,
    target: start - remove,
    prompt: `Tem ${start} ${item.name.toLowerCase()} na cesta. Agora precisamos tirar ${remove}.`,
    hint: `Toque nos itens da cesta até sobrarem ${start - remove}.`,
  };
}

function completeOrder(level, item, currentValue, targetValue) {
  const target = clamp(targetValue, level.minValue, level.maxValue);
  const current = clamp(currentValue, 0, target);
  return {
    id: createId(),
    type: "complete_missing",
    itemId: item.id,
    start: current,
    target,
    missing: calculateMissing(target, current),
    prompt: `Eu quero ${target} ${item.name.toLowerCase()}. Já temos ${current}. Vamos completar?`,
    hint: `Faltam ${calculateMissing(target, current)} para a cesta ficar certinha.`,
  };
}

function paymentOrder(level, item, priceValue) {
  const price = clamp(priceValue, level.minValue, level.maxValue);
  return {
    id: createId(),
    type: "payment_exact",
    itemId: item.id,
    price,
    start: 0,
    target: price,
    prompt: `${item.name} custa ${price}. Vamos pagar o valor certinho com moedas?`,
    hint: `As moedas precisam somar ${price}.`,
  };
}

function changeOrder(level, item, paidValue, priceValue) {
  const paid = clamp(paidValue, 1, 10);
  const price = clamp(priceValue, level.minValue, paid);
  const change = calculateChange(paid, price);
  return {
    id: createId(),
    type: "change",
    itemId: item.id,
    paid,
    price,
    start: 0,
    target: change,
    prompt: `${item.name} custa ${price}. O cliente deu ${paid}. Qual troco volta?`,
    hint: `Devolva moedas que somem ${change}.`,
  };
}

function tensOrder(level, item, targetValue) {
  const target = clamp(targetValue, level.minValue, level.maxValue);
  const parts = splitTensUnits(target);
  return {
    id: createId(),
    type: "tens_units",
    itemId: item.id === "crate10" ? "apple" : item.id,
    start: 0,
    target,
    compact: true,
    prompt: `Vamos montar ${target}: ${parts.tens} caixa(s) de 10 e ${parts.units} unidade(s).`,
    hint: `Use caixas de 10 e unidades para chegar em ${target}.`,
  };
}

function getEntryValue(entry) {
  if (!entry || typeof entry !== "object") return 0;
  return Number.isFinite(entry.value) ? Math.max(0, entry.value) : 1;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)] ?? list[0];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value)));
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `order-${Date.now()}-${orderCounter}`;
}
