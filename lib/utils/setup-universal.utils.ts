import { renderModuleFactory } from '@angular/platform-server';
import * as express from 'express';
import { AngularUniversalOptions } from '..';
import {REQUEST, RESPONSE} from '@nguniversal/express-engine/tokens';

export function setupUniversal(
  app,
  ngOptions: AngularUniversalOptions & { template: string }
) {
  const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = ngOptions.bundle;
  const {
    provideModuleMap
  } = require('@nguniversal/module-map-ngfactory-loader');

  app.engine('html', (_, options, callback) => {
    renderModuleFactory(AppServerModuleNgFactory, {
      document: ngOptions.template,
      url: options.req.url,
      extraProviders: [
        provideModuleMap(LAZY_MODULE_MAP),
        {
          provide: 'serverUrl',
          useValue: `${options.req.protocol}://${options.req.get('host')}`
        },
        {
          provide: REQUEST,
          useValue: options.req
        },
        {
          provide: RESPONSE,
          useValue: options.res
        },
        ...(ngOptions.extraProviders || [])
      ]
    }).then(html => {
      callback(null, html);
    });
  });
  app.set('view engine', 'html');
  app.set('views', ngOptions.viewsPath);
  // Serve static files
  app.get(
    ngOptions.rootStaticPath,
    express.static(ngOptions.viewsPath, {
      maxAge: 600
    })
  );
}
