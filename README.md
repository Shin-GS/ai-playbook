# ai-playbook

Portable AI development framework — agents, skills, workflows, and rules that work across any AI coding tool.

## 목적

AI 개발 도구(Kiro, Claude Code, Cursor 등)에서 공통으로 쓸 수 있는 에이전트/스킬/워크플로우/규칙을 도구 독립적으로 관리하고, MCP 서버를 통해 필요한 자산을 동적으로 제공하는 개인 개발 프레임워크.

## 핵심 설계 원칙

1. **source/가 유일한 원본** — 도구 독립적 마크다운. 여기만 수정.
2. **MCP 서버가 서빙** — source/ 파일을 직접 읽어서 API로 제공.
3. **도구별 매핑으로 변환** — 다운로드 시 각 도구(Kiro, Claude Code)가 자기 방식으로 변환/저장. 매핑은 `source/workflows/tool-mappings/`에 정의.
4. **파일별 frontmatter로 자기 설명** — AI가 파일 하나 열면 즉시 이해 가능.
5. **catalog.json은 인덱스** — 검색 + 동기화 + 그룹 + 프리셋 + defaults.
6. **프리셋 기반 초기 세팅** — "뭘 하시나요?" 한 마디로 맞춤 자산 일괄 적용.
7. **changeLevel 기반 갱신** — patch/minor는 자동, breaking은 사용자 확인 필수.
8. **contentHash로 customized 감지** — 로컬 수정 여부를 해시로 자동 판별.

## 디렉토리 구조

```
ai-playbook/
├── README.md
├── catalog.json                 ← 자산 인덱스 + 그룹 + defaults + presets
│
├── source/                      ← 도구 독립 원본 (유일한 소스 오브 트루스)
│   ├── agents/                  ← 에이전트 역할 정의
│   ├── skills/                  ← 도메인 지식 (서브폴더 자유 확장)
│   ├── workflows/               ← 작업 순서 패턴
│   │   └── tool-mappings/       ← 도구별 변환 규칙 (kiro.md, claude-code.md)
│   ├── rules/                   ← 코딩/프로세스 규칙
│   └── automations/             ← 자동화 의도 (트리거 → 액션)
│
├── templates/
│   └── init/                    ← 프로젝트 초기화 템플릿
│       ├── _playbook.json       ← 상태 추적 파일 초기값
│       └── playbook-sync.md     ← 동기화 steering 템플릿
│
├── mcp-server/                  ← VPS에 배포할 HTTP API 서버
├── mcp-client/                  ← npm 배포할 MCP 프로세스 (AI 도구 연결부)
│   └── global/
│       └── playbook-sync.md     ← 글로벌 동기화 정책
│
└── docs/                        ← 프로젝트 문서
```

## Quick Start

### 1. 서버 실행 (로컬 또는 VPS)

```bash
cd mcp-server && npm start
# → http://localhost:3100
```

### 2. MCP 클라이언트 설정

```json
// ~/.kiro/settings/mcp.json
{
  "mcpServers": {
    "ai-playbook": {
      "command": "node",
      "args": ["/path/to/ai-playbook/mcp-client/src/index.js"],
      "env": {
        "PLAYBOOK_API_URL": "http://localhost:3100"
      },
      "autoApprove": ["list_catalog", "init_project", "check_updates"]
    }
  }
}
```

### 3. 사용

글로벌 MCP 설정이 되어 있으면, 아무 프로젝트에서 세션 시작 시 에이전트가 자동으로:
1. playbook 서버 연결 확인
2. `_playbook.json` 없으면 → "뭘 하시나요?" 질문
3. 용도에 맞는 프리셋 추천 → 승인 시 자산 다운로드

## 자산 타입

| 타입 | 용도 | Kiro 변환 | Claude Code 변환 |
|------|------|-----------|-----------------|
| rule | 제약 — "이렇게 해라" | `.kiro/steering/{id}.md` | `CLAUDE.md` 섹션 |
| workflow | 프로세스 — "이 순서로 해라" | `.kiro/steering/{id}.md` | `CLAUDE.md` 섹션 |
| skill | 지식 — "이걸 알아둬라" | `.kiro/steering/{id}.md` (manual) | `.claude/docs/{id}.md` |
| agent | 페르소나 — "이 관점으로 봐라" | `.kiro/agents/{id}.md` | `.claude/commands/{id}.md` |
| automation | 트리거 — "이때 자동으로 해라" | `.kiro/hooks/{id}.kiro.hook` | `CLAUDE.md` 규칙 |

## 프리셋

초기 세팅 시 용도를 말하면 맞춤 자산을 일괄 적용:

| 프리셋 | 용도 | 포함 내용 |
|--------|------|-----------|
| java-backend-dev | Java/Spring 백엔드 | java-backend 그룹 + workflow-full + defaults |
| react-frontend-dev | React 프론트엔드 | react-frontend 그룹 + workflow-full + defaults |
| nodejs-backend-dev | Node.js 백엔드 | nodejs-backend 그룹 + workflow-full + defaults |
| fullstack-dev | 풀스택 | react + nodejs + workflow-full + defaults |
| creative-comic | 만화/웹툰 | creative 그룹 + defaults(always) |
| creative-image | 이미지 편집 | image-editing + defaults(always) |
| planning-docs | 기획/문서 | project-setup + defaults(always) |
| operations | 운영/장애 대응 | ops skills + defaults |

## Defaults

프리셋과 무관하게 기본 적용되는 자산:

| 카테고리 | 자산 | 적용 조건 |
|----------|------|-----------|
| always | dev-language, ask-before-assume, git-workflow, commit-granularity, scope-judgment, block-git-commit, block-env-read | 모든 프로젝트 |
| codeProjects | security-coding, code-reading-order, verification-loop, context-efficiency, work-strategy, error-handling | 코드 작업 시 |
| convenience | conventional-commit, lessons-learned | 모든 프리셋 (끄기 쉬움) |

## 동기화 & 갱신

- 세션 시작 시 `list_catalog` → 로컬 `_playbook.json`과 버전 비교
- `changeLevel` 기반 자동 처리:
  - **patch**: 즉시 갱신
  - **minor**: 안내 후 갱신 (사용자 거부 가능)
  - **breaking**: 반드시 확인 후 갱신
- `contentHash`(SHA-256)로 로컬 수정 여부 자동 감지
- 로컬에서 수정된 파일은 어떤 레벨이든 확인 필수

## MCP 도구

| 도구 | 설명 |
|------|------|
| `list_catalog` | 자산 목록 조회 (type/tags 필터) |
| `load_asset` | 자산 전체 내용 로드 |
| `suggest_assets` | 작업 설명 기반 추천 |
| `get_group` | 그룹 상세 조회 |
| `init_project` | 프로젝트 초기화 + 프리셋 추천 |
| `apply_preset` | 프리셋 기반 자산 목록 계산 |
| `check_updates` | 갱신 필요 자산 확인 |

## Roadmap

[docs/roadmap.md](docs/roadmap.md) 참조.

## 라이선스

MIT
