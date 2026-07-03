---
id: kiro-conversion
type: workflow
name: Kiro 자산 변환 규칙 (Deprecated)
description: "⚠️ 이 문서는 asset-download.md + tool-mappings/kiro.md로 분리되었습니다."
tags: [workflow, conversion, kiro, deprecated]
version: "2.0"
updatedAt: 2026-07-03
changelog: asset-download.md + tool-mappings/kiro.md로 분리, 이 파일은 리다이렉트만 유지
activation: always
activationPattern: []
dependsOn: [asset-download, tool-mapping-kiro]
compatibleWith: []
---

# ⚠️ Deprecated — 이동됨

이 문서의 내용은 아래 두 문서로 분리되었습니다:

1. **공통 다운로드 절차**: `source/workflows/asset-download.md`
   - 의존성 해결, 버전 관리, 갱신 정책 (changeLevel)
   - 도구 중립적 공통 절차

2. **Kiro 도구 매핑**: `source/workflows/tool-mappings/kiro.md`
   - source → .kiro/ 변환 규칙
   - 타입별 저장 위치, frontmatter 변환

해당 문서들을 참조하세요.
