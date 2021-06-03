import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  externalSchematic,
  FileEntry,
  forEach,
  mergeWith,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { getOutputPath } from '@nguniversal/express-engine/schematics/utils';
import {
  addPackageJsonDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';
import { updateWorkspace } from '@schematics/angular/utility/workspace';
import { Schema as UniversalOptions } from './schema';

const SERVER_DIST = 'dist/server';

function addDependenciesAndScripts(): Rule {
  return (host: Tree) => {
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/common',
      version: '^7.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/core',
      version: '^7.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: 'reflect-metadata',
      version: '^0.1.13'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: 'class-transformer',
      version: '^0.2.3'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: 'class-validator',
      version: '^0.9.1'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/platform-express',
      version: '^7.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/ng-universal',
      version: '^4.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nguniversal/express-engine',
      version: '^12.0.0'
    });

    const pkgPath = '/package.json';
    const buffer = host.read(pkgPath);
    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }
    const pkg = JSON.parse(buffer.toString());
    pkg.scripts = {
      ...pkg.scripts,
      'prebuild:ssr': `ngcc`
    };

    host.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
  };
}

function updateWorkspaceConfigRule(options: UniversalOptions): Rule {
  return () => {
    return updateWorkspace(workspace => {
      const projectName = options.project || <string>workspace.extensions.defaultProject;
      const project = workspace.projects.get(projectName);
      if (!project) {
        return;
      }

      const serverTarget = project.targets.get('server');
      serverTarget.options.externalDependencies = [
        '@nestjs/microservices',
        '@nestjs/microservices/microservices-module',
        '@nestjs/websockets',
        '@nestjs/websockets/socket-module',
        'cache-manager'
      ];
      const configurations = serverTarget.configurations;
      if (!configurations) {
        return;
      }
      if (configurations.production) {
        configurations.production.optimization = false;
      }
    });
  };
}

function addFiles(options: UniversalOptions): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const browserDistDirectory = await getOutputPath(
      tree,
      options.project,
      'build'
    );
    const rule = mergeWith(
      apply(url('./files/root'), [
        template({
          ...strings,
          ...(options as object),
          stripTsExtension: (s: string) => s.replace(/\.ts$/, ''),
          getBrowserDistDirectory: () => browserDistDirectory,
          getServerDistDirectory: () => SERVER_DIST,
          getClientProjectName: () => options.project
        }),
        forEach((fileEntry: FileEntry) => {
          if (tree.exists(fileEntry.path)) {
            tree.overwrite(fileEntry.path, fileEntry.content);
            return null;
          }
          return fileEntry;
        })
      ])
    );
    return rule;
  };
}

export default function(options: UniversalOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    return chain([
      externalSchematic('@nguniversal/express-engine', 'ng-add', options),
      addFiles(options),
      addDependenciesAndScripts(),
      updateWorkspaceConfigRule(options)
    ]);
  };
}
