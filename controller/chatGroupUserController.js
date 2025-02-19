import ChatGroupModal from "../modals/chatGroupModal.js";
import GroupUsersModal from "../modals/groupUsersModal.js";

// get All group users by group_id
export const getGroupUsers = async (req, res) => {
  try {
    const { group_id } = req.params;
    const users = await GroupUsersModal.find({
      chatgroup: group_id,
    }).sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ message: "Group Users Fetched Successfully.", data: users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// store user in group
export const storeUsersInGroup = async (req, res) => {
  try {
    const { name, group_id, user_id, key } = req.body;
    console.log(key);
    // check if user is already a group memeber.
    const IsMember = await GroupUsersModal.findOne({
      user_id: user_id,
      chatgroup: group_id,
    });

    if (IsMember) {
      return res.status(200).json({ message: "User already a group member." });
    }

    const user = await GroupUsersModal.create({
      name,
      chatgroup: group_id,
      user_id,
    });
    if (key != null) {
      // adding user id and public key of the user in the group memebers details
      await ChatGroupModal.findByIdAndUpdate(group_id, {
        $push: {
          members: { member_id: user_id, publicKey: key },
        },
      });
    }

    return res
      .status(200)
      .json({ message: "User added Successfully in group.", data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
