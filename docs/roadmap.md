# Roadmap

## 완료 (1단계)

- 리포 구조 확립 (source/ → dist/ 단방향 흐름)
- source/ 자산 20개 (rules 6, workflows 3, agents 8, automations 3)
- dist/kiro/ 변환 완료 (steering 9, agents 8, hooks 3, global 1)
- self-hosting .kiro/ 설정 (conventions, self-reference, hooks)
- 프리셋 시스템 (web-fullstack)
- catalog.json 인덱스

## 2단계 (예정)

### MCP 서버
- VPS에 Node.js MCP 서버 배포
- GitHub Actions로 push 시 자동 동기화 (git pull)
- 도구: list_catalog, load_asset, suggest_assets, get_preset
- 인메모리 캐시 (catalog.json 기반)

### 도구 확장
- dist/claude/ 변환 (CLAUDE.md, /commands)
- dist/cursor/ 변환 (.cursorrules, .cursor/prompts)

### 자산 확장
- skills/ 도메인 지식 축적 (개발 외 영역 포함)
- 프리셋 추가 (nodejs-api, static-site 등)

## 3단계 (향후)

- suggest_assets 시맨틱 검색 (태그 매칭 → 임베딩 기반)
- 사용 로그 / 피드백 루프
- 프리셋 자동 추천
