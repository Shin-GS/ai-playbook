---
inclusion: always
---

# ai-playbook 연동

ai-playbook MCP 서버 사용 중.

## 세션 시작 시

1. `list_catalog` 도구를 호출하여 자산 목록(id, version, updatedAt, changeLevel, changelog)을 확인하라.
2. 프로젝트 루트에 `_playbook.json`이 있으면:
   - applied 자산들의 version/updatedAt과 catalog의 값을 비교
   - 차이 있는 것만 수집
   - 로컬 파일 해시와 contentHash 비교로 customized 여부 자동 감지
   - changeLevel별 처리:
     - **patch**: 즉시 갱신, 완료 후 한 줄 안내
     - **minor**: "v{old}→v{new}: {changelog}. 갱신합니다 (취소하려면 말씀하세요)"
     - **breaking**: "⚠️ v{old}→v{new} (breaking): {changelog}. 갱신할까요?" → 명시적 승인 필요
   - 로컬에서 수정된 자산 (해시 불일치): 어떤 레벨이든 사용자 확인 필수
3. MCP 연결 안 되면: 동기화 스킵, 로컬 파일로 정상 동작

## 작업 중 새 자산 제안

작업 중 catalog 목록에서 프로젝트에 유용한 자산을 발견하면:
- "playbook에 {name}이 있는데 다운로드할까요? — {description}"
- 허락 시: `load_asset`으로 내용 가져와서 → 도구별 매핑에 따라 변환 → 프로젝트에 저장 → _playbook.json 갱신
- 거절 시: _playbook.json의 declined에 기록 → 같은 자산 다시 제안하지 않음

### 제안 기준
- 프로젝트에 해당 기술 스택이 확인될 때만
- declined에 있는 자산은 제안하지 않음
- 한 세션에 최대 2개까지만 제안

### 의존성 자동 처리
- 다운로드 대상의 `dependsOn` 확인
- 미적용 의존 자산이 있으면 함께 제안: "{대상}이 {의존}에 의존합니다. 함께 다운로드할까요?"
- 승인 시 의존 자산부터 순서대로 다운로드

### 다운로드 시 변환

도구 환경에 따라 매핑이 달라진다. `_playbook.json`의 `tool` 필드 참조.

#### Kiro (tool: "kiro")

| type | 저장 위치 | 변환 |
|------|-----------|------|
| rule (always) | .kiro/steering/{id}.md | inclusion: always |
| rule (fileMatch) | .kiro/steering/{id}.md | inclusion: fileMatch + fileMatchPattern |
| workflow | .kiro/steering/{id}.md | inclusion: always |
| agent | .kiro/agents/{id}.md | frontmatter → name/description/tools |
| automation | .kiro/hooks/{id}.kiro.hook | Trigger/Action → when/then JSON |
| skill | .kiro/steering/{id}.md | inclusion: manual |

#### Claude Code (tool: "claude-code")

| type | 저장 위치 | 변환 |
|------|-----------|------|
| rule (always) | CLAUDE.md 섹션 | playbook 영역에 삽입 |
| rule (fileMatch) | 하위 CLAUDE.md 또는 .clauderules | 디렉토리별 분리 |
| workflow | CLAUDE.md 섹션 | playbook 영역에 삽입 |
| agent | .claude/commands/{id}.md | 슬래시 커맨드 |
| automation | CLAUDE.md 규칙 섹션 | 자연어 규칙 변환 |
| skill | .claude/docs/{id}.md | 참조 문서 |

> 상세 변환 규칙: playbook 서버의 tool-mappings 참조

## 우선순위
- 사용자의 작업 요청이 항상 최우선
- 동기화 안내는 작업 완료 후 마지막에 짧게
- breaking 갱신은 작업 시작 전에 안내 (구버전으로 작업하는 것 방지)

## 초기 세팅 (처음 연결 시)

`_playbook.json`이 없거나 `purpose`가 비어 있으면:

1. 맥락이 충분한 경우 (이미 구체적 작업 요청이 온 경우):
   - 스택 자동 감지 + 요청 내용에서 용도 추론 → 적합한 프리셋 자동 제안
   - "Java 백엔드 개발 프로젝트로 보이는데, 관련 규칙을 세팅할까요?"

2. 맥락이 부족한 경우 (첫 세션, 일반적 인사 등):
   - 사용자에게 질문: "이 프로젝트에서 주로 뭘 하시나요? (여러 개 가능. 예: 웹서버 개발, 만화 그리기, 사진 편집 등)"
   - 답변 기반으로 프리셋 매칭 → `apply_preset` 호출

3. 프리셋 적용 후:
   - defaults(always) 자산은 안내 없이 자동 적용
   - 나머지는 목록 보여주고 승인 받기

## 용도 변경/추가

이미 `purpose`가 있는 프로젝트에서 새로운 용도가 감지되면:
- 사용자가 기존과 다른 작업을 언급 (예: 기존 "백엔드 개발" → "프론트도 추가할 거야")
- 해당 용도에 맞는 미적용 자산을 자연스럽게 제안
- 승인 시 purpose 배열에 추가 + 새 프리셋 적용
