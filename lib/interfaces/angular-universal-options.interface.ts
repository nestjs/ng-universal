import { CacheStorage } from './cache-storage.interface';
import { CacheKeyGenerator } from './cache-key-generator.interface';

export interface AngularUniversalOptions {
  /**
   * The directory where the module should look for client bundle (Angular app).
   */
  viewsPath: string;
  /**
   * Path to index file.
   * Default: {viewsPaths}/index.html
   */
  templatePath?: string;
  /**
   * Static files root directory.
   * Default: *.*
   */
  rootStaticPath?: string | RegExp;
  /**
   * Path to render Angular app.
   * Default: * (wildcard - all paths)
   */
  renderPath?: string;
  /**
   * The platform level static-providers for the current render request.
   */
  staticProviders?: any[];
  /**
   * The platform level dynamic-providers for the current render request, passing request it self and response.
   */
  dynamicProviders?: (req, res) => any[];
  /**
   * Cache options (flag or configuration object)
   */
  cache?:
    | boolean
    | {
        expiresIn?: number;
        storage?: CacheStorage;
        keyGenerator?: CacheKeyGenerator;
      };
  /**
   * Module to bootstrap
   */
  bootstrap: any;
}
