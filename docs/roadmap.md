# Roadmap

## 완료 (1단계)

- 리포 구조 확립 (source/ → MCP 서버 서빙 → AI 도구가 자기 형식으로 변환/저장)
- source/ 자산 42개 (rules 15, workflows 8, agents 12, automations 4, skills 7)
- catalog.json 인덱스 (검색 + 동기화 + 그룹 6개)
- mcp-server 구현 (HTTP API, 검증 완료)
- mcp-client 구현 (npm 배포용, MCP SDK)
- self-hosting .kiro/ 설정 (conventions, self-reference, hooks — 검증 완료)
- 기획→디자인→개발→테스트 파이프라인 연결
- 루프 엔지니어링 (done-when/fail-action/반복 제한)
- 문서 최신화 체계 (문서 ↔ 코드 매핑)
- GitHub Actions 배포 워크플로우 (workflow_dispatch, SCP 전송)

## 남은 작업 (배포/연동)

### GitHub push
- [ ] GitHub에 리모트 설정 + push
- [ ] repo public 설정

### VPS 배포
- [ ] VPS에 Node.js 18+ 설치
- [ ] pm2 글로벌 설치 (`npm install -g pm2`)
- [ ] Nginx 설치 + SSL 인증서 발급 (Let's Encrypt)
- [ ] Nginx 리버스 프록시 설정 (localhost:3100 → HTTPS)
- [ ] GitHub Secrets 설정 (VPS_HOST, VPS_USER, VPS_SSH_KEY, PLAYBOOK_API_KEY)
- [ ] Actions "Run workflow"로 첫 배포
- [ ] Health check 확인 (`curl https://도메인/health`)
- [ ] pm2 startup (서버 재부팅 시 자동 시작)

### npm publish (mcp-client)
- [ ] npm 계정 로그인 (`npm adduser`)
- [ ] mcp-client/ 에서 `npm publish`
- [ ] 글로벌 mcp.json에 등록 테스트 (`npx ai-playbook-mcp`)

### 글로벌 steering 설치
- [ ] `~/.kiro/steering/playbook-sync.md` 설치 (mcp-client/global/ 에서 복사)
- [ ] `~/.kiro/settings/mcp.json` 에 ai-playbook MCP 등록

### 실전 검증
- [ ] 새 프로젝트에서 "ai-playbook에서 common-rules 그룹 적용해줘" 테스트
- [ ] 동기화 동작 확인 (세션 시작 시 list_catalog → 버전 비교)
- [ ] 새 자산 제안 동작 확인

## 3단계 (향후)

### 도구 확장
- Claude Code: CLAUDE.md 변환 지원
- Cursor: .cursorrules 변환 지원

### 자산 확장
- skills/ 도메인 지식 축적 (분야 제한 없음)
- 그룹 추가

### 고도화
- suggest_assets 시맨틱 검색 (태그 매칭 → 임베딩 기반)
- 사용 로그 / 피드백 루프
- 자산 간 충돌 감지
