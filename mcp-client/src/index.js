#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { ListToolsRequestSchema, CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const API_URL = process.env.PLAYBOOK_API_URL || 'http://localhost:3100';
const API_KEY = process.env.PLAYBOOK_API_KEY || '';

async function fetchApi(apiPath) {
  const url = `${API_URL}${apiPath}`;
  const headers = {};
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * 파일 내용의 SHA-256 해시를 계산한다 (LF 정규화 후).
 */
function computeHash(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  return 'sha256:' + crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * 프로젝트 루트에서 _playbook.json을 찾는다.
 */
function findPlaybookJson(projectRoot) {
  const filePath = path.join(projectRoot, '_playbook.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

/**
 * 도구 환경을 감지한다.
 */
function detectTool(projectRoot) {
  if (fs.existsSync(path.join(projectRoot, '.kiro'))) return 'kiro';
  if (fs.existsSync(path.join(projectRoot, '.claude'))) return 'claude-code';
  if (fs.existsSync(path.join(projectRoot, 'CLAUDE.md'))) return 'claude-code';
  return '';
}

const server = new Server(
  { name: 'ai-playbook', version: '1.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_catalog',
      description: 'ai-playbook 자산 목록 조회. 세션 시작 시 호출하여 사용 가능한 자산과 그룹을 확인한다. type이나 tags로 필터 가능.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', description: '자산 타입 필터 (rule, workflow, agent, automation, skill)', enum: ['rule', 'workflow', 'agent', 'automation', 'skill'] },
          tags: { type: 'string', description: '태그 필터 (쉼표 구분)' }
        }
      }
    },
    {
      name: 'load_asset',
      description: '특정 자산의 전체 내용(frontmatter + 본문)을 로드한다. 프로젝트에 다운로드하거나 참조할 때 사용.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '자산 ID' }
        },
        required: ['id']
      }
    },
    {
      name: 'suggest_assets',
      description: '작업 설명을 기반으로 관련 자산을 추천한다. 키워드 매칭으로 상위 5개 반환.',
      inputSchema: {
        type: 'object',
        properties: {
          task_description: { type: 'string', description: '현재 작업 설명' }
        },
        required: ['task_description']
      }
    },
    {
      name: 'get_group',
      description: '자산 그룹의 상세 정보를 조회한다. 그룹에 포함된 자산 목록과 설명 반환.',
      inputSchema: {
        type: 'object',
        properties: {
          group_id: { type: 'string', description: '그룹 ID (java-backend, react-frontend, common-rules 등)' }
        },
        required: ['group_id']
      }
    },
    {
      name: 'init_project',
      description: '프로젝트에 playbook 연동을 초기화한다. _playbook.json과 playbook-sync steering 파일을 생성하고, 사용자에게 물어볼 질문과 사용 가능한 프리셋 목록을 반환한다.',
      inputSchema: {
        type: 'object',
        properties: {
          project_root: { type: 'string', description: '프로젝트 루트 절대 경로' },
          tool: { type: 'string', description: '사용 중인 AI 도구 (자동 감지 가능)', enum: ['kiro', 'claude-code'] }
        },
        required: ['project_root']
      }
    },
    {
      name: 'apply_preset',
      description: '사용자의 용도에 맞는 프리셋을 적용한다. 프리셋에 정의된 defaults + groups + extras 자산 목록을 계산하여 반환한다. 실제 파일 다운로드는 에이전트가 load_asset으로 수행.',
      inputSchema: {
        type: 'object',
        properties: {
          project_root: { type: 'string', description: '프로젝트 루트 절대 경로' },
          preset_ids: { type: 'array', items: { type: 'string' }, description: '적용할 프리셋 ID 목록 (여러 개 가능)' },
          purpose: { type: 'array', items: { type: 'string' }, description: '사용자가 답변한 용도 (원문 그대로)' }
        },
        required: ['project_root', 'preset_ids']
      }
    },
    {
      name: 'check_updates',
      description: '프로젝트에 적용된 자산들의 최신 버전을 확인하고, 갱신이 필요한 자산 목록을 반환한다.',
      inputSchema: {
        type: 'object',
        properties: {
          project_root: { type: 'string', description: '프로젝트 루트 절대 경로' }
        },
        required: ['project_root']
      }
    }
  ]
}));


server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_catalog': {
        const params = new URLSearchParams();
        if (args.type) params.set('type', args.type);
        if (args.tags) params.set('tags', args.tags);
        const query = params.toString() ? `?${params.toString()}` : '';
        const data = await fetchApi(`/api/catalog${query}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'load_asset': {
        const data = await fetchApi(`/api/asset/${args.id}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'suggest_assets': {
        const data = await fetchApi(`/api/suggest?q=${encodeURIComponent(args.task_description)}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'get_group': {
        const data = await fetchApi(`/api/group/${args.group_id}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'init_project': {
        return await handleInitProject(args);
      }

      case 'apply_preset': {
        return await handleApplyPreset(args);
      }

      case 'check_updates': {
        return await handleCheckUpdates(args);
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});


/**
 * init_project: 프로젝트 playbook 초기화
 */
async function handleInitProject(args) {
  const projectRoot = args.project_root;

  if (!fs.existsSync(projectRoot)) {
    return { content: [{ type: 'text', text: `Error: 프로젝트 경로가 존재하지 않습니다: ${projectRoot}` }], isError: true };
  }

  // 이미 초기화된 경우 현재 상태 반환
  const existing = findPlaybookJson(projectRoot);
  if (existing) {
    const catalog = await fetchApi('/api/catalog');
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'already_initialized',
          playbook: existing,
          catalog_summary: {
            assetCount: catalog.assets.length,
            groupCount: Object.keys(catalog.groups || {}).length,
            groups: Object.entries(catalog.groups || {}).map(([id, g]) => ({
              id, description: g.description, assetCount: g.assets.length
            }))
          },
          presets: catalog.presets || {}
        }, null, 2)
      }]
    };
  }

  // 도구 감지
  const tool = args.tool || detectTool(projectRoot) || 'kiro';

  // _playbook.json 생성
  const playbookData = {
    tool,
    purpose: [],
    presets: [],
    appliedGroups: [],
    applied: [],
    declined: [],
    pendingUpdates: [],
    history: [{
      date: new Date().toISOString().split('T')[0],
      action: 'initialized',
      tool
    }]
  };

  const playbookPath = path.join(projectRoot, '_playbook.json');
  fs.writeFileSync(playbookPath, JSON.stringify(playbookData, null, 2) + '\n', 'utf-8');

  // playbook-sync.md 생성 (도구에 따라 위치 다름)
  let syncFilePath;
  const syncContent = generateSyncContent();

  if (tool === 'kiro') {
    const steeringDir = path.join(projectRoot, '.kiro', 'steering');
    fs.mkdirSync(steeringDir, { recursive: true });
    syncFilePath = path.join(steeringDir, 'playbook-sync.md');
  } else {
    // claude-code: .claude/docs/에 저장
    const docsDir = path.join(projectRoot, '.claude', 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    syncFilePath = path.join(docsDir, 'playbook-sync.md');
  }

  fs.writeFileSync(syncFilePath, syncContent, 'utf-8');

  // catalog 요약 + 스택 감지
  const catalog = await fetchApi('/api/catalog');
  const stackDetection = detectStackAndRecommend(projectRoot, catalog);

  // presets 목록 (사용자 선택용)
  const presets = catalog.presets || {};
  const presetList = Object.entries(presets).map(([id, p]) => ({
    id,
    description: p.description,
    keywords: p.keywords
  }));

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        status: 'initialized',
        tool,
        files_created: [
          playbookPath,
          syncFilePath
        ],
        detectedStack: stackDetection.detectedStack,
        askUser: '이 프로젝트에서 주로 뭘 하시나요? (여러 개 가능. 예: 웹서버 개발, 만화 그리기, 사진 편집, 기획 문서 작성 등)',
        availablePresets: presetList,
        autoRecommendations: stackDetection.recommendedGroups,
        nextStep: '사용자 답변을 받은 후 apply_preset을 호출하여 맞춤 자산을 적용하세요.'
      }, null, 2)
    }]
  };
}

/**
 * check_updates: 적용된 자산의 갱신 확인
 */
async function handleCheckUpdates(args) {
  const projectRoot = args.project_root;
  const playbook = findPlaybookJson(projectRoot);

  if (!playbook) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'not_initialized',
          message: '이 프로젝트에 _playbook.json이 없습니다. init_project를 먼저 실행하세요.'
        }, null, 2)
      }]
    };
  }

  if (!playbook.applied || playbook.applied.length === 0) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'no_assets',
          message: '적용된 자산이 없습니다.'
        }, null, 2)
      }]
    };
  }

  const catalog = await fetchApi('/api/catalog');
  const updates = [];
  const disabledSet = new Set(playbook.disabled || []);

  for (const applied of playbook.applied) {
    // disabled된 자산은 갱신 체크 건너뜀
    if (disabledSet.has(applied.id)) continue;

    const catalogEntry = catalog.assets.find(a => a.id === applied.id);
    if (!catalogEntry) continue;

    // 버전 비교
    if (catalogEntry.version !== applied.version || catalogEntry.updatedAt !== applied.updatedAt) {
      // customized 체크 (contentHash 비교)
      let customized = false;
      if (applied.contentHash && applied.localPath) {
        const localFile = path.join(projectRoot, applied.localPath);
        if (fs.existsSync(localFile)) {
          const currentContent = fs.readFileSync(localFile, 'utf-8');
          const currentHash = computeHash(currentContent);
          customized = (currentHash !== applied.contentHash);
        }
      }

      updates.push({
        id: applied.id,
        name: catalogEntry.name,
        fromVersion: applied.version,
        toVersion: catalogEntry.version,
        changeLevel: catalogEntry.changeLevel,
        changelog: catalogEntry.changelog,
        customized
      });
    }
  }

  // defaults 새 자산 감지 (프로젝트에 미적용된 defaults)
  const allDefaults = catalog.defaults || {};
  const appliedIds = new Set((playbook.applied || []).map(a => a.id));
  const newDefaults = [];

  for (const [category, assetIds] of Object.entries(allDefaults)) {
    for (const assetId of assetIds) {
      if (!appliedIds.has(assetId) && !disabledSet.has(assetId)) {
        const entry = catalog.assets.find(a => a.id === assetId);
        if (entry) {
          newDefaults.push({ id: assetId, name: entry.name, category, description: entry.description });
        }
      }
    }
  }

  // 그룹 변경 감지 (적용된 그룹의 version 비교)
  const groupUpdates = [];
  const appliedGroups = playbook.appliedGroups || [];
  const catalogGroups = catalog.groups || {};

  for (const groupId of appliedGroups) {
    const group = catalogGroups[groupId];
    if (!group || !group.version) continue;

    // _playbook.json에 그룹 적용 시점의 version을 기록해야 비교 가능
    // appliedGroups가 단순 ID 배열이면 version 비교 불가 → 새 자산 유무로 판별
    const groupAssets = group.assets || [];
    const newInGroup = groupAssets.filter(id => !appliedIds.has(id) && !disabledSet.has(id));
    if (newInGroup.length > 0) {
      groupUpdates.push({
        groupId,
        groupVersion: group.version,
        changelog: group.changelog,
        newAssets: newInGroup.map(id => {
          const entry = catalog.assets.find(a => a.id === id);
          return entry ? { id, name: entry.name, type: entry.type } : { id };
        })
      });
    }
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        status: 'checked',
        tool: playbook.tool,
        appliedCount: playbook.applied.length,
        disabledCount: disabledSet.size,
        updatesAvailable: updates.length,
        updates,
        newDefaultsAvailable: newDefaults.length,
        newDefaults,
        groupUpdatesAvailable: groupUpdates.length,
        groupUpdates
      }, null, 2)
    }]
  };
}

/**
 * apply_preset: 프리셋 기반으로 적용할 자산 목록 계산 + _playbook.json 갱신
 */
async function handleApplyPreset(args) {
  const projectRoot = args.project_root;
  const presetIds = args.preset_ids || [];
  const purpose = args.purpose || [];

  const playbookPath = path.join(projectRoot, '_playbook.json');
  if (!fs.existsSync(playbookPath)) {
    return { content: [{ type: 'text', text: 'Error: _playbook.json이 없습니다. init_project를 먼저 실행하세요.' }], isError: true };
  }

  const playbook = JSON.parse(fs.readFileSync(playbookPath, 'utf-8'));
  const catalog = await fetchApi('/api/catalog');
  const presets = catalog.presets || {};
  const defaults = catalog.defaults || {};
  const groups = catalog.groups || {};

  // 적용할 자산 ID 수집 (중복 제거)
  const assetIds = new Set();
  const appliedPresetIds = [];

  for (const presetId of presetIds) {
    const preset = presets[presetId];
    if (!preset) continue;

    appliedPresetIds.push(presetId);

    // defaults 포함
    if (preset.includeDefaults) {
      for (const defaultKey of preset.includeDefaults) {
        const defaultAssets = defaults[defaultKey] || [];
        defaultAssets.forEach(id => assetIds.add(id));
      }
    }

    // groups 포함
    if (preset.groups) {
      for (const groupId of preset.groups) {
        const group = groups[groupId];
        if (group && group.assets) {
          group.assets.forEach(id => assetIds.add(id));
        }
      }
    }

    // extras 포함
    if (preset.extras) {
      preset.extras.forEach(id => assetIds.add(id));
    }
  }

  // 이미 적용된 자산 제외
  const alreadyApplied = new Set((playbook.applied || []).map(a => a.id));
  const toApply = [...assetIds].filter(id => !alreadyApplied.has(id));

  // 자산 상세 정보 첨부
  const toApplyDetails = toApply.map(id => {
    const entry = catalog.assets.find(a => a.id === id);
    return entry ? { id: entry.id, type: entry.type, name: entry.name, description: entry.description, dependsOn: entry.dependsOn } : { id };
  });

  // 의존성으로 인해 추가로 필요한 자산
  const additionalDeps = new Set();
  for (const asset of toApplyDetails) {
    if (asset.dependsOn) {
      for (const dep of asset.dependsOn) {
        if (!assetIds.has(dep) && !alreadyApplied.has(dep)) {
          additionalDeps.add(dep);
        }
      }
    }
  }

  // _playbook.json 갱신 (purpose, presets 기록)
  playbook.purpose = [...new Set([...(playbook.purpose || []), ...purpose])];
  playbook.presets = [...new Set([...(playbook.presets || []), ...appliedPresetIds])];
  playbook.history.push({
    date: new Date().toISOString().split('T')[0],
    action: 'preset_applied',
    presets: appliedPresetIds,
    purpose
  });

  fs.writeFileSync(playbookPath, JSON.stringify(playbook, null, 2) + '\n', 'utf-8');

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        status: 'preset_calculated',
        appliedPresets: appliedPresetIds,
        purpose: playbook.purpose,
        assetsToApply: toApplyDetails,
        additionalDependencies: [...additionalDeps],
        alreadyAppliedCount: alreadyApplied.size,
        totalNewAssets: toApply.length,
        nextStep: '위 자산 목록을 사용자에게 보여주고, 승인받은 후 각 자산을 load_asset으로 다운로드하여 도구별 매핑에 따라 변환하세요.'
      }, null, 2)
    }]
  };
}

/**
 * playbook-sync.md 내용 생성
 */
function generateSyncContent() {
  return `---
inclusion: always
---

# ai-playbook 연동

ai-playbook MCP 서버 사용 중.

## 세션 시작 시

1. \`list_catalog\` 도구를 호출하여 자산 목록(id, version, updatedAt, changeLevel, changelog)을 확인하라.
2. 프로젝트 루트에 \`_playbook.json\`이 있으면:
   - applied 자산들의 version/updatedAt과 catalog의 값을 비교
   - 차이 있는 것만 수집
   - 로컬 파일 해시와 contentHash 비교로 customized 여부 자동 감지
   - changeLevel별 처리:
     - **patch**: 즉시 갱신, 완료 후 한 줄 안내
     - **minor**: "v{old}→v{new}: {changelog}. 갱신합니다 (취소하려면 말씀하세요)"
     - **breaking**: "⚠️ v{old}→v{new} (breaking): {changelog}. 갱신할까요?" → 명시적 승인 필요
   - 로컬에서 수정된 자산 (해시 불일치): 어떤 레벨이든 사용자 확인 필수
3. MCP 연결 안 되면: 동기화 스킵, 로컬 파일로 정상 동작

## 작업 중 새 자산 제안

작업 중 catalog 목록에서 프로젝트에 유용한 자산을 발견하면:
- "playbook에 {name}이 있는데 다운로드할까요? — {description}"
- 허락 시: \`load_asset\`으로 내용 가져와서 → 도구별 매핑에 따라 변환 → 프로젝트에 저장 → _playbook.json 갱신
- 거절 시: _playbook.json의 declined에 기록 → 같은 자산 다시 제안하지 않음

### 제안 기준
- 프로젝트에 해당 기술 스택이 확인될 때만
- declined에 있는 자산은 제안하지 않음
- 한 세션에 최대 2개까지만 제안

### 의존성 자동 처리
- 다운로드 대상의 \`dependsOn\` 확인
- 미적용 의존 자산이 있으면 함께 제안: "{대상}이 {의존}에 의존합니다. 함께 다운로드할까요?"
- 승인 시 의존 자산부터 순서대로 다운로드

## 우선순위
- 사용자의 작업 요청이 항상 최우선
- 동기화 안내는 작업 완료 후 마지막에 짧게
- breaking 갱신은 작업 시작 전에 안내 (구버전으로 작업하는 것 방지)

## 초기 세팅 (처음 연결 시)

\`_playbook.json\`이 없거나 \`purpose\`가 비어 있으면:

1. 맥락이 충분한 경우 (이미 구체적 작업 요청이 온 경우):
   - 스택 자동 감지 + 요청 내용에서 용도 추론 → 적합한 프리셋 자동 제안
2. 맥락이 부족한 경우 (첫 세션, 일반적 인사 등):
   - 사용자에게 질문: "이 프로젝트에서 주로 뭘 하시나요? (여러 개 가능)"
   - 답변 기반으로 프리셋 매칭 → \`apply_preset\` 호출
3. 프리셋 적용 후:
   - defaults(always) 자산은 안내 없이 자동 적용
   - 나머지는 목록 보여주고 승인 받기

## 용도 변경/추가

이미 \`purpose\`가 있는 프로젝트에서 새로운 용도가 감지되면:
- 해당 용도에 맞는 미적용 자산을 자연스럽게 제안
- 승인 시 purpose 배열에 추가 + 새 프리셋 적용

## 자산 비활성화 (disabled)

사용자가 특정 자산을 끄고 싶을 때:
- \`_playbook.json\`의 \`disabled\` 배열에 해당 자산 ID 추가
- disabled된 자산은 갱신 체크 시 건너뜀
- \`defaults.always\` 안전장치를 끄려 할 때 경고 필수

## defaults 새 자산 전파

catalog의 defaults에 새 자산이 추가된 경우:
- 다음 세션에서 미적용 defaults 자산을 감지하여 제안
- disabled에 있는 자산은 제안하지 않음
`;
}

/**
 * 프로젝트 기술 스택 감지 + 그룹 추천
 */
function detectStackAndRecommend(projectRoot, catalog) {
  const detected = [];
  const recommendations = [];

  // package.json 분석
  const pkgPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      if (allDeps.react || allDeps['react-dom']) {
        detected.push('react');
        recommendations.push({ group: 'react-frontend', reason: 'React 의존성 감지' });
      }
      if (allDeps.express || allDeps.fastify || allDeps.koa) {
        detected.push('nodejs');
        recommendations.push({ group: 'nodejs-backend', reason: 'Node.js 서버 프레임워크 감지' });
      }
      if (allDeps.typescript || allDeps['ts-node']) {
        detected.push('typescript');
      }
    } catch (e) { /* ignore */ }
  }

  // pom.xml (Java/Spring)
  if (fs.existsSync(path.join(projectRoot, 'pom.xml'))) {
    detected.push('java');
    recommendations.push({ group: 'java-backend', reason: 'pom.xml 감지 (Maven/Java)' });
  }

  // build.gradle (Java/Kotlin)
  if (fs.existsSync(path.join(projectRoot, 'build.gradle')) || fs.existsSync(path.join(projectRoot, 'build.gradle.kts'))) {
    detected.push('java');
    if (!recommendations.find(r => r.group === 'java-backend')) {
      recommendations.push({ group: 'java-backend', reason: 'build.gradle 감지 (Gradle/Java)' });
    }
  }

  // Python
  if (fs.existsSync(path.join(projectRoot, 'requirements.txt')) || fs.existsSync(path.join(projectRoot, 'pyproject.toml'))) {
    detected.push('python');
  }

  // 공통 규칙은 항상 추천
  recommendations.push({ group: 'common-rules', reason: '모든 프로젝트에 권장되는 공통 규칙' });

  return {
    detectedStack: detected,
    recommendedGroups: recommendations
  };
}


async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
