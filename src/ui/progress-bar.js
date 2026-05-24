export function progressPill(current, total) {
  const element = document.createElement("div");
  element.className = "pill";
  element.textContent = `Pedido ${current}/${total}`;
  return element;
}
