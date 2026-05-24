import { updateOwnerName, sanitizeOwnerName } from "../core/storage.js";
import { characterSvg } from "../assets/vector/characters.js";
import { button } from "../ui/button.js";

export function renderProfile({ app, state, router, params = {} }) {
  const screen = document.createElement("main");
  screen.className = "screen profile-screen";
  screen.innerHTML = `
    <section class="profile-card">
      <div class="profile-mascot">${characterSvg("bento", "happy", "Coelho Bento")}</div>
      <h1>Qual é o nome do dono da banca?</h1>
      <p>Esse nome fica salvo só neste navegador.</p>
      <label class="owner-field">
        <span>Nome</span>
        <input type="text" maxlength="24" autocomplete="given-name" value="${state.owner.name}" placeholder="Ex: Ana" />
      </label>
      <p class="form-error" aria-live="polite"></p>
      <div class="profile-actions"></div>
    </section>
  `;

  const input = screen.querySelector("input");
  const error = screen.querySelector(".form-error");
  const actions = screen.querySelector(".profile-actions");
  actions.append(button("Abrir minha banca", { onClick: submit }));
  if (params.fromSettings) {
    actions.append(button("Voltar", { variant: "secondary", onClick: () => router.go("settings") }));
  }
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });

  function submit() {
    const clean = sanitizeOwnerName(input.value);
    input.value = clean;
    if (clean.length < 2) {
      error.textContent = "Escreva pelo menos 2 letras para abrir a banca.";
      input.focus();
      return;
    }
    try {
      state.replace(updateOwnerName(clean, state));
      router.go(params.next ?? "menu");
    } catch {
      error.textContent = "Esse nome ainda não vale. Tente de novo.";
    }
  }

  app.append(screen);
  input.focus();
}
