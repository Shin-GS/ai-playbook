---
id: design-system
type: workflow
name: 디자인 시스템 구축 워크플로우
description: 프로젝트별 디자인 시스템(토큰→컴포넌트→페이지) 구축 순서와 규칙
tags: [workflow, design, ui, ux, design-system]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: [multi-perspective-review]
compatibleWith: [react, typescript]
---

# 디자인 시스템 구축 워크플로우

## 목적

프로젝트마다 일관된 디자인 시스템을 구축하여, AI가 페이지를 구현할 때 시각적 일관성을 보장한다. HTML/CSS로 먼저 명세를 만들고, 이를 기반으로 FE 코드를 구현한다.

## 필수 전제: 디자인 시스템 없이 페이지 구현 금지

> ⚠️ tokens.css + components.css + 시스템 HTML이 없는 상태에서 페이지 구현을 시작하면 안 된다.

## Steps

### Step 1: 디자인 토큰 정의 (tokens.css)
- **done-when**: 색상, 간격, 폰트, radius, 그림자 등 기본 토큰 정의 완료
- **fail-action**: 프로젝트 성격에 맞는 기본 토큰을 제안하고 사용자에게 확인

정의할 토큰:
- 색상 팔레트 (primary, secondary, background, text, error, success, warning)
- 간격 체계 (4px 기반: xs, sm, md, lg, xl, 2xl)
- 폰트 크기 (heading, body, caption)
- 테두리 radius
- 그림자 (elevation)

### Step 2: 공통 컴포넌트 정의 (components.css + system.html)
- **done-when**: Button, Input, Card, Modal 등 기본 컴포넌트 스타일 + 카탈로그 HTML 생성
- **fail-action**: 프로젝트에 필요한 최소 컴포넌트 목록을 제안하고 확인

system.html은 **컴포넌트 카탈로그** — 브라우저에서 열면 모든 컴포넌트 상태를 확인 가능.

### Step 3: 페이지 디자인 명세 (케이스별 HTML)
- **done-when**: 케이스별(.cases.md에 정의된 상태별) HTML 구현 완료. tokens.css 변수만 사용.
- **fail-action**: 하드코딩된 색상/간격 발견 시 토큰으로 교체

### Step 4: FE 코드 구현
- **done-when**: HTML 명세를 React로 1:1 변환 완료. 모든 케이스 구현.
- **fail-action**: HTML과 불일치 발견 시 HTML 기준으로 수정

## 디자인 명세 디렉토리 구조

```
docs/design/
├── shared/
│   ├── tokens.css              # 디자인 토큰 변수
│   ├── components.css          # 공통 컴포넌트 스타일
│   ├── base.css                # 기본 레이아웃 스타일
│   └── system.html             # 컴포넌트 카탈로그 (브라우저 확인용)
├── {도메인}/
│   ├── {화면명}.cases.md       # 케이스 정의 (기획)
│   └── {화면명}.html           # 디자인 명세 (구현)
└── README.md                   # 화면 목록 + 상태
```

## tokens.css 예시

```css
:root {
  /* Colors */
  --color-primary: #3B82F6;
  --color-primary-hover: #2563EB;
  --color-secondary: #6B7280;
  --color-background: #111827;
  --color-surface: #1F2937;
  --color-text: #F9FAFB;
  --color-text-muted: #9CA3AF;
  --color-error: #EF4444;
  --color-success: #10B981;
  --color-warning: #F59E0B;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Font */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 20px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;

  /* Border */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

## 다관점 적용

디자인 결정 시 `multi-perspective-review` 워크플로우를 적용:
- 🛡️ 기존 디자인 시스템과의 일관성
- 👤 사용자 직관성, 접근성
- 🔍 엣지 케이스 (긴 텍스트, 빈 상태, 에러 상태)
- 💡 UX 혁신, 차별화 포인트

## 주의사항

- 페이지별 HTML은 **빌드 없이 브라우저에서 바로 확인** 가능해야 함
- 색상/간격은 절대 하드코딩하지 않음 — 반드시 var() 사용
- 새 토큰이 필요하면 tokens.css에 먼저 추가 후 사용
- 다크/라이트 모드가 필요하면 토큰 레벨에서 처리
