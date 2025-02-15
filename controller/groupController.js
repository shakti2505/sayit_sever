import dotenv from "dotenv";
dotenv.config();
import ChatGroupModal from "../modals/chatGroupModal.js";
import UserModal from "../modals/userModal.js";
import { io } from "../app.js";
import groupChatModal from "../modals/groupChatModal.js";
import {
  encryptAESKeyForGroup,
  generateAESkey,
} from "../utils/encryption/generate_keys.js";

// create group
export const createGroup = async (req, res) => {
  try {
    const body = req.body;
    const user = req.user;

    // extracting selected members in a new array
    const selectedMembers = req.body.selectedUsers.map(
      ({ contact_id, contact_name, contact_image, contact_public_key }) => {
        return {
          member_id: contact_id,
          member_name: contact_name,
          member_image: contact_image,
          publicKey: contact_public_key,
        };
      }
    );

    // extracting logged in user
    const loggedInUser = await UserModal.findById(user._id);

    // creating adming object to push in member's array
    const groupCreater = {
      member_id: user._id,
      member_name: loggedInUser.name,
      member_image: loggedInUser.image,
      publicKey: loggedInUser.public_key,
      isAdmin: true,
    };

    // pushing group creator deatails in teh member's array
    await selectedMembers.push(groupCreater);

    // creating the group with group member's array
    const NewGroup = await ChatGroupModal.create({
      name: body.name,
      passcode: body.passcode,
      group_admin: user._id,
      members: selectedMembers,
    });

    // saving welcome message to group
    await groupChatModal.create({
      group_id: NewGroup._id,
      message: `WECOME TO THE ${NewGroup.name}...`,
      name: "system",
      sender_id: "system",
      isRead: true,
      isReceived: true,
    });

    // once group is created we are generating AES key, then to encrypt it with the public keys of group members and saving it with the group
    const encryptedAesKeysForGroupMembers = await encryptAESKeyForGroup(
      NewGroup.members
    );
    // saving the encrypted AES key of group members
    await ChatGroupModal.findByIdAndUpdate(NewGroup._id, {
      encryptAESKeyForGroup: encryptedAesKeysForGroupMembers,
    });
    console.log(
      "encryptedAesKeysForGroupMembers",
      encryptedAesKeysForGroupMembers
    );

    return res
      .status(201)
      .json({ message: "Group created successfully", data: NewGroup });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// get all grouo created by user
export const getAllGroupOfUser = async (req, res) => {
  try {
    const user = req.user;
    // const groups = await ChatGroupModal.find({ group_admin: user._id }).sort({
    //   createdAt: -1,
    // });
    const groups = await ChatGroupModal.find({
      "members.member_id": user._id,
    });

    return res
      .status(200)
      .json({ message: "Chat Groups fetched successfully", groups: groups });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// get group by Id
export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await ChatGroupModal.findById(id);
    return res
      .status(200)
      .json({ message: "Chat Group fetched successfully", data: group });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// update group
export const updateGroup = async (req, res) => {
  try {
    const { name, passcode } = req.body;
    const { id } = req.params;
    const updatedGroup = await ChatGroupModal.findByIdAndUpdate(
      id,
      { $set: { name: name, passcode: passcode } },
      { new: true } // return the updated document
    );
    return res
      .status(201)
      .json({ message: "Group updated successfully", data: updatedGroup });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// delete group
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    await ChatGroupModal.findByIdAndDelete(id);
    return res.status(200).json({ message: "Group Deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// generate group-link
export const generate_group_link = (req, res) => {
  const { group_id } = req.params;
  try {
    if (!group_id) {
      return res.status(400).json({ message: "Group Id is not found" });
    }

    const baseURL = `${process.env.CLIENT_URL}/#/chats`;
    const uniqueLink = `${baseURL}/${group_id}`;
    return res.status(201).json({ link: uniqueLink });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal Server error, Please try again!" });
  }
};
