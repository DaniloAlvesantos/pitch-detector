import { PitchDetector } from "https://esm.sh/pitchy@4";

const audioContext = new AudioContext();
const analyzer = audioContext.createAnalyser();
const tonal = Tonal;

const noteLabel = document.getElementById("note-label");
const scaleLabel = document.getElementById("scale-label");
const freqLabel = document.getElementById("freq-label");

document.addEventListener("DOMContentLoaded", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(stream);

  analyzer.fftSize = 2048;
  source.connect(analyzer);

  const bufferLength = analyzer.fftSize;
  const dataArray = new Float32Array(bufferLength);
  const pitch = PitchDetector.forFloat32Array(bufferLength);

  const notes = [];
  let intervalId = null;

  async function startAudio() {
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    intervalId = setInterval(streamAudio, 100);
  }

  function streamAudio() {
    analyzer.getFloatTimeDomainData(dataArray);

    const [freq, clarity] = pitch.findPitch(dataArray, audioContext.sampleRate);

    if (clarity < 0.9) return;

    const note = tonal.Note.fromFreqSharps(freq);
    if (!note) return;

    const cleanNote = note.replace(/\d+/g, "");
    const lastNote = notes[notes.length - 1];

    if (cleanNote !== lastNote) {
      notes.push(cleanNote);

      const recentNotes = notes.slice(-7);
      const scale = tonal.Scale.detect(recentNotes);
      console.log(tonal.Scale.detect(recentNotes, { match: "exact" }));

      noteLabel.textContent = note;
      scaleLabel.textContent = scale[0] ?? "";
      freqLabel.textContent = freq.toFixed(2) + " Hz";
    }
  }

  document.addEventListener("click", startAudio, { once: true });
});

function getUserMedia() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      window.localStream = stream;
      window.hasStream = true;
    })
    .catch((err) => {
      window.hasStream = false;
      console.error(err);
    });
}
