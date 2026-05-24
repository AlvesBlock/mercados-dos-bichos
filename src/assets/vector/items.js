const ns = "http://www.w3.org/2000/svg";

export function itemSvg(id, label = "") {
  const title = label || id;
  return `<svg class="svg-art item-art" viewBox="0 0 96 96" role="img" aria-label="${title}">
    ${shapeForItem(id)}
  </svg>`;
}

function shapeForItem(id) {
  const shapes = {
    apple: `<path d="M50 23c13-16 29-7 27 12 12 12 3 42-17 42-7 0-9-4-14-4s-8 4-14 4c-20 0-29-30-17-42-2-19 14-28 27-12 2 2 6 2 8 0Z" fill="#e84d4d"/><path d="M48 25c1-12 8-18 18-19 1 11-6 18-18 19Z" fill="#4f8f5b"/><path d="M36 38c-5 2-8 7-8 13" stroke="#fff7" stroke-width="6" stroke-linecap="round"/>`,
    banana: `<path d="M21 65c25 16 54 3 61-31 1-4-5-7-8-3-14 20-31 30-54 25-5-1-7 6-3 9Z" fill="#f7c948"/><path d="M22 59c20 8 39 1 51-20" fill="none" stroke="#d89b25" stroke-width="5" stroke-linecap="round"/><path d="M75 30l9-5" stroke="#6b4b2a" stroke-width="6" stroke-linecap="round"/>`,
    orange: `<circle cx="48" cy="52" r="30" fill="#f59e2e"/><path d="M47 25c2-10 9-15 19-15 0 10-7 16-19 15Z" fill="#529c5d"/><path d="M31 43c9-8 24-9 35 1" fill="none" stroke="#ffd17d" stroke-width="5" stroke-linecap="round"/>`,
    grape: `<g fill="#7f5fc4"><circle cx="45" cy="30" r="12"/><circle cx="31" cy="45" r="12"/><circle cx="58" cy="45" r="12"/><circle cx="43" cy="60" r="12"/><circle cx="59" cy="65" r="10"/></g><path d="M49 20c3-9 10-13 19-12-1 9-8 14-19 12Z" fill="#4f8f5b"/>`,
    strawberry: `<path d="M48 78C22 57 24 29 40 26c5-1 8 2 8 2s3-3 8-2c16 3 18 31-8 52Z" fill="#e9435f"/><path d="M33 25l9 6 6-9 6 9 9-6-3 15H36Z" fill="#4f8f5b"/><g fill="#ffe08a"><circle cx="40" cy="43" r="2"/><circle cx="54" cy="45" r="2"/><circle cx="47" cy="58" r="2"/></g>`,
    carrot: `<path d="M35 30c13 3 25 12 31 24L28 78c-2-18 0-34 7-48Z" fill="#f28c28"/><path d="M34 30c-2-13 6-20 14-22 0 11-5 18-14 22Zm5 3c6-12 17-14 26-10-6 8-14 12-26 10Z" fill="#4f8f5b"/><path d="M39 47l14-7M35 60l20-10" stroke="#d66d1d" stroke-width="4" stroke-linecap="round"/>`,
    ball: `<circle cx="48" cy="48" r="32" fill="#4ea1ff"/><path d="M20 46h56M48 16c-12 15-12 49 0 64M48 16c12 15 12 49 0 64" fill="none" stroke="#fff" stroke-width="6"/>`,
    toyCar: `<path d="M19 53h58l-6-18H34l-8 18Z" fill="#4f8f5b"/><path d="M29 35h27l9 18H22Z" fill="#74c69d"/><circle cx="33" cy="62" r="8" fill="#2f3b45"/><circle cx="64" cy="62" r="8" fill="#2f3b45"/>`,
    doll: `<circle cx="48" cy="24" r="13" fill="#f7c7a3"/><path d="M30 80l7-34h22l7 34Z" fill="#ee8db4"/><path d="M34 24c3-16 25-16 28 0-7 8-21 8-28 0Z" fill="#6b4b2a"/><circle cx="43" cy="25" r="2" fill="#27313d"/><circle cx="53" cy="25" r="2" fill="#27313d"/>`,
    kite: `<path d="M48 11l29 29-29 39-29-39Z" fill="#43b8b3"/><path d="M48 11v68M19 40h58" stroke="#fff" stroke-width="5"/><path d="M48 79c5 8 15 5 18 14" fill="none" stroke="#6b4b2a" stroke-width="4" stroke-linecap="round"/>`,
    crate10: `<rect x="17" y="24" width="62" height="48" rx="8" fill="#c9793d"/><path d="M22 38h52M22 56h52M35 25v46M61 25v46" stroke="#8f4f2b" stroke-width="5"/><text x="48" y="55" text-anchor="middle" font-size="20" font-weight="900" fill="#fffaf0">10</text>`,
    coin1: coin("1"),
    coin5: coin("5"),
    coin10: coin("10"),
    note10: `<rect x="14" y="28" width="68" height="40" rx="8" fill="#9fdc8c" stroke="#4f8f5b" stroke-width="5"/><circle cx="48" cy="48" r="13" fill="#fff8"/><text x="48" y="55" text-anchor="middle" font-size="20" font-weight="900" fill="#285c35">10</text>`,
  };
  return shapes[id] ?? shapes.apple;
}

function coin(value) {
  return `<circle cx="48" cy="48" r="34" fill="#f6c945" stroke="#b57a10" stroke-width="6"/><circle cx="48" cy="48" r="24" fill="#ffe08a"/><text x="48" y="57" text-anchor="middle" font-size="${value.length > 1 ? 24 : 30}" font-weight="900" fill="#7a5209">${value}</text>`;
}

export function createSvgElement(markup) {
  const wrapper = document.createElementNS(ns, "svg");
  wrapper.outerHTML = markup;
  return wrapper;
}
