import { enableProdMode } from '@angular/core';
import { renderModuleFactory } from '@angular/platform-server';
import { applyDomino } from '@nestjs/ng-universal';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import 'reflect-metadata';
import 'zone.js/dist/zone-node';
import { ROUTES } from './static.paths';

enableProdMode();

const BROWSER_FOLDER = join(process.cwd(), 'browser');
const indexPath = join('browser', 'index.html');

applyDomino(global, indexPath);

const {
  AppServerModuleNgFactory,
  LAZY_MODULE_MAP
} = require('./dist/server/main');

let previousRender = Promise.resolve();

ROUTES.forEach(route => {
  const fullPath = join(BROWSER_FOLDER, route);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath);
  }
  previousRender = previousRender
    .then(_ =>
      renderModuleFactory(AppServerModuleNgFactory, {
        document: readFileSync(indexPath, 'utf8'),
        url: route,
        extraProviders: [provideModuleMap(LAZY_MODULE_MAP)]
      })
    )
    .then(html => writeFileSync(join(fullPath, 'index.html'), html));
});
