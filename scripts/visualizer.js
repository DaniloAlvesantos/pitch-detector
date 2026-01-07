let smoothedRadius = 110;
const logo = new Image();
logo.src =
  "../static/1.png";

/**
 * Initializes and starts the visualizer loop
 * @param {AnalyserNode} analyzer - The Web Audio Analyser node
 */
export function initVisualizer(analyzer) {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  const resize = () => {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
  };
  window.addEventListener("resize", resize);
  resize();

  function render() {
    requestAnimationFrame(render);

    const drawArray = new Float32Array(analyzer.fftSize);
    analyzer.getFloatTimeDomainData(drawArray);

    ctx.fillStyle = "rgb(9, 9, 11)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let total = 0;
    for (let i = 0; i < drawArray.length; i++) {
      total += Math.abs(drawArray[i]);
    }
    const rms = total / drawArray.length;

    const baseRadius = canvas.height * 0.2;
    const boost = canvas.height * 0.6;
    let targetRadius = baseRadius + rms * boost;
    smoothedRadius += (targetRadius - smoothedRadius) * 0.12;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, smoothedRadius, 0, Math.PI * 2);
    ctx.clip();
    if (logo.complete) {
      ctx.drawImage(
        logo,
        centerX - smoothedRadius,
        centerY - smoothedRadius,
        smoothedRadius * 2,
        smoothedRadius * 2
      );
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(centerX, centerY, smoothedRadius, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.shadowBlur = rms * 250;
    ctx.shadowColor = "rgba(6, 182, 212, 0.8)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.stroke();
    ctx.shadowBlur = 0;

    let triggerIndex = 0;
    for (let i = 0; i < drawArray.length / 2; i++) {
      if (drawArray[i] < 0 && drawArray[i + 1] > 0) {
        triggerIndex = i;
        break;
      }
    }

    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";

    let x = 0;
    const sliceWidth = canvas.width / (drawArray.length - triggerIndex);

    for (let i = triggerIndex; i < drawArray.length; i++) {
      const v = drawArray[i] * (canvas.height / 3);
      const y = centerY + v;

      if (i === triggerIndex) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();
  }

  render();
}
