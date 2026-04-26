# 고객 및 자산 API

태그: `#erp` `#domain/api` `#topic/customers` `#topic/assets`

상위 문서: [API 문서 지도](00-api-index.md)  
이전 문서: [사용자 및 권한 API](02-user-and-permission-api.md)  
다음 문서: [수리 API](03-repair-api.md)

문서 위치: [문서 지도](../00-index.md) > API > 고객 및 자산 API

관련 문서:
- [대시보드 쉘 UI](../ui/03-dashboard-shell-ui.md)
- [데이터 모델 기초 설계](../architecture/03-data-model-foundation.md)
- [권한 모델](../security/04-permission-model.md)

## 1. 목적

이 문서는 고객관리, 자산관리, 선박/장비 기준 정보, 사업자등록증 보조 입력, 기준정보 요청 API를 정의한다.

## 2. 엔드포인트 목록

### 2.1 고객

- `GET /api/v1/customers`
- `POST /api/v1/customers`
- `GET /api/v1/customers/{customerId}`
- `PATCH /api/v1/customers/{customerId}`
- `PATCH /api/v1/customers/{customerId}/memo`
- `POST /api/v1/customers/{customerId}/contacts`
- `PATCH /api/v1/contacts/{contactId}`
- `POST /api/v1/customers/{customerId}/addresses`

### 2.2 선박 및 장비

- `POST /api/v1/customers/{customerId}/assets`
- `PATCH /api/v1/assets/{assetId}`
- `DELETE /api/v1/assets/{assetId}`
- `POST /api/v1/assets/{assetId}/equipments`
- `PATCH /api/v1/equipments/{equipmentId}`
- `DELETE /api/v1/equipments/{equipmentId}`

### 2.3 기준 정보와 파일

- `GET /api/v1/master/equipment-options`
- `GET /api/v1/master/engine-models`
- `POST /api/v1/master/engine-models`
- `GET /api/v1/master/gearbox-models`
- `POST /api/v1/master/gearbox-models`
- `POST /api/v1/master-data-requests`
- `GET /admin/api/v1/master-data-requests`
- `POST /admin/api/v1/master-data-requests/{requestId}/approve`
- `POST /api/v1/files`
- `POST /api/v1/files/{fileId}/links`
- `POST /api/v1/customers/{customerId}/business-license/extract`

## 3. 핵심 규칙

- 고객관리 조회 화면과 신규 입력 화면은 같은 필드 배치를 사용한다.
- 등록 완료된 고객 기본정보는 `우클릭 수정`으로 단일 필드 인라인 수정을 지원한다.
- 고객 상세의 `기본 / 조직 / 장비` 하위 탭은 같은 상세 패널 안에서 전환한다.
- 선박 목록과 장비 목록은 각각 독립 스크롤 영역을 가진다.
- 주문이나 공사에 연결된 선박 또는 장비는 삭제를 제한하고 안내 메시지를 표시한다.
- 선박과 장비 삭제는 삭제 전 확인을 거친다.
- 엔진/감속기/장비 분류 등 기준 정보가 없으면 기준정보 요청으로 관리자 승인을 받을 수 있다.
- 사업자등록증 파일 선택과 OCR 보조 입력은 Electron 클라이언트에서 보조 기능으로 제공한다.

## 4. 고객 수정 예시

```json
{
  "customer_name": "영광기업",
  "representative_name": "하영광",
  "business_registration_no": "601-33-4432-12",
  "business_category": "선사",
  "business_item": "테스트 장비 / 테스트 종목",
  "company_phone": "010-4444-8901",
  "company_email": "test@mail.com",
  "tax_category": "영세율",
  "bank_account": "1111-111-111-11",
  "invoice_email": "test_tax@mail.com",
  "opening_date": "2026-01-30",
  "notes": "test 메모"
}
```

## 5. 선박 및 장비 삭제 응답

삭제 성공 시 최신 고객 상세 데이터를 반환한다.

```json
{
  "success": true,
  "data": {
    "customer": {},
    "assets": []
  }
}
```

삭제 제한 시:

```json
{
  "success": false,
  "errorCode": "DELETE_BLOCKED",
  "message": "주문이 등록된 선박은 삭제할 수 없습니다."
}
```

## 6. 구현 메모

- 모듈 후보: `src/modules/customers`, `src/modules/admin/master-data-request.store.ts`
- Electron IPC 브리지: `client/main.js`, `client/preload.js`
- 화면 구현 기준: `client/renderer/app.js`, `client/renderer/styles.css`
