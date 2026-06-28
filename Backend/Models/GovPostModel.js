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
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        replies: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            text: {
              type: String,
              required: true,
              trim: true,
              maxlength: 500,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const GovPost = mongoose.model("GovPost", govPostSchema);
module.exports = GovPost;
