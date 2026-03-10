# 소스 구조 초안

이 폴더는 ERP 구현을 시작하기 위한 기본 코드 구조 초안이다.

## 목표

- 보안 구현 우선순위 문서를 기준으로 바로 개발을 시작할 수 있는 구조를 제공한다.
- 로그인 인증, 사용자 상태, 권한 적용, 감사 로그, 세션 통제를 독립 모듈로 분리한다.
- 공통 로직은 `shared/`에 모으고, 업무별 구현은 `modules/` 아래에 둔다.

## 구조

```text
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
    domain/
    infrastructure/
    utils/
```

## 구현 우선순위 대응

1. `modules/auth/`
2. `modules/users/`
3. `modules/permissions/`
4. `modules/audit/`, `modules/sessions/`
5. `modules/security-exceptions/`
