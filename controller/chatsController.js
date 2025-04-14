import groupChatModal from "../modals/groupChatModal.js";

export const getGroupChatsById = async (req, res) => {
  try {
    const { group_id } = req.params;
    let { _page = 1, _limit = 10 } = req.query; // Set default values

    _page = parseInt(_page);
    _limit = parseInt(_limit);
    const skip = (_page - 1) * _limit;

    // Ensure pagination values are valid
    if (isNaN(_page) || _page < 1 || isNaN(_limit) || _limit < 1) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }

    // Count total messages in the groupw
    const totalCounts = await groupChatModal.countDocuments({ group_id });

    // If skip is greater than total messages, return empty array
    if (skip >= totalCounts) {
      return res.status(200).json([]);
    }

    // Fetch paginated chats
    const chats = await groupChatModal
      .find({ group_id })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(_limit)
      .lean(); // Optimize performance by returning plain JS objects

    return res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching group chats:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// search messges in group
export const searchMessgesInGroup = async (req, res) => {
  try {
    const { group_id, queryMessage, page = 1, limit = 20 } = req.query;

    // validate query
    if (!queryMessage) {
      return res.status(400).Json({ message: "Query is required" });
    }

    // build filter object
    const filter = {
      group_id: group_id,
      message: { $regex: new RegExp(queryMessage, "i") }, // case-insensitive search
    };

    // fetch messages with pagination

    const messages = await groupChatModal

      .find(filter)
      .select("createdAt isReceived isRead message _id iv")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)); // Limit the number of result per page

    return res.status(200).json({
      success: true,
      messages,
      pagination: { page: Number(page), limit: Number(limit) },
    });

    // Perform the text search with pagiation
  } catch (error) {
    console.log("Error searching messages:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// update message status isRead

export const updateMessageReadStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(401).json({ message: "Message id not found" });
    }

    await groupChatModal.findByIdAndUpdate(messageId, { isRead: true });

    return res.status(201).json({ message: "message status updated to true" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
