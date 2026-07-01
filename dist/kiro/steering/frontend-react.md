---
sourceId: frontend-react
version: "1.0"
updatedAt: 2026-07-01
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.tsx"]
---

# Frontend React 규칙

## 1. 함수형 컴포넌트만 사용

**왜**: hooks 기반 상태 관리, 간결한 코드, React 최적화 대상.

```tsx
function Card({ title, description }: CardProps) {
  return (
    <div className="rounded-lg p-4">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
```

## 2. 컴포넌트 파일 구조

```tsx
// 1. imports (React → 외부 라이브러리 → 내부 모듈 순)
// 2. types (Props interface)
// 3. component (hooks → handlers → render)
// 4. export default
```

## 3. 네이밍 규칙

- 컴포넌트: PascalCase (`UserCard.tsx`)
- hooks: camelCase, `use` 접두사 (`useAuth.ts`)
- 유틸리티: camelCase (`formatDate.ts`)
- 타입/인터페이스: PascalCase (`UserResponse`)
- 상수: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

## 4. Tailwind CSS

**왜**: 유틸리티 퍼스트로 일관된 디자인 시스템, 번들 크기 최적화.

- 유틸리티 클래스 우선 사용
- 반복되는 스타일은 컴포넌트로 추출 (CSS 추출 지양)
- 인라인 스타일 사용 금지

## 5. 상태 관리

| 유형 | 도구 | 용도 |
|------|------|------|
| 로컬 UI | useState | 단순 토글, 입력값 |
| 복잡 로컬 | useReducer | 다단계 폼, 복잡한 상태 전이 |
| 서버 상태 | @tanstack/react-query | API 데이터 캐싱, 로딩/에러 상태, 리페치 |
| 전역 상태 | zustand | 인증 정보, 앱 전역 상태 등 |

## 6. API 호출 규칙

**왜**: 서비스 레이어 분리로 컴포넌트와 API 로직 결합도를 낮추고, 타입 안전성 확보.

```tsx
// services/resourceApi.ts
const API_BASE = "/api/v1";

export async function getResources(): Promise<Resource[]> {
  const res = await fetch(`${API_BASE}/resources`);
  if (!res.ok) throw new Error("Failed to fetch resources");
  return res.json();
}
```

- API 호출 함수는 `services/` 디렉토리에 도메인별로 분리
- 컴포넌트에서 직접 fetch 호출 금지 — 서비스 레이어 경유

## 7. TypeScript 규칙

- `any` 타입 사용 금지 (불가피한 경우 주석으로 사유 명시)
- 타입 단언(`as`) 최소화, 타입 가드 활용
- Props: 같은 파일 내 interface 정의
- API 응답/공유 타입: `types/` 디렉토리

## 8. 피해야 할 패턴

- `any` 타입 남용
- useEffect 내 직접 API 호출 → 커스텀 hook 또는 react-query로 분리
- props drilling 3단계 이상 → Context 또는 composition 패턴
- index.ts barrel 파일 남용 → 순환 참조 위험
- `console.log` 프로덕션 코드에 남기기
- 인라인 스타일 사용 → Tailwind 사용

## 9. 프로젝트 디렉토리 구조

```
src/
├── components/
│   ├── ui/          # 재사용 UI 컴포넌트 (Button, Input, Card 등)
│   └── layout/      # 레이아웃 컴포넌트 (Header, Sidebar 등)
├── pages/           # 페이지 컴포넌트 (라우팅 단위)
├── hooks/           # 커스텀 hooks
├── services/        # API 호출 레이어
├── stores/          # Zustand 상태 관리
├── types/           # TypeScript 타입 정의
├── constants/       # 상수
└── utils/           # 유틸리티 함수
```
