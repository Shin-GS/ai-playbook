---
inclusion: always
---

# ai-playbook 개발 규칙

## frontmatter 필수 필드
모든 source/ 파일은 아래 frontmatter를 포함해야 한다:
- id: 영문 소문자 + 하이픈, {도메인}-{주제} 형식
- type: agent | skill | workflow | rule | automation
- name: 표시명
- description: 한 줄 설명
- tags: 관련 태그 배열
- version: "X.Y" 형식
- updatedAt: YYYY-MM-DD
- changelog: 최신 변경 요약

## 네이밍 규칙
- id = 파일명 (확장자 제외)
- 영문 소문자 + 하이픈만 사용
- 타입을 id에 포함하지 않음 (frontmatter type으로 구분)

## 버전 관리
- 내용 수정 시 version 증분 필수
- updatedAt을 수정 날짜로 갱신 필수
- changelog에 변경 사항 한 줄 기록

## catalog.json
- source/ 파일 추가/수정 시 catalog.json도 함께 갱신
