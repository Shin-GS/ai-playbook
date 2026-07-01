# ai-playbook

Portable AI development framework — agents, skills, workflows, and rules that work across any AI coding tool.

## 목적

AI 개발 도구(Kiro, Claude Code, Cursor 등)에서 공통으로 쓸 수 있는 에이전트/스킬/워크플로우/규칙을 도구 독립적으로 관리하고, 필요한 도구 형식으로 변환해서 사용하는 개인 개발 프레임워크.

## 핵심 설계 원칙

1. **source/가 유일한 원본** — 도구 독립적 마크다운. 여기만 수정.
2. **dist/{tool}/는 파생물** — 각 도구의 네이티브 형식. AI 1회 변환으로 생성.
3. **파일별 frontmatter로 자기 설명** — AI가 파일 하나 열면 즉시 이해 가능.
4. **catalog.json은 경로 인덱스** — 가벼운 목차 + 검색/동기화 겸용.
5. **2레이어 제공 전략** — 규칙/hooks는 로컬 파일, 스킬/지식은 MCP 서버.
6. **동기화** — 세션 시작 시 버전 체크 → 차이 있으면 알림 → 수동 sync.

## 디렉토리 구조

```
ai-playbook/
├── README.md
├── catalog.json                    ← 자산 인덱스 (검색 + 동기화 겸용)
│
├── source/                         ← 도구 독립 원본 (유일한 소스 오브 트루스)
│   ├── agents/                     ← 에이전트 역할 정의
│   ├── skills/                     ← 도메인 지식 (서브폴더 자유 확장)
│   ├── workflows/                  ← 작업 순서 패턴 (루프 제어 포함)
│   ├── rules/                      ← 코딩/프로세스 규칙
│   └── automations/                ← 자동화 의도 (트리거 → 액션)
│
├── dist/                           ← 도구별 네이티브 형식
│   ├── kiro/                       ← Kiro 형식 (steering, hooks, agents)
│   │   ├── README.md               ← 셋업 가이드
│   │   ├── manifest.json
│   │   ├── global/                 ← ~/.kiro/steering/에 설치
│   │   ├── steering/               ← 프로젝트 .kiro/steering/에 복사
│   │   ├── hooks/                  ← 프로젝트 .kiro/hooks/에 복사
│   │   └── agents/                 ← Kiro 커스텀 에이전트
│   ├── claude/                     ← (향후) CLAUDE.md, /commands
│   └── cursor/                     ← (향후) .cursorrules, .cursor/prompts
│
├── mcp-server/                     ← (2단계) MCP 서버
│
└── templates/
    └── presets/                    ← 프로젝트 초기화용 프리셋
```

## 자산 타입

| 타입 | 용도 | 예시 |
|------|------|------|
| rule | 제약 — "이렇게 해라" | git 커밋 규칙, 네이밍 컨벤션 |
| workflow | 프로세스 — "이 순서로 해라" | 서브에이전트 협업 패턴 |
| skill | 지식 — "이걸 알아둬라" | 텔레그램 API 팁, Solidity 패턴 |
| agent | 페르소나 — "이 관점으로 봐라" | 코드 리뷰어, 아키텍트 |
| automation | 트리거 — "이때 자동으로 해라" | 파일 저장 시 린트 |

## 사용법

### 프리셋으로 프로젝트 초기 세팅

```
"ai-playbook에서 web-fullstack preset 적용해줘"
```

### 개별 자산 적용

```
"ai-playbook의 git-workflow 규칙 이 프로젝트에 적용해줘"
```

### 새 자산 추가

```
"이 패턴 ai-playbook source/rules/에 추가해줘"
```

## 파일 포맷

모든 source/ 파일은 YAML frontmatter를 포함:

```markdown
---
id: {고유 식별자}
type: agent | skill | workflow | rule | automation
name: {표시명}
description: {한 줄 설명}
tags: [tag1, tag2]
version: "1.0"
updatedAt: 2026-07-01
changelog: {최신 변경 요약}
---

# {제목}

(본문)
```

## 동기화

프로젝트에 적용된 자산의 버전을 `_playbook.json`으로 추적하고, 세션 시작 시 최신 버전과 비교하여 업데이트 알림을 제공합니다.

## Roadmap

[docs/roadmap.md](docs/roadmap.md) 참조.

## 라이선스

MIT
