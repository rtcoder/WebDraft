const DEBUG = 0;

let APP_LOADED = false;
let APP_TITLE = 'WebDraft';

// TOOLS
const PENCIL = 'pencil';
const SELECT = 'select';
const ERASER = 'eraser';
const WEB = 'web';
const TEXT = 'text';
const RECTANGLE = 'rectangle';
const CIRCLE = 'circle';
const COLOR_SAMPLER = 'colorsampler';

let SELECTED_TOOL = PENCIL;


const layersList = [];

const webDraftDraw = {
  width: 600,
  height: 600,
  thisParent: '#drawHandler',
  selectorId: '#draw',
  eventHandler: '#eventHandler',
  bg: 'url(\'pic/transparent.png\') repeat'
};

const DRAW_SETTINGS = {
  shadow: {
    isShadow: false,
    blur: 1,
    offsetX: 0,
    offsetY: 0,
    color: '#232324'
  },
  size: 10,
  color: '#000000',
  sensitivityPoints: 1000,
};

let activeLayerId = '';

let points = {};

let canvas, ctx;


// MOUSE
const mouseButtons = {
  left: false, //left mouse button
  right: false  //right mouse button
};

const mousePosition = {
  x: 0,
  y: 0
};