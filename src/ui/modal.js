import { button } from "./button.js";

export function confirmModal({ title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", danger = false, onConfirm }) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <section class="modal-panel" role="dialog" aria-modal="true" aria-label="${title}">
      <h2>${title}</h2>
      <p>${message}</p>
      <div class="modal-actions"></div>
    </section>
  `;
  const actions = overlay.querySelector(".modal-actions");
  actions.append(
    button(cancelLabel, { variant: "secondary", onClick: () => overlay.remove() }),
    button(confirmLabel, {
      variant: danger ? "danger" : "",
      onClick: () => {
        overlay.remove();
        onConfirm?.();
      },
    }),
  );
  document.body.append(overlay);
  overlay.querySelector("button").focus();
}
