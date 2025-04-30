import express from "express";
import { pinMessage, getPinnedMessage } from "../controller/pinnedMessageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// pin message route
router.post("/pin-message", authMiddleware,pinMessage);

// get pinned messages
router.get('/get-pinned-message', authMiddleware,getPinnedMessage);

export default router;
