const mongoose = require("mongoose");

const govPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
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
    postType: {
      type: String,
      enum: ["update", "alert"],
      required: true,
    },
    ward_number: {
      type: Number,
      required: true,
    },
    media: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Progress", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

const GovPost = mongoose.model("GovPost", govPostSchema);
module.exports = GovPost;
