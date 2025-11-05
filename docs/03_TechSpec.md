---
title: 리오시스템_v1.0 기술 스펙
version: 1.0
updated: 2025-11-03
author: 리오
---

# 🧠 기술 스펙 (Tech Spec)

리오시스템_v1.0은 **로컬 환경 중심의 자동화 구조**로 설계되어 있다.  
Node.js, TypeScript, OpenAI API, ComfyUI, Figma API가 핵심 기반이며  
모든 모듈은 독립 실행이 가능하도록 구성된다.

---

## 1. 실행 환경 명세

| 항목 | 버전 / 구성 | 설명 |
|------|---------------|------|
| **운영체제(OS)** | Windows 11 Pro / macOS Sonoma 14 이상 | 로컬 환경에서 테스트 및 실행 |
| **Node.js** | v20.11.1 LTS | 메인 실행 런타임 |
| **TypeScript** | v5.4.x | 정적 타입 기반 개발 언어 |
| **패키지 관리자** | pnpm v9.x | 경량 고속 의존성 관리 |
| **Python** | v3.10 이상 | ComfyUI 및 이미지 처리용 |
| **ComfyUI** | Stable Diffusion XL (SDXL 1.0) 기반 | 로컬 이미지 생성 워크플로 |
| **Figma API** | v1.0 | 자동 배치 및 텍스트/이미지 삽입 |
| **OpenAI API** | GPT-4-Turbo (2025-03 기준) | 스토리라인 및 프롬프트 생성용 |
| **Google Sheets API** | v4 | 입력 데이터 수집 및 파싱용 |

---

## 2. 디렉토리 구조

```text
Riosystem_v1.0/
├─ docs/                      # 프로젝트 문서
├─ src/
│  ├─ api/                    # 데이터 수집/병합/검증 모듈
│  ├─ ai/                     # GPT 스토리빌더
│  ├─ figma/                  # 플러그인 로직
│  ├─ sync/                   # 텍스트·이미지 동기화
│  ├─ qa/                     # 품질검증 스크립트
│  └─ schema/                 # JSON 스키마
├─ comfy/
│  ├─ workflow/               # ComfyUI 노드 그래프
│  └─ input/                  # 리소스 이미지
├─ dist/                      # 중간 산출물
├─ output/                    # 결과 Export
├─ logs/                      # 로그
├─ scripts/                   # 실행 스크립트
└─ package.json
```

---

## 3. 주요 패키지 목록

| 구분 | 패키지명 | 버전 | 용도 |
|------|-----------|------|------|
| **Core** | `typescript` | ^5.4.0 | 타입 안정성 확보 |
|  | `ts-node` | ^10.9.2 | TS 실행 환경 |
|  | `dotenv` | ^16.4.1 | 환경 변수 관리 |
|  | `fs-extra` | ^11.2.0 | 파일 입출력 고도화 |
| **API 연동** | `googleapis` | ^137.0.0 | Google Sheets API |
|  | `openai` | ^4.56.0 | OpenAI GPT 호출 |
|  | `axios` | ^1.6.7 | HTTP 통신 관리 |
| **로컬 처리** | `sharp` | ^0.33.2 | 이미지 전처리 |
|  | `child_process` | 내장 | ComfyUI 배치 실행 제어 |
| **검증·로깅** | `chalk` | ^5.3.0 | 콘솔 로그 컬러링 |
|  | `winston` | ^3.12.0 | 로깅 관리 |
| **기타** | `figma-api` | ^2.1.0 | Figma 자동 배치 |
|  | `pnpm` | ^9.x | 패키지 관리 |

---

## 4. 환경 변수 구성 (.env.example)

| 변수명 | 설명 | 예시 값 |
|--------|------|----------|
| `OPENAI_API_KEY` | OpenAI API Key | `sk-xxxxxx` |
| `GOOGLE_SERVICE_ACCOUNT` | Google Sheets 인증용 서비스 계정 | `service@rio.dev` |
| `FIGMA_TOKEN` | Figma API 토큰 | `12345-abcdefg` |
| `COMFYUI_PATH` | 로컬 ComfyUI 실행 경로 | `C:\ComfyUI` |
| `OUTPUT_DIR` | 결과물 저장 경로 | `./output/` |
| `LOG_DIR` | 로그 저장 경로 | `./logs/` |

> `.env` 파일은 프로젝트 루트 경로에 위치하며  
> `dotenv` 모듈에 의해 자동 로드된다.

---

## 5. 실행 명령어 (pnpm Scripts)

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 (TypeScript watch) |
| `pnpm build` | TS → JS 빌드 |
| `pnpm run generate` | GPT 스토리라인 생성 (StoryBuilder 실행) |
| `pnpm run comfy` | ComfyUI 이미지 일괄 변환 |
| `pnpm run figma` | Figma 자동 배치 실행 |
| `pnpm run qa` | 텍스트/이미지 품질검증 실행 |
| `pnpm run export` | 최종 산출물 Export |
| `pnpm run backup` | Drive 백업 스크립트 실행 |

---

## 6. 버전 호환성 정책

| 구분 | 기준 | 정책 |
|------|------|------|
| **Node/TypeScript** | LTS 버전 기준 | 안정성 우선, 최신 기능은 최소 2개월 검증 후 반영 |
| **OpenAI API** | GPT-4 Turbo | 주요 모델 업데이트 시 프롬프트 리빌드 |
| **ComfyUI 워크플로** | riosys_sdxl_v1.json | 매 버전 업데이트 시 워크플로 백업 자동화 |
| **Figma API** | v1 | Layout/Style 변경 시 플러그인 리비전 동기화 |
| **Google Sheets API** | v4 | 변경 시 스키마 파일 자동 업데이트 |

---

## 7. 개발 환경 요약

| 항목 | 환경 | 설명 |
|------|------|------|
| **IDE** | VSCode 1.95.x | 기본 개발 환경 |
| **버전관리** | Git (로컬) | 단일 개발자 체계 |
| **패키지관리** | pnpm | 의존성 관리 및 속도 향상 |
| **형상관리 정책** | Local Branching | 실무 단위별 분리 (main / dev / test) |
| **테스트 방식** | 수동 검증 + 로그 기반 QA | 자동 QA 모듈 + Excel 리뷰 병행 |

---

## 8. 슬로건

> **“기술은 단순하게, 결과는 강력하게.”**
