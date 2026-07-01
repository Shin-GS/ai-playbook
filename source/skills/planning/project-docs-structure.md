---
id: project-docs-structure
type: skill
name: 프로젝트 기획 문서 구조
description: 프로젝트 시작 시 갖춰야 할 기획 문서 4종의 구조와 권장 내용
tags: [planning, documentation, project-setup]
version: "1.2"
updatedAt: 2026-07-01
changelog: 멀티 클라이언트 프로젝트 문서 분리 가이드 추가
dependsOn: []
compatibleWith: []
---

# 프로젝트 기획 문서 구조

## 개요

프로젝트를 시작할 때 아래 4종의 기획 문서를 먼저 작성해야 한다. 이 문서들이 있어야 AI가 프로젝트의 맥락을 이해하고, 디자인/구현 시 일관된 판단을 할 수 있다.

> ⚠️ 디자인 시스템 구축이나 화면 구현 전에 최소한 product.md + glossary.md는 존재해야 한다.

---

## 문서 4종

### 1. product.md — 서비스 개요

AI가 "이 프로젝트가 뭔지" 항상 인지해야 하는 문서.

**권장 섹션:**
```markdown
# 제품 개요

## 서비스 설명
- 한두 줄로 뭘 하는 서비스인지

## 대상 사용자
- 누가 쓰는지

## 핵심 기능
- 번호 매긴 기능 목록

## 기술 스택
| 구분 | 기술 |
|------|------|
| ... | ... |

## 프로젝트 구조
- 디렉토리 트리

## 환경변수
- .env.example 참조 또는 변수 목록

## 빌드 & 실행
- 핵심 명령어

## URL 구조
- 라우팅 테이블
```

**역할**: steering으로 등록하여 AI가 매 세션마다 프로젝트 맥락을 인지.

---

### 2. business-logic.md — 비즈니스 규칙

도메인 규칙, 상태 전이, 계산 공식 등 "코드로 구현해야 하는 비즈니스 판단"을 정리.

**권장 섹션:**
```markdown
# 비즈니스 로직

## 도메인 모델
- 핵심 엔티티와 관계
- 상태값 정의 (각 엔티티가 가질 수 있는 상태)

## 상태 전이
### {엔티티명}
- {상태A} → {상태B}: 조건
- {상태B} → {상태C}: 조건

## 비즈니스 규칙
### {도메인 영역 1}
- 규칙 1: ...
- 규칙 2: ...

### {도메인 영역 2}
- ...

## 계산/수식
- {계산 이름}: 공식 + 예시
- {수수료}: 기준 + 계산식

## 제약 조건
- 최소/최대값 (금액, 수량 등)
- 시간 제한 (취소 가능 기간 등)
- 횟수 제한 (일일 한도 등)
```

**역할**: steering으로 등록. 코드 구현 시 정확한 규칙 참조. 기획 변경 시 이 문서가 먼저 업데이트되고, 영향받는 cases.md → html → 코드 순으로 전파.

---

### 3. glossary.md — 용어 사전

프로젝트에서 사용하는 도메인 용어를 한 곳에 정의. AI가 일관된 용어를 사용하도록 강제.

**권장 섹션:**
```markdown
# 용어 사전

## 도메인 용어
| 용어 | 정의 | 비고 |
|------|------|------|
| {term} | {definition} | |

## 상태값
| 엔티티 | 상태 | 의미 |
|--------|------|------|
| Order | PENDING | 결제 대기 중 |
| Order | CONFIRMED | 결제 완료 |

## 화면 명칭
| 화면 | 경로 | 설명 |
|------|------|------|
| 홈 | / | 메인 화면 |
```

**역할**: steering으로 등록. 새 용어 추가 시 여기 먼저 등록 후 사용. 화면 추가/삭제 시 화면 명칭 섹션도 갱신.

---

### 4. {화면}.cases.md — 화면별 케이스 정의

화면 단위로 기획 내용을 정의. 디자인(html)과 1:1 매칭.

> 상세 형식은 `design-docs-system` skill의 "cases.md 파일 형식" 섹션 참조.

---

## 멀티 클라이언트 프로젝트에서의 문서 분리

프로젝트에 클라이언트가 여러 개 있을 때 기획 문서를 어떻게 분리하는지:

### 원칙

- **카테고리 이름은 프로젝트에 맞게 자유 결정** — 고정된 이름 없음
- **같은 화면이라도 클라이언트별로 각각 cases.md를 작성한다** — 공유 패턴 사용하지 않음

### 공통 vs 클라이언트별 분리

| 문서 | 공통 (1개) | 클라이언트별 (N개) | 이유 |
|------|-----------|-------------------|------|
| product.md | ✅ | | 서비스 전체 맥락은 하나 |
| business-logic.md | ✅ | | 도메인 규칙은 클라이언트를 관통 |
| glossary.md | ✅ | | 용어는 프로젝트 전체에서 통일 |
| {화면}.cases.md | | ✅ | 화면은 클라이언트별로 다름 |

### 예시

```
.kiro/steering/
├── product.md           ← 공통 (always)
├── business-logic.md    ← 공통 (always)
└── glossary.md          ← 공통 (always)

docs/design/
├── {client-a}/
│   ├── home.cases.md
│   └── home.html
├── {client-b}/
│   ├── dashboard.cases.md
│   └── dashboard.html
└── shared/
```

### business-logic.md 내부 구조

도메인 규칙이 특정 클라이언트에서만 적용되는 경우, 문서 내부에서 섹션으로 구분:

```markdown
## 비즈니스 규칙

### 공통
- 규칙 1: ...

### {client-a} 전용
- 규칙 2: ...

### {client-b} 전용
- 규칙 3: ...
```

> 문서를 분리하지 않는다 — 한 파일에서 섹션으로 구분하면 전체 규칙을 한눈에 볼 수 있음.

---

## 문서 간 관계

```
product.md (서비스 전체 맥락)
    ↓
business-logic.md (도메인 규칙)
    ↓ 규칙 참조
{화면}.cases.md (화면별 케이스)
    ↓ 디자인 근거
{화면}.html (디자인 명세)
    ↓ 구현 근거
코드 (React/Java 등)
```

glossary.md는 모든 문서에서 참조하는 공통 사전.

---

## 기획 변경 시 전파 순서

1. `business-logic.md` 수정 (규칙 변경)
2. 영향받는 `{화면}.cases.md` 확인 — `비즈니스 규칙` 참조 필드로 역추적
3. 해당 cases.md 수정
4. 해당 HTML 수정 (디자인 반영)
5. 코드 수정
6. glossary.md 갱신 (용어/상태값 변경 시)

---

## 프로젝트 시작 시 세팅 순서

1. product.md 작성 (서비스 뭔지)
2. glossary.md 작성 (핵심 용어 정의)
3. business-logic.md 작성 (최소한의 도메인 규칙)
4. 디자인 시스템 세팅 (docs/design/ 초기 구조)
5. 화면별 cases.md + html 작성 (기능 추가마다)

> product.md와 glossary.md 없이 화면 구현을 시작하지 않는다.

---

## steering 등록 가이드

프로젝트의 .kiro/steering/에 아래와 같이 등록:

```yaml
# product.md
---
inclusion: always
---

# glossary.md
---
inclusion: always
---

# business-logic.md
---
inclusion: always
---
```

cases.md는 steering으로 등록하지 않음 (화면 작업 시 직접 읽기).


---

## 멀티 서버 프로젝트 (모노레포)

하나의 리포에 여러 서버가 있을 때 (예: packages/miniapp + packages/admin + packages/backend) 기획 문서를 어떻게 관리하는지.

### 공통 문서 (1개)

| 문서 | 공통/분리 | 이유 |
|------|-----------|------|
| product.md | **공통 1개** | 서비스 전체 개요. 모든 서버가 하나의 제품을 구성 |
| business-logic.md | **공통 1개** | 도메인 규칙은 서버를 관통함 (결제 규칙이 FE/BE 양쪽에 영향) |
| glossary.md | **공통 1개** | 용어는 프로젝트 전체에서 통일 |

### 서버별 분리

| 문서 | 공통/분리 | 이유 |
|------|-----------|------|
| cases.md | **서버별** | 각 클라이언트마다 화면이 다름 (miniapp/home.cases.md, admin/dashboard.cases.md) |
| 기술 스택 (tech.md) | **서버별 또는 통합** | 서버마다 기술 스택이 다를 수 있음. product.md에 통합하거나 별도 분리 |
| 구조 문서 (structure.md) | **서버별 또는 통합** | 패키지 구조가 복잡하면 분리 |

### business-logic.md 작성 시 주의

여러 서버에 걸친 규칙은 "어느 서버에서 책임지는지" 명시:

```markdown
## 결제 규칙
- 최소 금액: 10 TON
- 검증: **BE에서 수행** (FE는 UX용 사전 체크만)
- 상태 변경: **BE에서만** (FE는 조회만)
```

### steering 등록 (프로젝트의 .kiro/steering/)

```yaml
# product.md — 항상 로드
---
inclusion: always
---

# business-logic.md — 항상 로드
---
inclusion: always
---

# glossary.md — 항상 로드
---
inclusion: always
---
```

> 공통 문서는 어떤 서버 작업을 하든 항상 컨텍스트에 포함되어야 한다.

### 프로젝트 구조 예시

```
project/
├── packages/
│   ├── miniapp/           ← React 모바일
│   ├── admin/             ← React 데스크톱
│   └── backend/           ← Java/Spring
├── docs/
│   ├── design/            ← 디자인 문서 (카테고리별)
│   └── test/              ← QA 체크리스트 (카테고리별)
├── .kiro/
│   └── steering/
│       ├── product.md     ← 공통 (always)
│       ├── business-logic.md ← 공통 (always)
│       ├── glossary.md    ← 공통 (always)
│       ├── backend-rules.md  ← BE 작업 시만 (fileMatch)
│       └── frontend-rules.md ← FE 작업 시만 (fileMatch)
```
