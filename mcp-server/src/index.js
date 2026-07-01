const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3100;
const API_KEY = process.env.PLAYBOOK_API_KEY || '';
const REPO_ROOT = path.resolve(__dirname, '../..');

// catalog.json 경로
const CATALOG_PATH = path.join(REPO_ROOT, 'catalog.json');

function readCatalog() {
  const raw = fs.readFileSync(CATALOG_PATH, 'utf-8');
  return JSON.parse(raw);
}

function readAsset(assetPath) {
  const fullPath = path.join(REPO_ROOT, assetPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

function parseFrontmatter(content) {
  // Normalize line endings (Windows \r\n → \n)
  const normalized = content.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: normalized };

  const frontmatterLines = match[1].split('\n');
  const frontmatter = {};
  for (const line of frontmatterLines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      // Simple array parsing
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim().replace(/"/g, ''));
      }
      // Remove quotes
      if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }
  return { frontmatter, body: match[2] };
}

function authenticate(req) {
  if (!API_KEY) return true; // 키 미설정 시 인증 없이 허용
  const authHeader = req.headers['authorization'] || '';
  return authHeader === `Bearer ${API_KEY}`;
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function sendError(res, message, status = 400) {
  sendJson(res, { error: message }, status);
}


const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Auth check
  if (!authenticate(req)) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    // GET /health
    if (pathname === '/health') {
      const catalog = readCatalog();
      sendJson(res, {
        status: 'ok',
        assetCount: catalog.assets.length,
        groupCount: Object.keys(catalog.groups || {}).length,
        updatedAt: catalog.updatedAt
      });
      return;
    }

    // GET /api/catalog
    if (pathname === '/api/catalog') {
      const catalog = readCatalog();
      const type = url.searchParams.get('type');
      const tags = url.searchParams.get('tags');

      let assets = catalog.assets;

      if (type) {
        assets = assets.filter(a => a.type === type);
      }
      if (tags) {
        const tagList = tags.split(',').map(t => t.trim());
        assets = assets.filter(a =>
          tagList.some(t => a.tags && a.tags.includes(t))
        );
      }

      sendJson(res, {
        assets,
        groups: catalog.groups || {}
      });
      return;
    }

    // GET /api/asset/:id
    if (pathname.startsWith('/api/asset/')) {
      const id = pathname.slice('/api/asset/'.length);
      const catalog = readCatalog();
      const entry = catalog.assets.find(a => a.id === id);

      if (!entry) {
        sendError(res, `Asset '${id}' not found`, 404);
        return;
      }

      const content = readAsset(entry.path);
      if (!content) {
        sendError(res, `Asset file not found: ${entry.path}`, 404);
        return;
      }

      const { frontmatter, body } = parseFrontmatter(content);

      sendJson(res, {
        ...entry,
        frontmatter,
        content: body
      });
      return;
    }

    // GET /api/group/:id
    if (pathname.startsWith('/api/group/')) {
      const groupId = pathname.slice('/api/group/'.length);
      const catalog = readCatalog();
      const group = (catalog.groups || {})[groupId];

      if (!group) {
        sendError(res, `Group '${groupId}' not found`, 404);
        return;
      }

      // 그룹에 포함된 자산들의 상세 정보도 함께 반환
      const assets = group.assets.map(assetId =>
        catalog.assets.find(a => a.id === assetId)
      ).filter(Boolean);

      sendJson(res, {
        id: groupId,
        ...group,
        assetDetails: assets
      });
      return;
    }

    // GET /api/suggest?q=...
    if (pathname === '/api/suggest') {
      const query = (url.searchParams.get('q') || '').toLowerCase();
      if (!query) {
        sendError(res, 'Query parameter "q" is required');
        return;
      }

      const catalog = readCatalog();
      const keywords = query.split(/\s+/);

      const scored = catalog.assets.map(asset => {
        const text = `${asset.name} ${asset.description} ${(asset.tags || []).join(' ')}`.toLowerCase();
        const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
        return { ...asset, relevance: score };
      }).filter(a => a.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5);

      sendJson(res, { suggestions: scored });
      return;
    }

    // 404
    sendError(res, 'Not found', 404);

  } catch (err) {
    console.error('[ERROR]', err.message);
    sendError(res, 'Internal server error', 500);
  }
});

server.listen(PORT, () => {
  console.log(`[ai-playbook-server] Running on port ${PORT}`);
  const catalog = readCatalog();
  console.log(`[ai-playbook-server] ${catalog.assets.length} assets, ${Object.keys(catalog.groups || {}).length} groups loaded`);
});
