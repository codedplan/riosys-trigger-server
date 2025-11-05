/** =====================================================================
 * 📄 File: fetchSheets.ts
 * 목적: Google Sheets API를 통해 각 시트 탭 데이터를 JSON으로 파싱
 * 결과: /data/sheets/*.json 저장
 * ===================================================================== */

import "dotenv/config";
import fs from "fs";
import path from "path";
import os from "os";
import { google } from "googleapis";

interface SheetConfig {
  name: string;
  gid: string;
  output: string;
}

const SHEETS: SheetConfig[] = [
  { name: "상품마스터", gid: "0", output: "상품마스터.json" },
  { name: "브랜드가이드", gid: "12345", output: "브랜드가이드.json" },
  { name: "품종사전", gid: "23456", output: "품종사전.json" },
  { name: "스토리플롯", gid: "34567", output: "스토리플롯.json" },
];

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const OUTPUT_DIR = path.resolve(process.cwd(), "data/sheets");

// ✅ 환경변수 점검
if (!SPREADSHEET_ID) {
  throw new Error("환경변수 GOOGLE_SHEET_ID가 누락되었습니다.");
}

// ✅ 키는 Base64 또는 JSON 원문 중 하나만 쓰게 합니다.
const base64Env = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
const jsonEnv   = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!base64Env && !jsonEnv) {
  throw new Error("환경변수 GOOGLE_APPLICATION_CREDENTIALS_BASE64 또는 GOOGLE_APPLICATION_CREDENTIALS_JSON 가 필요합니다.");
}

// ✅ 키 파싱 + 개행/이스케이프 정규화
function loadCredentials() {
  let raw: string;

  if (base64Env) {
    raw = Buffer.from(base64Env, "base64").toString("utf-8");
  } else {
    raw = jsonEnv!;
  }

  const obj = JSON.parse(raw);

  // private_key 정규화: \\n → \n, CRLF → \n, 앞뒤 공백 제거
  if (typeof obj.private_key === "string") {
    obj.private_key = obj.private_key
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
  }

  if (
    !obj.client_email ||
    !obj.private_key ||
    !obj.private_key.includes("BEGIN") ||
    !obj.private_key.includes("PRIVATE KEY")
  ) {
    throw new Error("서비스 계정 키 형식이 올바르지 않습니다. client_email / private_key 를 확인하세요.");
  }

  return obj;
}

async function fetchSheets() {
  try {
    const credentials = loadCredentials();

    // ✅ JWT 클라이언트로 직접 인증(파일 경로/ADC 미사용)
    const jwt = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth: jwt });

    // (선택) OpenSSL 문제 회피용: 임시 파일로 키를 내려 쓰고 GOOGLE_APPLICATION_CREDENTIALS 설정
    // 일부 런타임에서 PEM 파서가 문자열보다 파일 경로를 더 안정적으로 처리하는 경우가 있습니다.
    const tmpKeyPath = path.join(os.tmpdir(), "gsa-key.json");
    fs.writeFileSync(tmpKeyPath, JSON.stringify(credentials));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpKeyPath;

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    for (const sheet of SHEETS) {
      console.log(`📥 시트 요청 중: ${sheet.name}`);

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID!,
        range: sheet.name,
      });

      const [header, ...rows] = res.data.values || [];
      const json = rows.map((r) => {
        const obj: Record<string, string> = {};
        header.forEach((h: string, i: number) => (obj[h] = r[i] || ""));
        return obj;
      });

      fs.writeFileSync(
        path.join(OUTPUT_DIR, sheet.output),
        JSON.stringify(json, null, 2),
        "utf-8"
      );

      console.log(`✅ ${sheet.name} → ${sheet.output} 저장 완료 (${json.length}건)`);
    }

    console.log("🎉 모든 시트 데이터가 성공적으로 저장되었습니다.");
  } catch (err: any) {
    // 에러 유형별 힌트
    const msg = String(err && err.message ? err.message : err);
    if (msg.includes("invalid_grant")) {
      console.error("❌ fetchSheets 오류: invalid_grant (JWT 서명을 검증하지 못함) — 대부분 private_key 개행/이스케이프 또는 키 손상/불일치 문제입니다.");
    } else if (msg.includes("ERR_OSSL_UNSUPPORTED") || msg.includes("DECODER routines::unsupported")) {
      console.error("❌ fetchSheets 오류: OpenSSL 디코더가 키를 해석하지 못함 — 키 포맷/개행 또는 런타임/라이브러리 호환 이슈입니다.");
    } else {
      console.error("❌ fetchSheets 오류:", err);
    }
    process.exit(1);
  }
}

// ✅ 실행
fetchSheets();
