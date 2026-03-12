# 수리 API

태그: `#erp` `#domain/api` `#topic/repair`

상위 문서: [API 문서 지도](00-api-index.md)  
이전 문서: [사용자 및 권한 API](02-user-and-permission-api.md)  
다음 문서: [재고 API](04-inventory-api.md)

문서 위치: [문서 지도](../00-index.md) > API > 수리 API

관련 문서:
- [수리 접수 워크플로우](../workflows/01-repair-intake-workflow.md)
- [수리 진행 워크플로우](../workflows/02-repair-process-workflow.md)
- [데이터 모델 기초 설계](../architecture/03-data-model-foundation.md)

## 1. 목적

이 문서는 수리 접수, 진단, 작업 지시, 부품 사용, 완료 처리 API를 정의한다.

## 2. 엔드포인트 목록

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/v1/repairs` | 수리 접수 목록 조회 |
| `POST` | `/api/v1/repairs` | 수리 접수 생성 |
| `GET` | `/api/v1/repairs/{repairId}` | 수리 상세 조회 |
| `POST` | `/api/v1/repairs/{repairId}/diagnostics` | 진단 등록 |
| `POST` | `/api/v1/repairs/{repairId}/work-orders` | 작업 지시 등록 |
| `POST` | `/api/v1/repairs/{repairId}/parts-usage` | 사용 부품 등록 |
| `POST` | `/api/v1/repairs/{repairId}/complete` | 수리 완료 처리 |
| `POST` | `/api/v1/repairs/{repairId}/hold` | 보류 처리 |
| `POST` | `/api/v1/repairs/{repairId}/mark-unrepairable` | 수리 불가 처리 |

## 3. 수리 접수 생성 예시

```json
{
  "customer_id": "cust_100",
  "product": {
    "item_id": "item_200",
    "serial_no": "SN-123"
  },
  "symptom": "전원 불량",
  "requested_at": "2026-03-11T09:30:00Z",
  "memo": "방문 접수"
}
```

## 4. 진단 등록 예시

```json
{
  "diagnosis_result": "메인보드 이상",
  "estimated_cost": 120000,
  "requires_parts": true,
  "requires_customer_approval": true
}
```

## 5. 부품 사용 등록 예시

```json
{
  "parts": [
    {
      "item_id": "part_100",
      "quantity": 2,
      "warehouse_id": "wh_main",
      "location_id": "loc_a_01"
    }
  ]
}
```

## 6. 핵심 규칙

- 수리 접수 시 고객, 제품 또는 임시 식별 정보가 필요하다.
- 부품 사용 등록은 재고 원장 기록과 함께 처리한다.
- 수리 불가, 보류, 완료는 모두 상태 이력을 남긴다.
- 수리 불가와 비용 확정은 승인 또는 고객 확인 절차가 필요할 수 있다.

## 7. 응답 핵심 필드

- `repair_id`
- `repair_no`
- `status`
- `customer`
- `product`
- `diagnostics`
- `parts_usage`
- `attachments`
- `status_history`

## 8. 구현 메모

- 수리 API 구현 전 파일 API와 재고 API의 연결 지점을 함께 고려한다.
