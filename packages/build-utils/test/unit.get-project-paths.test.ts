import path from 'path';
import { getProjectPaths, ProjectPath } from '../src/get-project-paths';
import { FixtureFilesystem } from './utils/fixture-filesystem';

describe.each<[ProjectPath[], string]>([
  [
    ['backend/app-three', 'frontend/app-one', 'frontend/app-two'],
    '30-monorepo-no-workspaces',
  ],
  [[], '31-no-monorepo'],
  [[], '32-monorepo-highly-nested'],
])('`getProjectPaths()`', (paths, fixturePath) => {
  const testName =
    paths.length > 0
      ? `should detect ${paths.join()} project${
          paths.length > 1 ? 's' : ''
        } for ${fixturePath}`
      : `should not detect any path for ${fixturePath}`;

  it(testName, async () => {
    const fixture = path.join(__dirname, 'fixtures', fixturePath);
    const fs = new FixtureFilesystem(fixture);

    const actualPaths = await getProjectPaths({ fs });

    expect(actualPaths).toEqual(expect.arrayContaining(paths));
  });
});
