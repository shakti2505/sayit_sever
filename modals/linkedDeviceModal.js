import mongoose, { trusted } from "mongoose";
import { stringify } from "querystring";

const LinkDeiveSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  deviceLinkKey: {
    type: String,
    required: true,
  },
  deviceLinkEncryptedKey: {
    type: String,
    required: true,
  },
  deviceLinkIv: {
    type: String,
    required: true,
  },
  deviceLinkSalt: {
    type: String,
    required: true,
  },
});

const LinkDeviceModal = mongoose.model("LinkDeviceModal", LinkDeiveSchema);
export default LinkDeviceModal;
