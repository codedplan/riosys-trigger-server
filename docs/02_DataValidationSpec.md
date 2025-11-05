---
title: 리오시스템_v1.0 데이터 유효성 규칙 명세
version: 1.0
updated: 2025-11-03
author: 리오
---

# 🔒 데이터 유효성 규칙 명세 (02_DataValidationSpec)

본 문서는 Google Sheets 기반 입력 데이터의 **정합성 보장**을 위한 규칙을 정의한다.  
대상 파일: `AI 상세페이지_입력데이터`  
대상 시트: `상품마스터`, `브랜드가이드`, `품종사전`, `스토리플롯`

---

## 0. 공통 운영 원칙

- **헤더는 1행 고정**. 데이터는 2행부터 입력  
- **이름정의(네임드레인지)** 를 사용해 참조 안정화  
- **드롭다운은 목록에서만 선택**. 임의 텍스트 금지  
- **상태값으로 실행 제어**. READY만 파이프라인 대상  
- **조건부서식으로 오류 가시화**. 유효성 위반은 즉시 붉은 배경  

---

## 1. 이름정의 목록

시트 상단 또는 별도 `CONFIG` 시트를 사용해 다음 네임을 정의한다.

- `BRAND_CODE_LIST` → `브랜드가이드!A2:A`
- `VARIETY_CODE_LIST` → `품종사전!A2:A`
- `STORY_ID_LIST` → `스토리플롯!A2:A`
- `STATUS_LIST` → 수동 목록 = `{READY, HOLD, ERROR, DONE}`
- `SALE_STATUS_LIST` → 수동 목록 = `{ACTIVE, HOLD}`
- `SECTION_TYPE_LIST` → 수동 목록 = `{hero, usp, problem, benefit, origin, proof, howto, package, cta, outro}`
- `SENTENCE_FORM_LIST` → 수동 목록 = `{서술, 감탄, 질문}`
- `BG_KIND_LIST` → 수동 목록 = `{단색, 실사, 블러}`
- `LENS_LIST` → 수동 목록 = `{35mm, 50mm, 85mm}`
- `ANGLE_LIST` → 수동 목록 = `{Eye, Top, Macro}`
- `ASPECT_LIST` → 수동 목록 = `{1:1, 3:4, 9:16}`

> 네임 정의 방법: **데이터 > 이름정의** 메뉴 사용

---

## 2. 시트별 유효성 규칙

### 2.1 상품마스터

**대상 컬럼**
- A: `SKU`  
- B: `상품명`  
- C: `브랜드코드`  
- D: `품종코드`  
- E: `스토리ID`  
- F: `AUTO_GEN`  
- G: `카테고리코드`  
- H: `판매상태`  
- I: `가격대`  
- J: `원산지`  
- K: `판매채널`  
- L: `특징키워드`  
- M: `USP문구`  
- N: `패키지타입`  
- O: `생성결과폴더`  
- P: `상태`  
- Q: `생성일시`  
- R: `수정일시`

**유효성 설정**
- `A2:A` SKU  
  - **맞춤 수식:**  
    ```
    =REGEXMATCH(A2,"^[A-Z]{2}-[A-Z]{2}-\d{3}$")
    ```
- `B2:B` 상품명
  - **필수 입력:**
    ```
    =LEN(B2)>0
    ```
- `C2:C` 브랜드코드
  - **목록:**
    ```
    =BRAND_CODE_LIST
    ```
- `D2:D` 품종코드
  - **목록:**
    ```
    =VARIETY_CODE_LIST
    ```
- `E2:E` 스토리ID
  - **목록:**
    ```
    =STORY_ID_LIST
    ```
- `F2:F` AUTO_GEN
  - **체크박스:**
    ```
    (TRUE/FALSE)
    ```
- `H2:H` 판매상태
  - **목록:**
    ```
    =SALE_STATUS_LIST
    ```
- `I2:I` 가격대 
  - **숫자:**
    ```
    0 이상
    ```  