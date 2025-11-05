"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const papaparse_1 = __importDefault(require("papaparse"));
function loadCSV(filePath) {
    const csvText = fs_1.default.readFileSync(filePath, "utf8");
    const parsed = papaparse_1.default.parse(csvText, { header: true, skipEmptyLines: true });
    return parsed.data;
}
function mergeBySKU() {
    const ROOT = process.cwd();
    const basePath = path_1.default.resolve(ROOT, "data/sheets");
    const products = loadCSV(path_1.default.join(basePath, "상품마스터.csv"));
    const brands = loadCSV(path_1.default.join(basePath, "브랜드가이드.csv"));
    const varieties = loadCSV(path_1.default.join(basePath, "품종사전.csv"));
    const stories = loadCSV(path_1.default.join(basePath, "스토리플롯.csv"));
    const brandMap = {};
    brands.forEach((b) => (brandMap[b["브랜드코드"]] = b));
    const varietyMap = {};
    varieties.forEach((v) => (varietyMap[v["품종코드"]] = v));
    const storyMap = {};
    stories.forEach((s) => (storyMap[s["스토리ID"]] = s));
    const merged = products.map((p) => {
        const brandCode = String(p["브랜드코드"] || "").trim();
        const varietyCode = String(p["품종코드"] || "").trim();
        const storyId = String(p["스토리ID"] || "").trim();
        const brand = brandMap[brandCode] || {};
        const variety = varietyMap[varietyCode] || {};
        const story = storyMap[storyId] || {};
        const autoGen = typeof p["AUTO_GEN"] === "boolean"
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
    const outputDir = path_1.default.resolve(ROOT, "dist");
    if (!fs_1.default.existsSync(outputDir))
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    const outputPath = path_1.default.join(outputDir, "grouped_input.json");
    const output = {
        records: merged,
        source: "Riosys_Input.gsheet|mergeBySKU",
        generatedAt: new Date().toISOString(),
    };
    fs_1.default.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");
    console.log("✅ 병합 완료 → dist/grouped_input.json 생성됨 (records 구조 적용)");
}
try {
    mergeBySKU();
}
catch (err) {
    console.error("❌ 병합 실패:", err);
    process.exit(1);
}
