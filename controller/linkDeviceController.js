import LinkDeviceModal from "../modals/linkedDeviceModal.js";
import UserModal from "../modals/userModal.js";
import crypto from "crypto";
export const addDeviceLinkKey = async (req, res) => {
  const { encryptedData, iv, salt } = req.body;
  if (!encryptedData || !iv || !salt)
    return res.status(401).json({ message: "No device Link key found" });
  try {
    // check if device link key exists
    const existingKey = await LinkDeviceModal.findOne({
      user_id: req.user._id,
    });
    if (existingKey)
      return res.status(200).json({
        message: "Device Link key Already created",
        key: existingKey.deviceLinkKey,
      });

    // if no key exists then fetch the user and create a new key
    const keyID = crypto.randomUUID();
    const DeviceLinkData = await LinkDeviceModal.create({
      deviceLinkKey: keyID,
      deviceLinkEncryptedKey: encryptedData,
      deviceLinkIv: iv,
      deviceLinkSalt: salt,
      user_id: req.user._id,
    });
    return res.status(201).json({
      message: "Device Link key added successfully",
      key: DeviceLinkData.deviceLinkKey,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getDeviceLinkedKeyData = async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) {
      return res.status(401).json({ message: "No key found" });
    }

    // if key found
    const response = await LinkDeviceModal.findOne({ deviceLinkKey: key });
    if (response) {
      return res.status(200).json(response);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const loginAfterLinkedDeviceSuccssfully = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ message: "No user id found" });
    const user = await UserModal.findOne(user_id);
    const { refreshToken, accessToken } =
      await genrateRefreshTokenAndAccessToken(user._id, user.email);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 3 * 60 * 60 * 5000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res
      .status(200)
      .cookie()
      .json({ message: "success", accessToken, user, user_id: _id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
