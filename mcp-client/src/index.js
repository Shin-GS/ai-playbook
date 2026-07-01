#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const API_URL = process.env.PLAYBOOK_API_URL || 'http://localhost:3100';
const API_KEY = process.env.PLAYBOOK_API_KEY || '';

async function fetchApi(path) {
  const url = `${API_URL}${path}`;
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

const server = new Server(
  { name: 'ai-playbook', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Tool: list_catalog
server.setRequestHandler('tools/list', async () => ({
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
    }
  ]
}));


// Tool execution
server.setRequestHandler('tools/call', async (request) => {
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

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
