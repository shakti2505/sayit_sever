import groupChatModal from "../modals/groupChatModal.js";

export const setUpSocket = (io) => {
  // current saved Message ID
  let current_saved_message_id;

  // middleware for hand shaking before creating socket connection
  io.use((socket, next) => {
    // get the room passed from client
    const room = socket.handshake.auth.room || socket.handshake.headers.room;
    // if room is not available then throw error
    if (!room) {
      return next(new Error("Invalid Room! please pass correct room ID"));
    }

    socket.room = room;
    next();
  });

  // socket connection if room is available
  io.on("connection", (socket) => {
    // join the roomW
    socket.join(socket.room);

    // capturing "message" event from the triggerd by client and extracting data and saving messsages to database.
    socket.on("message", async (data, callback) => {
      // socket.broadcast.emit("message", data);
      const newMessage = await groupChatModal.create({
        group: data.group,
        group_id: data.group_id,
        message: data.message,
        iv: data.iv,
        name: data.name,
        sender_id: data.sender_id,
        isRead: [],
        isReceived: [],
      });
      current_saved_message_id = newMessage._id;
      // sending acknowledgement to client after successfully receiving message.
      callback({
        status: "Message Received",
      });

      // emitting the message to the room
      socket.to(socket.room).emit("message", data);
    });

    socket.on("IsReceived", async (data) => {
      await groupChatModal.findByIdAndUpdate(current_saved_message_id, {
        isReceived: [{ member_id: data.id }],
      });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected: ", socket.id);
    });
  });
};
