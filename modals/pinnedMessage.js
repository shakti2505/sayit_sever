import mongoose from "mongoose";
import ChatGroupModal from "./chatGroupModal.js";
import groupChatModal from "./groupChatModal.js";
import UserModal from "./userModal.js";

const pinnedMessageSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserModal,
      required: true,
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ChatGroupModal,
      required: true,
    },
    message_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: groupChatModal,
      required: true,
    },
    expireAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

pinnedMessageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const pinnedMessageModal = mongoose.model("pinnedMessage", pinnedMessageSchema);
export default pinnedMessageModal;
