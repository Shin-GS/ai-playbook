---
id: kiro-conversion
type: workflow
name: Kiro 자산 변환 규칙
description: source/ 자산을 Kiro 네이티브 형식(.kiro/)으로 변환하여 프로젝트에 저장하는 규칙
tags: [workflow, conversion, kiro]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: []
compatibleWith: []
---

# source/ → Kiro 변환 규칙

## 목적

MCP `load_asset`으로 가져온 source/ 자산을 프로젝트의 .kiro/ 디렉토리에 Kiro 네이티브 형식으로 변환하여 저장하는 규칙.

---

## 타입별 변환 매핑

| source type | 저장 위치 | 변환 방식 |
|-------------|-----------|-----------|
| rule | `.kiro/steering/{id}.md` | frontmatter → inclusion/fileMatchPattern |
| workflow | `.kiro/steering/{id}.md` | frontmatter → inclusion: always |
| agent | `.kiro/agents/{id}.md` | frontmatter → name/description/tools |
| automation | `.kiro/hooks/{id}.kiro.hook` | Trigger/Action → when/then JSON |
| skill | 다운로드 안 함 (MCP 실시간 참조) | — |

---

## Steering 변환 (rule, workflow → .kiro/steering/)

### rule 변환

source frontmatter:
```yaml
id: backend-java-spring
type: rule
activation: fileMatch
activationPattern: ["**/*.java", "**/*.kts"]
```

→ .kiro/steering/{id}.md frontmatter:
```yaml
---
sourceId: backend-java-spring
version: "1.0"
updatedAt: 2026-07-01
inclusion: fileMatch
fileMatchPattern: ["**/*.java", "**/*.kts"]
---
```

본문: source 본문 그대로 복사.

### workflow 변환

→ .kiro/steering/{id}.md frontmatter:
```yaml
---
sourceId: {id}
version: "{version}"
updatedAt: {updatedAt}
inclusion: always
---
```

본문: source 본문 그대로 복사.

### activation → inclusion 매핑

| source activation | Kiro inclusion |
|-------------------|---------------|
| always | always |
| fileMatch | fileMatch (activationPattern → fileMatchPattern) |
| manual | manual |
| (없으면) | always (기본값) |

### compatibleWith → fileMatchPattern 매핑 (activation 없을 때 fallback)

| compatibleWith 값 | fileMatchPattern |
|-------------------|-----------------|
| java | `**/*.java` |
| kotlin | `**/*.kt`, `**/*.kts` |
| spring-boot | `**/*.java`, `**/*.yml` |
| typescript | `**/*.ts`, `**/*.tsx` |
| javascript | `**/*.js`, `**/*.jsx` |
| react | `**/*.tsx`, `**/*.jsx` |
| nodejs | `**/*.js`, `**/*.ts` |
| python | `**/*.py` |
| go | `**/*.go` |
| rust | `**/*.rs` |

> activation 필드가 있으면 우선 사용. 없으면 compatibleWith에서 추론.

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
  "enabled": true,
  "name": "{source.name}",
  "description": "{source.description}",
  "version": "1.0.0",
  "when": { ... },
  "then": { ... }
}
```

---

## 멱등성

- 동일 source 자산을 여러 번 변환해도 동일 결과
- 기존 파일이 있으면 덮어쓰기 (customized=true면 제외)
- sourceId로 원본 추적 가능
