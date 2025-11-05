/** =====================================================================
 * 📄 File: fetchSheets.ts
 * 목적: Google Sheets API를 통해 각 시트 탭 데이터를 JSON으로 파싱
 * 결과: /data/sheets/*.json 저장
 * ===================================================================== */

import "dotenv/config";
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

// ✅ 환경변수 점검
if (!SPREADSHEET_ID) {
  throw new Error("환경변수 GOOGLE_SHEET_ID가 누락되었습니다.");
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  throw new Error("환경변수 GOOGLE_APPLICATION_CREDENTIALS_BASE64가 누락되었습니다.");
}

async function fetchSheets() {
  try {
    // ✅ 1️⃣ Render 환경용 Base64 키 디코딩
    const base64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64!;
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const credentials = JSON.parse(decoded);

    // ✅ 2️⃣ Google 인증 생성 (파일 경로가 아닌 credentials 직접 주입)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ✅ 출력 폴더 없으면 생성
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // ✅ 3️⃣ 시트별 데이터 요청
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

      // ✅ JSON 파일 저장
      fs.writeFileSync(
        path.join(OUTPUT_DIR, sheet.output),
        JSON.stringify(json, null, 2),
        "utf-8"
      );

      console.log(`✅ ${sheet.name} → ${sheet.output} 저장 완료 (${json.length}건)`);
    }

    console.log("🎉 모든 시트 데이터가 성공적으로 저장되었습니다.");
  } catch (err: any) {
    console.error("❌ fetchSheets 오류:", err);
    process.exit(1);
  }
}

// ✅ 실행
fetchSheets();
