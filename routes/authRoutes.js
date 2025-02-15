import express from "express";
import { googleLogin, savePubicKey } from "../controller/authControler.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// auth route
router.get("/google", googleLogin);

router.patch("/update-public-key", authMiddleware, savePubicKey);
export default router;
