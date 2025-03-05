import express from "express";
import {
  addDeviceLinkKey,
  getDeviceLinkedKeyData,
  loginAfterLinkedDeviceSuccssfully,
} from "../controller/linkDeviceController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

// add device link key
router.post("/add-device-link-key", authMiddleware, addDeviceLinkKey);

//get data with device link key
router.get("/get-data-with-device-link-key", getDeviceLinkedKeyData);

router.post(
  "/login-after-link-successfully",
  loginAfterLinkedDeviceSuccssfully
);

export default router;
