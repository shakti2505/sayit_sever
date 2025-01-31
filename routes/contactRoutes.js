import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addNewContact, getAllContactByUserId, searchUser } from "../controller/contactController.js";
const router = express.Router();

// search contact by name or email route
router.get("/search-user-by-name-or-email", authMiddleware, searchUser);

// add new contact
router.post("/add-new-contact", authMiddleware, addNewContact);

// get all contact of user
router.get('/get-all-contacts-of-user', authMiddleware, getAllContactByUserId)
export default router;
