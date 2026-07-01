# ai-playbook HTTP API Server

ai-playbook 자산을 HTTP API로 제공하는 서버. VPS에 배포하여 사용.

## 설치 & 실행

```bash
cd mcp-server
npm install  # 의존성 없음
node src/index.js
```

## 환경변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| PORT | 3100 | 서버 포트 |
| PLAYBOOK_API_KEY | (빈 문자열) | API 인증 키. 비어있으면 인증 없이 허용 |

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /health | 서버 상태 (자산 수, 그룹 수) |
| GET | /api/catalog?type=&tags= | 자산 목록 + 그룹 (필터 선택) |
| GET | /api/asset/{id} | 자산 상세 (frontmatter + 본문) |
| GET | /api/group/{id} | 그룹 상세 (포함 자산 목록) |
| GET | /api/suggest?q={검색어} | 키워드 기반 자산 추천 (상위 5개) |

## 배포

1. VPS에 ai-playbook repo clone
2. `cd mcp-server && node src/index.js` (pm2 권장)
3. Nginx 리버스 프록시 + SSL 설정
4. GitHub Actions로 push 시 자동 git pull + pm2 restart
