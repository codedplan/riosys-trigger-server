"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = process.env.PORT || process.env.RIOSYS_TRIGGER_PORT || 3000;
const TOKEN = process.env.RIOSYS_TRIGGER_TOKEN;
app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, ts: new Date().toISOString() });
});
app.use((req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.replace("Bearer ", "");
    if (!token || token !== TOKEN) {
        console.warn("⚠️ Unauthorized access attempt detected");
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
});
app.post("/trigger", async (req, res) => {
    try {
        console.log("▶ 자동화 파이프라인 시작...");
        console.log("→ 1️⃣ fetchSheets 실행 중... (mock)");
        console.log("→ 2️⃣ mergeBySKU 실행 중... (mock)");
        console.log("→ 3️⃣ renderDataOverview 실행 중... (mock)");
        console.log("✅ 모든 단계 완료!");
        res.status(200).json({ status: "ok", message: "Pipeline complete (mock)" });
    }
    catch (err) {
        console.error("❌ 파이프라인 실행 오류:", err);
        res.status(500).json({ error: String(err) });
    }
});
app.get("/", (_req, res) => {
    res.status(200).json({ status: "server alive" });
});
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Trigger server listening on port ${PORT}`);
});
