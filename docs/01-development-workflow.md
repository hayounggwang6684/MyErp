# ERP 개발 워크플로우

태그: `#erp` `#domain/development` `#flow/development` `#doc/process`

상위 문서: [문서 지도](00-index.md)  
이전 문서: [청구서 워크플로우](workflows/07-invoice-workflow.md)  
다음 문서: [문서 지도](00-index.md)

문서 위치: [문서 지도](00-index.md) > 개발 운영

관련 문서:
- [시스템 아키텍처](architecture/01-system-architecture.md)
- [로그인 인증](security/02-login-authentication.md)
- [수리 접수 워크플로우](workflows/01-repair-intake-workflow.md)
- [재고 워크플로우](workflows/05-inventory-workflow.md)

## 1. 목적

이 문서는 ERP 프로젝트의 개발 및 테스트 절차를 표준화하기 위한 운영 규칙을 정의한다.

본 프로젝트는 **AI 기반 개발(Codex)**을 사용하며, 개발 환경과 테스트 환경이 분리되어 있다.

개발 과정에서 코드 품질과 안정성을 유지하기 위해 아래 워크플로우를 따른다.

---

## 2. 개발 환경 구조

개발은 아래 환경에서 진행된다.

| 환경 | 역할 |
| --- | --- |
| Mac 개발 PC | Codex를 사용한 코드 작성 |
| GitHub Repository | 코드 저장소 및 버전 관리 |
| Test PC (Windows) | 설치형 클라이언트 실제 실행 환경 테스트 |

개발 흐름 개요

```text
Mac (Codex 개발)
      │
      │ git push
      ▼
GitHub Repository
      │
      │ git pull
      ▼
Test PC (Windows 실행 테스트)
```

---

## 3. 기본 개발 흐름

개발자는 아래 순서를 반드시 따른다.

### Step 1. 로컬 개발

Mac 개발 PC에서 Codex를 사용하여 프로젝트를 수정한다.

- 작업 폴더는 로컬 Git 저장소이다.
- AI에게 코드 수정 및 생성 작업을 지시한다.

---

### Step 2. 작업 브랜치 생성

새 기능 또는 수정 작업은 **codex 브랜치**에서 진행한다.

예

```text
codex/login-system
codex/repair-workflow
codex/inventory-module
```

브랜치 생성

```bash
git checkout -b codex/<feature-name>
```

---

### Step 3. 변경 사항 커밋

작업 완료 후 변경 사항을 커밋한다.

```bash
git add .
git commit -m "feat: implement login authentication"
```

커밋 메시지는 다음 규칙을 따른다.

| 타입 | 의미 |
| --- | --- |
| feat | 기능 추가 |
| fix | 버그 수정 |
| refactor | 코드 구조 개선 |
| docs | 문서 변경 |

---

### Step 4. GitHub 브랜치 업로드

로컬 브랜치를 GitHub에 업로드한다.

```bash
git push origin codex/<feature-name>
```

---

### Step 5. 테스트 PC에서 코드 다운로드

Windows 테스트 PC에서 브랜치를 가져온다.

초기 클론

```bash
git clone <repository-url>
```

브랜치 전환

```bash
git checkout codex/<feature-name>
```

최신 코드 업데이트

```bash
git pull
```

---

### Step 6. 실제 실행 테스트

테스트 PC에서 다음 항목을 검증한다.

- 설치 파일 실행 여부
- UI 정상 작동
- 데이터 처리
- 시스템 오류 발생 여부
- 앱 시작 시 GitHub Releases 업데이트 확인 동작

문제가 발견되면 Mac 개발 PC에서 수정 후 다시 브랜치에 반영한다.

---

### Step 7. 서버 반영 검증

Mac mini 서버 반영 전에는 아래 순서로 점검한다.

```bash
git pull origin main
npm install
npm run db:migrate
npm run start:db:local
```

검증 항목:

- 서버가 PostgreSQL 연결 상태로 정상 기동되는가
- 로그인, MFA 등록, MFA 검증 API가 정상 동작하는가
- 기존 Windows 클라이언트가 새 서버와 호환되는가

원칙:

- 서버 패치는 항상 클라이언트 배포보다 먼저 진행한다.
- DB 스키마 변경이 있는 버전은 `npm run db:migrate`를 반드시 먼저 수행한다.

---

### Step 8. main 브랜치 병합

테스트 PC에서 정상 작동이 확인되면 main 브랜치에 병합한다.

```bash
git checkout main
git merge codex/<feature-name>
git push origin main
```

---

### Step 9. 클라이언트 릴리즈 게시

main 기준 서버 검증이 끝난 뒤 Windows 설치형 클라이언트를 새 버전으로 배포한다.

클라이언트 배포 순서:

1. Windows 빌드 PC에서 최신 `main` 가져오기
2. `package.json`의 `version`을 다음 패치 버전으로 올리기
3. `package-lock.json`의 상단 버전 정보도 함께 맞추기
4. `npm install`
5. 릴리즈용 커밋 생성
6. `npm run client:dist` 또는 `npm run client:release`
7. 생성된 설치 파일, `latest.yml`, 관련 blockmap 파일을 GitHub Releases에 게시
8. 설치된 클라이언트가 앱 시작 시 새 릴리즈를 감지하는지 확인

원칙:

- 서버를 먼저 배포하고 클라이언트를 나중에 배포한다.
- 클라이언트 자동 업데이트는 GitHub Releases 자산이 업로드되어야 동작한다.
- 무서명 빌드는 SmartScreen 또는 백신 오탐 가능성을 포함해 테스트한다.

클라이언트 패치 버전 기준:

- UI 수정, 로그인 흐름 보완, 자동 업데이트 보완 같은 하위 호환 변경은 패치 버전으로 올린다.
- 예: `0.1.0` -> `0.1.1`

권장 릴리즈 절차 예시:

```bash
git checkout main
git pull origin main
npm install
```

그 다음 `package.json`, `package-lock.json` 버전을 함께 올린 뒤:

```bash
git add -A
git commit -m "release: v0.1.1"
git push origin main
```

Windows 빌드 PC에서:

```bash
npm install
npm run client:release
```

GitHub Actions 자동 릴리즈:

- `.github/workflows/client-release.yml`가 `v*` 태그 푸시를 감지해 Windows 빌드를 수행한다.
- 생성된 `.exe`, `latest.yml`, `.blockmap`은 같은 태그의 GitHub Release에 자동 업로드된다.
- 이미 만들어진 태그에 자산만 다시 올려야 할 때는 GitHub Actions의 `workflow_dispatch`로 `release_tag`를 지정해 수동 실행한다.

GitHub Releases 확인 항목:

- Windows 설치 파일 `.exe`
- `latest.yml`
- 관련 `.blockmap`

자동 업데이트 검증 절차:

1. 기존 버전 클라이언트 설치 상태 유지
2. 새 버전 릴리즈 게시
3. 클라이언트 실행
4. 새 버전 감지 여부 확인
5. 자동 다운로드 완료 여부 확인
6. 재시작 후 새 버전 적용 여부 확인

---

## 4. 브랜치 전략

| 브랜치 | 역할 |
| --- | --- |
| main | 안정 버전 |
| codex/* | 기능 개발 브랜치 |

규칙

- main 브랜치는 항상 실행 가능한 상태를 유지해야 한다.
- codex 브랜치에서 개발 후 main으로 병합한다.

---

## 5. 테스트 정책

모든 기능은 다음 절차를 거쳐야 한다.

1. 로컬 코드 수정
2. GitHub 브랜치 업로드
3. Windows 테스트 PC 실행 검증
4. 문제 없을 경우 main 병합

테스트 PC는 **최종 실행 환경 검증 용도**이다.
설치형 클라이언트 기준으로는 로그인 화면, MFA 화면, 대시보드 진입 여부와 업데이트 확인 동작을 우선 검증한다.

추가 정책:

- 같은 공유기 또는 같은 사설 IP 대역 환경은 기본적으로 내부망으로 본다.
- 외부망 MFA 검증은 핫스팟 또는 실제 외부 네트워크에서 확인한다.
- 내부망 자동 로그인과 외부망 MFA는 분리해서 검증한다.

---

## 6. AI 개발 규칙

Codex 사용 시 다음 원칙을 따른다.

1. codex 브랜치에서만 작업한다.
2. main 브랜치에서 직접 수정하지 않는다.
3. 커밋 전 코드 오류 여부를 확인한다.
4. 변경 사항은 작은 단위로 커밋한다.

---

## 7. 문서 관리

설계 및 운영 문서는 다음 폴더에서 관리한다.

```text
docs/
  architecture/
  security/
  workflows/
  01-development-workflow.md
```

모든 문서는 Markdown(.md) 형식으로 관리한다.

---

## 8. 운영 반영 절차

### 8.1 서버 운영 반영

현재 서버는 Mac mini에서 아래 명령으로 PostgreSQL 연결 상태로 실행한다.

```bash
cd "/Users/glory_ai_sever/Desktop/erp porject"
npm run start:db:local
```

현재 단계 원칙:

- 서버는 설치형 패키지로 배포하지 않는다.
- Mac mini에서 코드 업데이트 후 재시작하는 방식으로 운영한다.

향후 운영 고정 단계:

- `pm2` 또는 `launchd` 기반 상시 서비스로 전환한다.

### 8.2 클라이언트 운영 반영

- 클라이언트는 GitHub Releases로 배포한다.
- 사용자는 설치형 앱에서 자동 업데이트를 통해 새 버전을 받는다.
- 서버 URL과 GitHub 저장소 정보는 클라이언트 내부 설정으로 고정하고 사용자 입력 UI는 노출하지 않는다.

---

## 9. 향후 확장 계획

프로젝트 안정화 이후 다음 기능을 추가할 수 있다.

- GitHub Actions 기반 자동 테스트
- Windows 자동 빌드
- CI/CD 파이프라인 구축
- GitHub Releases 기반 설치 파일 자동 게시

---
