# 파일 API

태그: `#erp` `#domain/api` `#topic/files`

상위 문서: [API 문서 지도](00-api-index.md)  
이전 문서: [영업, 주문, 출하, 청구 API](05-sales-order-invoice-api.md)  
다음 문서: 없음

문서 위치: [문서 지도](../00-index.md) > API > 파일 API

관련 문서:
- [배포 및 저장 구조](../architecture/02-deployment-and-storage-architecture.md)
- [데이터 모델 기초 설계](../architecture/03-data-model-foundation.md)

## 1. 목적

이 문서는 업로드, 메타데이터 조회, 다운로드, 업무 엔터티 연결에 필요한 파일 API를 정의한다.

## 2. 엔드포인트 목록

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `POST` | `/api/v1/files` | 파일 업로드 시작 및 저장 |
| `GET` | `/api/v1/files/{fileId}` | 파일 메타데이터 조회 |
| `GET` | `/api/v1/files/{fileId}/download` | 권한 검사 후 다운로드 |
| `POST` | `/api/v1/files/{fileId}/links` | 업무 엔터티와 연결 |
| `DELETE` | `/api/v1/files/{fileId}/links/{linkId}` | 파일 연결 해제 |
| `POST` | `/api/v1/files/{fileId}/versions` | 새 버전 업로드 |

## 3. 업로드 요청 예시

```json
{
  "domain": "repair",
  "entity_type": "repair_intake",
  "entity_id": "repair_123",
  "original_name": "symptom-photo.jpg"
}
```

## 4. 핵심 규칙

- 실제 파일 경로는 API 응답에 노출하지 않는다.
- 다운로드는 파일 권한 검사 후 스트리밍으로 제공한다.
- 업로드 직후 임시 저장, 검사, 본 저장, 메타데이터 기록 순서를 따른다.
- 파일은 `file_id`와 버전 기준으로 추적한다.

## 5. 응답 핵심 필드

- `file_id`
- `domain`
- `entity_type`
- `entity_id`
- `original_name`
- `mime_type`
- `size_bytes`
- `version`
- `scan_status`
- `uploaded_at`

## 6. 구현 메모

- 파일 API는 수리, 주문, 판매, 출하, 청구와 공통으로 연결된다.
- 저장 경로 규칙은 서버 내부 구현에서만 사용한다.
