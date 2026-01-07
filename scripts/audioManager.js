export async function startAudio() {
  const audioContext = new AudioContext();
  const stream = await getUserMedia();
  const source = audioContext.createMediaStreamSource(stream);
  const analyzer = audioContext.createAnalyser();
  analyzer.fftSize = 2048;

  source.connect(analyzer);

  const { PitchDetector } = await import("https://esm.sh/pitchy@4");
  const pitchDetector = PitchDetector.forFloat32Array(analyzer.fftSize);

  if (audioContext.state === "suspended") await audioContext.resume();

  return { analyzer, pitchDetector, audioContext, stream };
}

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

/**
 * @param {MEdiaStream} stream
 */
export function stopAudio(stream) {
  const intervalId = window.intervalId;

  if (intervalId) {
    clearInterval(intervalId);
    window.intervalId = null;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}
