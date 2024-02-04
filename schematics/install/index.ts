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
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';
import { updateWorkspace } from '@schematics/angular/utility/workspace';
import { Schema as UniversalOptions } from './schema';
import { getOutputPath, getIsStandaloneApp } from './utils';
import { Logger } from '@nestjs/common';

function addDependencies(options: UniversalOptions): Rule {
  return (host: Tree) => {
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/common',
      version: '^10.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/core',
      version: '^10.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: 'reflect-metadata',
      version: '^0.1.13'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: 'class-transformer',
      version: '^0.5.1'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: 'class-validator',
      version: '^0.14.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/platform-express',
      version: '^10.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/ng-universal',
      version: '^8.0.0'
    });

    updateWorkspace((workspace) => {
      const workspaceProject = workspace.projects.get(options.project);

      if (!workspaceProject) {
        return;
      }

      const buildTarget = workspaceProject.targets.get('build');

      if (!buildTarget?.options) {
        Logger.warn(
          `Cannot find 'options' for ${options.project} build target.`
        );
        return;
      }

      const externalDependencies =
        buildTarget.options.externalDependencies ?? [];

      if (!Array.isArray(externalDependencies)) {
        Logger.warn(
          `externalDependencies property in 'options' for ${options.project} build target is not an array.`
        );
        return;
      }

      buildTarget.options.externalDependencies = [
        ...externalDependencies,
        '@nestjs/core',
        '@nestjs/common',
        '@nestjs/websockets',
        '@nestjs/microservices',
        '@nestjs/ng-universal',
        'domino'
      ];
    });
  };
}

function addFiles(options: UniversalOptions): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const browserDistDir = await getOutputPath(tree, options.project);
    const isStandalone = await getIsStandaloneApp(tree, options.project);

    const rule = mergeWith(
      apply(url('./files/root'), [
        template({
          ...strings,
          browserDistDir,
          isStandalone
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

export default function (options: UniversalOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    return chain([
      externalSchematic('@angular/ssr', 'ng-add', options),
      addFiles(options),
      addDependencies(options)
    ]);
  };
}
