/*!
 * sitemap-generator.js — MIT
 * Generates sitemap.xml for a static site by scanning .html files.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTFILE = path.join(ROOT, "sitemap.xml");
const BASE_URL = (process.env.BASE_URL || "https://example.com").replace(/\/+$/,"");

const EXCLUDE_DIRS = new Set([".git", "node_modules", ".dist", "dist", "build", ".github"]);
const INCLUDE_EXT = new Set([".html"]);

function walk(dir) {
  let files = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") && e.name !== ".well-known") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      files = files.concat(walk(full));
    } else if (e.isFile() && INCLUDE_EXT.has(path.extname(e.name).toLowerCase())) {
      files.push(path.relative(ROOT, full));
    }
  }
  return files;
}
function toUrl(relPath) {
  const webPath = relPath.split(path.sep).join("/");
  if (webPath.toLowerCase() === "index.html") return `${BASE_URL}/`;
  return `${BASE_URL}/${encodeURI(webPath)}`;
}
function priorityFor(url) { return url === `${BASE_URL}/` ? "1.0" : "0.7"; }
function sitemap(urls) {
  const rows = urls.map(u => `  <url>
    <loc>${u}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priorityFor(u)}</priority>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}
(function main(){
  const urls = new Set();
  for (const rel of walk(ROOT)) {
    const url = toUrl(rel);
    urls.add(url);
    if (rel.toLowerCase().endsWith("/index.html")) {
      const folderUrl = url.replace(/index\.html$/i,"");
      urls.add(folderUrl.endsWith("/") ? folderUrl : folderUrl + "/");
    }
  }
  fs.writeFileSync(OUTFILE, sitemap(Array.from(urls).sort()), "utf8");
})();
