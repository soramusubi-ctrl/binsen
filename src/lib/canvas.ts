export type TemplateId = "watermark" | "frame" | "point" | "note";
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
  | "stars"
  | "waterblue";
export type LineStyleId = "none" | "solid" | "dashed" | "double" | "handdrawn" | "dots";
export type ScatterShapeId = "square" | "circle" | "oval" | "cloud" | "stamp";
export type WatercolorFrameColorId = "blue" | "green" | "pink" | "brown" | "violet";
export type OnePointPositionId = "bottom-right" | "top-left" | "bottom-center" | "watermark";

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
  onePointPosition: OnePointPositionId;
  onePointOpacity: number;
  message: string;
  frame: FrameId;
  watercolorFrameColor: WatercolorFrameColorId;
  frameMotifSeed: number;
};

export const PIECE_WIDTH = 1240;
export const PIECE_HEIGHT = 1754;
export const A4_WIDTH = 2480;
export const A4_HEIGHT = 3508;
export const NOTE_WIDTH = A4_WIDTH / 4;
export const NOTE_HEIGHT = A4_HEIGHT / 2;

const ink = "#73675a";
const paleInk = "#b7aa98";
const paper = "#ffffff";
const green = "#788d76";
const watercolorFramePalettes: Record<
  WatercolorFrameColorId,
  { strong: string; pale: string; cap: string; washStart: string; washEnd: string }
> = {
  blue: {
    strong: "#2f95d7",
    pale: "#8ecbec",
    cap: "rgba(47,149,215,.28)",
    washStart: "rgba(105,184,226,.22)",
    washEnd: "rgba(105,184,226,0)",
  },
  green: {
    strong: "#6da35f",
    pale: "#b5d49c",
    cap: "rgba(109,163,95,.28)",
    washStart: "rgba(155,199,131,.22)",
    washEnd: "rgba(155,199,131,0)",
  },
  pink: {
    strong: "#d78398",
    pale: "#efb7bf",
    cap: "rgba(215,131,152,.28)",
    washStart: "rgba(232,166,181,.22)",
    washEnd: "rgba(232,166,181,0)",
  },
  brown: {
    strong: "#b38a62",
    pale: "#d8bea0",
    cap: "rgba(179,138,98,.28)",
    washStart: "rgba(198,166,128,.2)",
    washEnd: "rgba(198,166,128,0)",
  },
  violet: {
    strong: "#9078b2",
    pale: "#c4b4d7",
    cap: "rgba(144,120,178,.28)",
    washStart: "rgba(181,160,207,.2)",
    washEnd: "rgba(181,160,207,0)",
  },
};

function createSeededRandom(seed: number) {
  let state = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function jitter(random: () => number, amount: number) {
  return (random() * 2 - 1) * amount;
}

function pick<T>(random: () => number, values: T[]) {
  return values[Math.floor(random() * values.length)];
}

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

function getOnePointBounds(position: OnePointPositionId) {
  if (position === "top-left") return { x: 86, y: 98, width: 320, height: 300 };
  if (position === "bottom-center") return { x: 420, y: 1285, width: 400, height: 330 };
  return { x: 820, y: 1290, width: 330, height: 330 };
}

function drawOnePointArtwork(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  settings: EditorSettings,
) {
  const opacity = settings.onePointOpacity / 100;
  if (settings.onePointPosition === "watermark") {
    drawSource(ctx, image, 0, 0, PIECE_WIDTH, PIECE_HEIGHT, settings, opacity * 0.64);
    ctx.fillStyle = "rgba(255,255,255,.66)";
    ctx.fillRect(0, 0, PIECE_WIDTH, PIECE_HEIGHT);
    return;
  }
  const bounds = getOnePointBounds(settings.onePointPosition);
  drawScatterSource(ctx, image, bounds.x, bounds.y, bounds.width, bounds.height, settings, opacity);
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

function drawVerticalLines(
  ctx: CanvasRenderingContext2D,
  startX: number,
  y: number,
  height: number,
  count: number,
  gap: number,
  style: LineStyleId,
) {
  if (style === "none") return;
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
    const x = startX - i * gap;
    if (style === "handdrawn") {
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let segment = 1; segment <= 10; segment += 1) {
        const py = y + (height * segment) / 10;
        const px = x + Math.sin(segment * 1.7 + i) * 2.2;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + height);
      ctx.stroke();
      if (style === "double") {
        ctx.beginPath();
        ctx.moveTo(x - 7, y);
        ctx.lineTo(x - 7, y + height);
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

function drawWatercolorStroke(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  color: string,
  width: number,
  alpha: number,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();
}

function drawWatercolorLineFrame(
  ctx: CanvasRenderingContext2D,
  colorId: WatercolorFrameColorId,
  random: () => number,
) {
  const palette = watercolorFramePalettes[colorId];
  ctx.save();

  const topLines = [
    { y: 82, width: 16, alpha: 0.46 },
    { y: 88, width: 9, alpha: 0.24 },
    { y: 74, width: 7, alpha: 0.18 },
  ];
  topLines.forEach((line, index) => {
    drawWatercolorStroke(
      ctx,
      [
        [74, line.y + index * 2 + jitter(random, 4)],
        [330, line.y - 8 + jitter(random, 8)],
        [610, line.y + 1 + jitter(random, 7)],
        [905, line.y - 5 + jitter(random, 8)],
        [1164, line.y + 4 + jitter(random, 4)],
      ],
      palette.strong,
      line.width,
      line.alpha,
    );
  });

  const sides = [
    { x: 78, sign: 1 },
    { x: 1162, sign: -1 },
  ];
  sides.forEach(({ x, sign }) => {
    drawWatercolorStroke(
      ctx,
      [
        [x + jitter(random, 4), 82],
        [x + sign * (8 + jitter(random, 5)), 410],
        [x + sign * (3 + jitter(random, 6)), 800],
        [x + sign * (10 + jitter(random, 6)), 1210],
        [x + sign * (2 + jitter(random, 4)), 1678],
      ],
      palette.strong,
      15,
      0.34,
    );
    drawWatercolorStroke(
      ctx,
      [
        [x + sign * 13 + jitter(random, 3), 86],
        [x + sign * 4 + jitter(random, 5), 510],
        [x + sign * 16 + jitter(random, 5), 1040],
        [x + sign * 8 + jitter(random, 3), 1666],
      ],
      palette.pale,
      7,
      0.28,
    );
  });

  [[72, 70], [1164, 70]].forEach(([x, y]) => {
    ctx.fillStyle = palette.cap;
    ctx.beginPath();
    ctx.ellipse(x, y, 13, 32, 0.05, 0, Math.PI * 2);
    ctx.fill();
  });

  const wash = ctx.createLinearGradient(0, 90, 0, 390);
  wash.addColorStop(0, palette.washStart);
  wash.addColorStop(1, palette.washEnd);
  ctx.fillStyle = wash;
  [
    [125, 125, 190, 55, -0.08],
    [335, 125, 250, 72, 0.1],
    [650, 148, 315, 82, -0.05],
    [940, 122, 230, 58, 0.07],
    [235, 222, 260, 78, 0.04],
    [560, 250, 230, 70, -0.1],
    [835, 225, 260, 75, 0.08],
  ].forEach(([x, y, rx, ry, angle]) => {
    ctx.beginPath();
    ctx.ellipse(x + jitter(random, 24), y + jitter(random, 16), rx + jitter(random, 28), ry + jitter(random, 12), angle + jitter(random, 0.08), 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawFramePreset(
  ctx: CanvasRenderingContext2D,
  frame: FrameId,
  watercolorFrameColor: WatercolorFrameColorId,
  frameMotifSeed: number,
) {
  const left = 64;
  const top = 64;
  const right = PIECE_WIDTH - 64;
  const bottom = PIECE_HEIGHT - 64;
  const random = createSeededRandom(frameMotifSeed + frame.length * 101);
  ctx.save();
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.82;

  if (frame === "waterblue") {
    drawWatercolorLineFrame(ctx, watercolorFrameColor, random);
    ctx.restore();
    return;
  }

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
    [[98, 1450, false], [1140, 1450, true], [98, 170, false], [1140, 170, true]].forEach(([x, y, flip]) => {
      ctx.save();
      ctx.translate(Number(x) + jitter(random, 18), Number(y) + jitter(random, 24));
      ctx.scale(0.9 + random() * 0.22, 0.9 + random() * 0.22);
      drawLeafAccent(ctx, 0, 0, Boolean(flip));
      ctx.restore();
    });
  }

  if (frame === "flowers" || frame === "corner") {
    const points = frame === "corner"
      ? [[112, 120], [1128, 120], [112, 1634], [1128, 1634]]
      : [[150, 120], [300, 105], [940, 105], [1090, 120], [150, 1635], [1090, 1635]];
    const colors = ["#e6b7a8", "#d89ba6", "#e8c27b", "#b9c8a8", "#cdb9d7"];
    points.forEach(([x, y], index) => {
      drawTinyFlower(
        ctx,
        x + jitter(random, frame === "corner" ? 18 : 28),
        y + jitter(random, frame === "corner" ? 18 : 20),
        pick(random, colors),
        (frame === "corner" ? 18 : 12) + random() * (frame === "corner" ? 7 : 5) + (index % 2),
      );
    });
  }

  if (frame === "mimosa") {
    ctx.fillStyle = "#dfb84e";
    const step = 70 + random() * 18;
    for (let y = 125 + jitter(random, 18); y < 1630; y += step) {
      [92, 1148].forEach((x, index) => {
        ctx.fillStyle = index % 2 ? "#e6c665" : "#dfb84e";
        ctx.beginPath();
        ctx.arc(x + jitter(random, 10), y + (index ? 25 : 0) + jitter(random, 14), 7 + random() * 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  if (frame === "lavender") {
    ctx.strokeStyle = "#879578";
    ctx.lineWidth = 3;
    for (let x = 95 + jitter(random, 18); x < 1160; x += 125 + random() * 36) {
      const stemTop = 1545 + jitter(random, 18);
      ctx.beginPath();
      ctx.moveTo(x, 1635);
      ctx.lineTo(x + 18 + jitter(random, 8), stemTop);
      ctx.stroke();
      for (let i = 0; i < 4; i += 1) {
        ctx.fillStyle = pick(random, ["#9b91b0", "#b5a7c1", "#8f84a8"]);
        ctx.beginPath();
        ctx.ellipse(x + 10 + i * 3 + jitter(random, 4), stemTop + 14 + i * 16 + jitter(random, 5), 8 + random() * 5, 4 + random() * 3, -0.6 + jitter(random, 0.18), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (frame === "berries") {
    const points = [[105, 115], [1135, 115], [105, 1638], [1135, 1638]];
    points.forEach(([x, y]) => {
      ctx.fillStyle = pick(random, ["#bb7f72", "#c68d7d", "#a96766"]);
      [[0, 0], [22, 8], [8, 24]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(x + dx + jitter(random, 8), y + dy + jitter(random, 8), 8 + random() * 5, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  if (frame === "ribbon") {
    ctx.strokeStyle = "#d78e91";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(510 + jitter(random, 18), 66 + jitter(random, 8));
    ctx.quadraticCurveTo(620 + jitter(random, 18), 150 + jitter(random, 20), 730 + jitter(random, 18), 66 + jitter(random, 8));
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(620 + jitter(random, 12), 82 + jitter(random, 8), 26 + random() * 12, 15 + random() * 7, jitter(random, 0.2), 0, Math.PI * 2);
    ctx.stroke();
  }

  if (frame === "dots") {
    const colors = ["#dca098", "#e6c56f", "#9eae91", "#b8a6bd"];
    for (let i = 0; i < 24; i += 1) {
      ctx.fillStyle = pick(random, colors);
      ctx.beginPath();
      ctx.arc(85 + i * 46 + jitter(random, 12), (i % 2 ? 92 : 1660) + jitter(random, 12), 5 + random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (frame === "stars") {
    ctx.fillStyle = "#d4af56";
    [[105, 110], [1135, 110], [105, 1640], [1135, 1640], [620, 85]].forEach(([x, y]) => {
      const size = 13 + random() * 10;
      ctx.save();
      ctx.translate(x + jitter(random, 20), y + jitter(random, 16));
      ctx.rotate(Math.PI / 4 + jitter(random, 0.35));
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    });
  }
  ctx.restore();
}

function getNotePointBounds(position: OnePointPositionId) {
  if (position === "top-left") return { x: 44, y: 82, width: 175, height: 175 };
  if (position === "bottom-center") return { x: 170, y: 1425, width: 280, height: 210 };
  return { x: 390, y: 1365, width: 185, height: 245 };
}

function drawNoteOnePointArtwork(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  settings: EditorSettings,
) {
  const opacity = settings.onePointOpacity / 100;
  if (settings.onePointPosition === "watermark") {
    drawSource(ctx, image, 0, 0, NOTE_WIDTH, NOTE_HEIGHT, settings, opacity * 0.45);
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.fillRect(0, 0, NOTE_WIDTH, NOTE_HEIGHT);
    return;
  }
  const bounds = getNotePointBounds(settings.onePointPosition);
  drawScatterSource(ctx, image, bounds.x, bounds.y, bounds.width, bounds.height, settings, opacity * 0.88);
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
    if (settings.lineStyle !== "none") drawLines(ctx, 120, 210, 1000, 14, 94, settings.lineStyle);
    drawMessage(ctx, settings.message, 120, 130, 1000);
  }

  if (template === "frame") {
    drawFramePreset(ctx, settings.frame, settings.watercolorFrameColor, settings.frameMotifSeed);
    if (settings.frame === "waterblue") {
      ctx.save();
      ctx.fillStyle = "rgba(171,128,78,.18)";
      ctx.beginPath();
      ctx.ellipse(250, 1515, 220, 48, 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(245, 1365, 220, 190, -0.1, 0, Math.PI * 2);
      ctx.clip();
      drawSource(ctx, image, 64, 1168, 392, 392, settings, 0.94);
      ctx.restore();

      if (settings.lineStyle !== "none") drawLines(ctx, 190, 430, 860, 9, 106, settings.lineStyle);
      drawMessage(ctx, settings.message, 190, 345, 860);
      return;
    }
    drawSource(ctx, image, 100, 90, PIECE_WIDTH - 200, 400, settings, 0.92);
    ctx.fillStyle = "rgba(255,255,255,.52)";
    const fade = ctx.createLinearGradient(0, 300, 0, 540);
    fade.addColorStop(0, "rgba(255,255,255,0)");
    fade.addColorStop(1, paper);
    ctx.fillStyle = fade;
    ctx.fillRect(90, 300, PIECE_WIDTH - 180, 250);
    if (settings.lineStyle !== "none") drawLines(ctx, 145, 620, 950, 9, 100, settings.lineStyle);
    drawMessage(ctx, settings.message, 145, 545, 950);
  }

  if (template === "point") {
    drawOnePointArtwork(ctx, image, settings);
    if (settings.lineStyle !== "none") drawLines(ctx, 145, 300, 900, 11, 105, settings.lineStyle);
    drawMessage(ctx, settings.message, 145, 210, 900);
  }

  ctx.strokeStyle = "rgba(130,116,97,.16)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, PIECE_WIDTH - 2, PIECE_HEIGHT - 2);
}

export function renderNotePiece(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | null,
  settings: EditorSettings,
  scale = 1,
) {
  canvas.width = Math.round(NOTE_WIDTH * scale);
  canvas.height = Math.round(NOTE_HEIGHT * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, NOTE_WIDTH, NOTE_HEIGHT);

  drawNoteOnePointArtwork(ctx, image, settings);

  ctx.strokeStyle = "rgba(130,116,97,.18)";
  ctx.lineWidth = 2;
  roundedRect(ctx, 34, 56, NOTE_WIDTH - 68, NOTE_HEIGHT - 112, 20);
  ctx.stroke();
  drawVerticalLines(ctx, NOTE_WIDTH - 92, 130, NOTE_HEIGHT - 270, 5, 78, settings.lineStyle);
  drawMessage(ctx, settings.message, 50, 70, 240);

  ctx.strokeStyle = "rgba(130,116,97,.16)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, NOTE_WIDTH - 2, NOTE_HEIGHT - 2);
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

  if (template === "note") {
    renderNotePiece(piece, image, settings);
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        ctx.drawImage(
          piece,
          col * NOTE_WIDTH * scale,
          row * NOTE_HEIGHT * scale,
          NOTE_WIDTH * scale,
          NOTE_HEIGHT * scale,
        );
      }
    }
    ctx.save();
    ctx.strokeStyle = "rgba(120,112,100,.42)";
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.setLineDash([14 * scale, 12 * scale]);
    ctx.beginPath();
    for (let col = 1; col < 4; col += 1) {
      ctx.moveTo(col * NOTE_WIDTH * scale, 0);
      ctx.lineTo(col * NOTE_WIDTH * scale, A4_HEIGHT * scale);
    }
    ctx.moveTo(0, NOTE_HEIGHT * scale);
    ctx.lineTo(A4_WIDTH * scale, NOTE_HEIGHT * scale);
    ctx.stroke();
    ctx.restore();
    return;
  }

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
