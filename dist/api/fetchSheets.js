"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const googleapis_1 = require("googleapis");
const SHEETS = [
    { name: "상품마스터", gid: "0", output: "상품마스터.json" },
    { name: "브랜드가이드", gid: "12345", output: "브랜드가이드.json" },
    { name: "품종사전", gid: "23456", output: "품종사전.json" },
    { name: "스토리플롯", gid: "34567", output: "스토리플롯.json" },
];
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const OUTPUT_DIR = path_1.default.resolve(process.cwd(), "data/sheets");
console.log("🔍 SPREADSHEET_ID:", SPREADSHEET_ID);
if (!SPREADSHEET_ID) {
    throw new Error("환경변수 GOOGLE_SHEET_ID가 로드되지 않았습니다. .env 파일을 확인하세요.");
}
async function fetchSheets() {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = googleapis_1.google.sheets({ version: "v4", auth });
    if (!fs_1.default.existsSync(OUTPUT_DIR))
        fs_1.default.mkdirSync(OUTPUT_DIR, { recursive: true });
    for (const sheet of SHEETS) {
        console.log(`📥 시트 요청 중: ${sheet.name}`);
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: sheet.name,
        });
        const [header, ...rows] = res.data.values || [];
        const json = rows.map((r) => {
            const obj = {};
            header.forEach((h, i) => (obj[h] = r[i] || ""));
            return obj;
        });
        fs_1.default.writeFileSync(path_1.default.join(OUTPUT_DIR, sheet.output), JSON.stringify(json, null, 2), "utf-8");
        console.log(`✅ ${sheet.name} → ${sheet.output} 저장 완료 (${json.length}건)`);
    }
    console.log("🎉 모든 시트 데이터가 성공적으로 저장되었습니다.");
}
fetchSheets().catch((err) => {
    console.error("❌ fetchSheets 오류:", err);
    process.exit(1);
});
