import pinnedMessageModal from "../modals/pinnedMessage.js";

// pin message
export const pinMessage = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { message_id, group_id, expireAfterTime } = req.body;
    if (!message_id || !group_id || !expireAfterTime) {
      return res.status(400).json({ Message: "Content missing" });
    }

    // checking if any message already pinned by the user in the perticular group, if yes then more then 3 pinned message are not allowed and new pinned message will replace the oldest pinned message
    const existingPinnedMessages = await pinnedMessageModal.find({
      user_id: user_id,
      group_id: group_id,
    });

    const existingMesssage = existingPinnedMessages.find(
      (item) => item.message_id.equals(Types.ObjectId(message_id))
    );  
    if (existingMesssage) {
      return res.status(400).json({ message: "Message already pinned" });
    }

    if (existingPinnedMessages.length === 3) {
      const oldestPinnedMessage = await pinnedMessageModal
        .findOne()
        .sort({ createdAt: 1 });
      // deleting the oldest pinned message pinned by user
      await pinnedMessageModal.findByIdAndDelete(oldestPinnedMessage._id);

      // creating new pinned Message
      // pin message
      const newPinMessage = await pinnedMessageModal.create({
        user_id,
        message_id,
        group_id,
        expireAt: new Date(new Date().getTime() + expireAfterTime * 1000), // 60*1000 = 1 minute
      });
      return res.status(201).json(newPinMessage);
    } else {
      const newPinMessage = await pinnedMessageModal.create({
        user_id,
        message_id,
        group_id,
        expireAt: new Date(new Date().getTime() + expireAfterTime * 1000), // 60*1000 = 1 minute
      });
      return res.status(201).json(newPinMessage);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const getPinnedMessage = async (req, res) => {
  try {
    const { group_id } = req.query;
    const result = await pinnedMessageModal.find({
      group_id: group_id,
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
};
