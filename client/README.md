# Electron 클라이언트 구조

이 폴더는 Windows 설치형 ERP 클라이언트의 초기 Electron 구조를 둔다.

## 구성

- `main.js`: 앱 시작, 창 생성, 업데이트 확인, 서버 API 프록시
- `preload.js`: renderer에서 사용할 안전한 IPC 브리지
- `renderer/`: 로그인, MFA, 대시보드, 설정 UI

## 현재 범위

- 로그인
- MFA
- 더미 대시보드
- 서버 URL 설정
- GitHub Releases 최신 버전 확인

## 향후 확장

- 자동 다운로드와 설치
- 코드 서명 적용
- 클라이언트 인증서 또는 단말 식별 확장
