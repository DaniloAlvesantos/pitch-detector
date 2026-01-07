import { PitchDetector } from "https://esm.sh/pitchy@4";
import { draw } from "./draw.js";

const audioContext = new AudioContext();
const analyzer = audioContext.createAnalyser();
const tonal = Tonal;

const noteLabel = document.getElementById("note-label");
const scaleLabel = document.getElementById("scale-label");
const freqLabel = document.getElementById("freq-label");
const chordLabel = document.getElementById("chord-label");
const recentNotesLabel = document.getElementById("recentNotes-label");

document.addEventListener("DOMContentLoaded", async () => {
  let notes = [];
  let stableNote = "";
  let stableCount = 0;
  const STABILITY_THRESHOLD = 3;

  async function startAudio() {
    const stream = await getUserMedia();
    const source = audioContext.createMediaStreamSource(stream);

    analyzer.fftSize = 2048;
    source.connect(analyzer);

    const bufferLength = analyzer.fftSize;
    const dataArray = new Float32Array(bufferLength);
    const pitch = PitchDetector.forFloat32Array(bufferLength);

    function streamAudio() {
      analyzer.getFloatTimeDomainData(dataArray);
      const [freq, clarity] = pitch.findPitch(
        dataArray,
        audioContext.sampleRate
      );

      if (clarity < 0.9) return;

      const note = tonal.Note.fromFreqSharps(freq);
      if (!note) return;

      const cleanNote = note.replace(/\d+/g, "");

      if (cleanNote === stableNote) {
        stableCount++;
      } else {
        stableNote = cleanNote;
        stableCount = 0;
      }

      if (stableCount === STABILITY_THRESHOLD) {
        if (notes[notes.length - 1] !== cleanNote) {
          notes.push(cleanNote);
          if (notes.length > 10) notes.shift();
        }

        const chordNotes = [...new Set(notes.slice(-4))];
        const chord = tonal.Chord.detect(chordNotes);
        const scale = tonal.Scale.detect(notes);

        noteLabel.textContent = note;
        scaleLabel.textContent = scale[0] ?? "Searching...";
        chordLabel.textContent = chord[0] ?? "--";
        recentNotesLabel.textContent = notes.join(", ");

        const badge = document.getElementById("accidental-badge");
        const info = getAccidentalCount(scale[0]);

        if (info.count > 0) {
          badge.classList.remove("hidden");
          badge.textContent = `${info.count} ${info.type}`;
        } else {
          badge.classList.add("hidden");
        }
      }

      freqLabel.textContent = freq.toFixed(2) + " Hz";
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (!window.showCanvas) window.showCanvas = false;

    if (window.showCanvas === true) {
      draw(analyzer);
    }

    setInterval(streamAudio, 100);
  }

  document.querySelector("#start-stream").addEventListener("click", startAudio);
});

async function getUserMedia() {
  if (!window.streamType) window.streamType = "mic";

  if (window.streamType === "mic") {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } else {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    const audioTracks = screenStream.getAudioTracks();
    if (audioTracks.length === 0) {
      alert("System audio sharing required.");
      throw new Error("No audio track");
    }
    return new MediaStream([audioTracks[0]]);
  }
}

function getAccidentalCount(scaleName) {
  if (!scaleName) return { count: 0, type: "none" };

  const scale = tonal.Scale.get(scaleName);
  const sharps = scale.notes.filter((n) => n.includes("#")).length;
  const flats = scale.notes.filter((n) => n.includes("b")).length;

  if (sharps > 0) return { count: sharps, type: "#" };
  if (flats > 0) return { count: flats, type: "b" };
  return { count: 0, type: "none" };
}
