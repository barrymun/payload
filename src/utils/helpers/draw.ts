export function getWindowDimensions() {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  return { width, height };
}

export function resizeCanvas(canvas: HTMLCanvasElement) {
  const { width, height } = getWindowDimensions();
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.resetTransform();
  ctx.scale(1, 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "20px monospace";

  return ctx;
}
