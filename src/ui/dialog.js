export function speech(text, small = "") {
  const element = document.createElement("div");
  element.className = "speech";
  element.innerHTML = `${text}${small ? `<small>${small}</small>` : ""}`;
  return element;
}
