# UI 문서 지도

태그: `#erp` `#hub/ui` `#doc/index`

상위 문서: [문서 지도](../00-index.md)  
이전 문서: [API 문서 지도](../api/00-api-index.md)  
다음 문서: [디자인 시스템](01-design-system.md)

문서 위치: [문서 지도](../00-index.md) > UI

관련 문서:
- [디자인 시스템](01-design-system.md)
- [로그인 및 MFA UI](02-login-and-mfa-ui.md)
- [대시보드 쉘 UI](03-dashboard-shell-ui.md)
- [관리자 로컬 UI 원칙](04-admin-local-ui-principles.md)
- [인증 및 세션 API](../api/01-auth-and-session-api.md)

## 1. 목적

이 문서는 Electron 기반 ERP 클라이언트 UI 문서의 출발점이다. 공통 컴포넌트, 로그인 화면, 대시보드 쉘, 관리자 로컬 전용 표시 규칙을 한 체계로 묶는다.

## 2. UI 설계 원칙

- 데스크톱 ERP 사용 환경을 우선한다.
- 화면 장식보다 가독성, 상태 인지, 빠른 입력을 우선한다.
- 버튼, 입력, 테이블, 상태 배지, 쉘 레이아웃은 공통 컴포넌트로 재사용한다.
- 일반 사용자 UI와 관리자 로컬 UI는 같은 디자인 시스템을 공유한다.
- 일반 사용자 화면은 Windows 설치형 클라이언트 renderer에서 동작한다.
- 엔진 수리 및 부품 판매 업체 특성에 맞춰 정밀하고 신뢰감 있는 톤을 유지한다.

## 3. 문서 목록

1. [디자인 시스템](01-design-system.md)
2. [로그인 및 MFA UI](02-login-and-mfa-ui.md)
3. [대시보드 쉘 UI](03-dashboard-shell-ui.md)
4. [관리자 로컬 UI 원칙](04-admin-local-ui-principles.md)
5. [로그인 UI 시안 비교 목업](login-ui-options.html)
6. [정적 시연 로그인](prototype/login.html)
7. `client/renderer/index.html` 실제 Electron 클라이언트 초안

## 4. 추천 읽기 순서

1. [디자인 시스템](01-design-system.md)
2. [로그인 및 MFA UI](02-login-and-mfa-ui.md)
3. [대시보드 쉘 UI](03-dashboard-shell-ui.md)
4. [관리자 로컬 UI 원칙](04-admin-local-ui-principles.md)

## 5. 구현 우선순위

1. 공통 색상, 타이포, 간격, 버튼, 입력 규칙 고정
2. 로그인 화면과 MFA 화면 구현
3. 대시보드 쉘과 좌측 메뉴 골격 구현
4. 관리자 로컬 전용 경고 패턴 적용

## 6. 향후 보완 항목

- 수리 접수 화면 UI
- 재고 조회 및 이동 화면 UI
- 주문/청구 테이블 패턴 상세화
