import express from "express";
import {
  addDeviceLinkKey,
  getDeviceLinkedKeyData,
  googleLogin,
  loginWithPassword,
  logoutUser,
  refreshAccessToken,
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

// refresh access token
router.post("/refresh-accessToken", refreshAccessToken);

// logout user
router.post("/logout", authMiddleware, logoutUser);

// add device link key
router.post("/add-device-link-key", authMiddleware, addDeviceLinkKey);

//get data with device link key
router.get(
  "/get-data-with-device-link-key",
  authMiddleware,
  getDeviceLinkedKeyData
);

export default router;
