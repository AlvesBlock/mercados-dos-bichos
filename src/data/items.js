export const items = [
  { id: "apple", name: "Maçã", type: "fruit", value: 1, price: 2, color: "#e84d4d" },
  { id: "banana", name: "Banana", type: "fruit", value: 1, price: 2, color: "#f7c948" },
  { id: "orange", name: "Laranja", type: "fruit", value: 1, price: 3, color: "#f59e2e" },
  { id: "grape", name: "Uva", type: "fruit", value: 1, price: 4, color: "#7f5fc4" },
  { id: "strawberry", name: "Morango", type: "fruit", value: 1, price: 4, color: "#e9435f" },
  { id: "carrot", name: "Cenoura", type: "fruit", value: 1, price: 3, color: "#f28c28" },
  { id: "ball", name: "Bola", type: "toy", value: 1, price: 4, color: "#4ea1ff" },
  { id: "toyCar", name: "Carrinho", type: "toy", value: 1, price: 7, color: "#4f8f5b" },
  { id: "doll", name: "Boneca", type: "toy", value: 1, price: 8, color: "#ee8db4" },
  { id: "kite", name: "Pipa", type: "toy", value: 1, price: 5, color: "#43b8b3" },
  { id: "crate10", name: "Caixa de 10", type: "crate", value: 10, price: 10, color: "#c9793d" },
  { id: "coin1", name: "Moeda 1", type: "coin", value: 1, price: 1, color: "#f6c945" },
  { id: "coin5", name: "Moeda 5", type: "coin", value: 5, price: 5, color: "#f6c945" },
  { id: "coin10", name: "Moeda 10", type: "coin", value: 10, price: 10, color: "#f6c945" },
  { id: "note10", name: "Nota 10", type: "coin", value: 10, price: 10, color: "#9fdc8c" },
];

export function getItem(id) {
  return items.find((item) => item.id === id);
}

export function getAllowedItems(ids) {
  return ids.map(getItem).filter(Boolean);
}
