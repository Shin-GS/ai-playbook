---
inclusion: always
---

# ai-playbook 연동

ai-playbook MCP 서버 사용 중.

## 세션 시작 시

1. `list_catalog` 도구를 호출하여 자산 목록(id, version, updatedAt, changelog)을 확인하라.
2. 프로젝트에 `.kiro/_playbook.json`이 있으면:
   - applied 자산들의 updatedAt과 catalog의 updatedAt을 비교
   - 차이 있는 것만 수집
   - 세션 마지막에 짧게 안내: "{항목명} v{old}→v{new}: {changelog}. 갱신할까요?"
3. MCP 연결 안 되면: 동기화 스킵, 로컬 파일로 정상 동작

## 작업 중 새 자산 제안

작업 중 catalog 목록에서 프로젝트에 유용한 자산을 발견하면:
- "playbook에 {name}이 있는데 다운로드할까요? — {description}"
- 허락 시: `load_asset`으로 내용 가져와서 → Kiro 형식으로 변환 → .kiro/에 저장 → _playbook.json 갱신
- 거절 시: _playbook.json의 declined에 기록 → 같은 자산 다시 제안하지 않음

### 제안 기준
- 프로젝트에 해당 기술 스택이 확인될 때만
- declined에 있는 자산은 제안하지 않음
- 한 세션에 최대 2개까지만 제안

### 다운로드 시 변환
| type | 저장 위치 | 변환 |
|------|-----------|------|
| rule | .kiro/steering/{id}.md | frontmatter → inclusion/fileMatchPattern |
| workflow | .kiro/steering/{id}.md | frontmatter → inclusion: always |
| agent | .kiro/agents/{id}.md | frontmatter → name/description/tools |
| automation | .kiro/hooks/{id}.kiro.hook | Trigger/Action → when/then JSON |
| skill | 다운로드 안 함 (참조만) | — |

## 우선순위
- 사용자의 작업 요청이 항상 최우선
- 동기화 안내는 작업 완료 후 마지막에 짧게
