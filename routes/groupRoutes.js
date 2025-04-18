import express from "express";
import {
  addContactsToGroup,
  createGroup,
  deleteGroup,
  generate_group_link,
  getAllGroupOfUser,
  getGroupById,
  updateGroup,
} from "../controller/groupController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getGroupUsers,
  storeUsersInGroup,
} from "../controller/chatGroupUserController.js";
import {
  getGroupChatsById,
  searchMessgesInGroup,
  updateMessageReadStatus,
} from "../controller/chatsController.js";

const router = express.Router();

// chat group route
// router.post("/create-chat-group", authMiddleware, (req, res) => createGroup(req, res, req.io));

router.post("/create-chat-group", authMiddleware, createGroup);

// getAllGroupOfUser

router.get("/chat-groups", authMiddleware, getAllGroupOfUser);

// get group by Id

router.get("/chat-group/:id", getGroupById);

// update group name or image
router.patch("/chat-group-update/:id", authMiddleware, updateGroup);

// delete group

router.delete("/delete-group/:id", authMiddleware, deleteGroup);

// chat group Users
router.get("/chat-group-users/:group_id", getGroupUsers);

// store user in group
router.post("/create-chat-group-user", storeUsersInGroup);

// group chats route
router.get("/get-group-chats/:group_id", getGroupChatsById);

// generate link route
router.post("/generate-group-link/:group_id", generate_group_link);

// search messges in group route
router.get("/search-messages", searchMessgesInGroup);

// update message status "is read" to true;

router.patch(
  "/update-message-status/:messageId",
  authMiddleware,
  updateMessageReadStatus
);

// add Contacts to group
router.patch("/add-contacts-to-group", addContactsToGroup);

export default router;
