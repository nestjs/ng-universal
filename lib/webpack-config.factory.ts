import { join } from 'path';
import * as nodeExternals from 'webpack-node-externals';

const defaultEntries = {
  // A path to Nest server for dynamic universal (SSR)
  server: './server/main.ts'
};

export interface WebpackEntries {
  [key: string]: string | string[];
}

export class WebpackConfigFactory {
  static create(
    webpack: any,
    entry: WebpackEntries = defaultEntries,
    currentDir: string = process.cwd(),
    projectDir: string = currentDir
  ) {
    return {
      entry,
      mode: 'none',
      target: 'node',
      resolve: { extensions: ['.ts', '.js'] },
      externals: [
        nodeExternals({
          whitelist: /^(?!(@nestjs\/(common|core|microservices)|livereload|concurrently)).*/
        })
      ],
      output: {
        // Puts the output at the root of the dist folder
        path: join(currentDir, 'dist'),
        filename: '[name].js'
      },
      module: {
        rules: [
          { test: /\.ts$/, loader: 'ts-loader' },
          {
            // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
            // Removing this will cause deprecation warnings to appear.
            test: /(\\|\/)@angular(\\|\/)core(\\|\/).+\.js$/,
            parser: { system: true }
          },
          {
            test: /\module.ts$/,
            loader: 'string-replace-loader',
            options: {
              search: '../server/main',
              replace: '../dist/server/main',
              flags: 'g'
            }
          }
        ]
      },
      plugins: [
        new webpack.ContextReplacementPlugin(
          // fixes WARNING Critical dependency: the request of a dependency is an expression
          /((.+)?angular(\\|\/)core(.+)?|express(.+)?|(.+)?nestjs(\\|\/)(.+)?)?/,
          join(projectDir, 'src'), // location of your src
          {}
        )
      ]
    };
  }
}
