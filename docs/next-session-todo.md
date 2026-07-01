# 다음 세션 TODO

## 이미지 관련 skill 2개 생성

### 1. source/skills/creative/image-generation.md

내용:
- 스타일 가이드 구조 (그림체, 팔레트, 분위기, 금지 사항)
- 캐릭터 관리 구조 (외형, 성격, 표정 변형, 참조 이미지 경로, 프롬프트 프리픽스)
- 시퀀스(만화) 규칙 (기-승-전-결, 컷 간 연결성)
- 프롬프트 규칙 (SLCT 프레임워크 참고: Subject→Lighting→Camera→Technical)
- 할루시네이션 방지 (공간 명시, 엔티티 제한, 부정어 회피, 실세계 참조, 수량 지정)
- 검증된 프롬프트 기록 패턴 (성공한 프롬프트 버전 관리)
- 이전 결과 참조 (일관성 유지)
- 플랫폼별 사이즈 프리셋 (Instagram, TikTok, YouTube, Facebook, LinkedIn, Pinterest, X, E-Commerce, Print)

작업 전 확인 사항 (AI가 먼저 물어볼 것):
- 타겟 플랫폼 (사이즈/비율 자동 결정)
- 스타일 (기존 스타일 가이드 있으면 참조, 없으면 결정)
- 캐릭터 (기존 캐릭터면 시트 참조, 새 캐릭터면 정의 먼저)
- 용도 (SNS 포스트? 앱 내 에셋? 마케팅?)

### 2. source/skills/creative/image-editing.md

내용:
- 원본/수정본 분리 규칙 (원본 절대 덮어쓰기 금지)
- 편집 작업 지시 md 구조 (원본 경로, 수정본 경로, 상세 지시, 상태)
- 용도별 사이즈 프리셋 (위와 동일 테이블 공유)
- 포맷/품질 기준 (WebP vs PNG vs JPEG, 용도별 선택)
- 배치 처리 규칙 (여러 이미지 동일 편집)
- 로고/워터마크 배치 규칙
- 브랜드 컬러/필터 기준

작업 전 확인 사항 (AI가 먼저 물어볼 것):
- 원본 이미지 위치
- 수정본 저장 위치
- 타겟 플랫폼/용도 (사이즈 자동 결정)
- 편집 종류 (리사이즈? 배경 제거? 필터? 합성?)

## 참고 자료

- Creatify-AI/ai-ad-prompt-guide: SLCT 프레임워크, 할루시네이션 방지 5규칙
- tg-miniapp-challenge marketing-strategist: Gemini Flash Image 활용 경험
- chatgptaihub.com: 25 Advanced Prompting Patterns

## 디렉토리 구조 (프로젝트 적용 시)

```
프로젝트/
└── docs/creative/
    ├── style-guide.md           ← 프로젝트 비주얼 스타일 정의
    ├── characters/
    │   ├── manifest.md          ← 캐릭터 목록
    │   └── {이름}.md            ← 캐릭터별 설정
    ├── photo-edits/
    │   ├── manifest.md          ← 편집 작업 목록
    │   └── {작업명}.md          ← 편집 지시
    └── assets/
        ├── original/            ← 원본
        └── edited/              ← 수정본
```
