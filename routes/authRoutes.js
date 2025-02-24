import express from "express";
import {
  googleLogin,
  loginWithPassword,
  savePubicKey,
  signUpWithPassword,
} from "../controller/authControler.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// auth route
router.get("/google", googleLogin);

// update public key
router.patch("/update-public-key", authMiddleware, savePubicKey);

// signup with email and password
router.post("/signup", signUpWithPassword);

// Login With Password
router.post("/login", loginWithPassword);
export default router;
