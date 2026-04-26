# 영업, 주문, 출하, 청구 API

태그: `#erp` `#domain/api` `#topic/sales` `#topic/order` `#topic/invoice`

상위 문서: [API 문서 지도](00-api-index.md)  
이전 문서: [재고 API](04-inventory-api.md)  
다음 문서: [파일 API](06-file-api.md)

문서 위치: [문서 지도](../00-index.md) > API > 영업, 주문, 출하, 청구 API

관련 문서:
- [견적 및 주문 워크플로우](../workflows/03-quotation-order-workflow.md)
- [부품 판매 워크플로우](../workflows/04-parts-sales-workflow.md)
- [출하 워크플로우](../workflows/06-shipping-workflow.md)
- [청구서 워크플로우](../workflows/07-invoice-workflow.md)

## 1. 목적

이 문서는 견적, 주문, 판매, 출하, 청구 처리 API를 정의한다.

## 2. 엔드포인트 목록

### 2.1 견적

- `GET /api/v1/quotations`
- `POST /api/v1/quotations`
- `GET /api/v1/quotations/{quotationId}`
- `POST /api/v1/quotations/{quotationId}/versions`
- `POST /api/v1/quotations/{quotationId}/approve`
- `POST /api/v1/quotations/{quotationId}/convert-to-order`

### 2.2 주문

- `GET /api/v1/orders`
- `POST /api/v1/orders`
- `GET /api/v1/orders/{orderId}`
- `PATCH /api/v1/orders/{orderId}`
- `POST /api/v1/orders/{orderId}/confirm`
- `POST /api/v1/orders/{orderId}/cancel`

### 2.3 부품 판매

- `GET /api/v1/parts-sales`
- `POST /api/v1/parts-sales`
- `GET /api/v1/parts-sales/{saleId}`
- `POST /api/v1/parts-sales/{saleId}/confirm`

### 2.4 출하

- `GET /api/v1/shipments`
- `POST /api/v1/shipments`
- `POST /api/v1/shipments/{shipmentId}/dispatch`
- `POST /api/v1/shipments/{shipmentId}/update-tracking`

### 2.5 청구

- `GET /api/v1/invoices`
- `POST /api/v1/invoices`
- `GET /api/v1/invoices/{invoiceId}`
- `POST /api/v1/invoices/{invoiceId}/issue`
- `POST /api/v1/invoices/{invoiceId}/record-payment`
- `POST /api/v1/invoices/{invoiceId}/documents`
- `PATCH /api/v1/invoices/{invoiceId}/memo`

## 3. 핵심 규칙

- 견적은 버전 관리가 가능해야 한다.
- 주문과 판매는 라인 구조를 기준으로 부분 출하, 부분 청구를 허용한다.
- 가격 예외, 할인 예외, 승인 확정은 승인 권한과 감사 로그가 필요하다.
- 출하 전 재고 검증을 다시 수행한다.
- 청구 라인은 원거래 변경과 독립적으로 보존한다.
- 청구 원거래는 `sourceType`, `sourceId`, `sourceNo`로 저장한다. `sourceType`은 `PROJECT`, `SALE`, `DELIVERY`를 사용한다.
- 수금 내역은 부분 수금을 허용하며 수금 합계가 청구 합계 이상이면 수금 완료로 계산한다.
- 예정일이 지났고 미수금이 있으면 연체 상태로 계산한다.
- 청구 문서 ID는 `청구번호-문서종류코드-순번` 형식으로 자동 생성한다.
- 주문 등록 화면은 기간 조회를 기본 검색 조건으로 사용한다.
- 주문 목록 기본 컬럼은 주문일, 거래처, 선박, 구분, 수주, 주문명, 상태, 주문ID, 공사ID를 기준으로 한다.
- 주문 상세는 주문 내역과 공사 정보를 분리 표시한다.
- 수주 확정 시 관리번호는 `SH-YYYY-NNN-T` 또는 `SH-YYYY-NNN-S` 형식으로 발급한다. `T`는 공사, `S`는 일반 판매 또는 납품이다.
- 관리번호는 결번 유지 정책을 따른다. 삭제, 취소, 병합으로 비는 순번이 생겨도 재정렬하지 않고, 신규는 항상 해당 연도 최대 순번 + 1 로 발급한다.
- 중복 관리번호가 발견되면 첫 정상 건은 유지하고 뒤 충돌 건만 새 번호를 재발급한다. 순번 압축은 하지 않는다.
- `YYYY`는 수주 확정 체크일 기준 연도이며, `NNN`은 해당 연도 누적 순번이다.

## 4. 주문 생성 예시

```json
{
  "customer_id": "cust_100",
  "quotation_id": "quo_200",
  "request_type": "견적 요청",
  "quote_scope": ["PARTS", "REPAIR"],
  "vessel_id": "asset_100",
  "equipment_id": "eq_100",
  "lines": [
    {
      "item_id": "item_100",
      "quantity": 3,
      "unit_price": 15000
    }
  ],
  "requested_delivery_date": "2026-03-20"
}
```

견적 없이 바로 진행하는 주문은 `quote_scope`를 빈 배열로 두고 수주 확정 단계에서 공사 또는 일반 판매 구분을 지정한다.

## 5. 출하 등록 예시

```json
{
  "source_type": "ORDER",
  "source_id": "ord_123",
  "lines": [
    {
      "source_line_id": "ord_line_1",
      "ship_qty": 2
    }
  ],
  "recipient": {
    "name": "이수령",
    "phone": "010-1111-2222",
    "address": "서울시 ..."
  }
}
```

## 6. 구현 메모

- 주문, 판매, 출하, 청구는 각각 분리 엔드포인트를 유지하되 내부적으로 재고/파일/감사 서비스와 연결한다.
