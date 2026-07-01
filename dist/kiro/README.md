# ai-playbook Kiro 셋업 가이드

## 개요

ai-playbook의 dist/kiro/ 디렉토리는 Kiro IDE에서 사용할 수 있는 형태로 변환된 자산(steering, agents, hooks)을 포함합니다.

## MCP 서버 연결

ai-playbook MCP 서버를 Kiro에 연결하면 자산의 자동 동기화 기능을 사용할 수 있습니다.

1. Kiro 설정에서 MCP 서버 추가
2. ai-playbook MCP 서버 URL 입력
3. 연결 확인 후 `list_catalog` 도구로 자산 목록 조회 가능

## Global 설치 (모든 프로젝트 공통 적용)

모든 프로젝트에 공통으로 적용할 steering 파일은 글로벌 경로에 설치합니다:

```
~/.kiro/steering/
```

글로벌 설치 방법:
```bash
# playbook-sync.md를 글로벌 steering에 복사
cp dist/kiro/global/playbook-sync.md ~/.kiro/steering/playbook-sync.md
```

이렇게 하면 모든 Kiro 프로젝트에서 ai-playbook 동기화가 자동으로 활성화됩니다.

## 프로젝트별 적용

특정 프로젝트에 steering/agents/hooks를 적용하려면 해당 프로젝트의 `.kiro/` 디렉토리에 복사합니다:

```bash
# steering 파일 복사
cp dist/kiro/steering/*.md <프로젝트>/.kiro/steering/

# agents 파일 복사
cp dist/kiro/agents/*.md <프로젝트>/.kiro/agents/

# hooks 파일 복사
cp dist/kiro/hooks/*.kiro.hook <프로젝트>/.kiro/hooks/
```

### 선택적 적용

모든 자산을 적용할 필요는 없습니다. 프로젝트 성격에 맞는 자산만 선택하여 복사하세요:

- **Java/Spring 백엔드 프로젝트**: `backend-java-spring.md`, `layered-architecture.md`, `backend-developer.md`, `java-architect.md`, `backend-code-reviewer.md`
- **React 프론트엔드 프로젝트**: `frontend-react.md`, `frontend-developer.md`
- **Node.js 프로젝트**: `nodejs-commonjs.md`, `code-reviewer-nodejs.md`
- **공통**: `git-workflow.md`, `dev-language.md`, `block-git-commit.kiro.hook`, `block-env-read.kiro.hook`, `conventional-commit.kiro.hook`

## 동기화 동작

`playbook-sync.md`가 설치되어 있으면 Kiro 세션 시작 시 다음과 같이 동작합니다:

1. MCP 서버의 `list_catalog`를 호출하여 최신 자산 목록 확인
2. 프로젝트의 `.kiro/_playbook.json`과 비교하여 업데이트 필요 여부 판단
3. 업데이트가 있으면 세션 마지막에 짧게 안내
4. 작업 중 관련 자산이 있으면 자동으로 `load_asset`을 호출하여 참고

## 프리셋

`templates/presets/` 디렉토리에 미리 정의된 프리셋을 사용하면 프로젝트 유형별로 필요한 자산을 한 번에 적용할 수 있습니다.

## 파일 구조

```
dist/kiro/
├── steering/          # 9개 (rules 6 + workflows 3)
├── agents/            # 8개
├── hooks/             # 3개
├── global/            # 글로벌 steering (playbook-sync.md)
├── manifest.json      # 전체 파일 목록
└── README.md          # 이 파일
```
