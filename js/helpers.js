function q(selector) {
  document.querySelector(selector);
}

function qAll(selector) {
  document.querySelectorAll(selector);
}

function addClass(selector, className) {
  document.querySelectorAll(selector).forEach(node => node.classList.add(className));
}

function removeClass(selector, className) {
  [...document.querySelectorAll(selector)].forEach(node => node.classList.remove(className));
}

function hasClass(selector, className) {
  document.querySelector(selector).classList.contains(className);
}

function setNodeAttributes(node, attributes) {
  Object.keys(attributes).forEach(key => {
    node.setAttribute(key, attributes[key]);
  });
}

function setAttributes(selector, attributes) {
  [...document.querySelectorAll(selector)].forEach(node => setNodeAttributes(node, attributes));
}

function setNodeCss(node, css) {
  Object.keys(css).forEach(key => {
    node.style[key] = css[key];
  });
}

function setCss(selector, css) {
  [...document.querySelectorAll(selector)].forEach(node => setNodeCss(node, css));
}

function getRandomString() {
  let text = '';
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';

  const possible = letters.toUpperCase() + letters + digits;

  for (let i = 0; i < 15; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function getColoRFromRgba(r, g, b, a) {
  let colorCode;
  if (a <= 0) {
    colorCode = ((r << 16) | (g << 8) | b).toString(16);
  } else {
    colorCode = `rgba(${r},${g},${b},${a})`;
  }

  if (colorCode === '0') {
    colorCode = 'transparent';
  }

  return colorCode;
}

function hexToRgba(hex, opacity) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const a = opacity / 100;
  return `rgba(${r},${g},${b},${a})`;
}