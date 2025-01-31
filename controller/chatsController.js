import groupChatModal from "../modals/groupChatModal.js";

export const getGroupChats = async (req, res) => {
  try {
    const { group_id } = req.params;
    const chats = await groupChatModal.aggregate([
      { $match: { group_id: group_id } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          messages: { $push: "$$ROOT" }, // Push all messages of that date
        },
      },
      { $sort: { _id: 1 } }, // Sort by date
    ]);
    return res.status(200).json({ message: "chats found", data: chats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
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
      .select("createdAt isReceived isRead message _id")
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
