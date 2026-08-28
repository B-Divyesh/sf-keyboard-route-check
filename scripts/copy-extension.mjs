import { cp, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const output = '.output';
const targetDir = 'dist/site/downloads';
await mkdir(targetDir, { recursive: true });
const archive = (await readdir(output)).find((name) => name.endsWith('.zip'));
if (!archive) throw new Error('Extension archive not found. Run npm run package:extension first.');
await cp(join(output, archive), join(targetDir, 'keyboard-route-check.zip'));
