export interface Schema {
  /**
   * Name or index of related client app.
   */
  project: string;
  /**
   * The appId to use withServerTransition.
   */
  appId?: string;
  /**
   * The name of the main entry-point file.
   */
  main?: string;
  /**
   * The name of the Express server file.
   */
  serverFileName?: string;
  /**
   * The port for the Express server.
   */
  serverPort?: number;
  /**
   * The name of the root module file
   */
  rootModuleFileName?: string;
  /**
   * The name of the root module class.
   */
  rootModuleClassName?: string;
  /**
   * Skip installing dependency packages.
   */
  skipInstall?: boolean;
}
