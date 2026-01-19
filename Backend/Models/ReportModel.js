const mongoose = require("mongoose");
const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // <-- this is important
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    media: [
      {
        type: String,
        required: false,
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId, // <-- this is important
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId, // <-- this is important
        ref: "User",
      },
    ],
    priority_score: {
      type: Number,
      required: false,
    },
    ward_number: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Progress", "Resolved"],
      trim: true,
    },
    changer: {
      type: mongoose.Schema.Types.ObjectId, // <-- this is important
      ref: "User",
    },
  },
  { timestamps: true },
);
const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
