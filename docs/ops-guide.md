# 운영 가이드 (Ops Guide)

## 인프라 구성

| 구성요소 | 위치 | 설명 |
|----------|------|------|
| MCP 서버 | VPS (Ubuntu 24.04) | PM2로 관리, 포트 3100 |
| 리버스 프록시 | VPS (Docker NPM) | playbook.cloudrudtjq1213.com → 172.17.0.1:3100 |
| MCP 클라이언트 | npm 레지스트리 | `ai-playbook-mcp` 패키지 |
| CI/CD | GitHub Actions | `workflow_dispatch`로 수동 트리거 |

## GitHub Secrets

| Secret | 용도 | 비고 |
|--------|------|------|
| `VPS_HOST` | VPS IP | 46.250.250.127 |
| `VPS_USER` | SSH 유저 | root |
| `VPS_SSH_KEY` | SSH 프라이빗 키 | ed25519, VPS `~/.ssh/authorized_keys`에 퍼블릭 키 등록 |
| `PLAYBOOK_API_KEY` | MCP 서버 인증 키 | Bearer 토큰으로 사용 |
| `NPM_TOKEN` | npm 자동 배포 | ⚠️ **최대 90일 만료** — 아래 갱신 절차 참고 |

## NPM_TOKEN 갱신 절차

> npm Granular Access Token은 최대 90일 만료. 만료 시 Deploy workflow의 npm publish 단계 실패.

**증상:**
- GitHub Actions Deploy 실행 시 `npm ERR! 401 Unauthorized` 또는 `npm ERR! 403 Forbidden`
- "Already published (same version)" 메시지가 아닌 인증 에러

**갱신 방법:**

1. https://www.npmjs.com 로그인
2. 프로필 → Access Tokens
3. Generate New Token → Granular Access Token
   - Token name: `ai-playbook-deploy`
   - Expiration: 90일 (최대)
   - Packages and scopes → Permissions: Read and Write
4. 토큰 복사
5. GitHub 리포 → Settings → Secrets and variables → Actions
6. `NPM_TOKEN` 값을 새 토큰으로 업데이트

**갱신 주기:** 만료 전에 갱신 권장 (약 80일마다)

## 배포 방법

1. GitHub 리포 → Actions → Deploy → "Run workflow" 클릭
2. 자동으로:
   - VPS에 소스 전체 SCP 전송
   - PM2로 mcp-server 재시작
   - health check 실행
   - mcp-client npm publish (버전 변경 시)

## 수동 서버 확인

```bash
# VPS에서
pm2 status
pm2 logs ai-playbook-server --lines 20

# 외부에서
curl -H "Authorization: Bearer YOUR_API_KEY" https://playbook.cloudrudtjq1213.com/health
```

## SSL 인증서

- Let's Encrypt (NPM 자동 관리)
- 만료: 2026-09-30
- 자동 갱신됨 (NPM이 처리)

## 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| Deploy 시 SSH 실패 | VPS SSH 키 불일치 | `VPS_SSH_KEY` 확인, VPS authorized_keys 확인 |
| npm publish 401/403 | NPM_TOKEN 만료 | 위 갱신 절차 참고 |
| health check 실패 | 서버 미기동 | VPS에서 `pm2 restart ai-playbook-server` |
| 502 Bad Gateway | PM2 프로세스 죽음 | `pm2 start ecosystem.config.js` |
| SSL 인증서 만료 | NPM 자동갱신 실패 | NPM UI에서 인증서 재발급 |
