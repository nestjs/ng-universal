import { DynamicModule, Inject, Module, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import 'reflect-metadata';
import 'zone.js/dist/zone-node';
import { ANGULAR_UNIVERSAL_OPTIONS } from './angular-universal.constants';
import { angularUniversalProviders } from './angular-universal.providers';
import { AngularUniversalOptions } from './interfaces/angular-universal-options.interface';

@Module({
  providers: [...angularUniversalProviders]
})
export class AngularUniversalModule {
  constructor(
    @Inject(ANGULAR_UNIVERSAL_OPTIONS)
    private readonly ngOptions: AngularUniversalOptions,
    private readonly httpAdapterHost: HttpAdapterHost
  ) {}

  static forRoot(options: AngularUniversalOptions): DynamicModule {
    options = {
      templatePath: join(options.viewsPath, 'index.html'),
      rootStaticPath: '*.*',
      renderPath: '*',
      ...options
    };
    const template = readFileSync(options.templatePath).toString();

    return {
      module: AngularUniversalModule,
      providers: [
        {
          provide: ANGULAR_UNIVERSAL_OPTIONS,
          useValue: {
            ...options,
            template
          }
        }
      ]
    };
  }
}
