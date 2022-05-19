import { detectFramework } from './detect-framework';
import { DetectorFilesystem } from './detectors/filesystem';
import frameworks from '@vercel/frameworks';

const MAX_DEPTH_TRAVERSE = 3;

export interface GetProjectPathsOptions {
  fs: DetectorFilesystem;
  path?: string;
  depth?: number;
}

export type ProjectPath = string;

export const getProjectPaths = async ({
  fs,
  path,
  depth = 0,
}: GetProjectPathsOptions): Promise<ProjectPath[] | any> => {
  if (depth > MAX_DEPTH_TRAVERSE) {
    return [];
  } else {
    const directoryContents = await fs.readdir(path ?? './');

    // This should only ever return one file bc there should never be more than one package.json in a directory
    const childFiles = directoryContents.filter(
      dir => dir.type === 'file' && dir.name === 'package.json'
    );
    const childDirs = directoryContents.filter(stat => stat.type === 'dir');

    const allPaths: Array<ProjectPath> = [];

    // Scenario 3
    if (!childDirs.length && !childFiles.length) {
      return allPaths;
    }

    if (childDirs.length) {
      const dirPaths = await Promise.all(
        childDirs.flatMap(async current => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const paths = await getProjectPaths({
            fs,
            path: current.path,
            depth: depth + 1,
          });
          return paths;
        })
      );
      dirPaths.flatMap(path => path).forEach(path => allPaths.push(path));
    }
    if (childFiles.length && path) {
      const framework = await detectFramework({
        fs: fs.chdir(path),
        frameworkList: frameworks,
      });
      if (framework) {
        allPaths.push(path);
      }
    }
    return allPaths;
  }
};
