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
    })
  ]
})
export class ApplicationModule {}
```

## API Spec

The `forRoot()` method takes an options object with a few useful properties.

| Property            | Type                | Description                                                                |
| ------------------- | ------------------- | -------------------------------------------------------------------------- |
| `viewsPath`         | string              | The directory where the module should look for client bundle (Angular app) |
| `bootstrap`         | Function            | Angular server module reference (`AppServerModule`).                       |
| `templatePath`      | string?             | Path to index file (default: `{viewsPaths}/index.html`)                    |
| `rootStaticPath`    | string?             | Static files root directory (default: `*.*`)                               |
| `renderPath`        | string?             | Path to render Angular app (default: `*`)                                  |
| `extraProviders`    | StaticProvider[]?   | The platform level providers for the current render request                |
| `inlineCriticalCss` | boolean?            | Reduce render blocking requests by inlining critical CSS. (default: true)  |
| `cache`             | boolean? \| object? | Cache options, description below (default: `true`)                         |
| `errorHandler`      | Function?           | Callback to be called in case of a rendering error                         |

### Cache

| Property       | Type               | Description                                                                    |
| -------------- | ------------------ | ------------------------------------------------------------------------------ |
| `expiresIn`    | number?            | Cache expiration in milliseconds (default: `60000`)                            |
| `storage`      | CacheStorage?      | Interface for implementing custom cache storage (default: in memory)           |
| `keyGenerator` | CacheKeyGenerator? | Interface for implementing custom cache key generation logic (default: by url) |

```typescript
AngularUniversalModule.forRoot({
  bootstrap: AppServerModule,
  viewsPath: join(process.cwd(), 'dist/{APP_NAME}/browser'),
  cache: {
    storage: new InMemoryCacheStorage(),
    expiresIn: DEFAULT_CACHE_EXPIRATION_TIME,
    keyGenerator: new CustomCacheKeyGenerator()
  }
});
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

This tool uses `@angular/ssr` and will properly provide access to the Express Request and Response objects in your Angular components.
Note since Angular 17, tokens are no longer provided by Angular, and must be imported from the `@nestjs/ng-universal/tokens`.

This is useful for things like setting the response code to 404 when your Angular router can't find a page (i.e. `path: '**'` in routing):

```ts
import { Response } from 'express';
import { Component, Inject, Optional, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { RESPONSE } from '@nestjs/ng-universal/tokens';

@Component({
  selector: 'my-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: any,
    @Optional()
    @Inject(RESPONSE)
    res: Response
  ) {
    // `res` is the express response, only available on the server
    if (isPlatformServer(this.platformId)) {
      res.status(404);
    }
  }
}
```

## Custom Webpack

In some situations, it may be required to customize the `webpack` build while using `@nestjs/ng-universal`, especially when additional dependencies are included (that rely on native Node.js code).

To add a customizable `webpack` config to your project, it is recommended to install [@angular-builders/custom-webpack](https://www.npmjs.com/package/@angular-builders/custom-webpack) in the project and to set your builders appropriately.

### Example Custom Webpack
```typescript
// webpack.config.ts
import { Configuration, IgnorePlugin } from 'webpack'
import {
  CustomWebpackBrowserSchema,
  TargetOptions
} from '@angular-builders/custom-webpack'
import nodeExternals from 'webpack-node-externals'

export default (
  config: Configuration
  _options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  if (targetOptions.target === 'server') {
    config.resolve?.extensions?.push('.mjs', '.graphql', '.gql')

    config.module?.rules?.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto'
    });

    config.externalsPresets = { node: true }

    (config.externals as Array<any>).push(
      nodeExternals({ allowlist: [/^(?!(livereload|concurrently|fsevents)).*/]})
    );

    config.plugins?.push(
      new IgnorePlugin({
        checkResource: (resource: string) => {
          const lazyImports = [
            '@nestjs/microservices',
            '@nestjs/microservices/microservices-module',
            '@nestjs/websockets/socket-module',
            'cache-manager',
            'class-validator',
            'class-transform',
          ];

          if (!lazyImpots.includes(resource)) {
            return false;
          }

          try {
            require.resolve(resource)
          } catch (_err: any) {
            return true;
          }
          return false;
        }
      })
    );
  }
  return config;
};

```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
