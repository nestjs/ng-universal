import * as cache from 'memory-cache';
import { CacheStorage } from '../interfaces/cache-storage.interface';

export class InMemoryCacheStorage implements CacheStorage {
  set(key: string, value: string, expiresIn: number) {
    cache.put(key, value, expiresIn);
  }

  get(key: string): string {
    return cache.get(key);
  }
}
