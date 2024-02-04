/**
 * Copied from angular/universal/express-engine/schematics/utils.ts
 * because Jest was unable to resolve the module(?) when running tests.
 * @ref https://github.com/angular/universal/blob/e1c5336536b985461d49dd5cea457aecac4be1bc/modules/express-engine/schematics/utils/utils.ts
 */
import { workspaces } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';
import { getMainFilePath } from '@schematics/angular/utility/standalone/util';
import { isStandaloneApp } from '@schematics/angular/utility/ng-ast-utils';
import { ProjectType } from '@schematics/angular/utility/workspace-models';

export async function getProject(
  host: Tree,
  projectName: string
): Promise<workspaces.ProjectDefinition> {
  const workspace = await readWorkspace(host);
  const project = workspace.projects.get(projectName);

  if (project?.extensions.projectType !== ProjectType.Application) {
    throw new SchematicsException(
      `'@angular/ssr' requires a project type of '${ProjectType.Application}'.`
    );
  }

  return project;
}

export async function getOutputPath(
  host: Tree,
  projectName: string
): Promise<string> {
  // Generate new output paths
  const project = await getProject(host, projectName);
  const buildTarget = project.targets.get('build');

  if (!buildTarget || !buildTarget.options) {
    throw new SchematicsException(
      `Cannot find 'options' for ${projectName} build target.`
    );
  }

  const { outputPath } = buildTarget.options;
  if (typeof outputPath !== 'string') {
    throw new SchematicsException(
      `outputPath for ${projectName} build target is not a string.`
    );
  }

  const isStandaloneApp = await getIsStandaloneApp(host, projectName)

  if(isStandaloneApp) {
    return `${outputPath}/browser`
  }

  return outputPath;
}

export async function getIsStandaloneApp(
  host: Tree,
  projectName: string
): Promise<boolean> {
  const mainFilePath = await getMainFilePath(host, projectName);

  return isStandaloneApp(host, mainFilePath);
}
