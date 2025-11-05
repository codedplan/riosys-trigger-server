---
title: 리오시스템_v1.0 네이밍 규칙
version: 1.0
updated: 2025-11-03
author: 리오
---

# 🧾 네이밍 규칙 (Naming Rules)

리오시스템_v1.0의 모든 파일명과 코드, 폴더, SKU, 버전명은  
**데이터 추적성(Traceability)** 과 **자동화 처리 일관성**을 위해 표준화되어 있다.  
규칙은 수동 입력 최소화·자동 로깅 최적화·파일 충돌 방지에 초점을 둔다.

---

## 1. 기본 원칙

| 원칙 | 설명 |
|------|------|
| **일관성(Consistency)** | 모든 파일과 변수명은 동일한 구조로 관리한다. |
| **가독성(Readability)** | 짧지만 의미가 명확한 명칭만 사용한다. |
| **자동 처리(Automation)** | GPT·ComfyUI·Figma 플러그인이 인식 가능한 규칙 구조를 유지한다. |
| **버전 추적(Versioning)** | 모든 결과물은 버전 폴더 및 파일명으로 관리한다. |
| **로컬 독립성(Locality)** | 외부 시스템 의존 없는 자가 추적 구조를 유지한다. |

---

## 2. SKU 네이밍 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| **형식** | `[브랜드코드]-[상품코드]-[옵션코드]` | `FP-LT-001` |
| **브랜드코드(2자리)** | 브랜드 약칭 (예: Farmplow → `FP`, Peppytail → `PT`) | `FP` |
| **상품코드(2자리)** | 품종·제품군 코드 (예: Lettuce → `LT`, Eel → `EL`) | `LT` |
| **옵션코드(3자리)** | SKU 세부 항목 (001~999 자동 증가) | `001` |
| **예시 전체 코드** | 브랜드 + 상품 + 옵션을 결합 | `FP-LT-001` |
| **자동 생성 규칙** | Google Sheets 입력 시 SKU 자동 채번 | `/src/api/mergeBySKU.ts` |

> SKU는 모든 상세페이지·이미지·JSON 파일의 루트 Key 값으로 사용된다.  
> SKU가 다르면 완전히 별도 파이프라인으로 취급된다.

---

## 3. 버전명 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| **형식** | `v[Major].[Minor]` | `v1.0` |
| **Major** | 기능 변경, 데이터 구조 변경 시 증가 | `v2.0`, `v3.0` |
| **Minor** | 수정·QA·UI 조정 등 경미한 변경 시 증가 | `v1.1`, `v1.2` |
| **단일 SKU 버전 폴더** | `/output/{SKU}/v1/`, `/output/{SKU}/v2/` | `FP-LT-001/v2/` |
| **로그 버전** | 로그 파일명에도 동일 버전 코드 부여 | `logs/Master_Log_v1.2.json` |

> `v` 접두어는 항상 소문자 사용.  
> 버전은 코드 수정 이력과 QA 검증 결과 기준으로 증가한다.

---

## 4. 파일명 규칙

| 파일 유형 | 형식 | 예시 | 설명 |
|------------|------|------|------|
| **데이터 파일(JSON)** | `{SKU}_{Section}.json` | `FP-LT-001_storyline.json` | GPT 스토리라인 결과 |
| **이미지 파일(PNG)** | `{SKU}_{Section}.png` | `FP-LT-001_hero.png` | ComfyUI 생성 이미지 |
| **메타 파일** | `{SKU}_meta.json` | `FP-LT-001_meta.json` | 이미지 생성 파라미터 |
| **프롬프트 파일** | `{SKU}_prompt.json` | `FP-LT-001_prompt.json` | GPT 이미지 프롬프트 |
| **Export 파일** | `{SKU}_v{Version}_export.html` | `FP-LT-001_v1_export.html` | Figma Export 결과 |
| **로그 파일** | `{Process}_log_{Date}.json` | `gpt_log_20251103.json` | 단계별 로그 기록 |

> 날짜 포맷은 항상 `YYYYMMDD` 형태로 통일한다.  
> 로그, 백업, Export 결과물 모두 동일한 네이밍 정책을 따른다.

---

## 5. 폴더 트리 규칙

```text
output/
└─ {SKU}/
   ├─ v1/
   │  ├─ {SKU}_storyline.json         # GPT 스토리라인 결과
   │  ├─ {SKU}_image_prompt.json      # 이미지 프롬프트 데이터
   │  ├─ {SKU}_hero.png               # 대표 이미지 (Hero)
   │  ├─ {SKU}_usp1.png               # USP 섹션 이미지
   │  ├─ {SKU}_origin.png             # 원산지 섹션 이미지
   │  ├─ {SKU}_meta.json              # 이미지 생성 파라미터 메타
   │  ├─ {SKU}_detail_doc.json        # 텍스트+이미지 통합 JSON
   │  └─ {SKU}_v1_export.html         # Figma Export 시안
   │
   ├─ v2/
   │  ├─ {SKU}_storyline.json
   │  ├─ {SKU}_image_prompt.json
   │  ├─ {SKU}_hero.png
   │  ├─ {SKU}_usp1.png
   │  ├─ {SKU}_origin.png
   │  ├─ {SKU}_meta.json
   │  ├─ {SKU}_detail_doc.json
   │  └─ {SKU}_v2_export.html
   │
   ├─ preview/
   │  ├─ {SKU}_preview_grid.png       # 이미지 프리뷰 그리드
   │  └─ {SKU}_review_notes.txt       # 검수 메모
   │
   ├─ backup/
   │  ├─ {SKU}_backup_20251103.zip    # 버전별 백업 파일
   │  └─ {SKU}_backup_20251102.zip
   │
   └─ logs/
      ├─ data_validation_20251103.json
      ├─ gpt_calls_20251103.json
      ├─ image_report_20251103.json
      └─ Master_Log_v1.2.json
```


> SKU 단위 폴더 내에 버전별 하위 디렉토리가 존재하며,  
> 모든 산출물은 해당 버전 경로 안에 포함된다.

---

## 6. 로그·백업 네이밍 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| **데이터 검증 로그** | `data_validation_{YYYYMMDD}.json` | `data_validation_20251103.json` |
| **GPT 호출 로그** | `gpt_calls_{YYYYMMDD}.json` | `gpt_calls_20251103.json` |
| **이미지 품질 로그** | `image_report_{YYYYMMDD}.json` | `image_report_20251103.json` |
| **마스터 로그** | `Master_Log_v{Version}.json` | `Master_Log_v1.2.json` |
| **백업 파일** | `{SKU}_backup_{YYYYMMDD}.zip` | `FP-LT-001_backup_20251103.zip` |

> 모든 로그 파일은 날짜 기반 자동 생성되며,  
> Master_Log는 버전 단위별 종합 기록으로 사용된다.

---

## 7. 시트명 및 탭 네이밍 규칙

| 시트명 | 역할 | 설명 |
|--------|------|------|
| **상품마스터** | 제품 기본 데이터 | SKU, 품종, 키워드 입력 |
| **브랜드가이드** | 브랜드 비주얼 규칙 | 컬러, 폰트, 톤 규정 |
| **품종사전** | 품종별 시각 특징 | 품종 이미지, 색상값, 형태 |
| **스토리플롯** | 문체·서사 구조 | 섹션 구성 및 톤 설정 |

> 시트명은 모두 한글로 표기하되, 스크립트에서는 영문으로 참조된다.  
> 예: `상품마스터` → `sheet_name = "ProductMaster"`

---

## 8. 코드 내 명명 규칙 (변수 / 함수)

| 구분 | 규칙 | 예시 |
|------|------|------|
| **함수명** | camelCase | `generateStoryline()` |
| **상수명** | UPPER_SNAKE_CASE | `DEFAULT_PROMPT_PATH` |
| **파일명** | kebab-case | `merge-by-sku.ts` |
| **클래스명** | PascalCase | `StoryBuilder` |
| **로그 키** | snake_case | `storyline_created` |

> 코드 네이밍은 가독성과 자동완성 효율을 위해  
> camelCase (함수) / kebab-case (파일) / PascalCase (클래스)로 구분한다.

---

## 9. 버전 관리 규칙

| 구분 | 정책 |
|------|------|
| **버전 증가 조건** | 기능 추가, 데이터 구조 변경, 오류 수정 |
| **버전 폴더 구조** | `/output/{SKU}/v1/`, `/v2/`, `/v3/` |
| **백업 주기** | 1일 1회 자동 백업 (`backup_to_drive.sh`) |
| **버전 표기 위치** | 문서 헤더 + 로그 파일명 + Export 파일명 |
| **리비전 관리** | 동일 버전 내 수정은 `_rev1`, `_rev2` 로 표기 |

> 예시: `FP-LT-001_v1_rev2_export.html` → v1 버전의 두 번째 리비전

---

## 10. 슬로건

> **“이름이 곧 질서다.”**
