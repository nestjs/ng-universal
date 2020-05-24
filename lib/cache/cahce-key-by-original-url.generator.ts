import { CacheKeyGenerator } from '../interfaces/cache-key-generator.interface';

export class CacheKeyByOriginalUrlGenerator implements CacheKeyGenerator {
  generateCacheKey(request: any): string {
    return request.originalUrl;
  }
}
