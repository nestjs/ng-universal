/* eslint-disable @typescript-eslint/naming-convention */
import { PathOrFileDescriptor, readFileSync } from 'fs';
import { default as domino } from 'domino';

export const applyDomino = (
  global: {
    window: Window;
    document: Document;
    navigator: Navigator;
    CSS: null;
    Prism: null;
  },
  templatePath: PathOrFileDescriptor
) => {
  const template = readFileSync(templatePath).toString();
  const win: Window = domino.createWindow(template);

  global.window = win;
  Object.defineProperty(
    win.document.body.style,
    'transform',
    createTransformOptions()
  );
  global.document = win.document;
  global.navigator = win.navigator;
  global.CSS = null;
  global.Prism = null;
};

export const createTransformOptions = () => {
  const value = () => ({
    enumerable: true,
    configurable: true
  });
  return { value };
};
