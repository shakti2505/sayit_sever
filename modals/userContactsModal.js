import mongoose from "mongoose";
import UserModal from "./userModal.js";

const UserContactSschema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: UserModal,
  },
  contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: UserModal,
  },
  contact_name: {
    type: String,
    required: true,
  },
  contact_image: {
    type: String,
  },
  contact_email: {
    type: String,
  },
  contact_public_key: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const UserContactModal = mongoose.model("UserContacts", UserContactSschema);
export default UserContactModal;
