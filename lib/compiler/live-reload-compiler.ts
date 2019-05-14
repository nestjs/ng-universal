import * as concurrently from 'concurrently';
import * as spawn from 'cross-spawn';

const defaultOptions: LiveReloadCompilerOptions = {
  projectName: 'app',
  tsServerConfigFile: 'server/tsconfig.json',
  watchDir: 'dist',
  serverBundlePath: 'dist/server/main.js',
  serverFilePath: 'dist/server-app/main',
  mainBundlePath: 'dist/browser/main.js',
  indexFilePath: 'dist/browser/index.html',
  outputDir: 'dist',
  watchSsr: true
};

export interface LiveReloadCompilerOptions {
  projectName: string;
  tsServerConfigFile?: string;
  watchDir?: string;
  serverFilePath?: string;
  outputDir?: string;
  watchSsr?: boolean;
  serverBundlePath?: string;
  indexFilePath?: string;
  /**
   * Options object passed down to the livereload package
   */
  liveReloadOptions?: Record<string, any>;
  /** @deprecated */
  mainBundlePath?: string;
  /** @deprecated */
  browserBundlePath?: string;
}

export class LiveReloadCompiler {
  private readonly options: LiveReloadCompilerOptions;
  constructor(options: LiveReloadCompilerOptions = { projectName: 'app' }) {
    this.options = {
      ...defaultOptions,
      ...options
    };
  }

  async run() {
    const {
      indexFilePath,
      projectName,
      tsServerConfigFile,
      watchDir,
      serverFilePath,
      outputDir,
      watchSsr,
      serverBundlePath,
      liveReloadOptions
    } = this.options;

    // Pre-build all packages (SSR)
    let PREBUILD_SCRIPT = `rimraf ${outputDir}`;
    if (!watchSsr) {
      PREBUILD_SCRIPT += `&& ng run ${projectName}:server:production`;
    }
    const script = spawn(`${PREBUILD_SCRIPT}`, {
      shell: true,
      stdio: 'inherit'
    });

    // Setup live reload server (websocket)
    const livereload = require('livereload');
    const server = livereload.createServer({
      delay: 300,
      ...(liveReloadOptions || {})
    });
    server.watch(outputDir);
    process.on('SIGINT', () => {
      try {
        // tslint:disable-next-line:no-unused-expression
        server && server.close();
      } catch {}
      process.exit();
    });

    script.on('exit', code => {
      if (code !== 0) {
        return;
      }
      const commands = [
        'ng build --aot --watch --delete-output-path=false',
        `tsc --watch -p ${tsServerConfigFile}`
      ];
      if (watchSsr) {
        commands.push(
          `wait-on ${indexFilePath} && wait-on ${serverBundlePath} && nodemon --watch ${watchDir} --delay 1 ${serverFilePath}`
        );
        commands.push(`ng run ${projectName}:server:production --watch`);
      } else {
        commands.push(
          `wait-on ${indexFilePath} && nodemon --watch ${watchDir} --delay 1 ${serverFilePath}`
        );
      }

      // Static server + live browser reload + watch mode + initial SSR (first build)
      concurrently(commands, {
        raw: true,
        killOthers: true
      });
    });
  }
}
