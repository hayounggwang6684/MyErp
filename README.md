# ERP 프로젝트 문서 및 구현 저장소

이 저장소는 Windows 설치형 ERP 클라이언트, Mac mini용 Electron 클라이언트, Mac mini 서버 기반 ERP 프로젝트의 구조, 보안 정책, 업무 흐름, 개발 절차를 함께 관리하기 위한 저장소이다.

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
- 현재 운영 기준 서버 실행은 `npm run start:db:prod`이며, 서버는 Mac mini에서 직접 패치하고 클라이언트는 GitHub Releases로 배포한다.
- 외부 공개는 `deploy/cloudflare/README.md` 기준의 Cloudflare Tunnel 구성을 기본으로 한다.
- Cloudflare Access를 앞단에 붙일 경우 Electron 클라이언트는 `client/constants.js`의 `cloudflareAccess` 설정으로 `CF-Access-Client-Id` / `CF-Access-Client-Secret` 헤더를 보낼 수 있다.
- GitHub Actions로 Windows 및 macOS 클라이언트를 릴리즈할 때 Cloudflare Access를 같이 포함하려면 저장소 시크릿 `CLOUDFLARE_ACCESS_CLIENT_ID`, `CLOUDFLARE_ACCESS_CLIENT_SECRET`를 설정해야 한다.
- macOS 클라이언트는 `client:dist:mac`, `client:release:mac` 스크립트로 `dmg`와 `zip` 설치 자산을 생성한다.
- Mac mini에서 빠르게 로컬 설치본을 확인할 때는 `npm run client:dist:mac:local` 을 실행하면 결과물이 `dist/mac` 폴더에 정리된다.
- `dist/mac/archive` 는 minor 기준 스냅샷 보관 폴더다. 예를 들어 `0.1.33` 빌드는 `0.1.0`, `0.2.x` 빌드는 `0.2.0` 기준으로 덮어써 보관한다.
- 아카이브가 10개를 넘으면 가장 오래된 minor 스냅샷부터 자동 삭제한다.
- major가 바뀌면 예전 major 아카이브는 가장 마지막 minor 스냅샷 1개만 남기고 나머지는 자동 삭제한다.
- 일반 사용자 브라우저 경로 `/`, `/login`, `/dashboard`, `/mfa/verify` 는 더 이상 업무 UI를 제공하지 않고 설치형 클라이언트 안내만 제공한다.
- 일반 사용자 UI 수정은 `client/renderer/*` 기준으로만 진행하며, `src/web/views/*` 의 옛 로그인/대시보드/MFA 템플릿은 런타임에서 제거되었다.
- Mac mini에서 일반 사용자 UI를 확인할 때도 브라우저가 아니라 macOS Electron 클라이언트를 사용한다.
- Mac mini 서버는 `deploy/launchd/com.sunjin.erp.server.plist` 기준 LaunchAgent(`com.sunjin.erp.server`)로 등록할 수 있고, 로그는 `~/Library/Logs/com.sunjin.erp.server.out.log`, `~/Library/Logs/com.sunjin.erp.server.err.log` 에 기록한다.
- Mac mini 로컬 관리자 인터페이스는 `운영 현황 / 사용자 관리 / 업데이트 관리 / 감사 로그` 4개 메뉴 구조를 기준으로 한다.
- Mac mini 로컬 관리자 인터페이스의 `사용자 관리`는 `ERP 사용자 계정`과 `직원 기본정보`를 함께 관리하는 구조를 기준으로 한다.
- 직원 전체가 ERP 사용자는 아니며, ERP 사용자 계정은 일부 직원에게만 연결된다.
- 현재 Electron 클라이언트 대시보드는 `고객관리`, `주문관리`, `공사관리`, `자산관리`, `부품관리`, `청구관리`, `직원관리`, `설정`의 상위 탭 구조를 기준으로 정리한다. 업무 탭은 역할 기반으로 노출되고, `직원관리`는 관리부 또는 `STAFF_VIEW` 권한 사용자에게만 노출되며, `설정`은 개인화 전용이다.
- `고객관리`는 목록/상세 구조, 조회와 동일한 신규 입력 레이아웃, 등록 완료 정보의 `우클릭 수정`, 선박/장비 독립 스크롤과 삭제 액션을 기준으로 한다.
- `주문관리`는 기존 ERP 주문등록 화면을 참고한 하위 페이지 탭, 기간 조회, 좌측 주문 목록, 우측 주문 내역/공사 상세 구조를 기준으로 한다.
- `공사관리`는 공사뷰/문서뷰 전환, 견적서, 체크리스트, 진행 상황, 레포트, 외부 의뢰, 준공 문서를 기준으로 한다.
- `청구관리`는 공사와 판매/납품 건의 청구, 세금계산서, 수금, 관련 문서를 기준으로 한다.
- `설정`은 장치 로컬 설정과 서버 동기화 개인 설정을 분리한다. 서버 동기화 개인 설정은 Electron 클라이언트와 Mac mini 로컬 관리자 화면에서 같은 값을 사용한다.
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
