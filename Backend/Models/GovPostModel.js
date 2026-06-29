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
   
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
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
            likes: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
            ],
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

govPostSchema.index({ authorId: 1, postType: 1, createdAt: -1 });
govPostSchema.index({ postType: 1, createdAt: -1 });

const GovPost = mongoose.model("GovPost", govPostSchema);
module.exports = GovPost;
