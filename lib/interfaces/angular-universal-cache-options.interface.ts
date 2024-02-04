import { CacheKeyGenerator } from './cache-key-generator.interface';
import { CacheStorage } from './cache-storage.interface';

interface CacheOptionsEnabled {
  isEnabled: true;
  storage: CacheStorage;
  expiresIn: number;
  keyGenerator: CacheKeyGenerator;
}

interface CacheOptionsDisabled {
  isEnabled: false;
}

export type AngularUniversalCacheOptions =
  | CacheOptionsEnabled
  | CacheOptionsDisabled;
