let audioContext = null;
let unlocked = false;

export function unlockAudio() {
  unlocked = true;
}

export function playSound(name, state) {
  if (!state.settings?.soundEnabled || !unlocked) return;
  const frequencies = {
    click: 320,
    drag: 260,
    drop: 420,
    success: 660,
    error: 190,
    guide: 260,
    coin: 540,
    star: 760,
    complete: 880,
    unlock: 720,
  };
  const frequency = frequencies[name] ?? 300;
  try {
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = name === "error" ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
  } catch {
    // Browsers can block Web Audio; the game stays silent and playable.
  }
}
