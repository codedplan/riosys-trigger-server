import express from "express";
import "dotenv/config";
import { execSync } from "child_process";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || process.env.RIOSYS_TRIGGER_PORT || 3000;
const TOKEN = process.env.RIOSYS_TRIGGER_TOKEN;

// ✅ any 타입 명시 (빌드 오류 방지용)
app.get("/health", (_req: any, res: any) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

app.post("/trigger/render", async (req: any, res: any) => {
  const token = req.query.token || req.body?.token;
  if (token !== TOKEN) {
    return res.status(403).json({ error: "Invalid token" });
  }

  try {
    console.log("▶ 자동화 파이프라인 시작...");
    console.log("→ 1️⃣ fetchSheets 실행 중...");
    execSync("node dist/api/fetchSheets.js", { stdio: "inherit" });

    console.log("→ 2️⃣ mergeBySKU 실행 중...");
    execSync("node dist/mergeBySKU.js", { stdio: "inherit" });

    console.log("→ 3️⃣ renderDataOverview 실행 중...");
    execSync("node dist/render/renderDataOverview.js", { stdio: "inherit" });

    console.log("✅ 모든 단계 완료!");
    res.status(200).json({ status: "ok", message: "Pipeline complete" });
  } catch (err: any) {
    console.error("❌ 파이프라인 실행 오류:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Trigger server listening on http://localhost:${PORT}`);
});
