export function positiveFeedback() {
  return pick([
    "Oba! Agora a cesta ficou certinha.",
    "Muito bem! Pedido pronto para a feira.",
    "Que contagem bonita!",
    "Você ajudou a banca a brilhar.",
  ]);
}

export function guidanceFeedback(result, order) {
  if (result.reason === "basket_invalid") return "Vamos tentar com os itens da prateleira.";
  if (result.missing > 0) return `Quase! Faltam só ${result.missing}. Vamos completar juntos.`;
  if (result.extra > 0) return `Tem ${result.extra} a mais. Vamos tirar um pouquinho?`;
  return order?.hint ?? "Vamos contar de novo, sem pressa.";
}

export function characterMoodLine(animal, mood = "neutral") {
  return animal?.lines?.[mood] ?? "Vamos contar juntos?";
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
