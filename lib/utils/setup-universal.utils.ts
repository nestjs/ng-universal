import { renderModuleFactory } from '@angular/platform-server';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import * as express from 'express';
import { LIVE_RELOAD_SCRIPT } from '../angular-universal.constants';
import { InMemoryCacheStorage } from '../cache/in-memory-cache.storage';
import { AngularUniversalOptions } from '../interfaces/angular-universal-options.interface';

const DEFAULT_CACHE_EXPIRATION_TIME = 60000; // 60 seconds

export function setupUniversal(
  app: any,
  ngOptions: AngularUniversalOptions & { template: string }
) {
  const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = ngOptions.bundle;
  const {
    provideModuleMap
  } = require('@nguniversal/module-map-ngfactory-loader');

  const cacheOptions = getCacheOptions(ngOptions);
  app.engine('html', (_, options, callback) => {
    const originalUrl = options.req.originalUrl;
    if (cacheOptions.isEnabled) {
      const cacheHtml = cacheOptions.storage.get(originalUrl);
      if (cacheHtml) {
        return callback(null, cacheHtml);
      }
    }

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
      if (cacheOptions.isEnabled) {
        cacheOptions.storage.set(originalUrl, html, cacheOptions.expiresIn);
      }
      if (ngOptions.liveReload) {
        const headTagIndex = html.indexOf('<head>');
        html =
          html.substr(0, headTagIndex + 6) +
          LIVE_RELOAD_SCRIPT +
          html.substr(headTagIndex + 7, html.length);
      }
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

export function getCacheOptions(ngOptions: AngularUniversalOptions) {
  if (!ngOptions.cache) {
    return {
      isEnabled: false
    };
  }
  if (typeof ngOptions.cache !== 'object') {
    return {
      isEnabled: true,
      storage: new InMemoryCacheStorage(),
      expiresIn: DEFAULT_CACHE_EXPIRATION_TIME
    };
  }
  return {
    isEnabled: true,
    storage: ngOptions.cache.storage || new InMemoryCacheStorage(),
    expiresIn: ngOptions.cache.expiresIn || DEFAULT_CACHE_EXPIRATION_TIME
  };
}
