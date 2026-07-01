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

GitHub Actions (workflow_dispatch, 수동 트리거)로 배포:
1. "Run workflow" 클릭
2. 전체 파일 SCP로 VPS 전송
3. pm2로 서버 재시작
4. Health check 자동 확인

### VPS 초기 요구사항

- Node.js 18+
- pm2 (`npm install -g pm2`)
- Nginx (리버스 프록시 + SSL)

### 환경변수

pm2 ecosystem.config.js에서 관리. 또는 VPS에서:
```bash
cd ~/ai-playbook/mcp-server
PLAYBOOK_API_KEY="your-key" pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 서버 재부팅 시 자동 시작
```

### Nginx 설정 예시

```nginx
server {
    listen 443 ssl;
    server_name playbook-api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/playbook-api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/playbook-api.your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name playbook-api.your-domain.com;
    return 301 https://$host$request_uri;
}
```

SSL 인증서 발급:
```bash
sudo certbot --nginx -d playbook-api.your-domain.com
```
