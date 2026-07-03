---
id: server-command-check
type: automation
name: 서버 명령 사전 체크
description: 위험한 서버/인프라 명령 실행 전에 사전 체크를 강제하는 자동화
tags: [server, safety, infra, automation, shell]
version: "1.0"
updatedAt: 2026-07-03
changelog: 초기 버전
dependsOn: [server-safety]
compatibleWith: []
---

# 서버 명령 사전 체크

## Trigger

- **event**: shell 명령 실행 전
- **condition**: 명령에 아래 위험 키워드 중 하나 이상 포함

### 위험 키워드

```
apt install, apt remove, apt purge, yum install, yum remove,
rm -rf, rm -r,
systemctl stop, systemctl disable, systemctl restart,
docker rm, docker stop, docker compose down, docker system prune,
iptables, ufw,
chmod 777, chown -R,
dd, mkfs, fdisk,
kill -9, killall,
curl | sh, curl | bash, wget | sh,
> /etc/, tee /etc/
```

## Action

위험 키워드가 감지되면 아래를 수행한다:

1. **기존 환경 체크** (조회 명령으로 확인):
   - 같은 역할의 서비스가 이미 Docker/systemd로 돌고 있는지
   - 해당 포트가 이미 사용 중인지
   - 설치/삭제 대상에 의존하는 다른 서비스가 있는지

2. **사용자에게 보고**:
   - 명령의 위험도 (🟡/🔴/⛔)
   - 기존 환경 체크 결과
   - 충돌 가능성 또는 "안전" 판정
   - 대안이 있으면 함께 제시

3. **승인 대기**:
   - 🔴 이상: 사용자 명시적 OK 필요
   - 🟡: 보고 후 진행 (사용자가 중단 가능)

## 위험 키워드가 아닌 경우

아래는 차단하지 않고 즉시 허용:
- `ls`, `cat`, `grep`, `find`, `head`, `tail`
- `systemctl status`, `docker ps`, `docker logs`
- `ss`, `netstat`, `df`, `free`, `top`, `htop`
- `git` 명령 (별도 hook 관할)
- `node`, `npm`, `npx` (개발 명령)

## Notes

- 상세 체크 절차는 `server-safety` rule을 참조
- 조회 명령은 절대 차단하지 않음 (정보 수집은 자유)
- 사용자가 "괜찮아 실행해" 하면 진행 (강제 차단 아님, 안내 후 허용)
- 연속된 서버 작업 시 첫 번째 체크에서 환경 확인했으면 동일 세션 내 반복 체크 불필요
