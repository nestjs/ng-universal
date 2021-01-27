import { Provider } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ANGULAR_UNIVERSAL_CACHE, ANGULAR_UNIVERSAL_OPTIONS } from './angular-universal.constants';
import { AngularUniversalOptions } from './interfaces/angular-universal-options.interface';
import { setupUniversal } from './utils/setup-universal.utils';
import { CacheStorage } from './interfaces/cache-storage.interface';

export const angularUniversalProviders: Provider[] = [
  {
    provide: 'UNIVERSAL_INITIALIZER',
    useFactory: (
      host: HttpAdapterHost,
      options: AngularUniversalOptions & { template: string },
      ngStorageProvider: CacheStorage
    ) =>
      host &&
      host.httpAdapter &&
      setupUniversal(host.httpAdapter.getInstance(), options, ngStorageProvider),
    inject: [HttpAdapterHost, ANGULAR_UNIVERSAL_OPTIONS, ANGULAR_UNIVERSAL_CACHE]
  }
];
