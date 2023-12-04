/**
 * Copied from angular/universal/express-engine/schematics/utils.ts
 * because Jest was unable to resolve the module(?) when running tests.
 * @ref https://github.com/angular/universal/blob/e1c5336536b985461d49dd5cea457aecac4be1bc/modules/express-engine/schematics/utils/utils.ts
 */
import { workspaces } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';

export async function getProject(
  host: Tree,
  projectName: string
): Promise<workspaces.ProjectDefinition> {
  const workspace = await readWorkspace(host);
  const project = workspace.projects.get(projectName);

  if (!project || project.extensions.projectType !== 'application') {
    throw new SchematicsException(
      `Universal requires a project type of 'application'.`
    );
  }

  return project;
}

export async function getOutputPath(
  host: Tree,
  projectName: string,
  target: 'server' | 'build'
): Promise<string> {
  // Generate new output paths
  const project = await getProject(host, projectName);
  const serverTarget = project.targets.get(target);
  if (!serverTarget || !serverTarget.options) {
    throw new SchematicsException(
      `Cannot find 'options' for ${projectName} ${target} target.`
    );
  }

  const { outputPath } = serverTarget.options;
  if (typeof outputPath !== 'string') {
    throw new SchematicsException(
      `outputPath for ${projectName} ${target} target is not a string.`
    );
  }

  return outputPath;
}
