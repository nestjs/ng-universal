import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  externalSchematic,
  mergeWith,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';
import { Schema as UniversalOptions } from './schema';

const BROWSER_DIST = 'dist/browser';
const SERVER_DIST = 'dist/server';

function addExpressEngineDependencies(): Rule {
  return (host: Tree) => {
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: '@nguniversal/express-engine',
      version: '^7.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: '@schematics/angular',
      version: '^7.0.0'
    });
    return host;
  };
}

function addDependenciesAndScripts(options: UniversalOptions): Rule {
  return (host: Tree) => {
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/common',
      version: '^6.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/core',
      version: '^6.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/platform-express',
      version: '^6.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: 'http-server',
      version: '^0.11.1'
    });

    const pkgPath = '/package.json';
    const buffer = host.read(pkgPath);
    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }

    const pkg = JSON.parse(buffer.toString());

    pkg.scripts[
      'build:prerender'
    ] = `npm run build:ssr && npm run generate:prerender`;
    pkg.scripts['generate:prerender'] = `cd dist && node prerender`;
    pkg.scripts['serve:prerender'] = `cd dist/browser && http-server -p 8080`;

    host.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
    return host;
  };
}

function removeExpressFiles(): Rule {
  return (host: Tree) => {
    host.get('webpack.server.config.js') &&
      host.delete('webpack.server.config.js');
    host.get('server.ts') && host.delete('server.ts');
  };
}

export default function(options: UniversalOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    const rootSource = apply(url('./files/root'), [
      template({
        ...strings,
        ...(options as object),
        stripTsExtension: (s: string) => s.replace(/\.ts$/, ''),
        getBrowserDistDirectory: () => BROWSER_DIST,
        getServerDistDirectory: () => SERVER_DIST
      })
    ]);

    return chain([
      addExpressEngineDependencies(),
      externalSchematic('@nguniversal/express-engine', 'ng-add', options),
      removeExpressFiles(),
      mergeWith(rootSource),
      addDependenciesAndScripts(options)
    ]);
  };
}
