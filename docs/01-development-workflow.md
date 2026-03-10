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
| Test PC (Windows) | 실제 실행 환경 테스트 |

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

### Step 2. Feature 브랜치 생성

새 기능 또는 수정 작업은 **feature 브랜치**에서 진행한다.

예

```text
feature/login-system
feature/repair-workflow
feature/inventory-module
```

브랜치 생성

```bash
git checkout -b feature/<feature-name>
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
git push origin feature/<feature-name>
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
git checkout feature/<feature-name>
```

최신 코드 업데이트

```bash
git pull
```

---

### Step 6. 실제 실행 테스트

테스트 PC에서 다음 항목을 검증한다.

- 프로그램 실행 여부
- UI 정상 작동
- 데이터 처리
- 시스템 오류 발생 여부

문제가 발견되면 Mac 개발 PC에서 수정 후 다시 브랜치에 반영한다.

---

### Step 7. main 브랜치 병합

테스트 PC에서 정상 작동이 확인되면 main 브랜치에 병합한다.

```bash
git checkout main
git merge feature/<feature-name>
git push origin main
```

---

## 4. 브랜치 전략

| 브랜치 | 역할 |
| --- | --- |
| main | 안정 버전 |
| feature/* | 기능 개발 브랜치 |

규칙

- main 브랜치는 항상 실행 가능한 상태를 유지해야 한다.
- feature 브랜치에서 개발 후 main으로 병합한다.

---

## 5. 테스트 정책

모든 기능은 다음 절차를 거쳐야 한다.

1. 로컬 코드 수정
2. GitHub 브랜치 업로드
3. Windows 테스트 PC 실행 검증
4. 문제 없을 경우 main 병합

테스트 PC는 **최종 실행 환경 검증 용도**이다.

---

## 6. AI 개발 규칙

Codex 사용 시 다음 원칙을 따른다.

1. feature 브랜치에서만 작업한다.
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

## 8. 향후 확장 계획

프로젝트 안정화 이후 다음 기능을 추가할 수 있다.

- GitHub Actions 기반 자동 테스트
- Windows 자동 빌드
- CI/CD 파이프라인 구축

---
