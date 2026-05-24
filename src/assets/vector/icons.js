export function starIcons(count = 0) {
  return Array.from({ length: 3 }, (_, index) => `<span class="star-icon ${index < count ? "filled" : ""}" aria-hidden="true">★</span>`).join("");
}

export function lockIcon() {
  return `<svg class="icon-art" viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="14" width="18" height="13" rx="3" fill="#7f6f5e"/><path d="M11 14v-3a5 5 0 0 1 10 0v3" fill="none" stroke="#7f6f5e" stroke-width="4" stroke-linecap="round"/></svg>`;
}

export function coinBadge(value) {
  return `<span class="coin-badge"><span>${value}</span></span>`;
}
