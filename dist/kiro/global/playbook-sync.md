---
sourceId: playbook-sync
version: "2.0"
updatedAt: 2026-07-01
inclusion: always
---

# ai-playbook 연동

ai-playbook 사용 중.

---

## 세션 시작 시

1. ai-playbook MCP 서버의 `list_catalog`를 호출하여 자산 목록(id, version, updatedAt, changelog)을 확인하라.
2. 프로젝트에 `.kiro/_playbook.json`이 있으면:
   - applied 자산들의 updatedAt과 catalog의 updatedAt을 비교
   - 차이 있는 것만 수집
   - 세션 마지막에 짧게 안내: "{항목명} v{old}→v{new}: {changelog}. 갱신할까요?"
3. MCP 연결 안 되면: 동기화 스킵, 로컬 파일로 정상 동작

## 작업 중 새 자산 제안

작업 중 catalog 목록에서 프로젝트에 유용한 자산을 발견하면:
- "playbook에 {name}이 있는데 다운로드할까요? — {description}"
- 사용자가 허락하면: load_asset → 도구 형식으로 변환 → 프로젝트에 저장 → _playbook.json 갱신
- 사용자가 거절하면: _playbook.json의 declined에 기록 → 같은 자산 다시 제안하지 않음

### 제안 기준 (엄격하게)
- 프로젝트에 해당 기술 스택이 확인될 때만 (Java 파일 있으면 → java 태그 자산)
- 이미 다운로드한 자산의 dependsOn에 있는 자산이 없을 때
- declined에 있는 자산은 제안하지 않음
- 한 세션에 최대 2개까지만 제안 (과도한 제안 방지)

### 의존성 처리
다운로드하려는 자산의 dependsOn에 프로젝트에 없는 자산이 있으면:
- "이 자산은 {dep}도 필요합니다. 함께 받을까요?"

## 갱신 방식

- **기본: 덮어쓰기** (프로젝트에서 playbook 자산을 직접 수정하지 않는 원칙)
- **customized 자산**: _playbook.json에 `"customized": true`인 파일은 자동 갱신에서 제외
  - "원본이 업데이트됐지만 이 파일은 커스텀됐습니다. 수동 확인 필요" 안내
- **비교 기준**: updatedAt 날짜 비교 (version보다 신뢰 가능)

## 다운로드 시 변환 규칙

source/ 파일을 프로젝트에 저장할 때 도구 형식으로 변환:

| source type | Kiro 저장 위치 | 변환 |
|-------------|---------------|------|
| rule | .kiro/steering/{id}.md | frontmatter → inclusion/fileMatchPattern (activation 필드 기반) |
| workflow | .kiro/steering/{id}.md | frontmatter → inclusion: always |
| agent | .kiro/agents/{id}.md | frontmatter → name/description/tools |
| automation | .kiro/hooks/{id}.kiro.hook | Trigger/Action → when/then JSON |
| skill | 다운로드 안 함 (MCP 실시간 참조) | — |

## 우선순위

- 사용자의 작업 요청이 항상 최우선
- 동기화 안내는 작업 완료 후 마지막에 짧게
- 제안은 한 줄로 간결하게

---

## _playbook.json 스키마

프로젝트에 playbook 자산이 적용되면 이 파일이 자동 생성/갱신된다:

```json
{
  "playbookVersion": "1.0",
  "lastSyncAt": "2026-07-01T09:00:00Z",
  "applied": {
    "backend-java-spring": {
      "version": "1.2",
      "updatedAt": "2026-07-01",
      "location": ".kiro/steering/backend-java-spring.md",
      "customized": false
    },
    "block-git-commit": {
      "version": "1.0",
      "updatedAt": "2026-07-01",
      "location": ".kiro/hooks/block-git-commit.kiro.hook",
      "customized": false
    }
  },
  "declined": ["some-asset-id-user-rejected"],
  "groups": ["common-rules", "java-backend"]
}
```

### 필드 설명

| 필드 | 용도 |
|------|------|
| playbookVersion | 스키마 버전 |
| lastSyncAt | 마지막 동기화 시각 |
| applied.{id}.version | 적용된 자산 버전 |
| applied.{id}.updatedAt | 적용된 자산의 수정일 |
| applied.{id}.location | 프로젝트 내 저장 경로 |
| applied.{id}.customized | true면 자동 갱신 제외 |
| declined | 사용자가 거절한 자산 (다시 제안하지 않음) |
| groups | 적용된 그룹 목록 |
