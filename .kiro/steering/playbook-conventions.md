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

## 네이밍 규칙
- id = 파일명 (확장자 제외)
- 영문 소문자 + 하이픈만 사용
- 타입을 id에 포함하지 않음 (frontmatter type으로 구분)

## 버전 관리
- 내용 수정 시 version 증분 필수
- updatedAt을 수정 날짜로 갱신 필수
- changelog에 변경 사항 한 줄 기록

## catalog.json
- source/ 파일 추가/수정 시 catalog.json도 함께 갱신

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
2. `catalog.json`에 엔트리 추가
3. 해당 프리셋에 포함 여부 판단 → `templates/presets/` 갱신

### 기존 자산 수정 시
1. `source/{type_plural}/{id}.md` 수정
2. frontmatter: version 증분 + updatedAt 갱신 + changelog 기록
3. `catalog.json`의 해당 엔트리 version/updatedAt 갱신

### 자산 삭제 시
1. `source/{type_plural}/{id}.md` 삭제
2. `catalog.json`에서 해당 엔트리 제거
3. `dependsOn`으로 참조하는 다른 자산 확인 → 의존성 제거/대체
4. `templates/presets/`에서 해당 id 제거
