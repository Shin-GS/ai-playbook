---
id: nodejs-commonjs
type: rule
name: Node.js CommonJS 규칙
description: Node.js CommonJS 프로젝트의 코딩 스타일, 에러 처리, 보안 규칙
tags: [nodejs, javascript, commonjs, backend]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: []
compatibleWith: [nodejs, javascript]
---

# Node.js CommonJS 규칙

## 1. 모듈 시스템

- CommonJS 모듈 사용: `require` / `module.exports`
- ESM (`import`/`export`)은 사용하지 않는다.

```javascript
// ✅ CommonJS
const express = require('express');
const { validateInput } = require('./utils/validator');

module.exports = { startServer, stopServer };
```

## 2. 비동기 처리

- `async/await` 사용 (콜백 지양)
- Promise 체이닝보다 async/await 선호

```javascript
// ✅ async/await
async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// ❌ 콜백
function fetchData(url, callback) {
  http.get(url, (res) => { /* ... */ });
}
```

## 3. 에러 처리

- 모든 외부 통신은 `try-catch`로 감싼다.
- 프로세스가 크래시하지 않도록 최상위 에러 핸들러를 둔다.
- 자식 프로세스 비정상 종료 시 자동 재연결 로직을 포함한다.

```javascript
async function callExternalApi(params) {
  try {
    const result = await apiClient.request(params);
    return result;
  } catch (error) {
    log.error(`[API] External call failed: ${error.message}`);
    throw error;
  }
}

// 최상위 에러 핸들러
process.on('uncaughtException', (error) => {
  log.error(`[FATAL] Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error(`[FATAL] Unhandled rejection: ${reason}`);
});
```

## 4. 보안

- 외부 명령 실행 시 `child_process.execFile` 사용 (`exec` 금지 — shell injection 위험)
- `.env` 파일은 절대 커밋하지 않는다.
- 환경 변수로 민감 정보 관리.

```javascript
const { execFile } = require('child_process');

// ✅ execFile — 인자를 배열로 전달, shell 미개입
execFile('git', ['status', '--porcelain'], (error, stdout) => {
  // ...
});

// ❌ exec — shell injection 위험
exec(`git status ${userInput}`, (error, stdout) => {
  // ...
});
```

## 5. 로깅

- 주요 이벤트 로깅: 세션 생성/종료, 외부 호출, 에러
- 민감 정보(토큰, 비밀번호, 전체 메시지 내용) 로깅 금지
- 형식: `[모듈명] 이벤트 설명`

```javascript
console.log('[Server] Started on port 3000');
console.log('[Auth] Session created for user: 12345');
console.error('[API] Request failed: timeout after 5000ms');
```

## 6. 코딩 스타일

- 변수/함수: `camelCase`
- 상수: `UPPER_SNAKE_CASE`
- 클래스: `PascalCase`
- 함수는 단일 책임 원칙
- 매직 넘버 금지 — 상수로 추출

```javascript
// ❌ 매직 넘버
if (retryCount > 3) { /* ... */ }
setTimeout(callback, 5000);

// ✅ 상수 추출
const MAX_RETRY_COUNT = 3;
const TIMEOUT_MS = 5000;

if (retryCount > MAX_RETRY_COUNT) { /* ... */ }
setTimeout(callback, TIMEOUT_MS);
```
