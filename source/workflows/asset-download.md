---
id: asset-download
type: workflow
name: 자산 다운로드 절차
description: playbook 자산을 프로젝트에 다운로드할 때의 공통 절차 — 의존성 체크, 버전 관리, 갱신 정책
tags: [workflow, download, sync, versioning]
version: "1.4"
updatedAt: 2026-07-03
changelog: 비활성화(disabled) 및 재활성화 절차 섹션 추가
activation: always
activationPattern: []
dependsOn: []
compatibleWith: []
---

# 자산 다운로드 절차

## 목적

playbook 자산을 프로젝트에 다운로드할 때의 도구 중립적 공통 절차를 정의한다.
실제 파일 배치와 형식 변환은 도구별 매핑(tool-mappings/)이 담당한다.

---

## 아키텍처

```
source 자산 (intent 선언)
       │
       ▼
┌─────────────────────┐
│  asset-download.md  │  ← 이 문서: 공통 절차
│  (의존성, 버전, 갱신) │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│  tool-mappings/     │  ← 도구별 매핑
│  ├── kiro.md        │
│  └── claude-code.md │
└─────────────────────┘
       │
       ▼
  프로젝트 로컬 파일
```

---

## _playbook.json 위치

**항상 프로젝트 루트에 `_playbook.json`을 둔다.**

- Kiro든 Claude Code든 동일 위치: `{project_root}/_playbook.json`
- 이유: 같은 프로젝트에서 도구를 전환해도 상태가 유지됨
- `.kiro/`나 `.claude/`는 "변환된 자산 파일"만 저장 (상태 추적 파일 아님)
- `.gitignore`에 추가 권장 (개인 상태이므로 팀원마다 다를 수 있음)

---

## Step 1. 도구 환경 감지

`_playbook.json`의 `tool` 필드를 확인하여 어떤 매핑을 사용할지 결정한다.

| tool 값 | 매핑 파일 |
|---------|-----------|
| kiro | tool-mappings/kiro.md |
| claude-code | tool-mappings/claude-code.md |
| (미지정) | 프로젝트 구조로 추론: .kiro/ 있으면 kiro, .claude/ 있으면 claude-code |

**done-when**: tool 값이 확정됨
**fail-action**: 추론 불가 시 사용자에게 되묻기

---

## Step 2. 의존성 해결

자산의 `dependsOn` 필드를 확인하여 의존 자산을 함께 처리한다.

### 절차

1. 다운로드 대상 자산의 `dependsOn` 배열 확인
2. 각 의존 자산이 이미 프로젝트에 적용되어 있는지 `_playbook.json`의 `applied` 확인
3. 미적용 의존 자산이 있으면:
   - 사용자에게 안내: "{대상}이 {의존자산}에 의존합니다. 함께 다운로드할까요?"
   - 승인 시 → 의존 자산부터 다운로드 (재귀적으로 Step 2~4 실행)
   - 거절 시 → 의존성 없이 진행 (동작은 하지만 일부 기능 제한될 수 있음을 안내)
4. 순환 의존 방지: 이미 처리 중인 자산 목록을 추적하여 무한 루프 차단

**done-when**: 모든 의존 자산이 적용 완료 또는 사용자가 명시적으로 거절
**fail-action**: 순환 의존 감지 시 해당 자산 건너뛰고 경고

---

## Step 3. 다운로드 및 변환

1. `load_asset` MCP 도구로 자산 내용 가져오기
2. 해당 도구의 매핑 규칙에 따라 변환 + 파일 저장
3. 변환 상세는 `tool-mappings/{tool}.md` 참조

**done-when**: 로컬 파일이 정상 생성됨
**fail-action**: 변환 실패 시 에러 내용 보고, 원본 내용 그대로 저장 (fallback)

---

## Step 4. 상태 기록

`_playbook.json`에 적용 정보를 기록한다.

### applied 엔트리 구조

```json
{
  "id": "backend-java-spring",
  "version": "1.0",
  "updatedAt": "2026-07-01",
  "changeLevel": "minor",
  "appliedAt": "2026-07-03",
  "localPath": ".kiro/steering/backend-java-spring.md",
  "contentHash": "sha256:a1b2c3d4e5f6..."
}
```

| 필드 | 설명 |
|------|------|
| id | 자산 ID |
| version | 적용된 버전 |
| updatedAt | 원본의 updatedAt |
| changeLevel | 적용 시점의 changeLevel |
| appliedAt | 다운로드한 날짜 |
| localPath | 프로젝트 내 저장 경로 |
| contentHash | 다운로드 시점의 로컬 파일 SHA-256 해시 (customized 자동 감지용) |

### customized 자동 감지

`customized` 필드를 수동으로 관리하지 않는다. 대신:

1. 다운로드 시 생성된 로컬 파일의 SHA-256 해시를 `contentHash`에 저장
2. 갱신 체크 시 현재 로컬 파일의 해시를 계산하여 `contentHash`와 비교
3. **해시 일치** → 사용자가 수정하지 않음 → changeLevel 정책대로 갱신
4. **해시 불일치** → 사용자가 로컬에서 수정함 (customized) → 어떤 changeLevel이든 확인 필요:
   - "로컬에서 수정된 파일입니다. 갱신하면 커스텀 내용이 덮어씌워집니다. 진행할까요?"
   - 승인 시 → 갱신 + contentHash 새로 계산
   - 거절 시 → 건너뛰기 (pendingUpdates에 기록)

> 해시 계산 대상: 로컬 파일 전체 내용 (frontmatter 포함).
> 줄바꿈은 LF로 정규화 후 해시 계산 (OS별 차이 방지).

### history 기록

```json
{
  "date": "2026-07-03",
  "action": "applied",
  "id": "backend-java-spring",
  "version": "1.0"
}
```

**done-when**: `_playbook.json`이 정상 갱신됨
**fail-action**: 파일 쓰기 실패 시 수동 갱신 안내

---

## 갱신 정책 (changeLevel 기반)

자산이 업데이트됐을 때 갱신 방식을 `changeLevel`로 결정한다.

| changeLevel | 의미 | 갱신 방식 |
|-------------|------|-----------|
| patch | 오타 수정, 문구 개선 | 자동 갱신 (안내만) |
| minor | 규칙/내용 추가 (기존 변경 없음) | 안내 후 자동 갱신 (사용자가 거부 가능) |
| breaking | 기존 내용 변경/삭제 | 반드시 사용자 확인 후 갱신 |

### 갱신 절차

1. 세션 시작 시 `list_catalog`으로 최신 catalog 확인
2. `_playbook.json`의 `applied`와 버전/updatedAt 비교
3. 차이 있는 자산 수집
4. changeLevel별 처리:
   - **patch**: 즉시 갱신, 완료 후 한 줄 안내
   - **minor**: "v1.0→v1.1: {changelog}. 갱신합니다 (취소하려면 말씀하세요)"
   - **breaking**: "v1.0→v2.0 (⚠️ breaking): {changelog}. 갱신할까요?" → 명시적 승인 필요
5. 로컬 파일 해시 ≠ contentHash인 자산 (customized): 어떤 changeLevel이든 사용자 확인 필수
   - "로컬에서 수정된 파일입니다. 갱신하면 커스텀 내용이 덮어씌워집니다. 진행할까요?"
   - 승인 시 → 갱신 + contentHash 새로 계산
   - 거절 시 → 건너뛰기 (pendingUpdates에 기록)

### pendingUpdates

사용자가 거절한 갱신을 기록해두고, 다음 세션에서 다시 안내하지 않음 (같은 버전에 대해).

```json
{
  "pendingUpdates": [
    { "id": "git-workflow", "fromVersion": "1.0", "toVersion": "1.1", "declinedAt": "2026-07-03" }
  ]
}
```

새 버전이 또 나오면 (1.1→1.2) pendingUpdates에서 제거하고 다시 안내.

---

## 삭제 절차

적용된 자산을 프로젝트에서 제거할 때:

1. 로컬 파일 삭제
2. `_playbook.json`의 `applied`에서 해당 엔트리 제거
3. `history`에 `"action": "removed"` 기록
4. 역의존성 체크: 다른 자산이 이 자산에 의존하면 경고
   - "이 자산을 삭제하면 {의존 자산}이 영향받을 수 있습니다"

---

## 그룹 일괄 적용

그룹 전체를 한 번에 적용할 때:

1. `get_group`으로 그룹 자산 목록 가져오기
2. 이미 적용된 것 제외
3. 의존성 포함 전체 자산 목록 계산 (중복 제거)
4. 사용자에게 목록 보여주고 확인
5. 승인 시 순서대로 Step 2~4 실행
6. `_playbook.json`의 `appliedGroups`에 그룹 ID 기록

---

## 프리셋 기반 일괄 적용

사용자가 용도를 알려주면 프리셋으로 한 번에 세팅:

### 절차

1. `init_project` → 사용자에게 용도 질문
2. 사용자 답변 → 키워드 매칭으로 프리셋 선택
3. `apply_preset` 호출 → 적용할 자산 목록 계산
4. 사용자에게 목록 보여주기:
   - "다음 자산을 적용합니다: (목록). 진행할까요?"
   - defaults(always)는 별도 승인 없이 포함됨을 안내
5. 승인 시 → 각 자산을 `load_asset` + 도구별 매핑으로 다운로드
6. `_playbook.json` 갱신 (purpose, presets, applied, history)

### 프리셋 구조

```json
{
  "java-backend-dev": {
    "description": "Java/Spring 백엔드 개발",
    "keywords": ["java", "spring", "백엔드", ...],
    "groups": ["java-backend", "workflow-full"],
    "extras": ["testing-strategy", "naming-conventions"],
    "includeDefaults": ["always", "codeProjects"]
  }
}
```

| 필드 | 설명 |
|------|------|
| keywords | 사용자 답변에서 매칭할 키워드 |
| groups | 포함할 그룹 (그룹 내 모든 자산 포함) |
| extras | 그룹 외 추가 자산 |
| includeDefaults | 적용할 defaults 카테고리 |

### defaults 카테고리

| 카테고리 | 자산 | 적용 조건 |
|----------|------|-----------|
| always | dev-language, ask-before-assume, git-workflow, commit-granularity, scope-judgment, block-git-commit | 모든 프로젝트 |
| codeProjects | security-coding, code-reading-order, verification-loop, context-efficiency, work-strategy, block-env-read, error-handling | 코드 작업 있는 프로젝트 |

### 복수 프리셋

사용자가 "풀스택 + 만화" 처럼 여러 용도를 말하면:
- 해당되는 프리셋 모두 적용
- 자산 중복은 자동 제거
- `_playbook.json`의 `presets` 배열에 모두 기록

---

## 비활성화 (disabled)

적용된 자산을 삭제하지 않고 동작만 끌 때:

### 절차

1. `_playbook.json`의 `disabled` 배열에 자산 ID 추가
2. 도구별 처리:
   - **Kiro hook**: JSON에 `"enabled": false` 설정
   - **Kiro steering**: frontmatter에 `disabled: true` 추가 (Kiro가 로드하지 않음)
   - **Claude Code CLAUDE.md**: 해당 섹션을 주석 처리 (`<!-- disabled: {id} -->`)
   - **Claude Code .claude/**: 파일명에 `.disabled` 접미사 추가
3. `history`에 `"action": "disabled"` 기록

### 안전장치 보호

`defaults.always`에 포함된 자산(block-git-commit, block-env-read)을 비활성화하려 할 때:
- 반드시 사용자에게 위험 고지: "⚠️ 이 자산은 안전장치입니다. 비활성화하면 {위험}. 정말 끌까요?"
- 명시적 확인 없이 비활성화 금지
- 확인 후 disabled 처리

### 재활성화

1. `disabled` 배열에서 해당 ID 제거
2. 도구별 역처리 (enabled: true, disabled: true 제거 등)
3. `history`에 `"action": "enabled"` 기록

---

## 주의사항

- 다운로드는 항상 사용자의 승인 하에 진행 (자동 다운로드 없음)
- 갱신은 changeLevel에 따라 자동 허용 범위가 다름
- MCP 연결 안 될 때: 로컬 파일로 정상 동작, 갱신 체크만 스킵
- 모든 상태는 `_playbook.json`에 기록하여 멱등성 보장
