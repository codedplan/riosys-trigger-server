import express from "express";
import "dotenv/config";

const app = express();
app.use(express.json());

// ✅ 환경변수 로드
const PORT = process.env.PORT || process.env.RIOSYS_TRIGGER_PORT || 3000;
const TOKEN = process.env.RIOSYS_TRIGGER_TOKEN;

// ✅ 헬스체크 (Render 모니터링용)
app.get("/health", (_req: any, res: any) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

// ✅ 인증 미들웨어 (Bearer 토큰 검증)
app.use((req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.replace("Bearer ", "");

  if (!token || token !== TOKEN) {
    console.warn("⚠️ Unauthorized access attempt detected");
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
});

// ✅ 트리거 엔드포인트 (Mock 테스트 버전)
app.post("/trigger", async (req: any, res: any) => {
  try {
    console.log("▶ 자동화 파이프라인 시작...");
    console.log("→ 1️⃣ fetchSheets 실행 중... (mock)");
    // execSync("node dist/api/fetchSheets.js", { stdio: "inherit" });

    console.log("→ 2️⃣ mergeBySKU 실행 중... (mock)");
    // execSync("node dist/mergeBySKU.js", { stdio: "inherit" });

    console.log("→ 3️⃣ renderDataOverview 실행 중... (mock)");
    // execSync("node dist/render/renderDataOverview.js", { stdio: "inherit" });

    console.log("✅ 모든 단계 완료!");
    res.status(200).json({ status: "ok", message: "Pipeline complete (mock)" });
  } catch (err: any) {
    console.error("❌ 파이프라인 실행 오류:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ✅ 루트 기본 경로 (테스트용)
app.get("/", (_req: any, res: any) => {
  res.status(200).json({ status: "server alive" });
});

// ✅ 서버 기동
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Trigger server listening on port ${PORT}`);
});
