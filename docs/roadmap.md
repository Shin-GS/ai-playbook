# Roadmap

## 완료 (1단계 — 기반 구축)

- 리포 구조 확립 (source/ → MCP 서버 서빙 → AI 도구가 자기 형식으로 변환/저장)
- source/ 자산 52개 (rules 15, workflows 11, agents 14, automations 4, skills 10)
- catalog.json 인덱스 (검색 + 동기화 + 그룹 7개 + presets 8개 + defaults 3카테고리)
- mcp-server 구현 (HTTP API, 검증 완료)
- mcp-client 구현 (MCP SDK, 7개 도구)
- self-hosting .kiro/ 설정 (conventions, self-reference, hooks 6개)
- 기획→디자인→개발→테스트 파이프라인 연결
- 루프 엔지니어링 (done-when/fail-action/반복 제한)
- 문서 최신화 체계 (문서 ↔ 코드 매핑)
- GitHub Actions 배포 워크플로우 (workflow_dispatch, SCP 전송)

## 완료 (2단계 — 다운로드/동기화 체계)

- 자산 다운로드 체계 (asset-download.md — 도구 중립 공통 절차)
- 도구별 매핑 분리 (tool-mappings/kiro.md, claude-code.md)
- skill 타입도 다운로드 대상으로 변경
- dependsOn 의존성 관리 (다운로드 시 함께 제안)
- changeLevel 기반 갱신 정책 (patch/minor/breaking)
- contentHash로 customized 자동 감지 (수동 마킹 제거)
- _playbook.json 위치 루트 통일 (도구 전환 시 상태 유지)
- 프리셋 시스템 (8종: java-backend-dev, react-frontend-dev, nodejs-backend-dev, fullstack-dev, creative-comic, creative-image, planning-docs, operations)
- defaults 카테고리 (always + codeProjects + convenience)
- 용도 기반 초기 세팅 (init_project → 질문 → apply_preset)
- disabled 메커니즘 (자산 비활성화 지원)
- defaults 새 자산 전파 (기존 프로젝트에 알림)
- automation hook 설치 (block-git-commit, block-env-read, conventional-commit, lessons-learned)
- hook toolTypes 성능 개선 (넓은 카테고리 → 정규식으로 좁힘)
- templates/init/ 초기화 템플릿

## 남은 작업 (배포/연동)

### GitHub push
- [x] GitHub에 리모트 설정 + push
- [ ] repo public 설정

### VPS 배포
- [x] VPS에 Node.js 18+ 설치
- [x] pm2 글로벌 설치
- [x] Nginx 설치 + SSL 인증서 발급 (Let's Encrypt)
- [x] Nginx 리버스 프록시 설정
- [x] GitHub Secrets 설정
- [x] Actions "Run workflow"로 첫 배포
- [x] Health check 확인
- [x] pm2 startup (서버 재부팅 시 자동 시작)

### npm publish (mcp-client)
- [ ] npm 계정 로그인 (`npm adduser`)
- [ ] mcp-client/ 에서 `npm publish`
- [ ] 글로벌 mcp.json에 등록 테스트 (`npx ai-playbook-mcp`)

### 실전 검증
- [ ] 새 프로젝트에서 init_project → preset 적용 → 다운로드 전체 사이클 테스트
- [ ] 동기화 동작 확인 (세션 시작 시 check_updates)
- [ ] 갱신 시나리오 (patch/minor/breaking) 각각 테스트
- [ ] 용도 추가 시 재추천 동작 확인
- [ ] disabled 동작 확인

## 3단계 (향후)

### 도구 확장
- [ ] Claude Code 실제 연동 테스트 (CLAUDE.md 변환)
- [ ] Cursor: .cursorrules 변환 지원

### 구조 개선
- [ ] 그룹 버전 관리 (groups에 version/changelog)
- [ ] onDemand vs manual 통일 (activation 필드 정리)
- [ ] suggest_assets 시맨틱 검색 (태그 매칭 → 임베딩 기반)

### 자산 확장
- [ ] skills/ 도메인 지식 축적 (분야 제한 없음)
- [ ] 그룹 추가 (Python, Go 등)
- [ ] severity 필드 도입 (automation block/warn/suggest 구분)

### 고도화
- [ ] 사용 로그 / 피드백 루프
- [ ] 자산 간 충돌 감지
- [ ] 프로젝트별 override 지원 (_playbook.json overrides 섹션)
