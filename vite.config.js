import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs/promises';
import nodePath from 'node:path';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url));

function cdnPrefixImages() {
  const DEBUG = process.env.CDN_IMG_DEBUG === '1';
  let publicDir = '';
  const imageSet = new Set();

  const isAbsolute = (p) =>
    /^(?:[a-z]+:)?\/\//i.test(p) || p.startsWith('data:') || p.startsWith('blob:');

  const normalizeRef = (p) => {
    let s = p.trim();
    if (isAbsolute(s)) return s;
    s = s.replace(/^(\.\/)+/, '');
    while (s.startsWith('../')) s = s.slice(3);
    if (s.startsWith('/')) s = s.slice(1);
    if (!s.startsWith('images/')) return p;
    return '/' + s;
  };

  const toCDN = (p, cdn) => {
    const n = normalizeRef(p);
    if (isAbsolute(n)) return n;
    if (!n.startsWith('/images/')) return p;
    if (!imageSet.has(n)) return p;
    const base = cdn.endsWith('/') ? cdn : cdn + '/';
    return base + n.slice(1);
  };

  const rewriteHtml = (html, cdn) => {
    html = html.replace(
      /(src|href)\s*=\s*(['"])([^'"]+)\2/g,
      (_m, k, q, p) => `${k}=${q}${toCDN(p, cdn)}${q}`
    );
    return html;
  };

  const rewriteCssUrls = (code, cdn) =>
    code.replace(/url\((['"]?)([^'")\s]+)\1\)/g, (_m, q, p) => `url(${q}${toCDN(p, cdn)}${q})`);

  async function collectPublicImagesFrom(dir) {
    const imagesDir = nodePath.join(dir, 'images');
    const stack = [imagesDir];
    while (stack.length) {
      const cur = stack.pop();
      let entries = [];
      try {
        entries = await fs.readdir(cur, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const ent of entries) {
        const full = nodePath.join(cur, ent.name);
        if (ent.isDirectory()) {
          stack.push(full);
        } else if (ent.isFile()) {
          const rel = nodePath.relative(dir, full).split(nodePath.sep).join('/');
          const canonical = '/' + rel;
          imageSet.add(canonical);
          imageSet.add(canonical.slice(1));
        }
      }
    }
  }

  return {
    name: 'cdn-prefix-images-existing',
    apply: 'build',
    enforce: 'pre',

    configResolved(cfg) {
      publicDir = cfg.publicDir;
    },

    async buildStart() {
      await collectPublicImagesFrom(publicDir);
    },

    transformIndexHtml(html) {
      const cdn = process.env.CDN_IMG_PREFIX;
      if (!cdn) return html;
      return rewriteHtml(html, cdn);
    },

    transform(code, id) {
      const cdn = process.env.CDN_IMG_PREFIX;
      if (!cdn) return null;
      if (/\.(css|scss|sass|less|styl)$/i.test(id)) {
        const out = rewriteCssUrls(code, cdn);
        return out === code ? null : { code: out, map: null };
      }
      return null;
    },
  };
}

export default defineConfig(({ mode }) => {
  return {
    base: '/santo-graal/',
    server: {
      host: '::',
      port: 8080,
    },
    plugins: [
      tailwindcss(),
      react(),
      cdnPrefixImages(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react-router-dom': path.resolve(__dirname, './src/lib/react-router-dom-proxy.jsx'),
        'react-router-dom-original': 'react-router-dom',
      },
    },
    define: {
      __ROUTE_MESSAGING_ENABLED__: JSON.stringify(
        mode === 'production'
          ? process.env.VITE_ENABLE_ROUTE_MESSAGING === 'true'
          : process.env.VITE_ENABLE_ROUTE_MESSAGING !== 'false'
      ),
    },
  };
});
