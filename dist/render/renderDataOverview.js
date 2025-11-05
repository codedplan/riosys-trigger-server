"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDataOverview = renderDataOverview;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const ROOT = process.cwd();
const INPUT_JSON = node_path_1.default.join(ROOT, "dist", "grouped_input.json");
const REPORT_DIR = node_path_1.default.join(ROOT, "dist", "report");
const QUEUE_DIR = node_path_1.default.join(ROOT, "dist", "queues");
const LOG_DIR = node_path_1.default.join(ROOT, "logs");
function ensureDirs() {
    [REPORT_DIR, QUEUE_DIR, LOG_DIR].forEach((d) => {
        if (!node_fs_1.default.existsSync(d))
            node_fs_1.default.mkdirSync(d, { recursive: true });
    });
}
function loadInput() {
    if (!node_fs_1.default.existsSync(INPUT_JSON)) {
        throw new Error(`grouped_input.json not found at ${INPUT_JSON}`);
    }
    const raw = node_fs_1.default.readFileSync(INPUT_JSON, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.records || !Array.isArray(parsed.records)) {
        throw new Error("Invalid grouped_input.json: 'records' must be array");
    }
    return parsed;
}
function validateRecord(rec) {
    const issues = [];
    if (!rec.SKU)
        issues.push("SKU missing");
    if (typeof rec.AutoGen !== "boolean")
        issues.push("AutoGen must be boolean");
    if (!rec.BrandCode)
        issues.push("BrandCode missing");
    if (!rec.VarietyCode)
        issues.push("VarietyCode missing");
    if (!rec.StoryId)
        issues.push("StoryId missing");
    if (!rec.Copy?.short?.trim())
        issues.push("Copy.short missing");
    if (!rec.Copy?.long?.trim())
        issues.push("Copy.long missing");
    if (!rec.Prompts?.image?.trim())
        issues.push("Prompts.image missing");
    if (!rec.Prompts?.layout?.trim())
        issues.push("Prompts.layout missing");
    if (!Array.isArray(rec.Assets?.refImages) || rec.Assets.refImages.length === 0)
        issues.push("Assets.refImages missing");
    if (!Array.isArray(rec.Assets?.brandPalette) || rec.Assets.brandPalette.length === 0)
        issues.push("Assets.brandPalette missing");
    if (!rec.Assets?.logoRef)
        issues.push("Assets.logoRef missing");
    return issues;
}
function aggregateKPI(records) {
    const kpi = {
        total: records.length,
        autoGen: records.filter((r) => r.AutoGen === true).length,
        byBrand: {},
        byVariety: {},
        byStory: {},
        missing: {
            copyShort: 0,
            copyLong: 0,
            promptImage: 0,
            promptLayout: 0,
            refImages: 0,
            brandPalette: 0,
            logoRef: 0,
        },
    };
    for (const r of records) {
        kpi.byBrand[r.BrandName || r.BrandCode] = (kpi.byBrand[r.BrandName || r.BrandCode] || 0) + 1;
        kpi.byVariety[r.VarietyName || r.VarietyCode] =
            (kpi.byVariety[r.VarietyName || r.VarietyCode] || 0) + 1;
        kpi.byStory[r.StoryTitle || r.StoryId] = (kpi.byStory[r.StoryTitle || r.StoryId] || 0) + 1;
        if (!r.Copy?.short?.trim())
            kpi.missing.copyShort++;
        if (!r.Copy?.long?.trim())
            kpi.missing.copyLong++;
        if (!r.Prompts?.image?.trim())
            kpi.missing.promptImage++;
        if (!r.Prompts?.layout?.trim())
            kpi.missing.promptLayout++;
        if (!Array.isArray(r.Assets?.refImages) || r.Assets.refImages.length === 0)
            kpi.missing.refImages++;
        if (!Array.isArray(r.Assets?.brandPalette) || r.Assets.brandPalette.length === 0)
            kpi.missing.brandPalette++;
        if (!r.Assets?.logoRef)
            kpi.missing.logoRef++;
    }
    return kpi;
}
function writeJson(filePath, data) {
    node_fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
function toHtmlTable(rows) {
    if (rows.length === 0)
        return "<p>데이터 없음</p>";
    const headers = Object.keys(rows[0]);
    const thead = `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${rows
        .map((r) => `<tr>${headers
        .map((h) => `<td>${String(r[h] ?? "").replace(/</g, "&lt;")}</td>`)
        .join("")}</tr>`)
        .join("")}</tbody>`;
    return `<table>${thead}${tbody}</table>`;
}
function renderHTML(kpi, issues, autoGenRows) {
    const brandRows = Object.entries(kpi.byBrand).map(([k, v]) => ({ Brand: k, Count: v }));
    const varietyRows = Object.entries(kpi.byVariety).map(([k, v]) => ({ Variety: k, Count: v }));
    const storyRows = Object.entries(kpi.byStory).map(([k, v]) => ({ Story: k, Count: v }));
    const autoGenTable = toHtmlTable(autoGenRows.map((r) => ({
        SKU: r.SKU,
        Brand: r.BrandName || r.BrandCode,
        Variety: r.VarietyName || r.VarietyCode,
        Story: r.StoryTitle || r.StoryId,
        Title: r.Title,
    })));
    const issueRows = issues.flatMap((i) => i.issues.map((msg) => ({ SKU: i.SKU, Issue: msg })));
    const issuesTable = toHtmlTable(issueRows);
    const brandTable = toHtmlTable(brandRows);
    const varietyTable = toHtmlTable(varietyRows);
    const storyTable = toHtmlTable(storyRows);
    return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<title>Riosys Data Overview</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  body { font-family: ui-sans-serif, system-ui, -apple-system; margin: 24px; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  .kpis { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
  .card { border:1px solid #e5e7eb; border-radius:12px; padding:16px; box-shadow:0 1px 2px rgba(0,0,0,0.04);}
  table { width:100%; border-collapse: collapse; margin-top:8px; }
  th, td { border:1px solid #e5e7eb; padding:8px; font-size: 12px; }
  th { background:#f9fafb; text-align:left; }
  .grid { display:grid; gap:16px; grid-template-columns: repeat(3, minmax(0,1fr)); }
  .muted { color:#6b7280; font-size:12px; }
  .danger { color:#b91c1c; font-weight:600; }
</style>
</head>
<body>
  <h1>리오시스템_v1.0 · 데이터 오버뷰</h1>
  <div class="muted">생성일: ${new Date().toISOString()}</div>

  <section class="kpis" style="margin-top:12px;">
    <div class="card"><div class="muted">총 레코드</div><div style="font-size:28px;">${kpi.total}</div></div>
    <div class="card"><div class="muted">AUTO_GEN 대상</div><div style="font-size:28px;">${kpi.autoGen}</div></div>
    <div class="card"><div class="muted">결손 자산(이미지/팔레트/로고)</div>
      <div>refImages: <b class="${kpi.missing.refImages > 0 ? "danger" : ""}">${kpi.missing.refImages}</b></div>
      <div>brandPalette: <b class="${kpi.missing.brandPalette > 0 ? "danger" : ""}">${kpi.missing.brandPalette}</b></div>
      <div>logoRef: <b class="${kpi.missing.logoRef > 0 ? "danger" : ""}">${kpi.missing.logoRef}</b></div>
    </div>
    <div class="card"><div class="muted">결손 카피/프롬프트</div>
      <div>Copy.short: <b class="${kpi.missing.copyShort > 0 ? "danger" : ""}">${kpi.missing.copyShort}</b></div>
      <div>Copy.long: <b class="${kpi.missing.copyLong > 0 ? "danger" : ""}">${kpi.missing.copyLong}</b></div>
      <div>Prompt.image: <b class="${kpi.missing.promptImage > 0 ? "danger" : ""}">${kpi.missing.promptImage}</b></div>
      <div>Prompt.layout: <b class="${kpi.missing.promptLayout > 0 ? "danger" : ""}">${kpi.missing.promptLayout}</b></div>
    </div>
  </section>

  <section class="grid" style="margin-top:16px;">
    <div class="card">
      <h2>브랜드 분포</h2>
      ${brandTable}
    </div>
    <div class="card">
      <h2>품종 분포</h2>
      ${varietyTable}
    </div>
    <div class="card">
      <h2>스토리 플롯 분포</h2>
      ${storyTable}
    </div>
  </section>

  <section class="card" style="margin-top:16px;">
    <h2>AUTO_GEN 대상 목록</h2>
    <div class="muted">※ Apps Script의 체크박스 → Boolean 변환 결과 반영</div>
    ${autoGenTable}
  </section>

  <section class="card" style="margin-top:16px;">
    <h2>이슈 로그(결손/형식)</h2>
    ${issuesTable}
  </section>
</body>
</html>`;
}
async function renderDataOverview() {
    ensureDirs();
    const input = loadInput();
    const all = input.records;
    const issues = [];
    const logPath = node_path_1.default.join(LOG_DIR, "data_visual_check.jsonl");
    const logStream = node_fs_1.default.createWriteStream(logPath, { flags: "a", encoding: "utf-8" });
    const nowIso = new Date().toISOString();
    for (const r of all) {
        const errs = validateRecord(r);
        if (errs.length > 0) {
            issues.push({ SKU: r.SKU, issues: errs });
            logStream.write(JSON.stringify({ ts: nowIso, sku: r.SKU, issues: errs }) + "\n");
        }
    }
    logStream.end();
    const kpi = aggregateKPI(all);
    const autoGenRows = all.filter((r) => r.AutoGen === true);
    const queue = autoGenRows.map((r) => {
        const lacks = validateRecord(r).filter((m) => ["Assets.refImages missing", "Assets.brandPalette missing", "Assets.logoRef missing"].includes(m)).length;
        const priority = 100 - (lacks * 20);
        return {
            SKU: r.SKU,
            BrandCode: r.BrandCode,
            StoryId: r.StoryId,
            layoutHint: r.Prompts?.layout || "",
            priority,
        };
    }).sort((a, b) => b.priority - a.priority);
    const html = renderHTML(kpi, issues, autoGenRows);
    const htmlOut = node_path_1.default.join(REPORT_DIR, "data_overview.html");
    node_fs_1.default.writeFileSync(htmlOut, html, "utf-8");
    const jsonOut = node_path_1.default.join(REPORT_DIR, "data_overview.json");
    writeJson(jsonOut, {
        generatedAt: nowIso,
        kpi,
        issueCount: issues.length,
    });
    const queueOut = node_path_1.default.join(QUEUE_DIR, "figma_render_queue.json");
    writeJson(queueOut, { generatedAt: nowIso, items: queue });
    console.log("[OK] Data overview generated:", "\n -", htmlOut, "\n -", jsonOut, "\n -", queueOut, "\n -", logPath);
}
if (require.main === module) {
    renderDataOverview().catch((err) => {
        console.error("[FAIL] renderDataOverview:", err);
        process.exit(1);
    });
}
