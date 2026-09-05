const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 3000);
const host = '0.0.0.0';
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function resolvePublicPath(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(urlPath, 'http://localhost').pathname);
  } catch {
    return null;
  }
  if (pathname === '/') pathname = '/index.html';
  const resolved = path.resolve(publicDir, `.${pathname}`);
  return resolved.startsWith(`${publicDir}${path.sep}`) ? resolved : null;
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  const filePath = resolvePublicPath(req.url || '/');
  if (!filePath) {
    res.writeHead(400);
    return res.end('Bad request');
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500);
      return res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
    }
    res.writeHead(200, {
      'content-type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'cache-control': 'no-cache'
    });
    res.end(data);
  });
});

if (require.main === module) {
  server.listen(port, host, () => console.log(`Tetris listening on ${host}:${port}`));
}

module.exports = { server, resolvePublicPath };
