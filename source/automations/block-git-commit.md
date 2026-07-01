---
id: block-git-commit
type: automation
name: Git Commit 차단
description: AI의 자동 커밋을 방지하고, 사용자의 명시적 허용이 있을 때만 커밋 허용
tags: [git, safety, commit]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: []
compatibleWith: []
---

# Git Commit 차단

## Trigger

- **event**: shell 명령 실행 전
- **condition**: 명령에 "git commit" 포함

## Action

- 사용자의 직전 메시지(바로 이전 1개의 사용자 메시지)에서 명시적 커밋 허용 표현을 확인한다
- 허용 표현 예시: "커밋해", "commit 해줘", "커밋 허용", "커밋까지 해줘"
- 허용 표현이 있으면: 실행 허용
- 허용 표현이 없으면: "ACCESS DENIED: 사용자의 명시적 커밋 허용이 필요합니다." 응답
- git commit 외 다른 git 명령(git add, git status, git diff 등)은 자유롭게 허용

## Notes

- 과거 허용은 무효 — 직전 1개 메시지만 확인한다
- git add, git status, git diff 등은 차단 대상이 아님
- git과 무관한 shell 명령도 차단 대상이 아님
