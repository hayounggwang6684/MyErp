# 재고 API

태그: `#erp` `#domain/api` `#topic/inventory`

상위 문서: [API 문서 지도](00-api-index.md)  
이전 문서: [수리 API](03-repair-api.md)  
다음 문서: [영업, 주문, 출하, 청구 API](05-sales-order-invoice-api.md)

문서 위치: [문서 지도](../00-index.md) > API > 재고 API

관련 문서:
- [재고 워크플로우](../workflows/05-inventory-workflow.md)
- [데이터 모델 기초 설계](../architecture/03-data-model-foundation.md)

## 1. 목적

이 문서는 재고 조회, 입고, 출고, 이동, 조정 API를 정의한다.

## 2. 엔드포인트 목록

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/v1/inventory/balances` | 현재고 조회 |
| `GET` | `/api/v1/inventory/movements` | 재고 원장 조회 |
| `POST` | `/api/v1/inventory/receipts` | 입고 등록 |
| `POST` | `/api/v1/inventory/issues` | 출고 등록 |
| `POST` | `/api/v1/inventory/transfers` | 창고/로케이션 이동 |
| `POST` | `/api/v1/inventory/adjustments` | 재고 조정 |

## 3. 핵심 규칙

- 모든 재고 변경은 원장 테이블에 기록된다.
- 현재고 조회는 캐시 테이블을 사용하되 원장으로 재계산 가능해야 한다.
- 음수 재고 발생 시 등록을 차단한다.
- 재고 조정은 승인 권한 또는 재인증이 필요할 수 있다.

## 4. 조정 요청 예시

```json
{
  "item_id": "item_100",
  "warehouse_id": "wh_main",
  "location_id": "loc_a_01",
  "adjust_qty": -2,
  "reason": "실사 차이",
  "requires_approval": true
}
```

## 5. 주요 응답 필드

- `movement_id`
- `movement_type`
- `item_id`
- `warehouse_id`
- `location_id`
- `quantity`
- `balance_after`
- `reason`

## 6. 구현 메모

- 수리, 판매, 출하 API는 내부적으로 재고 API 또는 동일한 재고 서비스 계층을 호출한다.
