import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/site/', import.meta.url));
const repo = fileURLToPath(new URL('../', import.meta.url));
const rewrites = new Map([
  ['/demo', 'demo.html'],
  ['/privacy', 'privacy.html'],
  ['/terms', 'terms.html'],
  ['/404', '404.html']
]);
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.zip': 'application/zip' };

function fileFor(pathname) {
  if (pathname === '/') return { file: join(root, 'index.html'), status: 200 };
  if (pathname.startsWith('/fixtures/')) {
    const fixture = join(repo, 'tests', normalize(pathname).replace(/^([/\\])+/, ''));
    if (fixture.startsWith(join(repo, 'tests', 'fixtures')) && existsSync(fixture) && statSync(fixture).isFile()) return { file: fixture, status: 200 };
  }
  const rewritten = rewrites.get(pathname);
  if (rewritten) return { file: join(root, rewritten), status: 200 };
  const clean = normalize(pathname).replace(/^([/\\])+/, '');
  const file = join(root, clean);
  if (file.startsWith(root) && existsSync(file) && statSync(file).isFile()) return { file, status: 200 };
  return { file: join(root, '404.html'), status: 404 };
}

createServer((request, response) => {
  const { file, status } = fileFor(new URL(request.url, 'http://localhost').pathname);
  response.writeHead(status, { 'content-type': `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8` });
  createReadStream(file).pipe(response);
}).listen(4173, '127.0.0.1');
