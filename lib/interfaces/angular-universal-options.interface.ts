import { AngularUniversalStorageProvider, CacheKeyGenerator } from './cache-key-generator.interface';

export interface CacheOptions {
  expiresIn?: number;
  storage?: AngularUniversalStorageProvider;
  keyGenerator?: CacheKeyGenerator;
}

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
   * The platform level providers for the current render request.
   */
  extraProviders?: any[];
  /**
   * Cache options (flag or configuration object)
   */
  cache?:
    | boolean
    | CacheOptions;
  /**
   * Callback to be called in case of a rendering error.
   */
  errorHandler?: (params: {
    err?: Error;
    html?: string;
    renderCallback: (err: any, content: string) => void;
  }) => void;
  /**
   * Module to bootstrap
   */
  bootstrap: any;
}
