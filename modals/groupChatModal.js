import mongoose from "mongoose";

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

const groupChatSchema = new mongoose.Schema({
  sender_id: {
    type: String,
    required: true,
  },
  group_id: {
    type: String,
    required: true,
  },
  message: String,
  iv: String,
  name: String,
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
});

groupChatSchema.index({ createdAt: 1 });

const groupChatModal = mongoose.model("Group chats", groupChatSchema);
export default groupChatModal;
