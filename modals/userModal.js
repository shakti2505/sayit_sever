import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  image: {
    type: String,
  },
  public_key: {
    type: String,
    default: "",
  },
  passwordHash: {
    type: String,
    required: [true, "password is required"],
  },
  saltHash: String,
  refreshToken: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const UserModal = mongoose.model("UserModal", UserSchema);
export default UserModal;
