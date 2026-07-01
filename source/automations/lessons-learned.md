---
id: lessons-learned
type: automation
name: 패턴 축적 제안
description: 세션 종료 시 이번 작업에서 배운 패턴이 있으면 playbook 추가를 제안
tags: [automation, learning, knowledge, growth]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: []
compatibleWith: []
---

# 패턴 축적 제안

## Trigger

- **event**: 에이전트 작업 완료 후 (agentStop)

## Action

이번 세션에서 아래에 해당하는 패턴이 있었는지 확인한다:

1. **새로 발견한 문제 해결 패턴** — 이전에 없던 방식으로 문제를 해결했는가?
2. **반복될 가능성이 있는 실수** — 다른 프로젝트에서도 같은 실수를 할 수 있는가?
3. **유용한 도구/라이브러리 사용법** — 다음에도 쓸 만한 팁이 있는가?

해당 사항이 있으면:
- "이번 작업에서 {패턴 요약}을 발견했습니다. ai-playbook에 추가할까요?" 제안
- 추가 동의 시: 적절한 source/ 위치에 자산 생성 (rule/skill/workflow)

해당 사항이 없으면:
- 아무 말 하지 않음 (불필요한 출력 방지)

## Notes

- 매 세션마다 강제로 물어보지 않는다 — 유의미한 패턴이 있을 때만
- 단순 버그 수정이나 typo 수정 세션에서는 대부분 해당 없음
- 제안 시 간결하게 — "추가할까요?" 한 줄이면 충분
