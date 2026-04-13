const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["image", "pdf", "document", "other"],
      default: "other"
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    shareToken: {
      type: String,
      default: null
    },
    sharePassword: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("File", fileSchema);
