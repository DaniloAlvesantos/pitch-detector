window.showCanvas = true;
window.streamType = "mic";

function getAudioInputType(type) {
  window.streamType = type;
}

function handleShowCanvas(val) {
  if (val === false) {
    window.showCanvas = false;
    return;
  }
  window.showCanvas = true;
}
