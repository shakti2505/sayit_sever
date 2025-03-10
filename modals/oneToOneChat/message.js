import mongoose, { mongo, Mongoose } from "mongoose";
import User from "../userModal.js";
const messageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
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
    mediaUrl: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deletedBy: {
      type: [mongoose.Schema.Types.ObjectId], // Track who deleted the message
      ref: "User",
      default: [],
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const messageModal = mongoose.model("OneToOneMessage", messageSchema);
export default messageModal;
