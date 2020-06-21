import * as PIXI from "pixi.js";
import { Vector, VectorLike } from "./vector";
import { isUsingPixi, ex, isDarkTheme } from "./main";
import { colorToNumber, colorToStyle } from "./color";
import { LetterImage, letterSize } from "./letter";
declare const gcc;

export const size = new Vector();
export let canvas: HTMLCanvasElement;
let canvasSize = new Vector();
let context: CanvasRenderingContext2D;
let graphics: PIXI.Graphics;
const graphicsScale = 5;

let background = document.createElement("img");
let captureCanvas: HTMLCanvasElement;
let captureContext: CanvasRenderingContext2D;
let viewBackground: Color = "black";

export let currentColor: Color;
let savedCurrentColor: Color;

export function init(
  _size: VectorLike,
  _bodyBackground: string,
  _viewBackground: Color,
  isCapturing: boolean
) {
  size.set(_size);
  viewBackground = _viewBackground;
  const bodyCss = `
-webkit-touch-callout: none;
-webkit-tap-highlight-color: ${_bodyBackground};
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
background: ${_bodyBackground};
color: #888;
`;
  const canvasCss = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
`;
  const crispCss = `
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
  document.body.style.cssText = bodyCss;
  canvasSize.set(size);
  if (isUsingPixi) {
    canvasSize.mul(graphicsScale);
    const app = new PIXI.Application({
      width: canvasSize.x,
      height: canvasSize.y,
    });
    canvas = app.view;
    graphics = new PIXI.Graphics();
    graphics.scale.x = graphics.scale.y = graphicsScale;
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    app.stage.addChild(graphics);
    canvas.style.cssText = canvasCss;
  } else {
    canvas = document.createElement("canvas");
    canvas.width = canvasSize.x;
    canvas.height = canvasSize.y;
    context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    canvas.style.cssText = canvasCss + crispCss;
  }
  document.body.appendChild(canvas);
  const cs = 95;
  const cw =
    canvasSize.x >= canvasSize.y ? cs : (cs / canvasSize.y) * canvasSize.x;
  const ch =
    canvasSize.y >= canvasSize.x ? cs : (cs / canvasSize.x) * canvasSize.y;
  canvas.style.width = `${cw}vmin`;
  canvas.style.height = `${ch}vmin`;
  if (isCapturing) {
    captureCanvas = document.createElement("canvas");
    if (canvasSize.x <= canvasSize.y * 2) {
      captureCanvas.width = canvasSize.y * 2;
      captureCanvas.height = canvasSize.y;
    } else {
      captureCanvas.width = canvasSize.x;
      captureCanvas.height = canvasSize.x / 2;
    }
    captureContext = captureCanvas.getContext("2d");
    captureContext.fillStyle = _bodyBackground;
    gcc.setOptions({
      scale: Math.round(400 / captureCanvas.width),
      capturingFps: 60,
    });
  }
}

export function clear() {
  if (isUsingPixi) {
    graphics.clear();
    graphics.lineStyle(0);
    graphics.beginFill(colorToNumber(viewBackground, isDarkTheme ? 0.15 : 1));
    graphics.drawRect(0, 0, size.x, size.y);
    graphics.endFill();
    return;
  }
  saveCurrentColor();
  setColor(viewBackground);
  context.fillRect(0, 0, size.x, size.y);
  loadCurrentColor();
}

export function saveAsBackground() {
  background.src = canvas.toDataURL();
}

export function drawBackground() {
  context.drawImage(background, 0, 0);
}

export function setColor(colorName: Color) {
  currentColor = colorName;
  if (isUsingPixi) {
    return;
  }
  context.fillStyle = colorToStyle(colorName);
}

export function saveCurrentColor() {
  savedCurrentColor = currentColor;
}

export function loadCurrentColor() {
  setColor(savedCurrentColor);
}

export function fillRect(x: number, y: number, width: number, height: number) {
  if (isUsingPixi) {
    graphics.lineStyle(0);
    graphics.beginFill(colorToNumber(currentColor));
    graphics.drawRect(x, y, width, height);
    graphics.endFill();
    return;
  }
  context.fillRect(x, y, width, height);
}

export function drawLetterImage(
  li: LetterImage,
  x: number,
  y: number,
  width?: number,
  height?: number
) {
  if (isUsingPixi) {
    graphics.lineStyle(0);
    graphics.beginTextureFill({
      texture: li.texture,
      matrix: new PIXI.Matrix().translate(x, y),
    });
    graphics.drawRect(
      x,
      y,
      width == null ? letterSize : width,
      height == null ? letterSize : height
    );
    graphics.endFill();
    return;
  }
  if (width == null) {
    context.drawImage(li.image, x, y);
  } else {
    context.drawImage(li.image, x, y, width, height);
  }
}

export function capture() {
  captureContext.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
  captureContext.drawImage(
    canvas,
    (captureCanvas.width - canvas.width) / 2,
    (captureCanvas.height - canvas.height) / 2
  );
  gcc.capture(captureCanvas);
}
