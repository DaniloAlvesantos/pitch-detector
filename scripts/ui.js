export const ui = {
  note: document.getElementById("note-label"),
  scale: document.getElementById("scale-label"),
  chord: document.getElementById("chord-label"),
  freq: document.getElementById("freq-label"),
  history: document.getElementById("recentNotes-label"),
  badge: document.getElementById("accidental-badge"),
  stopStream: document.getElementById("stop-stream"),
  startStream: document.getElementById("start-stream"),
};

export function updateUI({ note, freq, scale, chord, accidental, recentNotes }) {
  ui.note.textContent = note;
  ui.freq.textContent = `${freq.toFixed(2)} Hz`;
  ui.scale.textContent = scale || "Searching...";
  ui.chord.textContent = chord || "--";
  ui.history.textContent = recentNotes.join(" ");

  if (accidental.count > 0) {
    ui.badge.classList.remove("hidden");
    ui.badge.textContent = `${accidental.count} ${accidental.type}`;
  } else {
    ui.badge.classList.add("hidden");
  }
}
