export enum Tool {
  Select = 'select',
  Pencil = 'pencil',
  Eraser = 'eraser',
  Sampler = 'sampler',
  FillBucket = 'fill-bucket',
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

export type TextLayerData = {
  html: string;
  bounds: SizeWithPosition;
  defaultFontSize: number;
  defaultFontFamily: string;
  defaultColor: string;
  defaultAlign: CanvasTextAlign;
};

export type EditorOptions = {
  width: number;
  height: number;
  color: string;
  size: number;
};

export type EditorState = {
  activeTool: Tool;
  zoom: number;
  color: string;
  fillColor: string;
  fillEnabled: boolean;
  fillOpacity: number;
  fillTolerance: number;
  size: number;
  canvasWidth: number;
  canvasHeight: number;
  webSensitivity: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
};
