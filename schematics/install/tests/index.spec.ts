import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';

import { Schema as NgAddOptions } from '../schema';

const collectionPath = require.resolve('../../collection.json');

async function createWorkspace(appOptions: object = {}) {
  const testRunner = new SchematicTestRunner(
    'ng-universal-schematics',
    collectionPath
  );

  const tree = await testRunner
    .runExternalSchematicAsync('@schematics/angular', 'workspace', {
      name: 'ng-universal-workspace',
      newProjectRoot: 'projects',
      version: '15.0.4'
    })
    .toPromise();

  return await testRunner
    .runExternalSchematicAsync(
      '@schematics/angular',
      'application',
      {
        ...appOptions,
        name: 'ng-universal-app'
      },
      tree
    )
    .toPromise();
}

describe('ng-add', () => {
  let tree: UnitTestTree;
  let schematicRunner: SchematicTestRunner;

  const appOptions = { project: 'ng-universal-app' };

  beforeEach(async () => {
    // Generate a basic Angular CLI application.
    tree = await createWorkspace();
    schematicRunner = new SchematicTestRunner('schematics', collectionPath);
  });

  it('should run ng-add without exceptions', async () => {
    // Arrange & act
    tree = await schematicRunner
      .runSchematicAsync<NgAddOptions>('ng-add', appOptions, tree)
      .toPromise();

    // Assert
    expect(tree.files).toBeDefined();
  });

  it('should add server.ts, main.ts and app.module.ts files', async () => {
    // Arrange & act
    tree = await schematicRunner
      .runSchematicAsync<NgAddOptions>('ng-add', appOptions, tree)
      .toPromise();

    const server = getFileContent(tree, '/server.ts');
    const main = getFileContent(tree, '/server/main.ts');
    const appModule = getFileContent(tree, '/server/app.module.ts');

    // Assert
    expect(server).toContain("import 'zone.js/node'");
    expect(main).toContain('await app.listen(process.env.PORT || 4000)');
    expect(appModule).toContain(
      "viewsPath: join(process.cwd(), 'dist/ng-universal-app/browser')"
    );
  });

  it('should install dependencies', async () => {
    // Arrange & act
    tree = await schematicRunner
      .runSchematicAsync<NgAddOptions>('ng-add', appOptions, tree)
      .toPromise();

    const dependencies = Object.keys(
      JSON.parse(getFileContent(tree, '/package.json')).dependencies
    );

    // Assert
    [
      '@nestjs/common',
      '@nestjs/core',
      'reflect-metadata',
      'class-transformer',
      'class-validator',
      '@nestjs/platform-express',
      '@nestjs/ng-universal',
      '@nguniversal/express-engine'
    ].forEach((dependency) => {
      expect(dependencies).toContain(dependency);
    });
  });

  it('should add externalDependencies and disable optimization for the server target', async () => {
    // Arrange & act
    tree = await schematicRunner
      .runSchematicAsync<NgAddOptions>('ng-add', appOptions, tree)
      .toPromise();

    const { projects } = JSON.parse(getFileContent(tree, '/angular.json'));
    const { server } = projects[appOptions.project].architect;

    // Assert
    expect(server.configurations.production.optimization).toEqual(false);
    expect(server.options.externalDependencies).toEqual([
      '@nestjs/microservices',
      '@nestjs/microservices/microservices-module',
      '@nestjs/websockets',
      '@nestjs/websockets/socket-module',
      'cache-manager'
    ]);
  });
});
