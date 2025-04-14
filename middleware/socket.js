import mongoose from "mongoose";
import { addOrUpdateReaction } from "../controller/groupController.js";
import groupChatModal from "../modals/groupChatModal.js";

export const setUpSocket = (io) => {
  // current saved Message ID
  let current_saved_message_id;
  let onlineUser = new Map();

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

  // socket connection if room is available(entire circuit where all sockets are connected)
  io.on("connection", (socket) => {
    // join the room
    socket.join(socket.room);

    // caputring typing event
    socket.on("typing", (name) => {
      socket.to(socket.room).emit("isTyping", name);
    });
    // caputring not typing event
    socket.on("notTyping", (name) => {
      socket.to(socket.room).emit("notTyping", name);
    });

    // capturing "message" event from the triggerd by client and extracting data and saving messsages to database.

    socket.on("message", async (data, callback) => {
      // emitting the message to the room
      const message_id = new mongoose.Types.ObjectId().toHexString();
      const newMessage = {
        _id: message_id,
        createdAt: data.createdAt,
        group: data.group,
        group_id: data.group_id,
        message: data.message,
        iv: data.iv,
        name: data.name,
        sender_id: data.sender_id,
        isRead: [],
        isReceived: [],
        isReply: data.isReply,
        replyTo: data.replyTo ? data.replyTo : null,
      };
      // console.log(data);

      socket.to(socket.room).emit("message", newMessage);
      // socket.broadcast.emit("message", data);
      const res = await groupChatModal.create(newMessage);
      current_saved_message_id = res._id;
      // sending acknowledgement to client after successfully receiving message.
      callback({
        status: "Message Received",
        message_id,
      });
    });

    socket.on("IsReceived", async (data) => {
      await groupChatModal.findByIdAndUpdate(current_saved_message_id, {
        isReceived: [{ member_id: data.id }],
      });
    });

    // capturing event for react
    socket.on("reactionToMessage", (data) => {
      socket.emit("reactionToMessage", data); // Emit to the sender
      socket.to(socket.room).emit("reactionToMessage", data);

      // saving the reaction to the database
      const { user_id, type, messageId } = data;

      addOrUpdateReaction(user_id, type, messageId);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected: ", socket.id);
    });
  });
};

// online User

export const SetUpSocketForOnetoOneChat = (io) => {
  // io.on("connection", (socket) => {
  //   console.log(`A user in connected ${socket.id}`);
  //   socket.on("joinOneToOne", (sender_id) => {
  //     onlineUser.set(sender_id, socket.id);
  //     console.log(`User ${sender_id} is Online`);
  //   });
  // });
};
