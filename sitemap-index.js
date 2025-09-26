/*!
 * sitemap-index.js — writes sitemap_index.xml that lists subdomain sitemaps
 * MIT License
 */

const fs = require("fs");
const path = require("path");

const OUT = path.join(process.cwd(), "sitemap_index.xml");

// Provide subdomain sitemap URLs via env (comma-separated), or use defaults:
const LIST = (process.env.SITEMAPS || `
https://quietmoon.plnt.earth/sitemap.xml,
https://tunes.plnt.earth/sitemap.xml,
https://jar.plnt.earth/sitemap.xml,
https://honey.plnt.earth/sitemap.xml
`).split(",").map(s => s.trim()).filter(Boolean);

// Optional: set <lastmod> to today
const today = new Date().toISOString().slice(0,10);

const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${LIST.map(u => `  <sitemap>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join("\n")}
</sitemapindex>
`;

fs.writeFileSync(OUT, xml, "utf8");
