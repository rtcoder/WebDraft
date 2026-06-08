export type ToolId = 'pencil' | 'eraser';

export type Point = {
  x: number;
  y: number;
};

export type EditorOptions = {
  width: number;
  height: number;
  color: string;
  size: number;
};

export type EditorState = {
  activeTool: ToolId;
  color: string;
  size: number;
};
