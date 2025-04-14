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

// reaction schema
const ReactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
); // Avoid creating a separate _id for each reaction

// main message schema
const groupChatSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true }, // Explicitly define `_id`

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
    reactions: [ReactionSchema],
    isRead: {
      type: [isReadBy],
      default: [],
    },
    isReceived: {
      type: [isReceivedBy],
      default: [],
    },
  },
  { timestamps: true }
);

groupChatSchema.index({ createdAt: 1 });

const groupChatModal = mongoose.model("GroupChats", groupChatSchema);
export default groupChatModal;
