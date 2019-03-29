export interface CacheStorage {
  set(key: string, value: string, expiresIn: number): any;
  get(key: string): string | null;
}
