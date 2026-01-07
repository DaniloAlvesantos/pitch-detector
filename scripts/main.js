import { startAudio, stopAudio } from "./audioManager.js";
import { processAudioTheory } from "./theoryProcessor.js";
import { initVisualizer } from "./visualizer.js";
import { ui, updateUI } from "./ui.js";

const appState = {};

let intervalId = window.intervalId || null;
let currentStream = null;

ui.startStream.addEventListener("click", async () => {
  const { analyzer, audioContext, pitchDetector, stream } = await startAudio();
  currentStream = stream;

  if (!window.showCanvas) window.showCanvas = false;
  if (window.showCanvas === true) {
    initVisualizer(analyzer);
  }

  ui.stopStream.disabled = false;
  ui.startStream.disabled = true;

  intervalId = setInterval(() => {
    const results = processAudioTheory(analyzer, audioContext, pitchDetector);
    if (results) updateUI(results);
  }, 100);

  window.intervalId = intervalId;
});

ui.stopStream.addEventListener("click", () => {
  stopAudio(currentStream);

  ui.stopStream.disabled = true;
  ui.startStream.disabled = false;

  ui.note.textContent = "--";
  ui.freq.textContent = "0.00 Hz";
});
