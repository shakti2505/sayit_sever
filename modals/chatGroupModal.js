import mongoose from "mongoose";
import User from "./userModal.js";

const memberSchema = new mongoose.Schema({
  member_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  member_name: {
    type: String,
    required: true,
  },
  member_image: {
    type: String,
  },
  publicKey: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const encryptAESKeyForGroupSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  encryptedAESKey: {
    type: String,
  },
});

const chatGroup = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  group_admin: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: User,
    required: true,
  },
  group_picture: {
    type: String,
  },
  members: {
    type: [memberSchema], // Use an array of subdocuments
    default: [],
    required: true,
  },
  encryptAESKeyForGroup: {
    type: [encryptAESKeyForGroupSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

// Create an index on `createdAt` field (ascending order to get older items first)
chatGroup.index({ createdAt: 1 });

const ChatGroupModal = mongoose.model("ChatGroupModal", chatGroup);
export default ChatGroupModal;
