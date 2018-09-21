import { ExpressAdapter } from '@nestjs/core/adapters/express-adapter';
import { HTTP_SERVER_REF } from '@nestjs/core';
import { setupUniversal } from './utils/setup-universal.utils';
import { ANGULAR_UNIVERSAL_OPTIONS } from './angular-universal.constants';
import { AngularUniversalOptions } from './interfaces/angular-universal-options.interface';
import { Provider } from '@nestjs/common';

export const angularUniversalProviders: Provider[] = [
  {
    provide: 'UNIVERSAL_INITIALIZER',
    useFactory: (
      httpServerRef: ExpressAdapter,
      options: AngularUniversalOptions & { template: string },
    ) => setupUniversal(httpServerRef.getInstance(), options),
    inject: [HTTP_SERVER_REF, ANGULAR_UNIVERSAL_OPTIONS],
  },
];
