export function button(label, options = {}) {
  const element = document.createElement("button");
  element.className = `btn ${options.variant ?? ""}`.trim();
  element.type = "button";
  if (options.html) element.innerHTML = label;
  else element.textContent = label;
  if (options.ariaLabel) element.setAttribute("aria-label", options.ariaLabel);
  if (options.disabled) element.disabled = true;
  if (options.onClick) element.addEventListener("click", options.onClick);
  return element;
}
