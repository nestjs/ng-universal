import * as concurrently from 'concurrently';
import * as spawn from 'cross-spawn';

const defaultOptions: LiveReloadCompilerOptions = {
  projectName: 'app',
  webpackConfigFile: 'webpack.server.config.js',
  browserBundlePath: './dist/browser',
  tsServerConfigFile: 'server/tsconfig.json',
  watchDir: 'dist',
  serverFilePath: 'dist/server-app/main',
  mainBundlePath: 'dist/browser/main.js'
};

export interface LiveReloadCompilerOptions {
  projectName: string;
  webpackConfigFile?: string;
  browserBundlePath?: string;
  tsServerConfigFile?: string;
  watchDir?: string;
  serverFilePath?: string;
  mainBundlePath?: string;
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
      projectName,
      webpackConfigFile,
      browserBundlePath,
      tsServerConfigFile,
      watchDir,
      serverFilePath,
      mainBundlePath
    } = this.options;

    // Pre-build all packages (SSR)
    const SSR_BUILD_SCRIPT = `ng build --prod && ng run ${projectName}:server:production`;
    const SERVER_COMPILE_SCRIPT = `node_modules/.bin/webpack --config ${webpackConfigFile} --progress --colors`;

    const script = spawn(`${SSR_BUILD_SCRIPT} && ${SERVER_COMPILE_SCRIPT}`, {
      shell: true,
      stdio: 'inherit'
    });

    // Setup live reload server (websocket)
    const livereload = require('livereload');
    const server = livereload.createServer();
    server.watch(browserBundlePath); // join(__dirname, 'dist', 'browser')
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
      // Static server + live browser reload + watch mode + initial SSR (first build)
      concurrently(
        [
          'ng build --aot --watch --delete-output-path=false',
          `tsc --watch -p ${tsServerConfigFile}`,
          `node_modules/.bin/wait-on ${mainBundlePath} && nodemon --watch ${watchDir} ${serverFilePath} --delay 1 --exec "node"`
        ],
        {
          raw: true,
          killOthers: true
        }
      );
    });
  }
}
