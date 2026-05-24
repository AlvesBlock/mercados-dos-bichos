export function enableDragSource(source, payloadFactory, onDrop) {
  source.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    source.setPointerCapture(event.pointerId);
    const payload = payloadFactory();
    const ghost = source.cloneNode(true);
    ghost.classList.add("dragging");
    document.body.appendChild(ghost);
    moveGhost(ghost, event.clientX, event.clientY);

    const onMove = (moveEvent) => moveGhost(ghost, moveEvent.clientX, moveEvent.clientY);
    const onUp = (upEvent) => {
      source.releasePointerCapture(event.pointerId);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      ghost.remove();
      const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      onDrop(payload, target, upEvent);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  });
}

function moveGhost(ghost, x, y) {
  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;
}
