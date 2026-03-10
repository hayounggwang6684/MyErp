# ERP 문서 지도

태그: `#erp` `#hub/home` `#hub/docs`

상위 문서: 없음  
이전 문서: 없음  
다음 문서: [시스템 아키텍처](architecture/01-system-architecture.md)

이 문서는 ERP 프로젝트 문서의 출발점이다.  
처음 읽는 사람은 이 페이지에서 전체 구조를 파악한 뒤 세부 문서로 이동하면 된다.

## 홈 노트 사용법

- Obsidian에서는 이 문서를 즐겨찾기하거나 시작 노트처럼 사용한다.
- VS Code에서는 왼쪽 편집, 오른쪽 미리보기로 열어 문서 허브처럼 사용한다.
- 설계 검토를 시작할 때는 항상 이 문서에서 출발한다.

## 프로젝트 진행 상태

### 문서 구조

- [x] 문서 폴더 구조 정리
- [x] 문서 지도 작성
- [x] 문서 간 상호 참조 링크 연결
- [x] VS Code 설정 파일 추가
- [x] Obsidian 홈 노트 구성
- [x] 구현 폴더 구조 초안 생성

### 아키텍처와 보안

- [x] 시스템 아키텍처 초안 작성
- [x] 보안 운영 요약 문서 작성
- [x] 로그인 인증 워크플로우 작성
- [x] 사용자 관리 정책 초안 작성
- [x] 권한 모델 초안 작성
- [ ] 핵심 엔터티 상세 정의
- [x] 권한 매트릭스 상세화

### 업무 흐름

- [x] 수리 접수 워크플로우 작성
- [x] 수리 진행 워크플로우 작성
- [x] 견적 및 주문 워크플로우 작성
- [x] 부품 판매 워크플로우 작성
- [x] 재고 워크플로우 작성
- [x] 출하 워크플로우 작성
- [x] 청구서 워크플로우 작성
- [ ] 업무 상태값 표준화
- [ ] 문서별 Mermaid 흐름도 추가

### 다음 추천 작업

- [ ] 시스템 아키텍처에 엔터티 관계 표 추가
- [ ] 보안 모듈별 실제 인터페이스 정의
- [ ] 각 업무 문서에 상태값 전이 정의 추가
- [ ] 인증 모듈부터 실제 코드 구현 시작

## 빠른 시작

- 전체 구조부터 보려면 [시스템 아키텍처](architecture/01-system-architecture.md)
- 로그인과 접근 통제를 보려면 [보안 운영 요약](security/01-security-operations-summary.md), [로그인 인증](security/02-login-authentication.md), [사용자 관리](security/03-user-management.md), [권한 모델](security/04-permission-model.md)
- 실제 업무 흐름을 보려면 `업무 흐름 문서` 구역
- 개발 절차를 보려면 [개발 워크플로우](01-development-workflow.md)

## 작업 목적별 바로가기

### 시스템 구조를 보고 싶을 때

- [시스템 아키텍처](architecture/01-system-architecture.md)

### 로그인과 보안 정책을 보고 싶을 때

- [보안 운영 요약](security/01-security-operations-summary.md)
- [보안 구현 우선순위](security/05-security-implementation-priority.md)
- [로그인 인증](security/02-login-authentication.md)
- [사용자 관리](security/03-user-management.md)
- [권한 모델](security/04-permission-model.md)

### 수리 업무 흐름을 보고 싶을 때

- [수리 접수 워크플로우](workflows/01-repair-intake-workflow.md)
- [수리 진행 워크플로우](workflows/02-repair-process-workflow.md)
- [재고 워크플로우](workflows/05-inventory-workflow.md)
- [청구서 워크플로우](workflows/07-invoice-workflow.md)

### 판매와 출하 흐름을 보고 싶을 때

- [견적 및 주문 워크플로우](workflows/03-quotation-order-workflow.md)
- [부품 판매 워크플로우](workflows/04-parts-sales-workflow.md)
- [출하 워크플로우](workflows/06-shipping-workflow.md)
- [재고 워크플로우](workflows/05-inventory-workflow.md)
- [청구서 워크플로우](workflows/07-invoice-workflow.md)

### 개발 절차를 보고 싶을 때

- [개발 워크플로우](01-development-workflow.md)
- [소스 구조 초안](../src/README.md)

## 권장 읽기 순서

1. [시스템 아키텍처](architecture/01-system-architecture.md)
2. [보안 운영 요약](security/01-security-operations-summary.md)
3. [로그인 인증](security/02-login-authentication.md)
4. [사용자 관리](security/03-user-management.md)
5. [권한 모델](security/04-permission-model.md)
6. [보안 구현 우선순위](security/05-security-implementation-priority.md)
7. [수리 접수 워크플로우](workflows/01-repair-intake-workflow.md)
8. [수리 진행 워크플로우](workflows/02-repair-process-workflow.md)
9. [견적 및 주문 워크플로우](workflows/03-quotation-order-workflow.md)
10. [부품 판매 워크플로우](workflows/04-parts-sales-workflow.md)
11. [재고 워크플로우](workflows/05-inventory-workflow.md)
12. [출하 워크플로우](workflows/06-shipping-workflow.md)
13. [청구서 워크플로우](workflows/07-invoice-workflow.md)
14. [개발 워크플로우](01-development-workflow.md)

## 문서 대시보드

### 아키텍처

| 문서 | 설명 |
| --- | --- |
| [시스템 아키텍처](architecture/01-system-architecture.md) | ERP 전체 구조, 계층, 핵심 엔터티, 모듈 연결 기준 |

### 보안

| 문서 | 설명 |
| --- | --- |
| [보안 운영 요약](security/01-security-operations-summary.md) | 보안 문서 전체 요약, 운영 체크포인트, 구현 우선순위 개요 |
| [보안 구현 우선순위](security/05-security-implementation-priority.md) | 로그인, 계정 상태, 권한, 세션 통제 구현 순서 정리 |
| [로그인 인증](security/02-login-authentication.md) | mTLS, 내부망/외부망 로그인 정책, 세션 발급 기준 |
| [사용자 관리](security/03-user-management.md) | 계정 생성, 상태값, 운영 절차, 예외 처리 |
| [권한 모델](security/04-permission-model.md) | 역할, 권한 수준, 적용 원칙, 예외 권한 기준 |

### 업무 흐름

| 문서 | 설명 |
| --- | --- |
| [수리 접수 워크플로우](workflows/01-repair-intake-workflow.md) | 고객 수리 요청 접수와 접수번호 발급 기준 |
| [수리 진행 워크플로우](workflows/02-repair-process-workflow.md) | 진단, 수리, 부품 사용, 완료 또는 불가 처리 |
| [견적 및 주문 워크플로우](workflows/03-quotation-order-workflow.md) | 견적 발행과 주문 전환 기준 |
| [부품 판매 워크플로우](workflows/04-parts-sales-workflow.md) | 부품 판매, 인도, 출고 전 처리 기준 |
| [재고 워크플로우](workflows/05-inventory-workflow.md) | 입고, 출고, 이동, 조정과 현재고 반영 기준 |
| [출하 워크플로우](workflows/06-shipping-workflow.md) | 포장, 송장 등록, 배송 상태 관리 |
| [청구서 워크플로우](workflows/07-invoice-workflow.md) | 청구서 발행, 수금 상태, 미수 관리 기준 |

### 개발 운영

| 문서 | 설명 |
| --- | --- |
| [개발 워크플로우](01-development-workflow.md) | 브랜치 전략, 테스트 절차, 문서 관리 기준 |

### 구현 구조

| 문서 | 설명 |
| --- | --- |
| [소스 구조 초안](../src/README.md) | 보안 우선순위를 반영한 `src/`, `tests/`, `scripts/` 골격 설명 |

## 문서 연결 원칙

- 아키텍처 문서는 보안 문서와 업무 흐름 문서의 상위 기준이 된다.
- 보안 문서는 로그인, 사용자, 권한 문서가 서로 연결되어야 한다.
- 업무 흐름 문서는 전후 단계 문서를 함께 가리켜야 한다.
- 개발 문서는 문서 작성 및 코드 변경 절차를 연결해야 한다.

## 추천 탐색 경로

### 처음 구조를 잡을 때

[시스템 아키텍처](architecture/01-system-architecture.md)  
-> [보안 운영 요약](security/01-security-operations-summary.md)  
-> [로그인 인증](security/02-login-authentication.md)  
-> [권한 모델](security/04-permission-model.md)  
-> [수리 접수 워크플로우](workflows/01-repair-intake-workflow.md)  
-> [견적 및 주문 워크플로우](workflows/03-quotation-order-workflow.md)

### 수리 프로세스만 집중해서 볼 때

[수리 접수 워크플로우](workflows/01-repair-intake-workflow.md)  
-> [수리 진행 워크플로우](workflows/02-repair-process-workflow.md)  
-> [재고 워크플로우](workflows/05-inventory-workflow.md)  
-> [청구서 워크플로우](workflows/07-invoice-workflow.md)

### 판매와 물류를 함께 볼 때

[견적 및 주문 워크플로우](workflows/03-quotation-order-workflow.md)  
-> [부품 판매 워크플로우](workflows/04-parts-sales-workflow.md)  
-> [재고 워크플로우](workflows/05-inventory-workflow.md)  
-> [출하 워크플로우](workflows/06-shipping-workflow.md)  
-> [청구서 워크플로우](workflows/07-invoice-workflow.md)

## 추천 사용 방식

- VS Code에서는 이 문서를 첫 탭으로 열고 오른쪽에 미리보기를 고정한다.
- Obsidian에서는 이 문서를 홈 노트처럼 두고 링크를 따라 이동한다.
