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
  rootStaticPath?: string;
  /**
   * Path to render Angular app.
   * Default: * (wildcard - all paths)
   */
  renderPath?: string;
}
