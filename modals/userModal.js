import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  image: {
    type: String,
  },
  public_key: {
    type: String,
    default: "",
  },
  passwordHash: String,
  saltHash: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const UserModal = mongoose.model("UserModal", UserSchema);
export default UserModal;
