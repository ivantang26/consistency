import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = process.argv.includes('--dist') ? path.join(root, 'dist') : root;
const port = Number(process.env.PORT || 5173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const allowed = new Set(['/index.html', '/styles.css', '/favicon.svg', '/src/app.js', '/src/calculator.js', '/src/presets.js', '/src/state.js', '/assets/firms/tradeify.png', '/assets/firms/topstep.png', '/assets/firms/mffu.png', '/assets/firms/ftmo.png']);
const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const route = pathname === '/' ? '/index.html' : pathname;
  if (!allowed.has(route)) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const filename = path.join(publicRoot, route);
    await stat(filename);
    const content = await readFile(filename);
    res.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Consistency is ready at http://127.0.0.1:${port}`));
