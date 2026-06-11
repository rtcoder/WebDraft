import {Tool} from './core.ts';

export type ToolbarSection = {
  element: HTMLElement;
  sync: () => void;
};

export type ToolConfig = {
  id: Tool;
  label: string;
  icon: string;
};
