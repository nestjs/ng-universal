import { Logger } from '@nestjs/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import {
  default as express,
  Application as ExpressApplication,
  Request
} from 'express';
import { CacheKeyByOriginalUrlGenerator } from '../cache/cache-key-by-original-url.generator';
import { InMemoryCacheStorage } from '../cache/in-memory-cache.storage';
import { AngularUniversalOptions } from '../interfaces/angular-universal-options.interface';

const DEFAULT_CACHE_EXPIRATION_TIME = 60000; // 60 seconds

const logger = new Logger('AngularUniversalModule');

export function setupUniversal(app: any, ngOptions: AngularUniversalOptions) {
  const cacheOptions = getCacheOptions(ngOptions);

  app.engine(
    'html',
    (
      _: string,
      options: { req: Request },
      callback: (err: Error, html?: string) => void
    ) => {
      let cacheKey: string;
      if (cacheOptions.isEnabled) {
        const cacheKeyGenerator = cacheOptions.keyGenerator;
        cacheKey = cacheKeyGenerator.generateCacheKey(options.req);
        const cacheHtml = cacheOptions.storage.get(cacheKey);
        if (cacheHtml) {
          return callback(null, cacheHtml);
        }
      }

      ngExpressEngine({
        bootstrap: ngOptions.bootstrap,
        inlineCriticalCss: ngOptions.inlineCriticalCss,
        providers: [
          {
            provide: 'serverUrl',
            useValue: `${options.req.protocol}://${options.req.get('host')}`
          },
          /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
          ...(ngOptions.extraProviders || [])
        ] as StaticProvider[]
      })(_, options, (err, html) => {
        if (err && ngOptions.errorHandler) {
          return ngOptions.errorHandler({
            err,
            html,
            renderCallback: callback
          });
        }

      if (err) {
        logger.error(err);
        return callback(err);
      }

        if (cacheOptions.isEnabled && cacheKey) {
          cacheOptions.storage.set(cacheKey, html, cacheOptions.expiresIn);
        }
        callback(null, html);
      });
    }
  );

  app.set('view engine', 'html');
  app.set('views', ngOptions.viewsPath);

  // Serve static files
  app.get(
    ngOptions.rootStaticPath,
    express.static(ngOptions.viewsPath, {
      maxAge: 600
    })
  );
};

export const getCacheOptions = (ngOptions: AngularUniversalOptions) => {
  if (!ngOptions.cache) {
    return {
      isEnabled: false
    };
  }
  if (typeof ngOptions.cache !== 'object') {
    return {
      isEnabled: true,
      storage: new InMemoryCacheStorage(),
      expiresIn: DEFAULT_CACHE_EXPIRATION_TIME,
      keyGenerator: new CacheKeyByOriginalUrlGenerator()
    };
  }
  return {
    isEnabled: true,
    storage: ngOptions.cache.storage || new InMemoryCacheStorage(),
    expiresIn: ngOptions.cache.expiresIn || DEFAULT_CACHE_EXPIRATION_TIME,
    keyGenerator:
      ngOptions.cache.keyGenerator || new CacheKeyByOriginalUrlGenerator()
  };
};
