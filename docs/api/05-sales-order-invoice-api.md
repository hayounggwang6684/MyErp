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

## 3. 핵심 규칙

- 견적은 버전 관리가 가능해야 한다.
- 주문과 판매는 라인 구조를 기준으로 부분 출하, 부분 청구를 허용한다.
- 가격 예외, 할인 예외, 승인 확정은 승인 권한과 감사 로그가 필요하다.
- 출하 전 재고 검증을 다시 수행한다.
- 청구 라인은 원거래 변경과 독립적으로 보존한다.

## 4. 주문 생성 예시

```json
{
  "customer_id": "cust_100",
  "quotation_id": "quo_200",
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
