import { button } from "../ui/button.js";

export function renderMenu({ app, state, router }) {
  const hasProgress = state.progress.completedLevelIds.length > 0 || state.progress.lastPlayedLevelId > 1;
  const screen = document.createElement("main");
  screen.className = "screen home-screen";
  screen.innerHTML = `
    <div class="menu-background" aria-hidden="true"></div>
    <div class="menu-vignette" aria-hidden="true"></div>
    <div class="cloud-layer" aria-hidden="true">
      <span class="menu-cloud c1"></span><span class="menu-cloud c2"></span><span class="menu-cloud c3"></span>
    </div>
    <div class="light-glow" aria-hidden="true"></div>
    <div class="floating-leaves" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
    <section class="home-stage">
      <div class="wood-sign">
        <span>Mercado dos Bichinhos</span>
        <small>Banca do(a) ${state.owner.name}</small>
      </div>
      <div class="menu-actions"></div>
    </section>
  `;

  const actions = screen.querySelector(".menu-actions");
  actions.append(
    button("Jogar", { variant: "menu-btn menu-play", onClick: () => router.go("levels") }),
    button("Modo Aprendizagem", { variant: "menu-btn menu-learn", onClick: () => router.go("tutorial") }),
  );
  if (hasProgress) {
    actions.append(button("Continuar", { variant: "menu-btn menu-continue", onClick: () => router.go("market", { levelId: state.progress.currentLevelId }) }));
  }
  actions.append(button("Configurações", { variant: "menu-btn menu-settings", onClick: () => router.go("settings") }));

  app.append(screen);
}
