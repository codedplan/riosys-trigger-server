/** =====================================================================
 * 📄 File: mergeBySKU.ts
 * 목적: /data/sheets/*.csv 4종(상품마스터, 브랜드가이드, 품종사전, 스토리플롯)을 SKU 기준으로 병합
 * 결과: /dist/grouped_input.json 생성
 * 실무형 버전 – Node 환경(TypeScript + CSV 파서)
 * ===================================================================== */

import fs from "fs";
import path from "path";
import Papa from "papaparse";

interface ProductRow {
  SKU: string;
  상품명: string;
  브랜드코드: string;
  품종코드: string;
  스토리ID: string;
  AUTO_GEN?: string | boolean;
  [key: string]: any;
}

/** ✅ CSV 파일 로드 유틸 */
function loadCSV(filePath: string): any[] {
  const csvText = fs.readFileSync(filePath, "utf8");
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return parsed.data;
}

/** ✅ 병합 로직 */
function mergeBySKU() {
  // ✅ 빌드 후에도 항상 프로젝트 루트 기준으로 동작
  const ROOT = process.cwd();
  const basePath = path.resolve(ROOT, "data/sheets");

  const products = loadCSV(path.join(basePath, "상품마스터.csv"));
  const brands = loadCSV(path.join(basePath, "브랜드가이드.csv"));
  const varieties = loadCSV(path.join(basePath, "품종사전.csv"));
  const stories = loadCSV(path.join(basePath, "스토리플롯.csv"));

  // 코드별 매핑 테이블
  const brandMap: Record<string, any> = {};
  brands.forEach((b) => (brandMap[b["브랜드코드"]] = b));

  const varietyMap: Record<string, any> = {};
  varieties.forEach((v) => (varietyMap[v["품종코드"]] = v));

  const storyMap: Record<string, any> = {};
  stories.forEach((s) => (storyMap[s["스토리ID"]] = s));

  // 병합
  const merged = products.map((p) => {
    const brandCode = String(p["브랜드코드"] || "").trim();
    const varietyCode = String(p["품종코드"] || "").trim();
    const storyId = String(p["스토리ID"] || "").trim();

    const brand = brandMap[brandCode] || {};
    const variety = varietyMap[varietyCode] || {};
    const story = storyMap[storyId] || {};

    // AUTO_GEN을 boolean으로 정규화
    const autoGen =
      typeof p["AUTO_GEN"] === "boolean"
        ? p["AUTO_GEN"]
        : String(p["AUTO_GEN"]).toLowerCase() === "true";

    return {
      SKU: p["SKU"],
      상품명: p["상품명"],
      브랜드: brand,
      품종: variety,
      스토리: story,
      AUTO_GEN: autoGen,
    };
  });

  // ✅ 결과 저장 (프로젝트 루트 기준 dist)
  const outputDir = path.resolve(ROOT, "dist");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "grouped_input.json");

  // ✅ renderDataOverview.ts 호환 구조
  const output = {
    records: merged,
    source: "Riosys_Input.gsheet|mergeBySKU",
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");

  console.log("✅ 병합 완료 → dist/grouped_input.json 생성됨 (records 구조 적용)");
}

// ✅ 함수 실행
try {
  mergeBySKU();
} catch (err) {
  console.error("❌ 병합 실패:", err);
  process.exit(1);
}
