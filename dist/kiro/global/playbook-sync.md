---
sourceId: playbook-sync
version: "1.0"
updatedAt: 2026-07-01
inclusion: always
---

# ai-playbook 연동

ai-playbook 사용 중.

## 세션 시작 시

1. ai-playbook MCP 서버의 `list_catalog` 도구를 호출하여 자산 목록(id, description, version, updatedAt)을 확인하라.
2. 프로젝트에 `.kiro/_playbook.json`이 있으면, applied 버전과 catalog의 version/updatedAt을 비교하라.
3. 업데이트가 필요한 자산이 있으면 세션 마지막에 짧게 안내하라:
   "Playbook 업데이트 있음 — {항목명} v{old}→v{new}: {changelog}. 동기화할까요?"
4. 이후 작업 중 catalog 목록에서 현재 작업과 관련있는 자산이 있다고 판단되면 `load_asset`으로 내용을 참고하라. 관련 없으면 추가 호출하지 마라.

## 우선순위

- 사용자의 작업 요청이 항상 최우선
- 동기화 안내는 작업 완료 후 마지막에 짧게
