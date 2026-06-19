export type TemplateId = "watermark" | "frame" | "scatter" | "card";
export type FrameId =
  | "leaves"
  | "flowers"
  | "mimosa"
  | "lavender"
  | "berries"
  | "ribbon"
  | "dots"
  | "double"
  | "corner"
  | "stars";
export type LineStyleId = "solid" | "dashed" | "double" | "handdrawn" | "dots";
export type ScatterShapeId = "square" | "circle" | "oval" | "cloud" | "stamp";

export type EditorSettings = {
  brightness: number;
  cleanup: number;
  rotation: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  showLines: boolean;
  lineStyle: LineStyleId;
  watermarkOpacity: number;
  scatterShape: ScatterShapeId;
  message: string;
  frame: FrameId;
};

export const PIECE_WIDTH = 1240;
export const PIECE_HEIGHT = 1754;
export const A4_WIDTH = 2480;
export const A4_HEIGHT = 3508;

const ink = "#73675a";
const paleInk = "#b7aa98";
const paper = "#ffffff";
const green = "#788d76";

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  x: number,
  y: number,
  width: number,
  height: number,
  settings: EditorSettings,
) {
  const rotated = Math.abs(settings.rotation % 180) === 90;
  const sourceW = rotated ? imageHeight : imageWidth;
  const sourceH = rotated ? imageWidth : imageHeight;
  const scale = Math.max(width / sourceW, height / sourceH) * settings.zoom;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.translate(
    x + width / 2 + settings.offsetX * width * 0.28,
    y + height / 2 + settings.offsetY * height * 0.28,
  );
  ctx.rotate((settings.rotation * Math.PI) / 180);
  ctx.filter = `brightness(${settings.brightness}%) contrast(${100 + settings.cleanup * 0.35}%) saturate(${100 - settings.cleanup * 0.18}%)`;
  ctx.drawImage(
    image,
    (-imageWidth * scale) / 2,
    (-imageHeight * scale) / 2,
    imageWidth * scale,
    imageHeight * scale,
  );
  ctx.restore();
}

function drawSampleArt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = x + width * 0.52;
  const cy = y + height * 0.46;
  const unit = Math.min(width, height);

  const blooms = [
    { dx: -0.19, dy: -0.08, color: "#dca098", size: 0.19 },
    { dx: 0.05, dy: -0.2, color: "#e7b9a5", size: 0.16 },
    { dx: 0.18, dy: 0.02, color: "#d7a7b3", size: 0.17 },
  ];
  blooms.forEach((bloom) => {
    for (let i = 0; i < 7; i += 1) {
      const angle = (Math.PI * 2 * i) / 7;
      ctx.fillStyle = bloom.color;
      ctx.globalAlpha = alpha * (0.22 + i * 0.035);
      ctx.beginPath();
      ctx.ellipse(
        cx + bloom.dx * unit + Math.cos(angle) * bloom.size * unit * 0.36,
        cy + bloom.dy * unit + Math.sin(angle) * bloom.size * unit * 0.36,
        bloom.size * unit * 0.28,
        bloom.size * unit * 0.18,
        angle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = "#d5a454";
    ctx.globalAlpha = alpha * 0.65;
    ctx.beginPath();
    ctx.arc(cx + bloom.dx * unit, cy + bloom.dy * unit, bloom.size * unit * 0.12, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "#718b72";
  ctx.lineWidth = Math.max(2, unit * 0.012);
  ctx.globalAlpha = alpha * 0.65;
  ctx.lineCap = "round";
  [-0.18, 0.03, 0.18].forEach((dx, index) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * unit, cy - (index === 1 ? 0.18 : 0.04) * unit);
    ctx.quadraticCurveTo(cx + dx * unit * 0.5, cy + 0.2 * unit, cx - 0.03 * unit, cy + 0.42 * unit);
    ctx.stroke();
  });
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 ? "#8ca487" : "#6f9274";
    ctx.globalAlpha = alpha * 0.4;
    ctx.beginPath();
    ctx.ellipse(
      cx + (i % 2 ? -1 : 1) * (0.07 + i * 0.018) * unit,
      cy + (0.1 + i * 0.045) * unit,
      0.09 * unit,
      0.035 * unit,
      (i % 2 ? -0.45 : 0.45),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

function drawSource(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  x: number,
  y: number,
  width: number,
  height: number,
  settings: EditorSettings,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (image) {
    drawImageCover(ctx, image, image.naturalWidth, image.naturalHeight, x, y, width, height, settings);
  } else {
    drawSampleArt(ctx, x, y, width, height);
  }
  ctx.restore();
}

function buildScatterShapePath(
  ctx: CanvasRenderingContext2D,
  shape: ScatterShapeId,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.beginPath();
  if (shape === "circle") {
    ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    return;
  }
  if (shape === "oval") {
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    return;
  }
  if (shape === "cloud") {
    const bumps = 18;
    const cx = x + width / 2;
    const cy = y + height / 2;
    for (let i = 0; i <= bumps; i += 1) {
      const angle = (Math.PI * 2 * i) / bumps;
      const radius = 1 + 0.12 * Math.sin(i * 2.4) + 0.08 * Math.cos(i * 3.1);
      const px = cx + Math.cos(angle) * (width / 2) * radius;
      const py = cy + Math.sin(angle) * (height / 2) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.quadraticCurveTo(
        cx + Math.cos(angle - Math.PI / bumps) * (width / 2) * (radius + 0.08),
        cy + Math.sin(angle - Math.PI / bumps) * (height / 2) * (radius + 0.08),
        px,
        py,
      );
    }
    ctx.closePath();
    return;
  }
  if (shape === "stamp") {
    const radius = 22;
    roundedRect(ctx, x, y, width, height, radius);
    return;
  }
  roundedRect(ctx, x, y, width, height, 18);
}

function drawScatterSource(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  x: number,
  y: number,
  width: number,
  height: number,
  settings: EditorSettings,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(112,92,70,.12)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#ffffff";
  buildScatterShapePath(ctx, settings.scatterShape, x, y, width, height);
  ctx.fill();
  ctx.restore();

  ctx.save();
  buildScatterShapePath(ctx, settings.scatterShape, x, y, width, height);
  ctx.clip();
  drawSource(ctx, image, x, y, width, height, settings, alpha);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = settings.scatterShape === "stamp" ? "#d9c8b0" : "rgba(255,255,255,.9)";
  ctx.lineWidth = settings.scatterShape === "stamp" ? 4 : 7;
  if (settings.scatterShape === "stamp") ctx.setLineDash([12, 9]);
  buildScatterShapePath(ctx, settings.scatterShape, x, y, width, height);
  ctx.stroke();
  ctx.restore();
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  startY: number,
  width: number,
  count: number,
  gap: number,
  style: LineStyleId,
) {
  ctx.save();
  ctx.strokeStyle = paleInk;
  ctx.lineWidth = 2;
  if (style === "dashed") ctx.setLineDash([18, 14]);
  if (style === "dots") {
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.setLineDash([1, 18]);
  }
  for (let i = 0; i < count; i += 1) {
    const y = startY + i * gap;
    if (style === "handdrawn") {
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let segment = 1; segment <= 12; segment += 1) {
        const px = x + (width * segment) / 12;
        const py = y + Math.sin(segment * 1.8 + i) * 2.5;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.stroke();
      if (style === "double") {
        ctx.beginPath();
        ctx.moveTo(x, y + 7);
        ctx.lineTo(x + width, y + 7);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawMessage(ctx: CanvasRenderingContext2D, message: string, x: number, y: number, maxWidth: number) {
  if (!message.trim()) return;
  ctx.save();
  ctx.fillStyle = ink;
  ctx.font = '34px "Yu Mincho", "Hiragino Mincho ProN", serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  message.split("\n").slice(0, 4).forEach((line, index) => {
    ctx.fillText(line, x, y + index * 52, maxWidth);
  });
  ctx.restore();
}

function drawLeafAccent(ctx: CanvasRenderingContext2D, x: number, y: number, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -1 : 1, 1);
  ctx.strokeStyle = green;
  ctx.fillStyle = "#afbea5";
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.78;
  ctx.beginPath();
  ctx.moveTo(0, 100);
  ctx.quadraticCurveTo(42, 42, 22, 0);
  ctx.stroke();
  [[12, 72, -0.55], [28, 48, 0.7], [24, 22, -0.65]].forEach(([lx, ly, rotation]) => {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

function drawTinyFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size = 14,
) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i += 1) {
    const angle = (Math.PI * 2 * i) / 5;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(angle) * size, y + Math.sin(angle) * size, size, size * 0.58, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#d2a75c";
  ctx.beginPath();
  ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFramePreset(ctx: CanvasRenderingContext2D, frame: FrameId) {
  const left = 64;
  const top = 64;
  const right = PIECE_WIDTH - 64;
  const bottom = PIECE_HEIGHT - 64;
  ctx.save();
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.82;

  if (frame === "double") {
    ctx.strokeStyle = "#9dac97";
    ctx.lineWidth = 5;
    roundedRect(ctx, left, top, right - left, bottom - top, 32);
    ctx.stroke();
    ctx.strokeStyle = "#d7cbbb";
    ctx.lineWidth = 2;
    roundedRect(ctx, left + 18, top + 18, right - left - 36, bottom - top - 36, 24);
    ctx.stroke();
  } else {
    ctx.strokeStyle = frame === "stars" ? "#c8aa68" : "#b7aa98";
    ctx.lineWidth = frame === "dots" ? 2 : 3;
    if (frame === "dots") ctx.setLineDash([2, 18]);
    roundedRect(ctx, left, top, right - left, bottom - top, 28);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (frame === "leaves") {
    drawLeafAccent(ctx, 98, 1450);
    drawLeafAccent(ctx, 1140, 1450, true);
    drawLeafAccent(ctx, 98, 170);
    drawLeafAccent(ctx, 1140, 170, true);
  }

  if (frame === "flowers" || frame === "corner") {
    const points = frame === "corner"
      ? [[112, 120], [1128, 120], [112, 1634], [1128, 1634]]
      : [[150, 120], [300, 105], [940, 105], [1090, 120], [150, 1635], [1090, 1635]];
    points.forEach(([x, y], index) => drawTinyFlower(ctx, x, y, index % 2 ? "#e6b7a8" : "#d89ba6", frame === "corner" ? 20 : 13));
  }

  if (frame === "mimosa") {
    ctx.fillStyle = "#dfb84e";
    for (let y = 135; y < 1630; y += 78) {
      [92, 1148].forEach((x, index) => {
        ctx.beginPath();
        ctx.arc(x, y + (index ? 25 : 0), 10, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  if (frame === "lavender") {
    ctx.strokeStyle = "#879578";
    ctx.lineWidth = 3;
    for (let x = 105; x < 1160; x += 145) {
      ctx.beginPath();
      ctx.moveTo(x, 1635);
      ctx.lineTo(x + 18, 1555);
      ctx.stroke();
      for (let i = 0; i < 4; i += 1) {
        ctx.fillStyle = i % 2 ? "#9b91b0" : "#b5a7c1";
        ctx.beginPath();
        ctx.ellipse(x + 10 + i * 3, 1570 + i * 16, 10, 5, -0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (frame === "berries") {
    const points = [[105, 115], [1135, 115], [105, 1638], [1135, 1638]];
    points.forEach(([x, y]) => {
      ctx.fillStyle = "#bb7f72";
      [[0, 0], [22, 8], [8, 24]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, 10, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  if (frame === "ribbon") {
    ctx.strokeStyle = "#d78e91";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(510, 66);
    ctx.quadraticCurveTo(620, 150, 730, 66);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(620, 82, 30, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (frame === "dots") {
    const colors = ["#dca098", "#e6c56f", "#9eae91", "#b8a6bd"];
    for (let i = 0; i < 24; i += 1) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(85 + i * 46, i % 2 ? 92 : 1660, 6 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (frame === "stars") {
    ctx.fillStyle = "#d4af56";
    [[105, 110], [1135, 110], [105, 1640], [1135, 1640], [620, 85]].forEach(([x, y]) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-9, -9, 18, 18);
      ctx.restore();
    });
  }
  ctx.restore();
}

function drawCardBotanicalCorner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flipX = false,
  flipY = false,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = "#809478";
  ctx.fillStyle = "#9caf91";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 125);
  ctx.quadraticCurveTo(42, 58, 115, 0);
  ctx.stroke();
  [[28, 88, -0.5], [54, 58, 0.55], [84, 30, -0.5]].forEach(([lx, ly, angle]) => {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 27, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  drawTinyFlower(ctx, 42, 78, "#e2a9aa", 13);
  drawTinyFlower(ctx, 92, 20, "#e7c27b", 10);
  ctx.restore();
}

export function renderPiece(
  canvas: HTMLCanvasElement,
  template: TemplateId,
  image: HTMLImageElement | null,
  settings: EditorSettings,
  scale = 1,
) {
  canvas.width = Math.round(PIECE_WIDTH * scale);
  canvas.height = Math.round(PIECE_HEIGHT * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, PIECE_WIDTH, PIECE_HEIGHT);

  if (template === "watermark") {
    const sourceOpacity = image ? settings.watermarkOpacity / 100 : 0.42;
    drawSource(ctx, image, 0, 0, PIECE_WIDTH, PIECE_HEIGHT, settings, sourceOpacity);
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0.18, 0.62 - settings.watermarkOpacity / 120)})`;
    ctx.fillRect(0, 0, PIECE_WIDTH, PIECE_HEIGHT);
    if (settings.showLines) drawLines(ctx, 120, 210, 1000, 14, 94, settings.lineStyle);
    drawMessage(ctx, settings.message, 120, 130, 1000);
  }

  if (template === "frame") {
    drawFramePreset(ctx, settings.frame);
    drawSource(ctx, image, 100, 90, PIECE_WIDTH - 200, 400, settings, 0.92);
    ctx.fillStyle = "rgba(255,255,255,.52)";
    const fade = ctx.createLinearGradient(0, 300, 0, 540);
    fade.addColorStop(0, "rgba(255,255,255,0)");
    fade.addColorStop(1, paper);
    ctx.fillStyle = fade;
    ctx.fillRect(90, 300, PIECE_WIDTH - 180, 250);
    if (settings.showLines) drawLines(ctx, 145, 620, 950, 9, 100, settings.lineStyle);
    drawMessage(ctx, settings.message, 145, 545, 950);
  }

  if (template === "scatter") {
    drawScatterSource(ctx, image, 790, 65, 380, 330, settings, 0.82);
    drawScatterSource(ctx, image, 42, 1260, 310, 410, settings, 0.64);
    drawScatterSource(ctx, image, 940, 1375, 225, 245, settings, 0.5);
    if (settings.showLines) drawLines(ctx, 145, 300, 900, 11, 105, settings.lineStyle);
    drawMessage(ctx, settings.message, 145, 210, 900);
  }

  if (template === "card") {
    ctx.strokeStyle = "#9eae98";
    ctx.lineWidth = 3;
    roundedRect(ctx, 76, 278, PIECE_WIDTH - 152, 1195, 24);
    ctx.stroke();
    ctx.strokeStyle = "#e2d9ca";
    ctx.lineWidth = 1.5;
    roundedRect(ctx, 91, 293, PIECE_WIDTH - 182, 1165, 18);
    ctx.stroke();
    drawCardBotanicalCorner(ctx, 92, 296);
    drawCardBotanicalCorner(ctx, PIECE_WIDTH - 92, 1455, true, true);
    drawSource(ctx, image, 135, 350, PIECE_WIDTH - 270, 660, settings, 0.9);
    const cardFade = ctx.createLinearGradient(0, 850, 0, 1080);
    cardFade.addColorStop(0, "rgba(255,255,255,0)");
    cardFade.addColorStop(1, "#ffffff");
    ctx.fillStyle = cardFade;
    ctx.fillRect(125, 850, PIECE_WIDTH - 250, 240);
    drawMessage(ctx, settings.message, 180, 1080, PIECE_WIDTH - 360);
  }

  ctx.strokeStyle = "rgba(130,116,97,.16)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, PIECE_WIDTH - 2, PIECE_HEIGHT - 2);
}

export function renderArtworkPreview(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | null,
  settings: EditorSettings,
) {
  canvas.width = 960;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawSource(ctx, image, 22, 22, canvas.width - 44, canvas.height - 44, settings, 1);
  ctx.strokeStyle = "rgba(130,116,97,.24)";
  ctx.lineWidth = 3;
  roundedRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, 28);
  ctx.stroke();
}

export function renderA4(
  canvas: HTMLCanvasElement,
  template: TemplateId,
  image: HTMLImageElement | null,
  settings: EditorSettings,
  scale = 1,
) {
  canvas.width = Math.round(A4_WIDTH * scale);
  canvas.height = Math.round(A4_HEIGHT * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const piece = document.createElement("canvas");
  renderPiece(piece, template, image, settings);
  const positions = [
    [0, 0],
    [PIECE_WIDTH, 0],
    [0, PIECE_HEIGHT],
    [PIECE_WIDTH, PIECE_HEIGHT],
  ];
  positions.forEach(([x, y]) => {
    ctx.drawImage(piece, x * scale, y * scale, PIECE_WIDTH * scale, PIECE_HEIGHT * scale);
  });

  ctx.save();
  ctx.strokeStyle = "rgba(120,112,100,.42)";
  ctx.lineWidth = Math.max(1, 2 * scale);
  ctx.setLineDash([14 * scale, 12 * scale]);
  ctx.beginPath();
  ctx.moveTo(PIECE_WIDTH * scale, 0);
  ctx.lineTo(PIECE_WIDTH * scale, A4_HEIGHT * scale);
  ctx.moveTo(0, PIECE_HEIGHT * scale);
  ctx.lineTo(A4_WIDTH * scale, PIECE_HEIGHT * scale);
  ctx.stroke();
  ctx.restore();
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
