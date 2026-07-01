---
id: design-docs-system
type: skill
name: 디자인 문서 시스템
description: 빌드 도구 없이 HTML/CSS로 관리하는 디자인 문서 시스템 구조와 컨벤션
tags: [design, documentation, html, css, design-system]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: [design-system]
compatibleWith: [react, typescript]
---

# 디자인 문서 시스템

## 개요

빌드 도구 없이 순수 HTML/CSS/JS만으로 관리하는 디자인 문서 시스템.
브라우저에서 바로 열어서 화면별 디자인 시안을 케이스별로 확인할 수 있다.

### 핵심 특징
- 빌드 도구 제로 (파일 더블클릭으로 확인)
- 기획서(cases.md)와 시안(html)이 1:1 매칭
- 케이스별 화면 상태를 버튼으로 전환하며 확인
- 뷰포트 사이즈별 레이아웃 확인
- AI 에이전트가 cases.md를 읽고 html을 생성/수정 가능

---

## 디렉토리 구조

```
docs/design/
├── index.html                  ← 전체 화면 목록 (manifest 기반 렌더링)
├── README.md                   ← 현재 화면 목록 + 상태
├── shared/
│   ├── design-manifest.js      ← 카테고리별 화면 목록 + 뷰포트 설정
│   ├── tokens.css              ← 디자인 토큰
│   ├── base.css                ← 기본 스타일 + case-switcher + 뷰포트 프레임
│   ├── components.css          ← 공용 컴포넌트
│   └── {도메인}-system.html    ← 컴포넌트 카탈로그
├── {category}/
│   ├── {화면}.html             ← 화면 디자인 시안 (케이스별 분기 포함)
│   └── {화면}.cases.md         ← 기획서 (케이스, API, 비즈니스 규칙)
```

---

## design-manifest.js 스키마

```javascript
/**
 * 프로젝트별 디자인 문서 설정
 */

// 뷰포트 설정 — 프로젝트에서 고려하는 디바이스 목록
window.__DESIGN_CONFIG__ = {
  viewports: [
    { name: "Mobile S", width: 360 },    // 저사양 안드로이드
    { name: "Mobile M", width: 375 },    // iPhone SE, 구형 iPhone
    { name: "Mobile L", width: 430 },    // iPhone Pro Max, 갤럭시 S24+
    { name: "Tablet", width: 768 },      // iPad Mini, 세로 태블릿
    { name: "Desktop", width: 1280 },    // 일반 노트북
    { name: "Desktop L", width: 1440 },  // 큰 모니터
    { name: "Full", width: null }        // 제한 없음
  ],
  // 카테고리별 기본 뷰포트 (화면 열 때 초기 선택)
  categoryDefaults: {
    // 예시 — 프로젝트에 맞게 설정
    // miniapp: "Mobile M",
    // admin: "Desktop",
    // web: "Desktop"
  }
};

// 화면 목록
window.__DESIGN_MANIFEST__ = {
  // 예시:
  // miniapp: {
  //   label: "Mini App",
  //   items: [
  //     { name: "홈", file: "miniapp/home", status: "done" },
  //     { name: "설정", file: "miniapp/settings", status: "draft" }
  //   ]
  // }
};
```

### 뷰포트 설정 가이드

프로젝트 성격에 따라 필요한 사이즈만 남긴다:

| 프로젝트 유형 | 권장 뷰포트 |
|-------------|------------|
| 모바일 앱 전용 | Mobile M, Mobile L |
| 모바일 + 태블릿 | Mobile M, Mobile L, Tablet |
| 반응형 웹 | Mobile M, Tablet, Desktop |
| 데스크톱 전용 (어드민) | Desktop, Desktop L |
| 풀스택 (모바일 + 어드민) | Mobile M, Mobile L, Desktop |

> 디자이너 에이전트는 이 설정을 참고하여 각 뷰포트에서 레이아웃이 올바른지 확인한다.

### status 값

| status | 의미 | UI 표시 |
|--------|------|---------|
| done | 구현 완료 | 🟢 |
| draft | 작업 중 | 🟡 |
| outdated | 코드와 불일치 (갱신 필요) | 🔴 |
| todo | 미구현 | ⚪ |

---

## 3단 네비게이션 구조

화면 HTML 또는 index.html에서 3단 선택 UI 제공:

```
┌─────────────────────────────────────────────────┐
│ 1열: 페이지 선택                                  │
│ [홈] [챌린지 목록] [챌린지 상세] [내 챌린지] ...    │
├─────────────────────────────────────────────────┤
│ 2열: 케이스 선택                                  │
│ [일반] [이벤트] [빈 상태] [에러] [로딩]           │
├─────────────────────────────────────────────────┤
│ 3열: 뷰포트 사이즈                                │
│ [375] [430] [768] [1280] [Full]                 │
├─────────────────────────────────────────────────┤
│                                                 │
│            화면 렌더링 영역                       │
│         (선택된 사이즈로 제한)                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 구현 방식: iframe 기반

index.html에서 뷰포트 사이즈를 전환할 때:

```html
<div class="viewport-frame" id="viewport-frame">
  <iframe id="design-iframe" src="" style="width: 100%; height: 800px; border: none;"></iframe>
</div>

<script>
function setViewport(width) {
  const frame = document.getElementById('viewport-frame');
  frame.style.width = width ? `${width}px` : '100%';
  frame.style.margin = '0 auto';
}
</script>
```

- iframe 내부에서 미디어 쿼리가 정상 동작 (iframe width 기준)
- 개별 화면 HTML은 독립적으로도 열 수 있음 (단독 확인 가능)
- 뷰포트 선택은 index.html의 네비게이션에서만 제공

---

## cases.md 파일 형식

```markdown
# {화면명} 케이스

## 지원 뷰포트
- Mobile M (375px) — 기본
- Mobile L (430px)

## 진입 조건
- 어떤 경로로 이 화면에 도달하는지

## Case 1: {케이스명}
- 조건: {데이터 상태}
- 표시: {화면에 보여야 할 내용}
- 인터랙션: {사용자가 할 수 있는 행동}
- 결과: {행동 후 상태 변화}

## Case 2: ...

## 에러 케이스
- {에러 조건}: {표시할 내용}

## API 연동
- {어떤 API를 호출하는지, 성공/실패 분기}
```

> "지원 뷰포트" 섹션으로 이 화면이 어떤 디바이스를 고려하는지 명시. 디자이너 에이전트는 이 목록에 있는 사이즈에서만 레이아웃을 검증한다.

---

## 화면 HTML 파일 구조

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{화면명}</title>
  <link rel="stylesheet" href="../shared/base.css">
  <link rel="stylesheet" href="../shared/tokens.css">
  <link rel="stylesheet" href="../shared/components.css">
  <style>
    /* 이 화면 전용 스타일 */
  </style>
</head>
<body>
  <div class="container">
    <!-- 케이스 전환 탭 (2열) -->
    <nav class="case-switcher">
      <button class="active" data-case="1">Case 1</button>
      <button data-case="2">Case 2</button>
      <button data-case="3">빈 상태</button>
      <button data-case="4">에러</button>
    </nav>

    <!-- Case 1 -->
    <main class="screen active" id="case-1">
      <!-- 화면 내용 -->
    </main>

    <!-- Case 2 -->
    <main class="screen" id="case-2">
      <!-- 화면 내용 -->
    </main>
  </div>

  <script>
    // case-switcher 로직 (base.css/base.js에서 공통 제공 가능)
    document.querySelectorAll('.case-switcher button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.case-switcher button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`case-${btn.dataset.case}`).classList.add('active');
      });
    });
  </script>
</body>
</html>
```

---

## 컨벤션

### 파일명
- HTML: `{화면명-kebab-case}.html`
- 케이스: `{화면명-kebab-case}.cases.md`
- 동일 디렉토리에 1:1 매칭

### 스타일 규칙
- 색상/간격은 반드시 `var()` 사용 (하드코딩 금지)
- 새 토큰 필요 시 tokens.css에 먼저 추가
- 2개 화면 이상에서 반복되는 패턴 → components.css로 추출
- 1개 화면 전용 스타일 → 해당 HTML `<style>` 내 유지

### 인터랙션
- vanilla JS만 사용 (외부 라이브러리 금지)
- 케이스 전환, 모달, 탭 등 UI 동작 직접 구현
- 데이터 fetch는 하지 않음 (정적 더미 데이터로 모든 케이스 표현)

### 새 화면 추가 시
1. design-manifest.js에 항목 추가
2. cases.md 작성 (기획)
3. HTML 작성 (디자인)
4. README.md 갱신

### 화면 삭제 시
1. design-manifest.js에서 제거
2. HTML + cases.md 삭제
3. README.md 갱신
