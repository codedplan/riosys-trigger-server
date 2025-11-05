import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ 인증 미들웨어
app.use((req, res, next) => {
  const auth = req.headers["authorization"];
  const token = auth?.replace("Bearer ", "");
  if (!token || token !== process.env.RIOSYS_TRIGGER_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// ✅ 트리거 엔드포인트
app.post("/trigger", (req, res) => {
  console.log("✅ Trigger received:", req.body);
  res.json({ status: "ok" });
});

// ✅ 서버 구동
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Trigger server running on port ${PORT}`);
});
