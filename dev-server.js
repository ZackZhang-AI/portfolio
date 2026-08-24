// Zero-dependency static dev server for the portfolio site.
// Accepts forwarded CLI args: --port 7100 / --port=7100 / --host 127.0.0.1 / --host=127.0.0.1
// Also honors PORT / HOST env vars. Defaults: host 127.0.0.1, port 7100.
const http = require("http");
const fs = require("fs");
const path = require("path");

function argValue(name, argv) {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === name && argv[i + 1]) return argv[i + 1];
    if (argv[i].startsWith(name + "=")) return argv[i].slice(name.length + 1);
  }
  return null;
}

const argv = process.argv.slice(2);
const port = Number(argValue("--port", argv) || process.env.PORT) || 7100;
const host = argValue("--host", argv) || process.env.HOST || "127.0.0.1";
const root = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8"
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const filePath = path.normalize(path.join(root, urlPath));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found: " + urlPath);
        return;
      }
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-cache"
      });
      res.end(data);
    });
  } catch (e) {
    res.writeHead(500);
    res.end("Server error");
  }
});

server.listen(port, host, () => {
  console.log(`Portfolio dev server running at http://${host}:${port}/`);
});
