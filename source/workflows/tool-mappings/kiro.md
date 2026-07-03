---
id: tool-mapping-kiro
type: workflow
name: Kiro 도구 매핑
description: playbook 자산을 Kiro 네이티브 형식(.kiro/)으로 변환하는 도구별 매핑 규칙
tags: [workflow, conversion, kiro, mapping]
version: "1.1"
updatedAt: 2026-07-03
changelog: 멱등성 덮어쓰기 조건을 customized 플래그에서 contentHash 불일치 기반으로 변경
activation: always
activationPattern: []
dependsOn: [asset-download]
compatibleWith: []
---

# Kiro 도구 매핑

## 목적

`asset-download.md`의 Step 3에서 호출됨.
source 자산을 Kiro 네이티브 형식(.kiro/)으로 변환하여 프로젝트에 저장하는 규칙.

---

## 타입별 변환 매핑

| source type | 저장 위치 | 변환 방식 |
|-------------|-----------|-----------|
| rule | `.kiro/steering/{id}.md` | frontmatter → inclusion/fileMatchPattern |
| workflow | `.kiro/steering/{id}.md` | frontmatter → inclusion: always |
| agent | `.kiro/agents/{id}.md` | frontmatter → name/description/tools |
| automation | `.kiro/hooks/{id}.kiro.hook` | Trigger/Action → when/then JSON |
| skill | `.kiro/steering/{id}.md` | frontmatter → inclusion: manual |

---

## Steering 변환 (rule, workflow, skill → .kiro/steering/)

### rule 변환

source frontmatter:
```yaml
id: backend-java-spring
type: rule
activation: fileMatch
activationPattern: ["**/*.java", "**/*.kts"]
```

→ .kiro/steering/{id}.md:
```yaml
---
sourceId: backend-java-spring
sourceVersion: "1.0"
sourceUpdatedAt: 2026-07-01
inclusion: fileMatch
fileMatchPattern: "**/*.java,**/*.kts"
---
```

본문: source 본문 그대로 복사.

### workflow 변환

→ .kiro/steering/{id}.md:
```yaml
---
sourceId: {id}
sourceVersion: "{version}"
sourceUpdatedAt: {updatedAt}
inclusion: always
---
```

본문: source 본문 그대로 복사.

### skill 변환

→ .kiro/steering/{id}.md:
```yaml
---
sourceId: {id}
sourceVersion: "{version}"
sourceUpdatedAt: {updatedAt}
inclusion: manual
---
```

본문: source 본문 그대로 복사.

> skill은 `inclusion: manual`로 설정되어, 사용자가 `#` 컨텍스트 키로 명시적으로 포함할 때만 로드된다.
> 항상 로드되지 않으므로 컨텍스트 낭비 없이 로컬에서 바로 참조 가능.

### activation → inclusion 매핑

| source activation | Kiro inclusion |
|-------------------|---------------|
| always | always |
| fileMatch | fileMatch (activationPattern → fileMatchPattern) |
| manual | manual |
| onDemand | manual |
| (없으면) | type에 따라: rule→always, workflow→always, skill→manual |

### activationPattern → fileMatchPattern 변환

Kiro의 fileMatchPattern은 쉼표 구분 문자열:
- source: `["**/*.java", "**/*.kts"]`
- kiro: `"**/*.java,**/*.kts"`

### compatibleWith → fileMatchPattern 매핑 (activation 없을 때 fallback)

| compatibleWith 값 | fileMatchPattern |
|-------------------|-----------------|
| java | `**/*.java` |
| kotlin | `**/*.kt,**/*.kts` |
| spring-boot | `**/*.java,**/*.yml` |
| typescript | `**/*.ts,**/*.tsx` |
| javascript | `**/*.js,**/*.jsx` |
| react | `**/*.tsx,**/*.jsx` |
| nodejs | `**/*.js,**/*.ts` |
| python | `**/*.py` |
| go | `**/*.go` |
| rust | `**/*.rs` |

> activation 필드가 있으면 우선 사용. 없으면 compatibleWith에서 추론.
> 둘 다 없으면 기본값 적용 (위 테이블 참조).

---

## Agent 변환 (agent → .kiro/agents/)

source frontmatter:
```yaml
id: backend-developer
type: agent
name: Backend Developer
description: 백엔드 코드 구현
```

→ .kiro/agents/{id}.md:
```yaml
---
name: backend-developer
description: 백엔드 코드 구현
sourceId: backend-developer
sourceVersion: "1.2"
sourceUpdatedAt: 2026-07-01
tools: ["*"]
---
```

본문: source 본문 그대로 복사.

---

## Automation → Hook 변환 (automation → .kiro/hooks/)

source의 Trigger/Action 섹션을 Kiro hook JSON으로 변환:

| source Trigger.event | hook JSON |
|---------------------|-----------|
| shell 명령 실행 전 | `when.type: "preToolUse"`, `when.toolTypes: ["shell"]` |
| 파일 읽기 전 | `when.type: "preToolUse"`, `when.toolTypes: ["read"]` |
| 파일 쓰기 전 | `when.type: "preToolUse"`, `when.toolTypes: ["write"]` |
| 사용자 수동 트리거 | `when.type: "userTriggered"` |
| 에이전트 작업 완료 후 | `when.type: "agentStop"` |
| 파일 생성 후 | `when.type: "fileCreated"`, `when.patterns: [...]` |
| 파일 수정 후 | `when.type: "fileEdited"`, `when.patterns: [...]` |

Action → `then.type: "askAgent"`, `then.prompt: (자연어 변환)`

출력 형식:
```json
{
  "name": "{source.name}",
  "version": "1.0.0",
  "description": "{source.description}",
  "sourceId": "{source.id}",
  "sourceVersion": "{source.version}",
  "sourceUpdatedAt": "{source.updatedAt}",
  "when": { ... },
  "then": { ... }
}
```

---

## 멱등성

- 동일 source 자산을 여러 번 변환해도 동일 결과
- 기존 파일이 있으면 덮어쓰기 (contentHash 불일치 시 = customized → 사용자 확인 후)
- sourceId로 원본 추적 가능

---

## Kiro 디렉토리 구조 예시

```
project/
├── _playbook.json                    ← 상태 추적 (프로젝트 루트)
└── .kiro/
    ├── settings/
    │   └── mcp.json
    ├── steering/
    │   ├── playbook-sync.md          ← 동기화 정책 (항상 포함)
    │   ├── git-workflow.md           ← rule (always)
    │   ├── backend-java-spring.md   ← rule (fileMatch)
    │   ├── verification-loop.md     ← workflow (always)
    │   └── image-generation.md      ← skill (manual)
    ├── agents/
    │   ├── backend-developer.md
    │   └── frontend-developer.md
    └── hooks/
        ├── block-git-commit.kiro.hook
        └── block-env-read.kiro.hook
```
