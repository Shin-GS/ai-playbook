# Roadmap

## 완료 (1단계)

- 리포 구조 확립 (source/ → 도구가 읽고 자기 형식으로 저장)
- source/ 자산 41개 (rules 14, workflows 8, agents 12, automations 4, skills 7)
- catalog.json 인덱스 (검색 + 동기화 + 그룹)
- self-hosting .kiro/ 설정 (conventions, self-reference, hooks)
- 프리셋 시스템 (web-fullstack)
- 기획→디자인→개발→테스트 파이프라인 연결
- 루프 엔지니어링 (done-when/fail-action/반복 제한)
- 문서 최신화 체계 (문서 ↔ 코드 매핑)

## 2단계 (예정)

### MCP 서버
- VPS에 Node.js MCP 서버 배포
- GitHub Actions로 push 시 자동 동기화 (git pull)
- 도구: list_catalog, load_asset, suggest_assets, get_preset, get_group
- 인메모리 캐시 (catalog.json 기반)

### 동적 자산 관리
- 세션 시작 시: applied 자산 updatedAt 비교 → 갱신 제안
- 작업 중: 관련 자산 발견 → 다운로드 제안 (제안 기준 엄격)
- 의존성 자동 해결: dependsOn 자산 함께 제안
- 거절 이력 (declined) 관리
- customized 플래그로 자동 갱신 제외
- 그룹 단위 적용 (java-backend, react-frontend 등)

### 도구 확장
- AI 도구가 source/를 읽고 자기 형식으로 변환하는 방식으로 전환
- Claude Code: CLAUDE.md 변환 지원
- Cursor: .cursorrules 변환 지원

### 자산 확장
- skills/ 도메인 지식 축적 (분야 제한 없음)
- 프리셋/그룹 추가

## 3단계 (향후)

- suggest_assets 시맨틱 검색 (태그 매칭 → 임베딩 기반)
- 사용 로그 / 피드백 루프
- 프리셋 자동 추천
- 자산 간 충돌 감지 (같은 규칙 다른 내용)
