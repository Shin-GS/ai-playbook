---
id: block-env-read
type: automation
name: .env 파일 읽기 차단
description: .env 파일 읽기를 차단하여 시크릿 키 노출 방지
tags: [security, env, secrets]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: []
compatibleWith: []
---

# .env 파일 읽기 차단

## Trigger

- **event**: 파일 읽기 전
- **condition**: 파일 경로가 정확히 ".env"로 끝나는 경우

## Action

- 파일 경로가 정확히 `.env`로 끝나는 경우에만 차단한다
- 차단 시 응답: "ACCESS DENIED: .env files contain secrets and must not be read."
- 아래 파일은 차단하지 않고 자유롭게 허용한다:
  - `.env.example`
  - `.env.local`
  - `.env.development`
  - `.env.production`
  - 기타 `.env.{suffix}` 형태의 파일

## Notes

- 판단 기준은 파일명 끝이 정확히 `.env`인지 여부
- `.env.example` 등 확장자가 추가된 파일은 시크릿이 아닌 템플릿이므로 허용
- 차단 대상이 아닌 파일은 별도 설명 없이 즉시 허용
