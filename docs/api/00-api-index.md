# API 문서 지도

태그: `#erp` `#hub/api` `#doc/index`

상위 문서: [문서 지도](../00-index.md)  
이전 문서: [개발 워크플로우](../01-development-workflow.md)  
다음 문서: [인증 및 세션 API](01-auth-and-session-api.md)

문서 위치: [문서 지도](../00-index.md) > API

관련 문서:
- [배포 및 저장 구조](../architecture/02-deployment-and-storage-architecture.md)
- [데이터 모델 기초 설계](../architecture/03-data-model-foundation.md)
- [로그인 인증](../security/02-login-authentication.md)
- [권한 모델](../security/04-permission-model.md)

## 1. 목적

이 문서는 ERP 서버 API 문서의 출발점이다. 실제 구현과 화면 개발 전에 서버 인터페이스를 고정하는 기준으로 사용한다.

## 2. API 설계 원칙

- 일반 사용자 API와 관리자 로컬 전용 API를 분리한다.
- API는 화면 단위가 아니라 업무 행위 단위로 설계한다.
- 응답은 상태값, 이력, 승인 정보를 추적 가능하게 구성한다.
- 파일 다운로드는 실제 경로 대신 `file_id` 기반으로 제공한다.
- 민감 기능은 권한 검사와 재인증 요구 여부를 함께 명시한다.

## 3. 문서 목록

1. [인증 및 세션 API](01-auth-and-session-api.md)
2. [사용자 및 권한 API](02-user-and-permission-api.md)
3. [고객 및 자산 API](07-customer-asset-api.md)
4. [수리 API](03-repair-api.md)
5. [재고 API](04-inventory-api.md)
6. [영업, 주문, 출하, 청구 API](05-sales-order-invoice-api.md)
7. [파일 API](06-file-api.md)

## 4. 공통 규칙

### 4.1 경로 규칙

- 일반 사용자 API: `/api/v1/...`
- 관리자 로컬 API: `/admin-api/v1/...`

### 4.2 공통 응답 형식

성공 응답:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

오류 응답:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 값이 올바르지 않습니다.",
    "details": []
  }
}
```

### 4.3 공통 오류 코드

- `UNAUTHENTICATED`
- `MFA_REQUIRED`
- `REAUTH_REQUIRED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`
- `ACCOUNT_LOCKED`
- `ACCOUNT_INACTIVE`
- `CERTIFICATE_INVALID`
- `DEVICE_NOT_APPROVED`
- `NEGATIVE_STOCK_BLOCKED`

### 4.4 공통 메타 규칙

- 목록 조회는 `page`, `page_size`, `sort`를 받는다.
- 시간은 ISO 8601 형식을 사용한다.
- 금액은 정밀 소수 문자열 또는 소수 허용 규칙을 구현 단계에서 통일한다.

## 5. 구현 우선순위

1. 인증 및 세션 API
2. 사용자 및 권한 API
3. 고객 및 자산 API
4. 수리 API
5. 재고 API
6. 영업, 주문, 출하, 청구 API
7. 파일 API

## 6. 향후 보완 항목

- OpenAPI 형식 변환
- 상태값 enum 상세화
- 도메인별 오류 코드 세분화
