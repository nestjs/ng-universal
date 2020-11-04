<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Angular [Universal](https://github.com/angular/universal) module for [Nest](https://github.com/nestjs/nest).

## Installation

Using the Angular CLI:

```bash
$ ng add @nestjs/ng-universal
```

Or manually:

```bash
$ npm i @nestjs/ng-universal
```

## Example

See full example [here](https://github.com/kamilmysliwiec/universal-nest).

## Usage

If you have installed the module manually, you need to import `AngularUniversalModule` in your Nest application.

```typescript
import { Module } from '@nestjs/common';
import { join } from 'path';
import { AngularUniversalModule } from '@nestjs/ng-universal';

@Module({
  imports: [
    AngularUniversalModule.forRoot({
      bootstrap: AppServerModule,
      viewsPath: join(process.cwd(), 'dist/{APP_NAME}/browser')
    }),
  ],
})
export class ApplicationModule {}
```

## API Spec

The `forRoot()` method takes an options object with a few useful properties.

| Property        | Type           | Description  |
| ------------- | ------------- | ----- |
| `viewsPath`      | string | The directory where the module should look for client bundle (Angular app) |
| `bootstrap`      | Function      |   Angular server module reference (`AppServerModule`). |
| `templatePath` | string?      | Path to index file (default: `{viewsPaths}/index.html`) |
| `rootStaticPath` | string?    | Static files root directory (default: `*.*`) |
| `renderPath` | string?    | Path to render Angular app (default: `*`) |
| `extraProviders` | StaticProvider[]?    | The platform level providers for the current render request |
| `dynamicProviders` | StaticProvider[]?    | Using the request and response objects to return the platform level providers to the rendering request |
| `cache` | boolean? \| object?    | Cache options, description below (default: `true`) |

### Cache

| Property        | Type           | Description  |
| ------------- | ------------- | ----- |
| `expiresIn`      | number? | Cache expiration in milliseconds (default: `60000`) |
| `storage`      | CacheStorage?      | Interface for implementing custom cache storage (default: in memory) |
| `keyGenerator` | CacheKeyGenerator?      | Interface for implementing custom cache key generation logic (default: by url) |

```typescript
AngularUniversalModule.forRoot({
  bootstrap: AppServerModule,
  viewsPath: join(process.cwd(), 'dist/{APP_NAME}/browser'),
  cache: {
    storage: new InMemoryCacheStorage(),
    expiresIn: DEFAULT_CACHE_EXPIRATION_TIME,
    keyGenerator: new CustomCacheKeyGenerator(),
  }
})
```

### Example for CacheKeyGenerator:

```typescript
export class CustomCacheKeyGenerator implements CacheKeyGenerator {
  generateCacheKey(request: Request): string {
    const md = new MobileDetect(request.headers['user-agent']);
    const isMobile = md.mobile() ? 'mobile' : 'desktop';
    return (request.hostname + request.originalUrl + isMobile).toLowerCase();
  }
}
```

## Request and Response Providers

This tool uses `@nguniversal/express-engine` and will properly provide access to the Express Request and Response objects in you Angular components.

This is useful for things like setting the response code to 404 when your Angular router can't find a page (i.e. `path: '**'` in routing):

```ts
import { Response } from 'express';
import { Component, Inject, Optional, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { RESPONSE } from '@nguniversal/express-engine/tokens';

@Component({
  selector: 'my-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent {
  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: any,
    @Optional()
    @Inject(RESPONSE)
    res: Response,
  ) {
    // `res` is the express response, only available on the server
    if (isPlatformServer(this.platformId)) {
      res.status(404);
    }
  }
}
```

## Providers

```typescript
export interface Token {
  access: string;
}

export const getTokenFromCookie(req): Token {
  // code to extract token with request object
  const token = { access: 'sdfsdffasdsd' };
  return token;
}

import { Module } from '@nestjs/common';
import { join } from 'path';
import { AngularUniversalModule } from '@nestjs/ng-universal';

@Module({
  imports: [
    AngularUniversalModule.forRoot({
      bootstrap: AppServerModule,
      viewsPath: join(process.cwd(), 'dist/{APP_NAME}/browser'),
      extraProviders: [{ provide: 'SERVER_TEST', useValue: 10 }],
      dynamicProviders: [{ provide: 'SERVER_TOKEN', useValue: (req, res) => getTokenFromCookie(req) }]
    }),
  ],
})
export class ApplicationModule {}
```

### Using Dynamic Providers on Client

We can use to set Authorization Header, for example, on a AppServerModule Interceptor Provider.

```typescript
import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';

import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

import { Token } from '...'; // import from a common model between client and server

@Injectable({
  providedIn: 'root',
})
export class UniversalInterceptor implements HttpInterceptor {
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject('SERVER_TOKEN') private token: Token,
    @Inject('SERVER_TEST') private test: number,
    @Optional() @Inject(REQUEST) protected request: Request
  ) {
    if (!isPlatformServer(this.platformId)) {
      throw new Error('This interceptor can be used only on server context');
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let serverReq: HttpRequest<any> = req;
    if (this.request && this.token) {
      let newUrl = `${this.request.protocol}://${this.request.get('host')}`;
      if (!req.url.startsWith('/')) {
        newUrl += '/';
      }
      newUrl += req.url;
      serverReq = req.clone({
        url: newUrl,
        withCredentials: true,
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.token.access}`,
          Test: this.test,
        }),
      });
    }
    return next.handle(serverReq);
  }
}
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

* Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
* Website - [https://nestjs.com](https://nestjs.com/)
* Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
