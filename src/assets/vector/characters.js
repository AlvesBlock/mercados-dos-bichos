const palette = {
  bento: ["#f7f2e9", "#efb7a3"],
  nina: ["#b87645", "#f2c38b"],
  mia: ["#f4a7b9", "#fff0f5"],
  tita: ["#72b66f", "#d7f1b9"],
  dudu: ["#b77b4b", "#f0c28c"],
  paco: ["#ffd45a", "#f59f40"],
  lila: ["#e98545", "#fff1d6"],
  nico: ["#d99b67", "#fff1d6"],
  olga: ["#8d79b8", "#f4d06f"],
  pipo: ["#f0f4f8", "#30343f"],
};

export function characterSvg(id, mood = "neutral", label = "") {
  const [main, accent] = palette[id] ?? palette.bento;
  const eyes = mood === "happy"
    ? `<path d="M36 45q5 7 10 0M54 45q5 7 10 0" fill="none" stroke="#27313d" stroke-width="4" stroke-linecap="round"/>`
    : mood === "unsure"
      ? `<circle cx="41" cy="45" r="3" fill="#27313d"/><path d="M56 43h8" stroke="#27313d" stroke-width="4" stroke-linecap="round"/>`
      : `<circle cx="41" cy="45" r="3.5" fill="#27313d"/><circle cx="60" cy="45" r="3.5" fill="#27313d"/>`;
  const mouth = mood === "happy"
    ? `<path d="M42 58q7 9 16 0" fill="none" stroke="#27313d" stroke-width="4" stroke-linecap="round"/>`
    : mood === "unsure"
      ? `<path d="M44 60q7-4 14 0" fill="none" stroke="#27313d" stroke-width="4" stroke-linecap="round"/>`
      : `<path d="M44 59q7 5 14 0" fill="none" stroke="#27313d" stroke-width="4" stroke-linecap="round"/>`;

  return `<svg class="svg-art character-art ${mood}" viewBox="0 0 112 112" role="img" aria-label="${label || id}">
    ${earsFor(id, main, accent)}
    <circle cx="56" cy="56" r="36" fill="${main}" stroke="#27313d18" stroke-width="3"/>
    ${facePatchFor(id, accent)}
    ${eyes}
    ${mouth}
    ${detailFor(id, accent)}
  </svg>`;
}

function earsFor(id, main, accent) {
  if (id === "bento") return `<path d="M33 26C26 3 42 0 47 26Z" fill="${main}"/><path d="M65 26C70 0 86 3 79 26Z" fill="${main}"/><path d="M39 23C36 11 42 9 44 24M72 23c3-12-3-14-5 1" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
  if (id === "mia") return `<path d="M28 31 36 9l13 20ZM64 29 78 9l7 24Z" fill="${main}"/>`;
  if (id === "lila") return `<path d="M26 31 36 8l13 24ZM64 31 78 8l9 25Z" fill="${main}"/><path d="M36 18l6 13M78 18l-7 13" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
  if (["dudu", "pipo"].includes(id)) return `<circle cx="29" cy="27" r="13" fill="${id === "pipo" ? "#30343f" : main}"/><circle cx="83" cy="27" r="13" fill="${id === "pipo" ? "#30343f" : main}"/>`;
  if (id === "nico") return `<path d="M25 28c-15 7-13 28 0 32 8-9 9-22 0-32ZM87 28c15 7 13 28 0 32-8-9-9-22 0-32Z" fill="#8f5c3b"/>`;
  if (id === "paco") return `<path d="M37 26c5-20 33-20 38 0Z" fill="${main}"/>`;
  if (id === "olga") return `<path d="M25 31 38 13l10 22ZM64 35l10-22 13 18Z" fill="${main}"/>`;
  return `<circle cx="31" cy="28" r="12" fill="${main}"/><circle cx="81" cy="28" r="12" fill="${main}"/>`;
}

function facePatchFor(id, accent) {
  if (id === "pipo") return `<circle cx="40" cy="45" r="11" fill="#30343f"/><circle cx="62" cy="45" r="11" fill="#30343f"/><ellipse cx="56" cy="61" rx="15" ry="12" fill="#fff"/>`;
  if (id === "paco") return `<path d="M43 55h34c10 0 10 13 0 13H45Z" fill="#f59f40"/>`;
  if (id === "olga") return `<circle cx="42" cy="46" r="13" fill="#fff8"/><circle cx="62" cy="46" r="13" fill="#fff8"/><path d="M51 53 56 63l6-10Z" fill="${accent}"/>`;
  if (id === "tita") return `<ellipse cx="56" cy="60" rx="24" ry="18" fill="${accent}"/>`;
  return `<ellipse cx="56" cy="60" rx="20" ry="14" fill="${accent}" opacity=".75"/>`;
}

function detailFor(id, accent) {
  if (id === "nina") return `<path d="M34 34c7-9 37-9 44 0" fill="none" stroke="#6b4b2a" stroke-width="7" stroke-linecap="round"/>`;
  if (id === "mia") return `<path d="M30 55H16M32 62H18M80 55h16M78 62h14" stroke="#27313d" stroke-width="3" stroke-linecap="round"/>`;
  if (id === "tita") return `<path d="M39 60h34M45 50l22 20M67 50 45 70" stroke="#72b66f" stroke-width="4" stroke-linecap="round"/>`;
  if (id === "paco") return `<path d="M54 30c3-9 13-10 18-5" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
  return "";
}
