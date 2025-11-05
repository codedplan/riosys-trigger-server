/** =====================================================================
 * 📄 File: fetchSheets.ts
 * 목적: Google Sheets API를 통해 각 시트 탭 데이터를 JSON으로 파싱
 * 결과: /data/sheets/*.json 저장
 * ===================================================================== */

import "dotenv/config"; // ✅ .env 파일 로드 (GOOGLE_SHEET_ID 등 환경변수 사용 가능)
import fs from "fs";
import path from "path";
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

// ✅ 환경변수 디버그 출력
console.log("🔍 SPREADSHEET_ID:", SPREADSHEET_ID);
if (!SPREADSHEET_ID) {
  throw new Error("환경변수 GOOGLE_SHEET_ID가 로드되지 않았습니다. .env 파일을 확인하세요.");
}

async function fetchSheets() {
  // ✅ Google 인증 초기화
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // ✅ 시트별 데이터 가져오기
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
}

// ✅ 실행
fetchSheets().catch((err) => {
  console.error("❌ fetchSheets 오류:", err);
  process.exit(1);
});
