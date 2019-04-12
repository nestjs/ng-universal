import * as concurrently from 'concurrently';
import * as spawn from 'cross-spawn';

const defaultOptions: LiveReloadCompilerOptions = {
  projectName: 'app',
  browserBundlePath: './dist/browser',
  tsServerConfigFile: 'server/tsconfig.json',
  watchDir: 'dist',
  serverBundlePath: 'dist/server/main.js',
  serverFilePath: 'dist/server-app/main',
  mainBundlePath: 'dist/browser/main.js',
  outputDir: 'dist',
  watchSsr: true
};

export interface LiveReloadCompilerOptions {
  projectName: string;
  browserBundlePath?: string;
  tsServerConfigFile?: string;
  watchDir?: string;
  serverFilePath?: string;
  mainBundlePath?: string;
  outputDir?: string;
  watchSsr?: boolean;
  serverBundlePath?: string;
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
      browserBundlePath,
      tsServerConfigFile,
      watchDir,
      serverFilePath,
      mainBundlePath,
      outputDir,
      watchSsr,
      serverBundlePath
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
    const server = livereload.createServer();
    server.watch(browserBundlePath);
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
          `wait-on ${mainBundlePath} && wait-on ${serverBundlePath} && nodemon --watch ${watchDir} ${serverFilePath} --delay 1 --exec "node"`
        );
        commands.push(`ng run ${projectName}:server:production --watch`);
      } else {
        commands.push(
          `wait-on ${mainBundlePath} && nodemon --watch ${watchDir} ${serverFilePath} --delay 1 --exec "node"`
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
