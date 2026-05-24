import { button } from "../ui/button.js";
import { characterSvg } from "../assets/vector/characters.js";
import { itemSvg } from "../assets/vector/items.js";

export function renderMenu({ app, state, router }) {
  const hasProgress = state.progress.completedLevelIds.length > 0 || state.progress.lastPlayedLevelId > 1;
  const screen = document.createElement("main");
  screen.className = "screen home-screen";
  screen.innerHTML = `
    <section class="home-sky" aria-hidden="true">
      <span class="cloud c1"></span><span class="cloud c2"></span><span class="cloud c3"></span>
    </section>
    <section class="home-stage">
      <div class="wood-sign">
        <span>Mercado dos Bichinhos</span>
        <small>Banca do(a) ${state.owner.name}</small>
      </div>
      <div class="home-market">
        <div class="decor-animal left">${characterSvg("nina", "happy", "Macaca Nina")}</div>
        <div class="hero-stall">
          <div class="awning"></div>
          <div class="stall-counter">
            ${itemSvg("apple", "Maçã")}
            ${itemSvg("banana", "Banana")}
            ${itemSvg("orange", "Laranja")}
            ${itemSvg("ball", "Bola")}
          </div>
        </div>
        <div class="decor-animal right">${characterSvg("bento", "neutral", "Coelho Bento")}</div>
      </div>
      <div class="menu-actions"></div>
    </section>
  `;

  const actions = screen.querySelector(".menu-actions");
  actions.append(
    button("Jogar", { onClick: () => router.go("levels") }),
    button("Modo Aprendizagem", { variant: "secondary", onClick: () => router.go("tutorial") }),
  );
  if (hasProgress) {
    actions.append(button("Continuar", { variant: "secondary", onClick: () => router.go("market", { levelId: state.progress.currentLevelId }) }));
  }
  actions.append(button("Configurações", { variant: "secondary", onClick: () => router.go("settings") }));

  app.append(screen);
}
