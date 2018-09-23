import { join } from 'path';

const defaultEntries = {
  // This is our Nest server for dynamic universal (SSR)
  server: './server/main.ts'
};

export interface WebpackEntries {
  [key: string]: string | string[];
}

export class WebpackConfigFactory {
  static create(
    webpack: any,
    entry: WebpackEntries = defaultEntries,
    currentDir: string = process.cwd()
  ) {
    return {
      entry,
      mode: 'none',
      target: 'node',
      resolve: { extensions: ['.ts', '.js'] },
      externals: [/node_modules/],
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
          }
        ]
      },
      plugins: [
        new webpack.ContextReplacementPlugin(
          // fixes WARNING Critical dependency: the request of a dependency is an expression
          /((.+)?angular(\\|\/)core(.+)?|express(.+)?|(.+)?nestjs(\\|\/)(.+)?)?/,
          join(currentDir, 'src'), // location of your src
          {}
        )
      ]
    };
  }
}
