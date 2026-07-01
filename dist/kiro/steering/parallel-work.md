---
sourceId: parallel-work
version: "1.0"
updatedAt: 2026-07-01
inclusion: always
---

# 병렬 작업 전략 (Git Worktree)

## 목적

여러 독립적인 작업을 동시에 진행해야 할 때, git worktree를 활용하여 브랜치 전환 없이 병렬 작업한다.

## 사용 기준

### 사용할 때
- 서로 독립적인 2개 이상 기능을 동시 개발할 때
- 긴급 핫픽스가 필요한데 현재 브랜치에 미완성 작업이 있을 때
- 실험적 접근을 별도로 시도하면서 메인 작업을 유지하고 싶을 때
- 큰 리팩토링과 일반 기능 개발을 병행할 때

### 사용하지 않을 때
- 단일 기능 구현 중
- 순차적으로 처리해도 되는 작업
- 같은 파일을 수정해야 하는 작업 (충돌 불가피)
- 5분 내 완료 가능한 작업

## Steps

### Step 1: 작업 분리 판단
- **done-when**: 두 작업이 독립적(같은 파일 미수정)임을 확인
- **fail-action**: 파일 겹침 발견 시 순차 처리로 전환

### Step 2: Worktree 생성

```bash
# 새 브랜치 + worktree 생성
git worktree add ../project-hotfix hotfix/urgent-bug

# 기존 브랜치로 worktree 생성
git worktree add ../project-experiment feature/experiment
```

- **done-when**: worktree 생성 완료, 별도 디렉토리에서 작업 가능
- **fail-action**: 생성 실패 시 git 상태 확인 (uncommitted changes 등)

### Step 3: 병렬 작업 수행
- 각 worktree에서 독립적으로 커밋
- 메인 작업 디렉토리와 worktree 간 혼동 주의

### Step 4: 정리

```bash
# 작업 완료 후 worktree 제거
git worktree remove ../project-hotfix

# 목록 확인
git worktree list
```

- **done-when**: merge/PR 완료 + worktree 제거
- **fail-action**: 충돌 발생 시 해결 후 제거

## 주의사항

- 같은 브랜치를 두 worktree에서 체크아웃할 수 없음
- worktree 내에서 `git checkout`으로 브랜치 전환 가능하지만, 다른 worktree가 사용 중인 브랜치로는 전환 불가
- worktree 삭제 전 커밋/스태시 필수
- 장기간 유지하면 메인과 멀어짐 — 가능한 빨리 merge하고 제거
