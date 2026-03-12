# ERP 프로젝트 문서 및 구현 저장소

이 저장소는 Windows 설치형 ERP 클라이언트와 Mac mini 서버 기반 ERP 프로젝트의 구조, 보안 정책, 업무 흐름, 개발 절차를 함께 관리하기 위한 저장소이다.

처음부터 문서 지도를 잘 그려두면 구현 단계에서 방향을 잃지 않는다. 이 저장소는 그 지도를 만드는 역할을 한다.

## 문서 읽는 순서

1. [`docs/00-index.md`](docs/00-index.md)에서 전체 문서 지도를 확인한다.
2. [`docs/architecture/01-system-architecture.md`](docs/architecture/01-system-architecture.md)에서 시스템의 큰 구조를 이해한다.
3. [`docs/architecture/02-deployment-and-storage-architecture.md`](docs/architecture/02-deployment-and-storage-architecture.md), [`docs/architecture/03-data-model-foundation.md`](docs/architecture/03-data-model-foundation.md)에서 배포 구조와 데이터 설계 기준을 확인한다.
4. [`docs/api/00-api-index.md`](docs/api/00-api-index.md)와 각 API 문서에서 서버 인터페이스를 확인한다.
5. [`docs/ui/00-ui-index.md`](docs/ui/00-ui-index.md)와 각 UI 문서에서 Electron 클라이언트 UI 구조를 확인한다.
6. [`docs/security/01-security-operations-summary.md`](docs/security/01-security-operations-summary.md), [`docs/security/02-login-authentication.md`](docs/security/02-login-authentication.md), [`docs/security/03-user-management.md`](docs/security/03-user-management.md), [`docs/security/04-permission-model.md`](docs/security/04-permission-model.md)에서 접근 제어 원칙을 확인한다.
7. `docs/workflows/` 아래 업무 문서에서 실제 ERP 처리 흐름을 본다.
8. [`docs/01-development-workflow.md`](docs/01-development-workflow.md)에서 개발 및 테스트 절차를 따른다.

## 현재 문서 구조

```text
docs/
  00-index.md
  01-development-workflow.md
  architecture/
    01-system-architecture.md
    02-deployment-and-storage-architecture.md
    03-data-model-foundation.md
  api/
    00-api-index.md
    01-auth-and-session-api.md
    02-user-and-permission-api.md
    03-repair-api.md
    04-inventory-api.md
    05-sales-order-invoice-api.md
    06-file-api.md
  ui/
    00-ui-index.md
    01-design-system.md
    02-login-and-mfa-ui.md
    03-dashboard-shell-ui.md
    04-admin-local-ui-principles.md
  security/
    01-security-operations-summary.md
    02-login-authentication.md
    03-user-management.md
    04-permission-model.md
    05-security-implementation-priority.md
  workflows/
    01-repair-intake-workflow.md
    02-repair-process-workflow.md
    03-quotation-order-workflow.md
    04-parts-sales-workflow.md
    05-inventory-workflow.md
    06-shipping-workflow.md
    07-invoice-workflow.md
```

## 현재 구현 구조 초안

```text
client/
  main.js
  preload.js
  renderer/
src/
  app/
  modules/
    auth/
    users/
    permissions/
    audit/
    sessions/
    security-exceptions/
  shared/
tests/
scripts/
```

구현 구조 설명은 [`src/README.md`](src/README.md)를 따른다.

## 문서 구성 원칙

- 아키텍처 문서는 시스템 전체 구조와 모듈 관계를 설명한다.
- 보안 문서는 인증, 사용자, 권한 통제를 설명한다.
- 업무 흐름 문서는 실제 ERP 업무 처리 순서를 설명한다.
- 개발 절차 문서는 브랜치, Windows 설치 테스트, GitHub Releases 배포 전 검증 절차를 설명한다.
- 각 문서는 반드시 관련 문서 링크를 포함해 다른 문서로 이어져야 한다.

## 권장 확장 구조

프로젝트가 구현 단계로 진행되면 아래 구조를 추가하는 것이 바람직하다.

```text
docs/
src/
tests/
scripts/
README.md
```
