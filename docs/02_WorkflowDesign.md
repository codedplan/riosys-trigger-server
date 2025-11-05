---
title: 리오시스템_v1.0 워크플로 설계
version: 1.0
updated: 2025-11-03
author: 리오
---

# ⚙️ 워크플로 설계

리오시스템_v1.0은 **단방향 데이터 흐름 구조(One-Way Flow)** 로 설계된다.  
입력 데이터는 Google Sheets에서 출발해 GPT → ComfyUI → Figma → Export 순서로 자동 변환된다.  
각 모듈은 독립적으로 실행 가능하며, 모든 산출물은 JSON 기반으로 로깅된다.

---

## 1. 전체 파이프라인

```mermaid
flowchart LR
    A[Google Sheets 입력데이터] --> B[GPT 스토리빌더]
    B --> C[ComfyUI 이미지 생성]
    C --> D[Figma 자동 배치]
    D --> E[Export 출력/검수]
단방향 구조 (Sheets → GPT → ComfyUI → Figma → Export)
각 단계는 독립 실행 가능하며, 모든 결과물은 dist/ 및 logs/ 폴더에 자동 저장된다.
```


## 2. 주요 데이터 파일 흐름
| 단계          | 입력            | 출력          | 파일명                       | 설명          |
| ----------- | ------------- | ----------- | ------------------------- | ----------- |
| 데이터 파싱      | Google Sheets | JSON        | `dist/grouped_input.json` | SKU별 통합 데이터 |
| 스토리 생성      | grouped_input | Storyline   | `dist/storyline.json`     | GPT 결과      |
| 이미지 프롬프트    | Storyline     | ImagePrompt | `dist/image_prompt.json`  | ComfyUI 입력용 |
| 이미지 출력      | ImagePrompt   | Image Files | `/output/{SKU}/`          | 실제 이미지 결과물  |
| 통합 결합       | Text + Image  | DetailDoc   | `dist/detail_doc.json`    | Figma 입력용   |
| 배치 및 Export | DetailDoc     | PNG / HTML  | `/dist/export/{SKU}/`     | 최종 시안 출력    |


## 3. 흐름 제어 규칙

- AUTO_GEN이 TRUE인 행만 자동 처리
- 각 단계는 중간 산출물 기준 독립 실행 가능
- 모든 실행 결과는 /logs 폴더에 기록

| 로그 파일명                      | 설명               |
| --------------------------- | ---------------- |
| `logs/data_validation.json` | 시트 파싱 검증 로그      |
| `logs/gpt_calls.json`       | GPT 요청/응답 로그     |
| `logs/image_report.json`    | 이미지 품질 검증 로그     |
| `logs/Master_Log.json`      | 전체 프로세스 기록 통합 로그 |


## 4. 모듈 구조
| 구분          | 주요 모듈                                                     | 역할                             |
| ----------- | --------------------------------------------------------- | ------------------------------ |
| **API 레이어** | `fetchSheets.ts`, `mergeBySKU.ts`                         | Google Sheets → 객체 변환 및 SKU 병합 |
| **AI 빌더**   | `storyGenerator.ts`, `imagePromptGenerator.ts`            | GPT 기반 스토리·프롬프트 생성             |
| **변환엔진**    | `ComfyUI Workflow (riosys_sdxl_v1.json)`                  | 로컬 이미지 생성 파이프라인                |
| **동기화 레이어** | `sync/sectionMap.json`, `sync/tonePreset.json`            | 텍스트·이미지 매핑 및 톤 일관성 유지          |
| **배치/출력**   | `figma/plugin_placeText.ts`, `figma/plugin_placeImage.ts` | Figma 자동 배치 및 Export 수행        |


## 5. 데이터 검증 및 디버깅 포인트
| 구간               | 검증 포인트                | 로그 파일                       |
| ---------------- | --------------------- | --------------------------- |
| Sheets → JSON    | 필드 누락 / 형식 오류         | `logs/data_validation.json` |
| GPT → Storyline  | 응답 구조 불일치 / Null 반환   | `logs/gpt_calls.json`       |
| ComfyUI → Output | 이미지 누락, 해상도 오류, 톤 불일치 | `logs/image_report.json`    |
| Export 단계        | 폴더 구조 / 경로 누락         | `logs/Master_Log.json`      |


## 6. 예외 처리 규칙
1. API 호출 실패 시
- 자동 재시도 2회
- 3회 실패 시 해당 SKU를 error_log.json에 기록

2. ComfyUI 이미지 생성 실패 시
- 프롬프트 오류 로그 생성 → 수동 재생성 대기

3. Figma 플러그인 오류 시
- 로그 생성 후 배치 좌표 초기화


## 7. 데이터 흐름 요약
[1] Sheets 데이터 수집

↓

[2] GPT 프롬프트 생성

↓

[3] ComfyUI 이미지 변환

↓

[4] 텍스트·이미지 통합(JSON)

↓

[5] Figma 자동 배치

↓

[6] QA · Export · 로그 기록


## 8. 핵심 원칙
| 원칙           | 설명                         |
| ------------ | -------------------------- |
| **단방향성**     | 데이터는 위 → 아래로만 전달되며 역피드백 없음 |
| **모듈 독립성**   | 각 모듈은 개별 실행 및 디버깅 가능       |
| **검증 로그화**   | 모든 단계 결과를 JSON 로그로 저장      |
| **가시성 확보**   | 산출물 및 로그 경로 명확히 지정         |
| **로컬 우선 구조** | 네트워크 영향 없이 안정적 실행 보장       |


## 9. 슬로건
> “흐름은 단순하게, 결과는 정교하게.”


---



✅ **요약 확인 포인트**
| 구분 | 기대 결과 |
|------|------------|
| Mermaid 다이어그램 | 정상 렌더링 (회색 코드영역 아님) |
| 2. 주요 데이터 파일 흐름 | 흰색 표로 정상 표시 |
| 접기 기능 | 모든 `##` 헤더에서 ▶ 작동 |
| HTML 필요 여부 | ❌ 불필요 |
| 미리보기 엔진 | VSCode 기본 Preview (`Ctrl+Shift+V`) |

---
