import { Logger } from '@nestjs/common';
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import * as express from 'express';

import { AngularUniversalOptions } from '../interfaces/angular-universal-options.interface';
import { AngularUniversalCacheOptions } from '../interfaces/angular-universal-cache-options.interface';

const logger = new Logger('AngularUniversalModule');
const commonEngine = new CommonEngine();

export function setupUniversal(app: any, ngOptions: AngularUniversalOptions) {
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

export function renderUniversal(
  req: express.Request,
  res: express.Response,
  next: express.Next,
  ngOptions: AngularUniversalOptions,
  cacheOptions: AngularUniversalCacheOptions
) {
  const { protocol, originalUrl, baseUrl, headers } = req;

  const cacheKey =
    cacheOptions.isEnabled && cacheOptions.keyGenerator.generateCacheKey(req);

  if (cacheKey) {
    const cacheHtml = cacheOptions.storage.get(cacheKey);
    if (cacheHtml) {
      res.send(cacheHtml);
    }
  }

  commonEngine
    .render({
      bootstrap: ngOptions.bootstrap,
      documentFilePath: ngOptions.templatePath,
      inlineCriticalCss: ngOptions.inlineCriticalCss,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: ngOptions.viewsPath,
      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
        ...(ngOptions.extraProviders ?? [])
      ]
    })
    .then((html) => {
      if (cacheKey) {
        cacheOptions.storage.set(cacheKey, html, cacheOptions.expiresIn);
      }
      res.send(html);
    })
    .catch((err) => {
      if (ngOptions.errorHandler) {
        return ngOptions.errorHandler({ err, html: '', renderCallback: next });
      }

      logger.error(err);
      return next(err);
    });
}
