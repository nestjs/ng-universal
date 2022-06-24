import { CacheKeyGenerator } from '../interfaces/cache-key-generator.interface';

export class CacheKeyByOriginalUrlGenerator implements CacheKeyGenerator {
  generateCacheKey(request: { originalUrl: string }): string {
    return request.originalUrl;
  }
}
