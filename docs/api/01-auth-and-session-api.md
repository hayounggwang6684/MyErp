# 인증 및 세션 API

태그: `#erp` `#domain/api` `#topic/auth`

상위 문서: [API 문서 지도](00-api-index.md)  
이전 문서: [API 문서 지도](00-api-index.md)  
다음 문서: [사용자 및 권한 API](02-user-and-permission-api.md)

문서 위치: [문서 지도](../00-index.md) > API > 인증 및 세션 API

관련 문서:
- [로그인 인증](../security/02-login-authentication.md)
- [사용자 관리](../security/03-user-management.md)
- [배포 및 저장 구조](../architecture/02-deployment-and-storage-architecture.md)

## 1. 목적

이 문서는 PostgreSQL 기반 로그인, TOTP MFA 등록 및 검증, 세션 발급, 세션 조회, 로그아웃에 필요한 API를 정의한다.

## 2. 경계

- 일반 사용자 Electron 클라이언트 API는 `/api/v1/auth/*`, `/api/v1/sessions/*`를 사용한다.
- 관리자 로컬 전용 세션 조회 및 강제 종료는 `/admin-api/v1/sessions/*`를 사용한다.

## 3. 엔드포인트 목록

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `POST` | `/api/v1/auth/login` | 서버 컨텍스트와 계정 정보를 기준으로 즉시 로그인, MFA, MFA 등록 요구 여부 판단 |
| `POST` | `/api/v1/auth/mfa/verify` | MFA 코드 검증 후 세션 발급 |
| `POST` | `/api/v1/auth/mfa/enrollment/start` | MFA 셀프 등록용 secret과 QR 발급 |
| `GET` | `/api/v1/auth/mfa/enrollment/status` | 현재 MFA 등록 상태 확인 |
| `POST` | `/api/v1/auth/mfa/enrollment/verify` | MFA 등록 확인 후 세션 발급 |
| `POST` | `/api/v1/auth/logout` | 현재 세션 종료 |
| `GET` | `/api/v1/sessions/me` | 현재 세션 정보 조회 |

## 4. 상세 계약

### 4.1 `POST /api/v1/auth/login`

설명:

- 서버가 TLS 계층에서 전달받은 인증서 검증 결과, 접속 위치, 사용자 상태, 비밀번호를 검증한다.
- 내부망은 바로 세션을 발급할 수 있다.
- 외부망은 활성 MFA가 있으면 `MFA_REQUIRED`, 없으면 `MFA_ENROLLMENT_REQUIRED`를 반환한다.

요청 예시:

```json
{
  "username": "kim01",
  "password": "plain-text-or-client-protected",
  "device_id": "device-win-001",
  "user_agent": "Edge/136.0"
}
```

서버 컨텍스트 예시:

- `mtls_verified`
- `certificate_fingerprint`
- `certificate_subject`
- `client_ip`
- `access_scope`

위 항목은 클라이언트 요청 바디가 아니라 reverse proxy 또는 앱 서버가 관측한 서버 컨텍스트 값이다.

성공 응답 예시:

```json
{
  "success": true,
  "data": {
    "login_status": "MFA_ENROLLMENT_REQUIRED",
    "mfa_challenge_id": "mfa_ch_123",
    "account_status": "ACTIVE",
    "access_scope": "EXTERNAL",
    "pending_session_id": "sess_pending_123"
  }
}
```

`session_context.certificate_fingerprint`는 클라이언트가 임의 제출한 값이 아니라 서버가 전달한 인증서 검증 컨텍스트 값이다.

오류:

- `CERTIFICATE_INVALID`
- `DEVICE_NOT_APPROVED`
- `ACCOUNT_LOCKED`
- `ACCOUNT_INACTIVE`
- `UNAUTHENTICATED`

가능한 `login_status`:

- `AUTHENTICATED`
- `MFA_REQUIRED`
- `MFA_ENROLLMENT_REQUIRED`

### 4.2 `POST /api/v1/auth/mfa/verify`

요청 예시:

```json
{
  "mfa_challenge_id": "mfa_ch_123",
  "otp_code": "123456"
}
```

성공 응답 예시:

```json
{
  "success": true,
  "data": {
    "session_id": "sess_123",
    "expires_at": "2026-03-11T14:00:00Z",
    "idle_expires_at": "2026-03-11T12:10:00Z",
    "user": {
      "id": "usr_1",
      "name": "김관리",
      "roles": ["SERVICE_AGENT"]
    },
    "session_context": {
      "mtls_verified": true,
      "certificate_fingerprint": "AB:CD:EF",
      "device_id": "device-win-001",
      "mfa_verified": true,
      "access_scope": "EXTERNAL"
    }
  }
}
```

### 4.3 `GET /api/v1/sessions/me`

응답 필드:

- `session_id`
- `user`
- `roles`
- `account_status`
- `access_scope`
- `mfa_verified`
- `issued_at`
- `expires_at`

### 4.4 `POST /api/v1/auth/mfa/enrollment/start`

설명:

- 외부망 로그인 후 MFA 미등록 사용자가 호출한다.
- 서버가 `otpauth` URI와 QR 이미지 데이터 URL, 수동 입력용 base32 secret을 반환한다.

### 4.5 `GET /api/v1/auth/mfa/enrollment/status`

설명:

- 현재 로그인 흐름에서 MFA 등록이 필요한지 확인한다.

### 4.6 `POST /api/v1/auth/mfa/enrollment/verify`

설명:

- 사용자가 Authenticator 앱에 등록한 뒤 6자리 TOTP 코드를 제출한다.
- 성공 시 MFA secret을 `ACTIVE`로 전환하고 바로 로그인 세션을 발급한다.

### 4.7 `POST /api/v1/auth/logout`

설명:

- 현재 세션을 즉시 만료 처리한다.
- 감사 로그를 남긴다.

## 5. 보안 규칙

- 외부망 로그인은 MFA 성공 전까지 세션을 발급하지 않는다.
- 외부망 로그인은 MFA 등록이 없으면 등록 완료 전까지 세션을 발급하지 않는다.
- 세션은 인증서 또는 단말에 바인딩한다.
- 인증서 정보와 접속 IP는 요청 바디가 아니라 서버 컨텍스트를 기준으로 처리한다.
- 계정 상태가 `승인대기`, `잠금`, `비활성`이면 로그인 차단한다.
- 비밀번호 5회 실패 시 계정을 잠근다.
- 로그인 성공, 실패, 잠금, 세션 종료는 모두 감사 로그 대상이다.

## 6. 구현 메모

- 구현 모듈: `src/modules/auth`, `src/modules/sessions`, `src/modules/users`, `src/modules/audit`
- 저장소: `identity.users`, `identity.user_mfa_secrets`, `security.sessions`, `security.mfa_challenges`, `audit.auth_events`
