import * as express from 'express';
import { LIVE_RELOAD_SCRIPT } from '../angular-universal.constants';
import { InMemoryCacheStorage } from '../cache/in-memory-cache.storage';
import { AngularUniversalOptions } from '../interfaces/angular-universal-options.interface';
import { renderModuleFactory } from '@angular/platform-server';
import { readFileSync } from 'fs';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import { Request, Response } from 'express';
const DEFAULT_CACHE_EXPIRATION_TIME = 60000; // 60 seconds
import * as e from 'express';
import { join } from 'path';
export function setupUniversal(
  app: any,
  ngOptions: AngularUniversalOptions & { template: string }
) {
  const {
    AppServerModuleNgFactory,
    LAZY_MODULE_MAP,
    provideModuleMap,
    ngExpressEngine
  } = ngOptions.bundle;
  const subApp: any = e();
  const cacheOptions = getCacheOptions(ngOptions);

  subApp.engine('html', (_, options, callback) => {
    const originalUrl = options.req.originalUrl;
    if (cacheOptions.isEnabled) {
      const cacheHtml = cacheOptions.storage.get(originalUrl);
      if (cacheHtml) {
        return callback(null, cacheHtml);
      }
    }
    ngExpressEngine({
      bootstrap: AppServerModuleNgFactory,
      document: ngOptions.template,
      url: options.req.url,
      providers: [
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
    })(_, options, (err, html) => {
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

  subApp.set('view engine', 'html');
  subApp.set('views', ngOptions.viewsPath);
  subApp.get('*', (req: Request, res: Response) => {
    if (req.originalUrl.indexOf('.') !== -1) {
      let fileName = req.originalUrl.substr(req.originalUrl.slice(1).indexOf('/') + 1);

      fileName = fileName.split('?')[0];
      const filePath = join(ngOptions.viewsPath, fileName);
      return res.sendFile(filePath);
    }
    res.render(
      ngOptions.templatePath,
      {
        req,
        res,
        providers: [
          {
            provide: 'REQUEST',
            useValue: req
          },
          {
            provide: 'RESPONSE',
            useValue: res
          },
          {
            provide: 'ORIGIN_URL',
            useValue: req.get('host')
          }
        ]
      },
      (err: Error, html) => {
        if (!!err) {
          throw err;
        }
        return res.send(html);
      }
    );
  });

  app.use(ngOptions.renderPath, subApp);
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
