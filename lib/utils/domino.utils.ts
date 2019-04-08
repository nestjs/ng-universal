import { readFileSync } from 'fs';

const domino = require('domino');

export function applyDomino(global, templatePath) {
  const template = readFileSync(templatePath).toString();
  const win = domino.createWindow(template);

  global['window'] = win;
  Object.defineProperty(
    win.document.body.style,
    'transform',
    createTransformOptions(),
  );
  global['document'] = win.document;
  global['navigator'] = win.navigator;
  global['CSS'] = null;
  global['Prism'] = null;
}

export function createTransformOptions() {
  const value = () => ({
    enumerable: true,
    configurable: true,
  });
  return { value };
}
