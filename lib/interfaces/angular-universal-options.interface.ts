import { CacheStorage } from './cache-storage.interface';

export interface AngularUniversalOptions {
  /**
   * The directory where the module should look for client bundle (Angular app).
   */
  viewsPath: string;
  /**
   * Bundle file (webpack output with "AppServerModuleNgFactory")
   */
  bundle: { AppServerModuleNgFactory; LAZY_MODULE_MAP };
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
    | {
        expiresIn?: number;
        storage?: CacheStorage;
      };
  /**
   * Enable live-reload (auto-browser refresh)
   */
  liveReload?: boolean;
}
