export interface CacheKeyGenerator {
  generateCacheKey(request: any): string;
}
