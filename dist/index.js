"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    const auth = req.headers["authorization"];
    const token = auth?.replace("Bearer ", "");
    if (!token || token !== process.env.RIOSYS_TRIGGER_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
});
app.post("/trigger", (req, res) => {
    console.log("✅ Trigger received:", req.body);
    res.json({ status: "ok" });
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Trigger server running on port ${PORT}`);
});
