---
id: layered-architecture
type: rule
name: 레이어드 아키텍처 규칙
description: Controller→Service→Infra→Client 레이어 흐름 및 의존성 규칙
tags: [architecture, layered, backend, java]
version: "1.0"
updatedAt: 2026-07-01
changelog: 초기 버전
dependsOn: []
compatibleWith: [java, spring-boot]
---

# 레이어드 아키텍처 규칙

## 1. 레이어 흐름

```
Controller / Scheduler → Service → Infra → Client(External)
```

## 2. 각 레이어 역할 및 의존 규칙

| 레이어 | 패키지 | 역할 | 의존 가능 대상 |
|--------|--------|------|---------------|
| Controller | `controller/` | HTTP 요청/응답 처리 | service, dto |
| Scheduler | `scheduler/` | 배치/스케줄 트리거 (controller와 동급 진입점) | service, infra, repository |
| Service | `service/` | 도메인 비즈니스 로직 ("뭘 할지" 결정) | infra, repository, domain, dto |
| Infra | `infra/` | 외부 시스템 추상화 ("어떻게 할지" 실행) | client, domain |
| Client | `client/` | 순수 외부 통신 (HTTP, SDK) | 없음 (최하위) |

## 3. 의존성 규칙

- `client/`는 `infra/`에서만 참조 (service, controller에서 직접 참조 금지)
- `infra/`는 `service/`에서 참조 (controller에서 직접 참조 금지)
- `service/`는 다른 `service/`를 참조할 수 있음 (순환 참조 주의)
- 새 외부 연동 추가 시: `client/` 서브패키지 + `infra/` 서브패키지 쌍으로 생성

## 4. `service/` vs `infra/` 구분 기준

| 구분 | `service/` | `infra/` |
|------|-----------|----------|
| 역할 | 도메인 유스케이스 처리 | 외부 시스템 추상화 |
| 호출자 | Controller | Service |
| 예시 | "주문 생성", "결제 처리" | "AI한테 물어봐", "메시지 보내", "파일 업로드" |
| 도메인 지식 | 있음 (비즈니스 규칙 판단) | 없음 (시킨 대로 실행) |

## 5. 인터페이스 분리 원칙

| 레이어 | 패턴 | 이유 |
|--------|------|------|
| `service/` | 단일 클래스 (인터페이스 없음) | 구현이 하나뿐, Profile 분기 불필요 |
| `infra/` | interface + 구현체 + Mock | Profile별 구현체 교체 필요 (Real vs Mock) |

**규칙:**
- `service/`에 인터페이스를 만들지 않는다 (불필요한 추상화 금지)
- `infra/`는 반드시 인터페이스를 정의하고, 구현체를 Profile로 분기한다
- 인터페이스 도입 기준: "같은 계약에 대해 2개 이상의 구현체가 존재하는가?"
- 향후 `service/`에 구현체가 2개 이상 필요해지면 그때 인터페이스를 추출한다 (YAGNI)

## 6. `client/` 패키지 규칙

순수 외부 통신만 담당하는 패키지. 비즈니스 로직 없음.

**규칙:**
- 모든 예외를 공통 Exception으로 래핑 (try-catch 필수)
- `request/`, `response/` 서브패키지에 외부 API 스펙 그대로 매핑한 record DTO
- 로깅: 요청 시작(debug), 성공(debug), 실패(error)

## 7. `infra/` 패키지 규칙

외부 시스템을 추상화한 인프라 서비스. `client/`를 주입받아 비즈니스 래핑 수행.

**규칙:**
- 인터페이스 + 구현체 + Mock 구조 유지
- Mock은 `@Profile("local")`, 실제 구현체는 `@Profile("!local")`
- `infra/`는 도메인 규칙을 모름 — 시킨 대로 외부 시스템과 통신할 뿐
- 도메인 판단(잔액 충분한지, 기한 내인지 등)은 `service/`에서 수행
- 결과 DTO는 해당 `infra/` 서브패키지에 위치 — `service/`에서 참조해도 의존 방향 OK
- `infra/`에서 `repository/` 직접 참조: 원칙적으로 금지하되, 외부 API 응답 기반 단순 상태 업데이트는 실용적 예외로 허용 (비즈니스 판단 없이 단일 UPDATE만)
