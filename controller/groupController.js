import dotenv from "dotenv";
dotenv.config();
import ChatGroupModal from "../modals/chatGroupModal.js";
import UserModal from "../modals/userModal.js";
import groupChatModal from "../modals/groupChatModal.js";
import { encryptAESKeyForGroup } from "../utils/encryption/generate_keys.js";
import { cachedWithRedis, getWithRedis } from "../utils/RedisCached.js";

// create group
export const createGroup = async (req, res) => {
  try {
    const { selectedUsers, group_picture, name } = req.body;
    const user = req.user;

    // extracting selected members in a new array
    const selectedMembers = selectedUsers.map(
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

    // creating admin object to push in member's array
    const groupCreater = {
      member_id: user._id,
      member_name: loggedInUser.name,
      member_image: loggedInUser.image,
      publicKey: loggedInUser.public_key,
      isAdmin: true,
    };

    // pushing group creator deatails in the member's array
    await selectedMembers.push(groupCreater);

    // creating the group with group member's array
    const NewGroup = await ChatGroupModal.create({
      name,
      group_admin: user._id,
      members: selectedMembers,
      group_picture,
    });

    // // saving welcome message to group
    // await groupChatModal.create({
    //   group_id: NewGroup._id,
    //   message: `WECOME TO THE ${NewGroup.name}...`,
    //   name: "system",
    //   sender_id: "system",
    // });

    // once group is created we are generating AES key, then to encrypt it with the public keys of group members and saving it with the group
    const encryptedAesKeysForGroupMembers = await encryptAESKeyForGroup(
      NewGroup.members
    );

    // saving the encrypted AES key of group members
    await ChatGroupModal.findByIdAndUpdate(NewGroup._id, {
      encryptAESKeyForGroup: encryptedAesKeysForGroupMembers,
    });
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
    // get value from redis
    const cachedValue = await getWithRedis("AllGroupOfUser");
    if (cachedValue)
      return res.status(200).json({ groups: JSON.parse(cachedValue) });

    const groups = await ChatGroupModal.find({
      "members.member_id": user._id,
    });
    await cachedWithRedis("AllGroupOfUser", groups);

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
    const cachedValue = await getWithRedis(id);
    if (cachedValue)
      return res.status(200).json({
        message: "Chat Group fetched successfully",
        data: JSON.parse(cachedValue),
      });

    const group = await ChatGroupModal.findById(id);
    await cachedWithRedis(id, group);

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
    const { name, imageUrl } = req.body;
    const { id } = req.params;
    if (name) {
      const updatedGroup = await ChatGroupModal.findByIdAndUpdate(
        id,
        { $set: { name: name } },
        { new: true } // return the updated document
      );
      return res
        .status(201)
        .json({ message: "Group updated successfully", data: updatedGroup });
    }
    if (imageUrl) {
      const updatedGroup = await ChatGroupModal.findByIdAndUpdate(
        id,
        { $set: { group_picture: imageUrl } },
        { new: true } // return the updated document
      );

      return res
        .status(201)
        .json({ message: "Group updated successfully", data: updatedGroup });
    }
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

// add new members to group
export const addContactsToGroup = async (req, res) => {
  try {
    const { selectedContacts, groupId, encryptedAesKeysOfContacts } = req.body;
    if (
      selectedContacts.length === 0 ||
      !groupId ||
      encryptedAesKeysOfContacts.length === 0
    ) {
      return res.status(401).json({ message: "selected Contacts not found" });
    }

    const selectedMembers = req.body.selectedContacts.map(
      ({ contact_id, contact_name, contact_image, contact_public_key }) => {
        return {
          member_id: contact_id,
          member_name: contact_name,
          member_image: contact_image,
          publicKey: contact_public_key,
        };
      }
    );

    // updating the chat group memebers array
    const newMembers = await ChatGroupModal.findOneAndUpdate(
      { _id: groupId }, // The ID of the group you want to update
      {
        $addToSet: {
          members: { $each: selectedMembers },
          encryptAESKeyForGroup: { $each: encryptedAesKeysOfContacts },
        },
      }, // Add new members, $addToSet ensure ony unique members added $each allow multiple entry at once
      { new: true } //
    );

    // updating redis cache
    await cachedWithRedis("AllGroupOfUser", newMembers);

    return res
      .status(201)
      .json({ message: "Members added successfully", data: newMembers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
