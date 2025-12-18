const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // <-- this is important
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
