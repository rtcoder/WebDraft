export enum Tool {
  Select = 'select',
  Pencil = 'pencil',
  Eraser = 'eraser',
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
  size: number;
};
