import { CacheKeyByOriginalUrlGenerator } from '../cache/cache-key-by-original-url.generator';
import { InMemoryCacheStorage } from '../cache/in-memory-cache.storage';
import { AngularUniversalCacheOptions } from '../interfaces/angular-universal-cache-options.interface';
import { AngularUniversalOptions } from '../interfaces/angular-universal-options.interface';

const DEFAULT_CACHE_EXPIRATION_TIME = 60000; // 60 seconds

export function angularUniversalCacheOptionsFactory(
  ngOptions: AngularUniversalOptions
): AngularUniversalCacheOptions {
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
    storage: ngOptions.cache.storage ?? new InMemoryCacheStorage(),
    expiresIn: ngOptions.cache.expiresIn ?? DEFAULT_CACHE_EXPIRATION_TIME,
    keyGenerator:
      ngOptions.cache.keyGenerator ?? new CacheKeyByOriginalUrlGenerator()
  };
}
