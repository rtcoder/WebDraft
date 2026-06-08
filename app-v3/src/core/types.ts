export enum Tool {
  Select = 'select',
  Pencil = 'pencil',
  Eraser = 'eraser',
  Sampler = 'sampler',
  Web = 'web',
  Rectangle = 'rectangle',
  Ellipse = 'ellipse',
  Text = 'text',
}

export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type SizeWithPosition = Size & Point;

export type EditorOptions = {
  width: number;
  height: number;
  color: string;
  size: number;
};

export type EditorState = {
  activeTool: Tool;
  color: string;
  fillColor: string;
  fillEnabled: boolean;
  fillOpacity: number;
  size: number;
  canvasWidth: number;
  canvasHeight: number;
  webSensitivity: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  textFontFamily: string;
  textAlign: CanvasTextAlign;
  textBold: boolean;
  textItalic: boolean;
};
