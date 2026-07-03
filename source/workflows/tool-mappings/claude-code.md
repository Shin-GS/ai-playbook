---
id: tool-mapping-claude-code
type: workflow
name: Claude Code 도구 매핑
description: playbook 자산을 Claude Code 형식(.claude/)으로 변환하는 도구별 매핑 규칙
tags: [workflow, conversion, claude-code, mapping]
version: "1.0"
updatedAt: 2026-07-03
changelog: 초기 버전
activation: always
activationPattern: []
dependsOn: [asset-download]
compatibleWith: []
---

# Claude Code 도구 매핑

## 목적

`asset-download.md`의 Step 3에서 호출됨.
source 자산을 Claude Code 네이티브 형식으로 변환하여 프로젝트에 저장하는 규칙.

---

## Claude Code 파일 구조 개요

```
project/
├── CLAUDE.md                      ← 프로젝트 루트 지시문 (항상 읽힘)
├── .claude/
│   ├── settings.json              ← MCP, 권한 등 설정
│   ├── commands/                  ← 슬래시 커맨드 (에이전트/스킬)
│   │   ├── backend-developer.md
│   │   └── review.md
│   └── docs/                      ← 참조 문서 (skill)
│       ├── image-generation.md
│       └── comic-series.md
├── .clauderules                   ← 추가 규칙 (fileMatch 대안)
└── _playbook.json                 ← 상태 추적 (공통)
```

---

## 타입별 변환 매핑

| source type | activation | 저장 위치 | 변환 방식 |
|-------------|-----------|-----------|-----------|
| rule | always | `CLAUDE.md` 섹션 삽입 | 본문을 CLAUDE.md의 섹션으로 추가 |
| rule | fileMatch | `.clauderules` 또는 하위 `CLAUDE.md` | 해당 디렉토리의 CLAUDE.md에 추가 |
| rule | manual | `.claude/docs/{id}.md` | 참조용 문서로 저장 |
| workflow | always | `CLAUDE.md` 섹션 삽입 | 워크플로우 섹션으로 추가 |
| workflow | manual | `.claude/docs/{id}.md` | 참조용 문서로 저장 |
| agent | — | `.claude/commands/{id}.md` | 슬래시 커맨드로 변환 |
| automation | — | `CLAUDE.md` 규칙 섹션 | 자연어 규칙으로 삽입 |
| skill | — | `.claude/docs/{id}.md` | 참조 문서로 저장 |

---

## CLAUDE.md 관리

### 구조

CLAUDE.md는 playbook 자산별로 구분된 섹션으로 관리한다:

```markdown
# Project Rules

<!-- playbook:start -->

## [playbook] Git 워크플로우 규칙
<!-- source: git-workflow v1.1 -->
(본문)

## [playbook] 검증 루프
<!-- source: verification-loop v1.1 -->
(본문)

<!-- playbook:end -->

## (사용자 직접 작성 섹션들)
...
```

**규칙:**
- playbook 관리 영역은 `<!-- playbook:start -->` ~ `<!-- playbook:end -->` 사이
- 각 자산은 `<!-- source: {id} v{version} -->` 주석으로 추적
- 사용자가 직접 작성한 내용은 playbook 영역 밖에 위치
- 갱신 시 해당 자산의 섹션만 교체 (다른 섹션 영향 없음)

### CLAUDE.md가 너무 길어질 때

- rule/workflow가 10개 이상이면 → `.claude/docs/`에 저장하고 CLAUDE.md에서 참조만
- 참조 형식: `자세한 규칙은 .claude/docs/{id}.md 참조`

---

## Rule 변환

### always activation

CLAUDE.md의 playbook 영역에 섹션으로 삽입:

```markdown
## [playbook] {name}
<!-- source: {id} v{version} -->

{본문}
```

### fileMatch activation

해당 패턴의 디렉토리에 `CLAUDE.md`를 생성/추가:

예: `activationPattern: ["src/main/**/*.java"]`
→ `src/main/CLAUDE.md`에 규칙 삽입

또는 `.clauderules`에 조건부 규칙으로 추가:

```markdown
# {name}
<!-- source: {id} v{version} -->
# Applies to: {activationPattern}

{본문}
```

### manual activation

`.claude/docs/{id}.md`에 저장 (필요할 때 참조):

```markdown
<!-- source: {id} v{version} -->

# {name}

{본문}
```

---

## Workflow 변환

### always activation

CLAUDE.md playbook 영역에 삽입 (rule과 동일 형식).

### manual activation

`.claude/docs/{id}.md`에 참조 문서로 저장.

---

## Agent 변환 (agent → .claude/commands/)

source:
```yaml
id: backend-developer
type: agent
name: Backend Developer
description: 백엔드 코드 구현
```

→ `.claude/commands/{id}.md`:
```markdown
<!-- source: {id} v{version} -->

# {name}

{본문}
```

사용: `/backend-developer` 슬래시 커맨드로 호출 가능.

---

## Automation 변환

Claude Code에는 hook 시스템이 없으므로, 자연어 규칙으로 변환하여 CLAUDE.md에 삽입:

source (예: block-git-commit):
```
Trigger: shell 명령 실행 전, git commit 포함
Action: 사용자 확인 없이 커밋 금지
```

→ CLAUDE.md:
```markdown
## [playbook] Git Commit 차단
<!-- source: block-git-commit v1.0 -->

**규칙:** git commit 명령을 실행하기 전에 반드시 사용자의 명시적 허락을 받아라.
자동으로 커밋하지 마라.
```

---

## Skill 변환

`.claude/docs/{id}.md`에 저장:

```markdown
<!-- source: {id} v{version} -->

# {name}

{본문 전체}
```

사용자가 대화에서 "image-generation 규칙 참고해" 하면 에이전트가 `.claude/docs/image-generation.md`를 읽어서 활용.

---

## 멱등성

- `<!-- source: {id} v{version} -->` 주석으로 기존 내용 위치를 찾아서 교체
- CLAUDE.md 내 playbook 영역 밖은 절대 수정하지 않음
- `.claude/commands/`와 `.claude/docs/`는 파일 단위로 덮어쓰기

---

## _playbook.json 위치

프로젝트 루트에 `_playbook.json` 생성 (Kiro와 동일 위치, 동일 구조):

```json
{
  "tool": "claude-code",
  "appliedGroups": [],
  "applied": [
    {
      "id": "git-workflow",
      "version": "1.1",
      "updatedAt": "2026-07-01",
      "changeLevel": "minor",
      "appliedAt": "2026-07-03",
      "localPath": "CLAUDE.md#git-workflow",
      "contentHash": "sha256:a1b2c3d4e5f6..."
    }
  ],
  "declined": [],
  "pendingUpdates": [],
  "history": []
}
```

- CLAUDE.md에 삽입된 자산의 `localPath`는 `CLAUDE.md#{id}` 형식으로 기록
- `contentHash`는 해당 섹션의 내용만 해시 (CLAUDE.md 전체가 아님)
- `.claude/docs/`나 `.claude/commands/`에 저장된 자산은 파일 전체 해시

---

## Claude Code 디렉토리 구조 예시

```
project/
├── CLAUDE.md
│   └── <!-- playbook:start -->
│       ├── [playbook] Git 워크플로우 규칙
│       ├── [playbook] 검증 루프
│       ├── [playbook] Git Commit 차단
│       └── [playbook] .env 읽기 차단
│       <!-- playbook:end -->
├── .claude/
│   ├── settings.json
│   ├── commands/
│   │   ├── backend-developer.md
│   │   ├── frontend-developer.md
│   │   └── bug-investigator.md
│   └── docs/
│       ├── image-generation.md      ← skill
│       ├── comic-series.md          ← skill
│       └── project-docs-structure.md ← skill
├── _playbook.json
└── src/main/CLAUDE.md               ← fileMatch rule (Java 전용)
```
