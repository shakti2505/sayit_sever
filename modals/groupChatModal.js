import mongoose from "mongoose";
import UserModal from "./userModal.js";

const isReadBy = new mongoose.Schema({
  member_id: {
    type: String,
  },
});
const isReceivedBy = new mongoose.Schema({
  member_id: {
    type: String,
  },
});

const groupChatSchema = new mongoose.Schema(
  {
    receiver_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Multiple receivers
      },
    ],
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserModal,
      required: true,
    },
    group_id: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    name: String,
    isReply: { type: Boolean, default: false },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupChats",
      default: null,
    },
   
    isRead: {
      type: [isReadBy],
      default: [],
    },
    isReceived: {
      type: [isReceivedBy],
      default: [],
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: true }
);

groupChatSchema.index({ createdAt: 1 });

const groupChatModal = mongoose.model("GroupChats", groupChatSchema);
export default groupChatModal;
