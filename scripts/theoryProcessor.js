let notes = [];
let stableNote = "";
let stableCount = 0;
const tonal = Tonal;
const STABILITY_THRESHOLD = 3;

export function processAudioTheory(analyzer, audioContext, pitchDetector) {
  const dataArray = new Float32Array(analyzer.fftSize);
  analyzer.getFloatTimeDomainData(dataArray);
  const [freq, clarity] = pitchDetector.findPitch(
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

  console.log("Freq: ",freq);

  if (stableCount === STABILITY_THRESHOLD) {
    if (notes[notes.length - 1] !== cleanNote) {
      notes.push(cleanNote);
      if (notes.length > 10) notes.shift();
    }

    const chordNotes = [...new Set(notes.slice(-4))];
    const chords = tonal.Chord.detect(chordNotes);
    const scales = tonal.Scale.detect(notes);

    return {
      note,
      freq: freq,
      scale: scales[0],
      chord: chords[0],
      accidental: getAccidentalCount(scales[0]),
      recentNotes: notes.slice(-7)
    };
  }
  return null;
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
