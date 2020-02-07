import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { InMemoryCacheStorage } from '../cache/in-memory-cache.storage';
import { AngularUniversalOptions } from '../interfaces/angular-universal-options.interface';

const DEFAULT_CACHE_EXPIRATION_TIME = 60000; // 60 seconds

export function setupUniversal(app: any, ngOptions: AngularUniversalOptions) {
  const cacheOptions = getCacheOptions(ngOptions);

  app.engine('html', (_, options, callback) => {
    const originalUrl = options.req.originalUrl;
    if (cacheOptions.isEnabled) {
      const cacheHtml = cacheOptions.storage.get(originalUrl);
      if (cacheHtml) {
        return callback(null, cacheHtml);
      }
    }

    ngExpressEngine({
      bootstrap: ngOptions.bootstrap,
      providers: [
        {
          provide: 'serverUrl',
          useValue: `${options.req.protocol}://${options.req.get('host')}`
        },
        ...(ngOptions.extraProviders || [])
      ]
    })(_, options, (err, html) => {
      if (cacheOptions.isEnabled) {
        cacheOptions.storage.set(originalUrl, html, cacheOptions.expiresIn);
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
