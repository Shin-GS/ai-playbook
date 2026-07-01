---
id: test-docs-system
type: skill
name: 테스트 문서 시스템
description: 빌드 도구 없이 HTML/JS로 관리하는 수동 테스트 체크리스트 시스템 구조와 컨벤션
tags: [qa, testing, documentation, checklist]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: []
compatibleWith: []
---

# 테스트 문서 시스템

## 개요

빌드 도구 없이 순수 HTML/CSS/JS만으로 관리하는 수동 테스트 체크리스트 시스템.
브라우저에서 바로 열어서 기능별 테스트 항목을 확인하고 체크할 수 있다.

### 핵심 특징
- 빌드 도구 제로 (파일 더블클릭으로 브라우저 확인)
- 테스트 데이터를 JS 파일(`window.__TEST_DATA__`)로 관리
- 공통 렌더러가 데이터를 읽어서 HTML로 변환
- 기능별 파일 분리 — 변경 시 영향받는 파일만 수정
- AI 에이전트(qa-tester)가 코드 변경 시 영향받는 테스트를 자동 추적

---

## 디렉토리 구조

```
docs/test/
├── index.html              ← 통합 뷰어 (manifest 기반, 드롭다운 선택)
├── README.md               ← 전체 테스트 현황 (기능별 케이스 수, 우선순위)
├── shared/
│   ├── test-manifest.js    ← 카테고리별 테스트 파일 목록 + 케이스 수
│   ├── test-base.css       ← 뷰어 공통 스타일
│   └── test-renderer.js    ← __TEST_DATA__ → HTML 렌더링 스크립트
├── {category}/
│   └── {기능명}.js         ← 테스트 데이터 (window.__TEST_DATA__ = {...})
```

---

## test-manifest.js 스키마

```javascript
/**
 * QA Test Manifest
 * 카테고리별 테스트 파일 목록. 새 테스트 추가 시 해당 카테고리 items에 항목 추가.
 * totalCases: 해당 .js 파일의 cases 배열 길이 (진행률 계산용)
 */
window.__TEST_MANIFEST__ = {
  // 예시:
  // miniapp: {
  //   label: "Mini App",
  //   items: [
  //     { file: "miniapp/home.js", feature: "홈", screen: "home", totalCases: 12 }
  //   ]
  // },
  // admin: {
  //   label: "Admin Dashboard",
  //   items: [
  //     { file: "admin/dashboard.js", feature: "대시보드", screen: "dashboard", totalCases: 15 }
  //   ]
  // }
};
```

---

## 테스트 데이터 파일 스키마 (.js)

```javascript
// QA Test Data — {기능명} ({screen})
window.__TEST_DATA__ = {
  "feature": "기능명",
  "screen": "화면명",
  "lastUpdated": "YYYY-MM-DD",
  "priority": "critical | high | medium | low",
  "cases": [
    {
      "id": "{약어}-{N|E}-{번호}",
      "type": "normal | exception",
      "regression": false,
      "regressionNote": "",
      "scenario": "테스트 시나리오 한 줄 설명",
      "precondition": "전제 조건",
      "action": "사용자 조작",
      "expected": "기대 결과",
      "dbCheck": "DB 확인 사항"
    }
  ]
};
```

### 필드 설명

| 필드 | 설명 |
|------|------|
| id | 고유 식별자. `{파일약어}-{N\|E}-{3자리번호}` (N=정상, E=예외) |
| type | `normal`(정상 흐름), `exception`(예외/에러 흐름) |
| regression | 이전에 Fail 났던 항목 → 뷰어에서 빨간 뱃지 표시 |
| regressionNote | regression 사유 (언제, 왜 실패했는지) |
| scenario | 뭘 테스트하는지 한 줄 |
| precondition | 테스트 시작 전 필요한 상태 |
| action | 사용자가 수행할 조작 |
| expected | 화면에서 확인할 기대 결과 |
| dbCheck | DB에서 확인할 사항 (테이블명 + 컬럼 + 기대값) |

### ID 체계
- 파일약어: 파일명에서 각 단어 첫 글자 (최대 2~3자)
  - `user-signup` → `US`
  - `order-payment` → `OP`
  - `withdrawal-request` → `WD`
- 정상: `{약어}-N-001`, `{약어}-N-002`
- 예외: `{약어}-E-001`, `{약어}-E-002`

### priority 기준

| 우선순위 | 기준 | 배포 전 행동 |
|---------|------|-------------|
| critical | 돈, 결제, 인증, 핵심 보안 | 반드시 전체 통과 |
| high | 핵심 사용자 플로우 | 관련 기능 변경 시 필수 확인 |
| medium | 일반 기능 | 주기적 확인 (주 1회) |
| low | 보조 기능 | 대규모 변경 시에만 |

---

## index.html 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Test Checklist</title>
    <link rel="stylesheet" href="shared/test-base.css">
</head>
<body>
    <div id="nav"></div>
    <div id="app"></div>
    <script src="shared/test-manifest.js"></script>
    <script src="shared/test-renderer.js"></script>
</body>
</html>
```

- manifest를 읽어서 카테고리 드롭다운 생성
- 기능 선택 시 해당 .js 파일을 동적 로드
- `window.__TEST_DATA__`를 읽어서 테이블 렌더링
- 체크박스로 통과/실패 마킹 (브라우저 내에서만, 파일 저장 안 함)

---

## test-renderer.js 핵심 동작

1. manifest에서 카테고리/기능 목록 렌더링
2. 기능 선택 → `<script src="{file}">` 동적 삽입
3. `window.__TEST_DATA__` 파싱 → HTML 테이블 생성
4. 각 케이스를 행으로: checkbox + id + scenario + precondition + action + expected + dbCheck
5. regression=true인 항목에 빨간 뱃지 표시
6. 진행률 표시 (체크된 수 / 전체)

---

## dbCheck 작성 규칙

- 형식: `테이블명(컬럼=값, 컬럼=값)`
- 여러 테이블: 세미콜론으로 구분
- 변경 없음: `"변경 없음"`
- 예시:
  - `"ORDER(status=CONFIRMED, amount=10000)"`
  - `"USER(status=ACTIVE); WALLET(balance+=100)"`

---

## 영향 분석 방법 (코드 변경 시)

기능 변경 후 어떤 테스트가 영향받는지 확인:

1. 변경된 **엔티티/테이블명**으로 모든 .js의 `dbCheck` 필드 검색
2. 변경된 **API 경로**로 `action` 필드 검색
3. 변경된 **상태값**으로 `precondition`, `expected` 필드 검색

---

## 새 테스트 추가 절차

1. `docs/test/{category}/{기능명}.js` 생성
2. `docs/test/shared/test-manifest.js`에 항목 추가
3. `docs/test/README.md` 갱신

## 기존 테스트 업데이트 절차

1. 변경된 코드/규칙 파악
2. 영향 분석 (위 방법)
3. 해당 .js 파일에서 영향받는 케이스 수정
4. 새 케이스 추가 / 삭제된 기능의 케이스 제거
5. `lastUpdated` 갱신
6. manifest의 `totalCases` 갱신
7. README.md 갱신

---

## README.md 형식

```markdown
# QA Test Checklist

## 테스트 현황

| 기능 | 파일 | 우선순위 | 케이스 수 | 마지막 업데이트 |
|------|------|---------|----------|--------------|
| 홈 | miniapp/home | high | 12 | 2026-07-01 |
| 결제 | miniapp/payment | critical | 18 | 2026-07-01 |

## 우선순위 가이드
- **critical**: 배포 전 반드시 전체 통과
- **high**: 관련 기능 변경 시 필수 확인
- **medium**: 주기적 확인 (주 1회)
- **low**: 대규모 변경 시에만
```

---

## 프로젝트 초기 세팅 절차

1. `docs/test/` 디렉토리 생성
2. `docs/test/shared/test-manifest.js` 생성 (빈 manifest)
3. `docs/test/shared/test-base.css` 생성 (뷰어 스타일)
4. `docs/test/shared/test-renderer.js` 생성 (렌더링 로직)
5. `docs/test/index.html` 생성 (위 구조)
6. `docs/test/README.md` 생성

> qa-tester 에이전트가 이 구조를 인지하고 기능 추가/변경 시 자동으로 테스트를 생성/갱신한다.
