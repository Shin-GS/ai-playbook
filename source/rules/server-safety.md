---
id: server-safety
type: rule
name: 서버 작업 안전 규칙
description: 서버/인프라 명령 실행 전 위험도 분류, 사전 체크, 충돌 감지, 롤백 준비를 강제하는 규칙
tags: [server, safety, infra, operations, linux]
version: "1.0"
updatedAt: 2026-07-03
changelog: 초기 버전
activation: manual
activationPattern: []
dependsOn: []
compatibleWith: []
---

# 서버 작업 안전 규칙

## 목적

서버/인프라 명령을 실행할 때 "일단 해보자" 대신 "먼저 확인하고 실행"하는 습관을 강제한다.
AI가 위험한 명령을 무심코 제안하거나, 기존 환경과 충돌하는 설치를 시도하는 것을 방지.

---

## 1. 위험도 분류

| 위험도 | 명령 유형 | 예시 | 사전 작업 |
|--------|----------|------|-----------|
| 🟢 안전 | 조회/확인 | `ls`, `cat`, `systemctl status`, `docker ps`, `ss -tlnp`, `df -h` | 없음 — 즉시 실행 |
| 🟡 주의 | 설정 변경 | nginx.conf 수정, iptables 추가, crontab 편집, .env 수정 | 현재 설정 백업 + 변경 내용 설명 |
| 🔴 위험 | 설치/삭제/중단 | `apt install`, `apt remove`, `docker rm`, `systemctl stop`, `rm -rf` | 기존 환경 체크 + 충돌 분석 + 사용자 승인 |
| ⛔ 매우 위험 | 시스템 레벨 | 디스크 포맷, 네트워크 인터페이스 변경, 커널 파라미터, 방화벽 전체 리셋 | 반드시 사용자 명시적 승인 + 롤백 계획 |

---

## 2. 설치 전 필수 체크

무언가를 설치하기 전에 아래를 **반드시** 확인한다:

### a) 같은 역할의 서비스가 이미 존재하는지

```bash
# Docker로 돌고 있는지
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
docker compose ls

# 시스템 서비스로 돌고 있는지
systemctl list-units --type=service --state=running | grep -i {서비스명}

# 이미 설치되어 있는지
which {프로그램}
dpkg -l | grep {이름}
```

### b) 포트 충돌

```bash
ss -tlnp | grep :{포트}
```

### c) 리소스 여유

```bash
df -h          # 디스크
free -h        # 메모리
nproc          # CPU 코어
```

### d) 사용자에게 보고

체크 결과를 요약하여 보고:

- 충돌 발견 시: "⚠️ {서비스}가 이미 {방식}으로 동작 중입니다. 포트 {N}을 사용하고 있어서 충돌합니다. 어떻게 할까요?"
- 안전한 경우: "기존 설치/실행 없음. 포트 {N} 비어 있음. 진행해도 안전합니다."

---

## 3. 설정 변경 전 필수 체크

### a) 현재 설정 백업

```bash
cp {파일} {파일}.bak.$(date +%Y%m%d%H%M)
```

### b) 변경 내용 미리 설명

변경 전에 사용자에게:
- 뭘 바꾸는지
- 왜 바꾸는지
- 영향 범위 (이 서비스만? 전체 서버?)
- 롤백 방법 ("문제 생기면 .bak 파일로 복원")

### c) 변경 후 검증

```bash
# 설정 문법 체크 (서비스별)
nginx -t
apachectl configtest
sshd -t

# 서비스 재시작 전 dry-run 가능하면 활용
systemctl reload {서비스}  # restart보다 reload 우선
```

---

## 4. 삭제/중단 전 필수 체크

### a) 의존성 확인

```bash
# 이 패키지에 의존하는 것
apt rdepends {패키지}

# 이 컨테이너에 연결된 네트워크/볼륨
docker inspect {컨테이너} | grep -A 10 "Mounts"
docker network inspect {네트워크}
```

### b) 데이터 유실 확인

- 볼륨/데이터 디렉토리가 삭제되는지
- DB 데이터가 포함되어 있는지
- 백업이 있는지

### c) 다운타임 예고

"이 작업을 하면 {서비스}가 {예상 시간} 동안 중단됩니다."

---

## 5. 위험 키워드 목록

아래 키워드가 포함된 명령은 🔴 이상 위험도로 취급:

| 키워드 | 위험 이유 |
|--------|----------|
| `apt install`, `apt remove`, `apt purge` | 패키지 설치/삭제 |
| `rm -rf`, `rm -r` | 재귀 삭제 |
| `systemctl stop`, `systemctl disable` | 서비스 중단 |
| `docker rm`, `docker stop`, `docker compose down` | 컨테이너 삭제/중단 |
| `iptables`, `ufw` | 방화벽 변경 |
| `chmod 777`, `chown -R` | 권한 변경 |
| `dd`, `mkfs`, `fdisk` | 디스크 작업 |
| `kill -9`, `killall` | 프로세스 강제 종료 |
| `curl | sh`, `curl | bash` | 원격 스크립트 실행 |
| `> /etc/`, `tee /etc/` | 시스템 설정 덮어쓰기 |

---

## 6. 대안 제시 의무

위험 명령을 제안할 때는 더 안전한 대안을 함께 제시:

| 위험한 방법 | 안전한 대안 |
|-----------|-----------|
| `apt install nginx` (bare metal) | Docker nginx 컨테이너 (격리, 롤백 쉬움) |
| `rm -rf /var/log/*` | `find /var/log -mtime +30 -delete` (30일 이상만) |
| `systemctl restart` | `systemctl reload` (무중단 가능하면) |
| 직접 설정 파일 수정 | `sed -i.bak` (자동 백업 포함) |
| `chmod 777` | 최소 권한으로 (`chmod 644` 또는 `755`) |

---

## 7. 실행 순서 원칙

```
1. [조회] 현재 상태 확인 (무조건 안전한 명령만)
      ↓
2. [분석] 충돌/의존성/리소스 체크
      ↓
3. [보고] 사용자에게 상황 + 계획 + 위험 요약
      ↓
4. [승인] 사용자 OK 받기 (🔴 이상)
      ↓
5. [백업] 영향받는 설정/데이터 백업
      ↓
6. [실행] 명령 실행
      ↓
7. [검증] 정상 동작 확인
      ↓
8. [보고] 완료 상태 + 롤백 방법 안내
```

---

## 안티패턴

| 패턴 | 왜 위험한가 |
|------|------------|
| "sudo apt install nginx 해보세요" (체크 없이) | Docker nginx가 이미 80 포트 점유 중이면 충돌 |
| 설정 파일 직접 덮어쓰기 | 기존 커스텀 설정 유실 |
| "rm -rf로 정리하세요" | 의존하는 다른 서비스 데이터 삭제 |
| "일단 restart 해보세요" | 원인 파악 없이 재시작하면 데이터 유실 가능 |
| curl로 받은 스크립트 바로 실행 | 내용 확인 없이 루트 권한으로 실행 = 위험 |
| 방화벽 전체 리셋 | SSH 접속도 끊길 수 있음 |
