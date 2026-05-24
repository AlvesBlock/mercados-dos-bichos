import { button } from "../ui/button.js";
import { clearAllGameData, resetProgressKeepingOwner } from "../core/storage.js";
import { confirmModal } from "../ui/modal.js";

export function renderSettings({ app, state, router }) {
  const screen = document.createElement("main");
  screen.className = "screen settings-screen";
  const panel = document.createElement("section");
  panel.className = "settings-panel";
  panel.innerHTML = `
    <h1>Configurações</h1>
    <p class="settings-owner">Banca do(a) <strong>${state.owner.name}</strong></p>
    <div class="settings-list">
      <label class="settings-row">Sons <input type="checkbox" data-setting="soundEnabled" /></label>
      <label class="settings-row">Música <input type="checkbox" data-setting="musicEnabled" /></label>
      <label class="settings-row">Reduzir animações <input type="checkbox" data-setting="reducedMotion" /></label>
      <label class="settings-row">Alto contraste <input type="checkbox" data-setting="highContrast" /></label>
      <label class="settings-row">Fonte grande <input type="checkbox" data-setting="fontScale" /></label>
    </div>
  `;

  const controls = {
    soundEnabled: panel.querySelector('[data-setting="soundEnabled"]'),
    musicEnabled: panel.querySelector('[data-setting="musicEnabled"]'),
    reducedMotion: panel.querySelector('[data-setting="reducedMotion"]'),
    highContrast: panel.querySelector('[data-setting="highContrast"]'),
    fontScale: panel.querySelector('[data-setting="fontScale"]'),
  };
  controls.soundEnabled.checked = state.settings.soundEnabled;
  controls.musicEnabled.checked = state.settings.musicEnabled;
  controls.reducedMotion.checked = state.settings.reducedMotion;
  controls.highContrast.checked = state.settings.highContrast;
  controls.fontScale.checked = state.settings.fontScale === "large";

  panel.addEventListener("change", () => {
    state.settings.soundEnabled = controls.soundEnabled.checked;
    state.settings.musicEnabled = controls.musicEnabled.checked;
    state.settings.reducedMotion = controls.reducedMotion.checked;
    state.settings.highContrast = controls.highContrast.checked;
    state.settings.fontScale = controls.fontScale.checked ? "large" : "normal";
    document.body.classList.toggle("reduced-motion", state.settings.reducedMotion);
    document.body.classList.toggle("high-contrast", state.settings.highContrast);
    document.body.classList.toggle("font-large", state.settings.fontScale === "large");
    state.save();
  });

  const actions = document.createElement("div");
  actions.className = "result-actions settings-actions";
  actions.append(
    button("Alterar nome", { variant: "secondary", onClick: () => router.go("profile", { fromSettings: true, next: "settings" }) }),
    button("Repetir tutorial", { variant: "secondary", onClick: () => router.go("tutorial") }),
    button("Voltar", { variant: "secondary", onClick: () => router.go("menu") }),
    button("Resetar progresso", {
      variant: "danger",
      onClick: () => confirmModal({
        title: "Resetar progresso?",
        message: "O nome da banca e as configurações ficam salvos, mas fases, moedas e estrelas voltam ao começo.",
        confirmLabel: "Resetar",
        danger: true,
        onConfirm: () => {
          state.replace(resetProgressKeepingOwner(state));
          router.go("menu");
        },
      }),
    }),
    button("Apagar todos os dados", {
      variant: "danger",
      onClick: () => confirmModal({
        title: "Apagar todos os dados?",
        message: "Isso limpa nome, progresso, moedas, estrelas e configurações deste navegador.",
        confirmLabel: "Apagar",
        danger: true,
        onConfirm: () => {
          state.replace(clearAllGameData());
          router.go("profile", { next: "tutorial" });
        },
      }),
    }),
  );
  panel.append(actions);
  screen.append(panel);
  app.append(screen);
}
