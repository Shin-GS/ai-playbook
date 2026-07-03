---
inclusion: always
---

# ai-playbook 개발 규칙

## frontmatter 필수 필드
모든 source/ 파일은 아래 frontmatter를 포함해야 한다:
- id: 영문 소문자 + 하이픈, {도메인}-{주제} 형식
- type: agent | skill | workflow | rule | automation
- name: 표시명
- description: 한 줄 설명
- tags: 관련 태그 배열
- version: "X.Y" 형식
- updatedAt: YYYY-MM-DD
- changelog: 최신 변경 요약
- activation: always | fileMatch | manual (도구가 이 자산을 어떻게 활성화하는지)
- activationPattern: 파일 패턴 배열 (activation이 fileMatch일 때만. 예: ["**/*.java", "**/*.kts"])
- dependsOn: 이 자산이 의존하는 다른 자산 ID 배열 (없으면 빈 배열 [])
- compatibleWith: 호환 기술 스택 배열 (없으면 빈 배열 [])

## catalog.json 추가 필드
catalog.json의 각 엔트리에는 위 frontmatter 필드 외에 추가로:
- changeLevel: patch | minor | breaking (이번 버전 변경의 영향 수준)
  - patch: 오타 수정, 문구 개선 (의미 변화 없음)
  - minor: 규칙/내용 추가 (기존 내용 변경 없음)
  - breaking: 기존 내용 변경/삭제 (사용자 확인 필수)
- dependsOn: frontmatter의 dependsOn과 동일 (catalog에도 반영)

## catalog.json 구조 섹션
- `defaults`: 모든 프로젝트에 기본 적용할 자산 카테고리
  - `always`: 어떤 프로젝트든 무조건 (안전장치 포함)
  - `codeProjects`: 코드 작업 프로젝트에 추가
  - `convenience`: 편의 자동화 (모든 프리셋에 포함하되 끄기 쉬움)
- `presets`: 용도별 자산 조합
- `groups`: 기술 스택별 자산 그룹

## _playbook.json 스키마
프로젝트 루트에 위치. 주요 필드:
- tool: "kiro" | "claude-code"
- purpose: 사용자가 답한 용도 배열
- presets: 적용된 프리셋 ID 배열
- applied: 적용된 자산 엔트리 배열 (id, version, contentHash 등)
- disabled: 비활성화된 자산 ID 배열
- declined: 제안 거절한 자산 ID 배열
- pendingUpdates: 거절된 갱신 목록
- history: 변경 이력

## 네이밍 규칙
- id = 파일명 (확장자 제외)
- 영문 소문자 + 하이픈만 사용
- 타입을 id에 포함하지 않음 (frontmatter type으로 구분)

## 버전 관리
- 내용 수정 시 version 증분 필수
- updatedAt을 수정 날짜로 갱신 필수
- changelog에 변경 사항 한 줄 기록
- changeLevel 결정 기준:
  - **patch**: 오타 수정, 문구 다듬기, 포맷 변경 (동작 영향 없음)
  - **minor**: 규칙/단계/내용 추가, 예시 보강 (기존 것 변경 없음)
  - **breaking**: 기존 규칙 삭제/수정, 구조 변경, 의존성 변경 (기존 사용자에 영향)

## catalog.json
- source/ 파일 추가/수정 시 catalog.json도 함께 갱신
- changeLevel은 "이번 변경"의 수준을 기록 (누적 아님, 최신 변경 기준)
- dependsOn 변경 시 catalog.json도 반영 필수

---

## 타입별 본문 구조

### rule (규칙)
- 번호 매긴 규칙 항목 (각각 독립적으로 참조 가능)
- 각 규칙에 **왜** (이유) 포함 권장
- 코드 예시 (있으면)
- "피해야 할 패턴" 섹션 (있으면)

### workflow (워크플로우)
- 목적 (한두 줄)
- Steps: 각 step에 **done-when** + **fail-action** 필수
- 판단 기준 (분기가 있으면 테이블)
- 주의사항

### agent (에이전트)
- Persona (한두 줄 역할)
- Mission (무엇을 하는지)
- 산출물/Output Format (결과 형식)
- (선택) Constraints, 작업 규칙, Checklist

### automation (자동화)
- Trigger: event + condition
- Action: 행동 기술
- Notes: 부가 설명

### skill (스킬/지식)
- 자유 형식 (지식 문서라 구조 강제 불필요)
- 참고 가능한 섹션 분리 권장

---

## CRUD 절차

### 새 자산 추가 시
1. `source/{type_plural}/{id}.md` 생성 (위 frontmatter + 타입별 본문 구조)
2. `catalog.json`에 엔트리 추가 (dependsOn, changeLevel 포함)
3. 해당 프리셋에 포함 여부 판단 → `templates/presets/` 갱신
4. 의존성 확인: dependsOn에 넣은 자산이 실제 존재하는지 확인

### 기존 자산 수정 시
1. `source/{type_plural}/{id}.md` 수정
2. frontmatter: version 증분 + updatedAt 갱신 + changelog 기록
3. `catalog.json`의 해당 엔트리 version/updatedAt/changelog/changeLevel 갱신
4. dependsOn 변경 시 catalog.json도 반영

### 자산 삭제 시
1. `source/{type_plural}/{id}.md` 삭제
2. `catalog.json`에서 해당 엔트리 제거
3. `dependsOn`으로 참조하는 다른 자산 확인 → 의존성 제거/대체
4. `templates/presets/`에서 해당 id 제거
