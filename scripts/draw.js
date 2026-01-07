export const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;
export const ctx = canvas.getContext("2d");

let smoothedRadius = 100;
const logo = new Image();
logo.src =
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export function draw(analyzer) {
  requestAnimationFrame(() => draw(analyzer));

  const drawArray = new Float32Array(analyzer.fftSize);
  analyzer.getFloatTimeDomainData(drawArray);

  ctx.fillStyle = "rgb(245, 245, 245)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let total = 0;
  for (let i = 0; i < drawArray.length; i++) {
    total += Math.abs(drawArray[i]);
  }
  let average = total / drawArray.length;

  const baseRadius = 110;
  const boost = 350;
  let targetRadius = baseRadius + average * boost;
  smoothedRadius += (targetRadius - smoothedRadius) * 0.12;

  ctx.save();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, smoothedRadius, 0, Math.PI * 2);
  ctx.clip();

  if (logo.complete) {
    ctx.drawImage(
      logo,
      canvas.width / 2 - smoothedRadius,
      canvas.height / 2 - smoothedRadius,
      smoothedRadius * 2,
      smoothedRadius * 2
    );
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, smoothedRadius, 0, Math.PI * 2);
  ctx.lineWidth = 10;
  ctx.shadowBlur = average * 180;
  ctx.shadowColor = "rgba(48, 45, 50, 0.7)";
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
  ctx.strokeStyle = "rgba(20, 20, 20, 0.8)";

  let x = 0;

  let sliceWidth = canvas.width / (drawArray.length - triggerIndex);

  for (let i = triggerIndex; i < drawArray.length; i++) {
    const v = drawArray[i] * (canvas.height / 3);
    const y = canvas.height / 2 + v;

    if (i === triggerIndex) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.stroke();
}
