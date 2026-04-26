# Electron 클라이언트 구조

이 폴더는 Windows 설치형 ERP 클라이언트의 초기 Electron 구조를 둔다.

## 구성

- `main.js`: 앱 시작, 창 생성, 업데이트 확인, 서버 API 프록시
- `preload.js`: renderer에서 사용할 안전한 IPC 브리지
- `renderer/app-dialog.js`: Electron renderer 공통 알림, 확인, 입력 다이얼로그
- `renderer/app-design-mode.js`: 하위 탭 디자인 모드의 배치 저장, 드래그, 크기 조절, 라벨 편집 로직
- `renderer/app-invoice.js`: 청구관리 상태, 집계, 목록/상세 렌더링 로직
- `renderer/app-invoice-actions.js`: 청구관리 클릭, 파일 선택, 수금/메모 폼 처리
- `renderer/app-project.js`: 공사관리 상태, 집계, 공사뷰/문서뷰 렌더링 로직
- `renderer/app-project-actions.js`: 공사관리 클릭, 입력 폼, 체크리스트/레포트 변경 처리
- `renderer/app-order.js`: 주문관리 상태, 관리번호 계산, 목록/상세 렌더링 로직
- `renderer/app-order-documents.js`: 주문관리 문서 타입, 첨부, 문서 추가, 문서 목록 렌더링 로직
- `renderer/app-order-actions.js`: 주문관리 클릭, 키보드, 폼, 컬럼 크기 조절 처리
- `renderer/app.js`: 로그인, MFA, 고객관리, 주문관리, 공사관리, 자산관리, 부품관리, 청구관리, 직원관리, 설정 UI
- `renderer/styles.css`: renderer 공통 스타일과 업무 탭 레이아웃

## 현재 범위

- 로그인
- MFA
- 고객관리 목록/상세/신규 등록/우클릭 수정
- 주문관리 주문등록 하위 탭과 기간 조회
- 공사관리 공사뷰/문서뷰 기본 구조
- 자산관리 선박/장비 기준 정보 조회
- 부품관리 재고 조회
- 청구관리 청구/수금 조회
- 대시보드 상위 탭
- 개인 설정
- 서버 URL 설정
- GitHub Releases 최신 버전 확인

## 향후 확장

- 자동 다운로드와 설치
- 코드 서명 적용
- 클라이언트 인증서 또는 단말 식별 확장
