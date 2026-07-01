---
id: conventional-commit
type: automation
name: Conventional Commit 메시지 생성
description: git staged 변경사항 분석하여 Conventional Commit 형식 커밋 메시지 자동 생성
tags: [git, commit, automation]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: []
compatibleWith: []
---

# Conventional Commit 메시지 생성

## Trigger

- **event**: 사용자 수동 트리거

## Action

### 실행 절차

1. `git diff --cached --stat`으로 변경 파일 목록 확인
2. `git diff --cached`로 상세 변경 내용 확인
3. staged 변경사항이 없으면 사용자에게 안내
4. 변경 내용을 분석하여 아래 규칙에 따라 커밋 메시지 작성
5. 사용자에게 메시지 리뷰 요청
6. 긍정 답변 시 커밋 실행

### 커밋 메시지 형식

```
<type>: <subject>
- <변경사항 1>
- <변경사항 2>
- ...
```

### Type 분류

| type | 용도 |
|------|------|
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| refactor | 리팩토링 (기능 변경 없음) |
| chore | 빌드, 설정, 의존성 변경 |
| docs | 문서 변경 |
| test | 테스트 추가/수정 |
| style | 코드 포맷팅, 세미콜론 등 (기능 변경 없음) |
| perf | 성능 개선 |

### 작성 원칙

- subject는 한국어로 작성, 50자 이내
- body의 각 항목은 파일 또는 컴포넌트 단위로 변경 내용을 요약
- 신규 파일은 역할을 간결하게 설명
- 삭제된 파일은 삭제 사유를 명시
- 설정 변경은 변경된 항목을 구체적으로 기술
- 여러 type에 걸치는 변경이면 가장 핵심적인 type을 선택

### 복합 변경 시 type 우선순위

1. `feat` (새 기능이 포함되면 feat 우선)
2. `fix` (버그 수정이 핵심이면)
3. `refactor` (구조 변경이 핵심이면)
4. `chore` (설정/의존성만 변경이면)

## Notes

- 리뷰 후 긍정 답변이 있어야 커밋을 실행한다
- staged 변경사항이 없으면 커밋을 시도하지 않고 안내만 한다
