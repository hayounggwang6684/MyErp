# 사용자 및 권한 API

태그: `#erp` `#domain/api` `#topic/users` `#topic/permissions`

상위 문서: [API 문서 지도](00-api-index.md)  
이전 문서: [인증 및 세션 API](01-auth-and-session-api.md)  
다음 문서: [수리 API](03-repair-api.md)

문서 위치: [문서 지도](../00-index.md) > API > 사용자 및 권한 API

관련 문서:
- [사용자 관리](../security/03-user-management.md)
- [권한 모델](../security/04-permission-model.md)
- [데이터 모델 기초 설계](../architecture/03-data-model-foundation.md)

## 1. 목적

이 문서는 사용자 계정 생성, 상태 변경, 역할 연결, 권한 조회, 예외 권한 요청 API를 정의한다.

## 2. 엔드포인트 목록

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/admin-api/v1/users` | 사용자 목록 조회 |
| `POST` | `/admin-api/v1/users` | 사용자 생성 |
| `GET` | `/admin-api/v1/users/{userId}` | 사용자 상세 조회 |
| `PATCH` | `/admin-api/v1/users/{userId}` | 사용자 기본 정보 수정 |
| `POST` | `/admin-api/v1/users/{userId}/activate` | 승인대기 계정 활성화 |
| `POST` | `/admin-api/v1/users/{userId}/lock` | 계정 잠금 |
| `POST` | `/admin-api/v1/users/{userId}/unlock` | 계정 잠금 해제 |
| `POST` | `/admin-api/v1/users/{userId}/deactivate` | 계정 비활성화 |
| `PUT` | `/admin-api/v1/users/{userId}/roles` | 사용자 역할 재설정 |
| `PUT` | `/admin/api/v1/users/{userId}/roles` | Mac mini 로컬 관리자 화면용 사용자 역할 재설정 |
| `POST` | `/admin/api/v1/users/{userId}/status` | Mac mini 로컬 관리자 화면용 계정 활성/비활성 전환 |
| `PATCH` | `/admin/api/v1/employees/{employeeId}` | Mac mini 로컬 관리자 화면용 직원 기본정보 수정 |
| `GET` | `/api/v1/preferences` | 현재 사용자 개인 설정 조회 |
| `PUT` | `/api/v1/preferences` | 현재 사용자 개인 설정 저장 |
| `GET` | `/admin/api/v1/preferences` | Mac mini 로컬 관리자 화면용 현재 관리자 개인 설정 조회 |
| `PUT` | `/admin/api/v1/preferences` | Mac mini 로컬 관리자 화면용 현재 관리자 개인 설정 저장 |
| `GET` | `/api/v1/me/permissions` | 현재 사용자 권한 조회 |
| `POST` | `/api/v1/permission-exceptions` | 예외 권한 요청 |
| `POST` | `/admin-api/v1/permission-exceptions/{requestId}/approve` | 예외 권한 승인 |
| `POST` | `/admin-api/v1/permission-exceptions/{requestId}/reject` | 예외 권한 반려 |

## 3. 핵심 규칙

- 관리자 계정 관리 API는 Mac mini 로컬 전용이다.
- 직원 기본정보 API와 ERP 사용자 계정 API는 분리한다.
- 모든 직원이 ERP 사용자 계정을 가지는 것은 아니다.
- 사용자 생성 시 초기 상태는 `승인대기`다.
- 잠금 해제와 비활성 처리는 감사 로그를 남긴다.
- 권한 변경은 역할 기반 매핑과 예외 권한을 함께 고려한다.

## 4. 주요 요청 예시

### 4.1 사용자 생성

```json
{
  "name": "홍길동",
  "department_id": "dept_service",
  "login_id": "hong01",
  "phone": "010-0000-0000",
  "role_ids": ["SERVICE_AGENT"]
}
```

### 4.2 역할 재설정

```json
{
  "roles": ["ORDER_MANAGE", "INVENTORY_VIEW"]
}
```

### 4.3 직원 기본정보 수정

```json
{
  "department": "정비부",
  "job_title": "정비 팀장",
  "contact": "010-2222-1002",
  "work_status": "현장 작업",
  "assigned_work_count": 6
}
```

### 4.4 예외 권한 요청

```json
{
  "permission_code": "INVENTORY_ADJUST_APPROVE",
  "reason": "월말 실사 차이 승인 필요",
  "expires_at": "2026-03-31T09:00:00Z"
}
```

### 4.5 개인 설정 저장

```json
{
  "defaultDashboardTab": "orders",
  "dashboardDensity": "COMFORTABLE",
  "showRememberedUsername": true,
  "testAccessScope": "AUTO"
}
```

개인 설정 응답:

```json
{
  "userId": "usr_admin_001",
  "defaultDashboardTab": "orders",
  "dashboardDensity": "COMFORTABLE",
  "showRememberedUsername": true,
  "testAccessScope": "AUTO",
  "updatedAt": "2026-04-15T00:00:00.000Z"
}
```

## 5. 주요 응답 필드

- `user_id`
- `login_id`
- `department`
- `roles`
- `account_status`
- `last_login_at`
- `lock_reason`
- `permission_exceptions`
- `default_dashboard_tab`
- `dashboard_density`
- `show_remembered_username`
- `test_access_scope`

## 6. 권한 및 재인증

- `users/*`와 `roles` 변경은 시스템 관리자 권한이 필요하다.
- 권한 변경, 잠금 해제, 비활성화는 재인증 대상이다.
- 예외 권한 승인은 관리자 또는 보안 관리자만 가능하다.
- Mac mini 로컬 관리자 화면은 `부서`와 별개로 사용자별 역할을 직접 부여할 수 있다.
- 관리자 로컬 화면은 계정 상태 변경과 직원 기본정보 수정 기능을 함께 제공한다.
- 개인 설정 API는 로그인된 사용자 자신의 설정만 조회/저장한다.
- `/admin/api/v1/preferences`는 Mac mini 로컬 관리자 세션에서만 사용한다.
- 자동 로그인 세션 저장 여부는 장치 로컬 설정이므로 개인 설정 API에 저장하지 않는다.

## 7. 구현 메모

- 모듈 후보: `src/modules/users`, `src/modules/permissions`, `src/modules/audit`
- 개인 설정 저장소: `identity.user_preferences`
