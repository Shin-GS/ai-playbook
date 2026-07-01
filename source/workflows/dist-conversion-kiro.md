---
id: dist-conversion-kiro
type: workflow
name: Kiro 변환 워크플로우
description: source/에서 dist/kiro/로의 변환 절차와 매핑 규칙
tags: [workflow, conversion, kiro, dist]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: []
compatibleWith: []
---

# source/ → dist/kiro/ 변환 규칙

## 타입별 변환 매핑

| source type | dist/kiro/ 위치 | 변환 방식 |
|-------------|-----------------|-----------|
| rule | `steering/{id}.md` | frontmatter 변환 (inclusion: fileMatch, fileMatchPattern 추가) |
| workflow | `steering/{id}.md` | frontmatter 변환 (inclusion: always) |
| agent | `agents/{id}.md` | Kiro agent 형식 (name, description, tools 헤더) |
| automation | `hooks/{id}.kiro.hook` | JSON 변환 (when/then 구조) |
| skill | MCP 전용 | dist에 포함하지 않음 |

## Steps

### Step 1: source 파일 읽기

- **done-when**: 대상 source 파일의 frontmatter + 본문 파싱 완료
- **fail-action**: frontmatter 형식 오류 시 변환 중단 + 오류 보고

### Step 2: type 판별 및 변환 경로 결정

- **done-when**: type에 따른 출력 경로 결정됨
- **fail-action**: 지원하지 않는 type 시 skip + 경고 로그

### Step 3: frontmatter 변환

- **done-when**: dist용 frontmatter 생성 완료 (sourceId, version, updatedAt 포함)
- **fail-action**: compatibleWith 매핑 실패 시 inclusion: always로 폴백

### Step 4: 본문 변환

- **done-when**: 대상 도구 형식에 맞게 본문 변환 완료
- **fail-action**: 변환 불가 섹션은 원본 유지 + 주석 표기

### Step 5: 파일 출력

- **done-when**: dist/kiro/ 해당 위치에 파일 생성됨
- **fail-action**: 파일 쓰기 실패 시 재시도 1회 후 오류 보고

---

## Steering 변환 규칙 (rule → dist/kiro/steering/)

### frontmatter 변환

source frontmatter:
```yaml
id: backend-java-spring
type: rule
version: "1.0"
updatedAt: 2026-07-01
compatibleWith: [java, spring-boot, kotlin]
```

→ dist/kiro/steering/ frontmatter:
```yaml
sourceId: backend-java-spring
version: "1.0"
updatedAt: 2026-07-01
inclusion: fileMatch
fileMatchPattern: ["**/*.java", "**/*.kts", "**/*.yml"]
```

### 변환 판단 기준

- `compatibleWith`에 파일 확장자 매핑 가능 → `inclusion: fileMatch`
- 매핑 불가 → `inclusion: always`
- 사용자가 `manual` 지정 시 → `inclusion: manual`

### compatibleWith → fileMatchPattern 매핑 테이블

| compatibleWith 값 | fileMatchPattern |
|-------------------|-----------------|
| java | `**/*.java` |
| kotlin | `**/*.kt`, `**/*.kts` |
| spring-boot | `**/*.java`, `**/*.yml`, `**/*.yaml` |
| typescript | `**/*.ts`, `**/*.tsx` |
| javascript | `**/*.js`, `**/*.jsx` |
| react | `**/*.tsx`, `**/*.jsx` |
| nodejs | `**/*.js`, `**/*.ts` |
| python | `**/*.py` |
| go | `**/*.go` |
| rust | `**/*.rs` |
| css | `**/*.css`, `**/*.scss` |
| html | `**/*.html` |
| docker | `**/Dockerfile*`, `**/docker-compose*.yml` |
| terraform | `**/*.tf` |
| sql | `**/*.sql` |

> 여러 값이 있으면 모두 합산 후 중복 제거

## Steering 변환 규칙 (workflow → dist/kiro/steering/)

### frontmatter 변환

source frontmatter:
```yaml
id: context-efficiency
type: workflow
version: "1.0"
updatedAt: 2026-07-01
```

→ dist/kiro/steering/ frontmatter:
```yaml
sourceId: context-efficiency
version: "1.0"
updatedAt: 2026-07-01
inclusion: always
```

본문: 그대로 유지

## Agent 변환 규칙 (agent → dist/kiro/agents/)

### frontmatter 변환

source frontmatter:
```yaml
id: backend-developer
type: agent
name: Backend Developer
description: 백엔드 코드 구현
```

→ dist/kiro/agents/ frontmatter:
```yaml
name: backend-developer
description: 백엔드 코드 구현
tools: ["*"]
```

본문: source의 본문을 Kiro agent 형식에 맞게 정리 (Persona, Mission, Rules 구조 유지)

## Automation → Hook 변환 규칙 (automation → dist/kiro/hooks/)

### 출력 형식: JSON (*.kiro.hook)

### 매핑 테이블

| source Trigger.event | hook JSON |
|---------------------|-----------|
| shell 명령 실행 전 | `when.type: "preToolUse"`, `when.toolTypes: ["shell"]` |
| 파일 읽기 전 | `when.type: "preToolUse"`, `when.toolTypes: ["read"]` |
| 파일 쓰기 전 | `when.type: "preToolUse"`, `when.toolTypes: ["write"]` |
| 사용자 수동 트리거 | `when.type: "userTriggered"` |
| 파일 생성 후 | `when.type: "fileCreated"`, `when.filePatterns: [...]` |
| 파일 수정 후 | `when.type: "fileEdited"`, `when.filePatterns: [...]` |

### Action 변환

- source의 Action 섹션 (자연어) → `then.type: "askAgent"`, `then.prompt: (자연어 내용 변환)`

### 메타데이터

```json
{
  "enabled": true,
  "name": "{source.name}",
  "description": "{source.description}",
  "version": "{source.version}",
  "when": { ... },
  "then": { ... }
}
```

## 멱등성 보장

- 동일한 source 파일을 여러 번 변환해도 동일한 결과를 생성한다
- 기존 dist 파일이 있으면 덮어쓴다 (version 비교 없이 항상 최신 반영)
- sourceId로 원본 추적 가능
