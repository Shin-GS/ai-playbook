# ai-playbook

Portable AI development framework — agents, skills, workflows, and rules that work across any AI coding tool.

## 목적

AI 개발 도구(Kiro, Claude Code, Cursor 등)에서 공통으로 쓸 수 있는 에이전트/스킬/워크플로우/규칙을 도구 독립적으로 관리하고, MCP 서버를 통해 필요한 자산을 동적으로 제공하는 개인 개발 프레임워크.

## 핵심 설계 원칙

1. **source/가 유일한 원본** — 도구 독립적 마크다운. 여기만 수정.
2. **MCP 서버가 서빙** — source/ 파일을 직접 읽어서 API로 제공.
3. **AI 도구가 자기 형식으로 변환** — 다운로드 시 각 도구(Kiro, Claude, Cursor)가 자기 방식으로 저장.
4. **파일별 frontmatter로 자기 설명** — AI가 파일 하나 열면 즉시 이해 가능.
5. **catalog.json은 인덱스** — 검색 + 동기화 + 그룹 관리.
6. **동기화** — 세션 시작 시 updatedAt 비교 → 차이 있으면 알림 → 사용자 허락 후 갱신.

## 디렉토리 구조

```
ai-playbook/
├── README.md
├── catalog.json                 ← 자산 인덱스 (검색 + 동기화 + 그룹)
│
├── source/                      ← 도구 독립 원본 (유일한 소스 오브 트루스)
│   ├── agents/                  ← 에이전트 역할 정의
│   ├── skills/                  ← 도메인 지식 (서브폴더 자유 확장)
│   ├── workflows/               ← 작업 순서 패턴 (루프 제어 포함)
│   ├── rules/                   ← 코딩/프로세스 규칙
│   └── automations/             ← 자동화 의도 (트리거 → 액션)
│
├── mcp-server/                  ← VPS에 배포할 HTTP API 서버
├── mcp-client/                  ← npm 배포할 MCP 프로세스 (AI 도구 연결부)
│
├── templates/presets/           ← 프로젝트 초기화용 프리셋/그룹
└── docs/                        ← 프로젝트 문서 (roadmap 등)
```

## Quick Start

### Kiro

1. MCP 클라이언트 설치 (한번만):

```json
// ~/.kiro/settings/mcp.json
{
  "mcpServers": {
    "ai-playbook": {
      "command": "npx",
      "args": ["ai-playbook-mcp"],
      "env": {
        "PLAYBOOK_API_URL": "https://your-vps-domain.com/api",
        "PLAYBOOK_API_KEY": "your-api-key"
      }
    }
  }
}
```

2. 글로벌 steering 설치:

```
// ~/.kiro/steering/playbook-sync.md
(mcp-client/global/playbook-sync.md 내용 복사)
```

3. 프로젝트에서 사용:

```
"ai-playbook에서 common-rules + java-backend 그룹 적용해줘"
```

### Claude Code (향후)

```
"ai-playbook에서 이 프로젝트에 맞는 자산 적용해줘"
→ MCP로 source/ 읽고 → CLAUDE.md에 통합
```

### Cursor (향후)

```
→ MCP로 source/ 읽고 → .cursorrules에 반영
```

## 자산 타입

| 타입 | 용도 | 예시 |
|------|------|------|
| rule | 제약 — "이렇게 해라" | git 커밋 규칙, 네이밍 컨벤션 |
| workflow | 프로세스 — "이 순서로 해라" | 서브에이전트 협업 패턴 |
| skill | 지식 — "이걸 알아둬라" | 디자인 시스템, 장애 대응 |
| agent | 페르소나 — "이 관점으로 봐라" | 코드 리뷰어, 아키텍트 |
| automation | 트리거 — "이때 자동으로 해라" | 커밋 차단, 환경파일 보호 |

## 자산 그룹

| 그룹 | 포함 자산 |
|------|-----------|
| common-rules | 모든 프로젝트 공통 규칙 8개 |
| java-backend | Java/Spring 백엔드 세트 7개 |
| react-frontend | React/TS 프론트엔드 세트 4개 |
| nodejs-backend | Node.js 백엔드 세트 4개 |
| project-setup | 문서 + 디자인 + 테스트 시스템 4개 |
| workflow-full | 협업 + 검증 + 다관점 심의 4개 |

## 동기화

- 세션 시작 시 MCP `list_catalog` 호출 → 로컬 `_playbook.json`과 updatedAt 비교
- 차이 있으면 changelog와 함께 갱신 제안
- 사용자 허락 후에만 갱신 (자동 변경 없음)
- 거절한 자산은 다시 제안하지 않음

## Roadmap

[docs/roadmap.md](docs/roadmap.md) 참조.

## 라이선스

MIT
