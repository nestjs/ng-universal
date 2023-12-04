export interface Schema {
  /**
   * Name or index of related client app.
   */
  project: string;
  /**
   * Skip installing dependency packages.
   */
  skipInstall?: boolean;
}
