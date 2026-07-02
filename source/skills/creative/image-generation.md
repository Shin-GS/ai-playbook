---
id: image-generation
type: skill
name: 이미지 생성 가이드
description: 외부 이미지 생성 API를 활용한 이미지/일러스트 생성 파이프라인 — 캐릭터 일관성 유지가 핵심
tags: [creative, image, illustration, generation, api]
version: "3.0"
updatedAt: 2026-07-02
changelog: 전면 리팩토링 — 중복 제거, 파이프라인/핵심 전제 현행화, 프롬프트 규칙 현실화, 프로바이더 표기 명확화
activation: manual
activationPattern: []
dependsOn: []
compatibleWith: []
---

# 이미지 생성 가이드

## 핵심 전제

> 너는 외부 이미지 생성 API를 MCP 도구 또는 코드에서 호출하여 이미지를 생성할 수 있다.
> 말풍선/텍스트는 이미지 생성 시 AI에게 함께 요청하는 것이 기본이다 (코드 오버레이 아님).
> 코드 후처리는 보정/합성 용도로만 사용한다.
> "이미지를 만들 수 없다"고 거부하지 마라.

---

## 파이프라인

```
1. [대화] 사용자와 컨셉 논의
      ↓
2. [프롬프트 구성] SLCT + 시리즈 템플릿 + 말풍선/텍스트 포함
      ↓
3. [Config 작성] config.json 생성 (프롬프트 + 참고 이미지 + 옵션)
      ↓
4. [사용자 승인] 프롬프트 요약, 참고 이미지 목록, 예상 비용 제시 → OK 받기
      ↓
5. [이미지 생성] API 호출 (참고 이미지 필수 첨부)
      ↓
6. [후처리] 보정 필요 시에만 (텍스트 깨짐, 리사이즈 등)
      ↓
7. [검증] 사이즈, 포맷, 캐릭터 일관성 체크
      ↓
8. [확정] 사용자 승인 → final로 복사
```

---

## ⛔ API 호출 승인 규칙

**이미지 생성 API는 반드시 사용자의 명시적 허락을 받은 후에만 호출한다.**

- config.json 작성까지는 자유
- 실제 API 호출 전, 사용자에게 아래를 보여주고 승인 후 실행:
  1. 프롬프트 요약
  2. 첨부할 참고 이미지 목록
  3. 사용 모델 + 예상 비용
- 사용자가 명시적으로 OK 해야 실행
- 비용이 발생하는 외부 API이므로 자동 호출 금지
- 작업 모드가 fast여도 이 규칙은 유지됨

---

## 일관성 유지 규칙 (최우선)

시리즈 만화/일러스트에서 캐릭터와 그림체가 매번 동일하게 구현되려면:

1. **참고 이미지 없이 프롬프트만 보내지 마라** — 매번 다른 결과가 나옴
2. **매 API 호출 시 반드시 첨부:**
   - 스타일 참고 이미지 (그림체 통일)
   - 해당 패널에 등장하는 캐릭터 ref (외형 통일)
3. **프롬프트에 참고 이미지 충실도 지시 포함** — "Keep the character exactly as shown in the reference image."
4. **참고 이미지는 시리즈 전체에서 동일한 파일 사용** — 매번 새로 만들지 않음
5. **참고 이미지 최대 5장 이내** — 너무 많으면 모델이 혼란

---

## SLCT 프롬프트 프레임워크

- **S**ubject — 주체 (누가, 어떤 포즈/행동)
- **L**ighting — 조명/분위기 (시간대, 색조)
- **C**amera — 카메라 각도/거리 (클로즈업, 와이드 등)
- **T**echnical — 스타일 키워드, 해상도

### 프롬프트 규칙

1. **T(Technical)를 프롬프트 맨 앞에 배치** — 스타일 키워드가 앞에 있을수록 영향력 강함
2. **참고 이미지가 없으면 60단어 이내** — 프롬프트만으로 설명해야 하므로 간결하게
3. **참고 이미지가 있으면 80단어까지 허용** — 장면 설명에 여유. 단, 핵심 요소가 무시되지 않도록 주의
4. **저작권 아티스트/스튜디오 이름 직접 언급 금지** — safety filter에 걸림. 일반적 스타일 키워드로 대체
5. **부정어 회피** — "~하지 마라" 대신 "~한 상태"로 기술
6. **할루시네이션 방지**: 공간 명시, 엔티티 3개 이하, 수량 지정, 실세계 참조

### 시리즈 프롬프트 템플릿

series.md에 `promptPrefix`와 `promptSuffix`를 정의하여 매 패널 자동 적용:

```
최종 프롬프트 = [promptPrefix] + " " + [prompt] + " " + [promptSuffix]
```

| 파트 | 역할 | 예시 |
|------|------|------|
| `promptPrefix` | 그림체/스타일 고정 | "Anime cel-shading style, warm color palette, clean outlines —" |
| `prompt` | 이번 패널의 장면 설명 | "A comic panel. Close-up, dark room, phone glow..." |
| `promptSuffix` | 참고 이미지 충실도 | "Keep the character exactly as shown in the reference image." |

### 프롬프트 내 필수 포함 요소

- 카메라 앵글 (close-up, wide shot, low angle 등)
- 조명/시간대 (morning sunlight, dark room with phone glow 등)
- 캐릭터의 감정/포즈 (determination, tired, arms raised 등)
- 말풍선 위치, 스타일, 대사 텍스트 (예: "A white speech bubble at the top with text: 내일부터")
- 말풍선 꼬리 방향

### 스타일 참고 이미지 분석

사용자가 그림체 참고 이미지를 제공하면 AI가 분석:
- 선 스타일 (clean lines / sketchy / thick outlines)
- 색감 (pastel / vivid / muted)
- 렌더링 방식 (cel-shading / watercolor / realistic)
- 유사 스타일 키워드 추출 → series.md에 기록하여 재사용

---

## 프로바이더

이 문서의 레퍼런스 구현은 **OpenRouter Image API** 기준이다.
다른 프로바이더 사용 시 변경 포인트:

| 프로바이더 | 엔드포인트 | 참고 이미지 전달 방식 | 비고 |
|-----------|-----------|---------------------|------|
| OpenRouter | POST /api/v1/images | `input_references` (base64 data URL) | 다수 모델 통합 |
| fal.ai | 모델별 다름 | `image_url` 또는 직접 업로드 | FLUX + LoRA 특화 |
| OpenAI 직접 | POST /v1/images/generations | `image` 파라미터 | GPT Image 직접 |

series.md에 모델이 명시되어 있으면 그것을 우선 사용.

### 프로바이더 자동 선택 (모델 미지정 시)

| 조건 | 우선 모델 | 이유 |
|------|----------|------|
| 캐릭터 참고 이미지 있음 | GPT Image 1 | 참고 이미지 이해 우수 |
| LoRA 지정됨 | FLUX (fal.ai) | LoRA 지원 |
| 참고 이미지 없음 + LoRA 없음 | 가장 저렴한 모델 | 비용 절약 |

### 비용 참고

| 모델 | 가격/장 | 특징 |
|------|---------|------|
| FLUX.2 Klein + LoRA | $0.014~0.016 | 최저가, LoRA 제어 |
| FLUX.2 Pro | $0.03 | 고퀄, 범용 |
| GPT Image 1 Mini | $0.02~0.05 | 참고 이미지 이해 우수 |
| GPT Image 1 | $0.02~0.26 | 최고 퀄리티, ref 수에 따라 증가 |
| Imagen 4 Fast | $0.02 | 최저가 |

---

## 후처리 (보정용)

AI에게 한 번에 요청하는 것이 기본인 이유:
- 말풍선이 그림체와 자연스럽게 통합됨
- 위치/크기가 구도에 맞게 자동 배치됨
- 코드 오버레이는 부자연스러운 결과를 낳기 쉬움 (실제 테스트 확인됨)

코드 후처리가 필요한 예외:

| 상황 | 도구 |
|------|------|
| AI가 한글 텍스트를 깨뜨린 경우 | Sharp + SVG 오버레이 교체 |
| 여러 패널을 하나로 합성 | Sharp composite |
| 최종 리사이즈/크롭 (플랫폼 규격) | Sharp |
| 워터마크/로고 | Sharp composite |

---

## 리트라이/변형 관리

- 기존 결과를 덮어쓰지 않음
- 변형: `{파일명}-v1.png`, `-v2.png` ...
- 사용자가 선택한 버전을 `{파일명}-final.png`으로 복사 (확정)
- 확정된 패널은 다음 패널 생성 시 참고 이미지로 사용 가능
- 성공한 프롬프트는 prompts.md에 기록

---

## 플랫폼별 사이즈 프리셋

| 플랫폼 | 용도 | 사이즈 (px) | 비율 |
|--------|------|------------|------|
| Instagram | 피드 정사각 | 1080×1080 | 1:1 |
| Instagram | 피드 세로 | 1080×1350 | 4:5 |
| Instagram | 스토리/릴스 | 1080×1920 | 9:16 |
| TikTok | 영상 커버 | 1080×1920 | 9:16 |
| YouTube | 썸네일 | 1280×720 | 16:9 |
| YouTube | 커뮤니티 | 1080×1080 | 1:1 |
| Pinterest | 핀 | 1000×1500 | 2:3 |
| X (Twitter) | 단일 이미지 | 1600×900 | 16:9 |

---

## 검증 체크리스트

- [ ] 출력 사이즈가 요청과 일치
- [ ] 말풍선 텍스트가 잘 읽힘 (깨짐 없음)
- [ ] 파일 포맷이 용도에 맞음 (PNG/JPEG/WebP)
- [ ] 스타일이 참고 이미지와 일관됨
- [ ] **캐릭터 외형이 ref와 동일** (가장 중요)
- [ ] 이전 패널과 톤/분위기 연속성 유지

---

## 레퍼런스 구현: 이미지 생성 스크립트

다른 프로젝트에서 이미지 생성이 필요할 때, 아래 스펙을 참고하여 해당 프로젝트 환경에 맞는 스크립트를 생성한다. (Node.js 필수 아님 — Python 등 가능. 핵심은 동작 스펙을 충족하는 것.)

### 배치 위치 (Node.js 기준)

```
input/{시리즈}/scripts/generate-image.js
input/{시리즈}/episodes/ep{N}/panel-{NN}-config.json
```

의존성: `sharp` (이미지 리사이즈용)

---

### Config JSON 스펙

```json
{
  "promptPrefix": "series.md의 스타일 키워드",
  "prompt": "패널별 장면 설명 (SLCT)",
  "promptSuffix": "참고 이미지 충실도 지시",
  "output": "출력 파일 경로",
  "references": ["스타일 ref", "캐릭터 ref", "이전 패널 final"],
  "size": "1024x1536",
  "model": "openai/gpt-image-1",
  "quality": "high"
}
```

| 필드 | 필수 | 누락 시 문제 |
|------|------|-------------|
| `promptPrefix` | 권장 | 스타일이 패널마다 달라짐 |
| `prompt` | **필수** | — |
| `promptSuffix` | 권장 | 모델이 참고 이미지를 무시할 수 있음 |
| `output` | **필수** | — |
| `references` | **필수** | ⚠️ 매번 다른 캐릭터가 생성됨 |
| `size` | 선택 | 기본 1024x1536 |
| `model` | 선택 | 기본 openai/gpt-image-1 |
| `quality` | 선택 | 기본 high |

---

### references 구성

```json
"references": [
  "assets/style-ref.jpg",              // 1. 스타일 (필수, 항상 동일)
  "assets/characters/{캐릭터}-ref.png", // 2. 등장 캐릭터 (필수, 패널별)
  "episodes/ep{N}/panel-{N-1}-final.png" // 3. 직전 확정 패널 (있으면)
]
```

| # | 이미지 | 필수 | 역할 | 없으면 |
|---|--------|------|------|--------|
| 1 | style-ref | 필수 | 그림체/색감 통일 | 스타일 흔들림 |
| 2 | 캐릭터-ref | 필수 | 캐릭터 외형 통일 | **매번 다른 캐릭터** |
| 3 | 직전 final | 권장 | 연속 톤 통일 | 톤 급변 가능 |
| 4 | 배경/소품-ref | 선택 | 반복 요소 일관성 | — |

---

### 참고 이미지 전처리

API 전송 전 반드시 전처리:

| 규칙 | 이유 | 구현 |
|------|------|------|
| 긴 변 1024px 초과 → 리사이즈 | 전송량 절약 + 타임아웃 방지 | `resize(1024, 1024, { fit: 'inside' })` |
| 리사이즈 시 JPEG 85% 변환 | 용량 2~5배 절약 | `.jpeg({ quality: 85 })` |
| 1024px 이하 → 원본 유지 | 불필요한 품질 손실 방지 | 조건 분기 |
| base64 data URL로 변환 | API 요구 형식 | `data:{mime};base64,{base64}` |
| MIME 타입 정확히 | 잘못되면 API 거부 | 확장자 매핑 (.png→image/png, .jpg→image/jpeg) |

---

### API 호출 상세 (OpenRouter 기준)

```
POST https://openrouter.ai/api/v1/images

Headers:
  Authorization: Bearer ${OPENROUTER_API_KEY}
  Content-Type: application/json
  HTTP-Referer: (프로젝트 URL)
  X-Title: (프로젝트명)
  ※ Content-Length 직접 지정 금지 (자동 계산에 맡길 것)

Body:
{
  "model": "openai/gpt-image-1",
  "prompt": "[promptPrefix] [prompt] [promptSuffix]",
  "n": 1,
  "size": "1024x1536",
  "quality": "high",
  "input_references": [
    { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
  ]
}

Response (성공):
{
  "data": [{ "b64_json": "<base64 PNG>" }],
  "usage": { "cost": 0.25 }
}
```

- `data[0].b64_json`을 Buffer 디코딩하여 파일 저장
- `usage.cost` 출력

---

### 스크립트 필수 동작 체크리스트

| # | 동작 | 누락 시 문제 |
|---|------|-------------|
| 1 | Config JSON 파일로 입력 받기 | 셸 이스케이프 깨짐 |
| 2 | promptPrefix + prompt + promptSuffix 자동 조합 | 스타일/충실도 지시 누락 |
| 3 | references 각 파일 존재 확인 | 런타임 에러 |
| 4 | references 비어있으면 경고 출력 | 일관성 없는 결과 인지 못함 |
| 5 | 참고 이미지 리사이즈 (긴 변 1024px) | 타임아웃, 용량 초과 |
| 6 | base64 data URL 변환 + MIME 정확히 | API 거부 |
| 7 | `input_references` 배열 구성 | 참고 이미지 전달 안 됨 |
| 8 | SSL 우회 (`NODE_TLS_REJECT_UNAUTHORIZED=0`) | 기업 환경 인증서 에러 |
| 9 | 타임아웃 120초 | 무한 대기 |
| 10 | 출력 디렉토리 자동 생성 | 경로 없어서 실패 |
| 11 | 비용 출력 (response.usage.cost) | 예산 관리 불가 |
| 12 | 에러 분류 (HTTP/파싱/네트워크) | 디버깅 불가 |

---

### 실패 케이스와 대응

| 실패 | 원인 | 대응 |
|------|------|------|
| 매번 다른 캐릭터 | references에 캐릭터 ref 안 넣음 | **references 필수 + 미첨부 경고** |
| 404 Not Found | 잘못된 API 경로 | OpenRouter: `/api/v1/images` (generations 아님) |
| Safety filter 거부 | "Ghibli", "Miyazaki" 등 저작권 키워드 | 일반 스타일 키워드로 대체 |
| SSL 에러 | 기업 프록시/방화벽 | `NODE_TLS_REJECT_UNAUTHORIZED=0` |
| 말풍선 부자연스러움 | 코드 오버레이 | AI에게 프롬프트에 포함시켜 한 번에 요청 |
| JSON 파싱 에러 | 셸에서 따옴표 깨짐 | Config JSON 파일 방식 |
| 타임아웃 | 원본(수 MB) 그대로 전송 | 리사이즈 후 전송 |
| 응답에 b64_json 없음 | 모델이 URL로 반환 | URL 다운로드 fallback |

---

### 실행

```bash
node input/{시리즈}/scripts/generate-image.js input/{시리즈}/episodes/ep{N}/panel-{NN}-config.json
```

- 환경변수 `OPENROUTER_API_KEY` 필수
- **사용자 승인 없이 실행 금지**
- 참고 이미지 없이 실행하면 일관성 보장 불가
