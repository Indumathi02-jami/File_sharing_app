const mongoose = require("mongoose");

const {
  DEFAULT_SHARE_DOWNLOAD_LIMIT,
  INTEGRITY_STATUS
} = require("../constants/shareSecurity");

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
    },
    shareExpiresAt: {
      type: Date,
      default: null
    },
    shareMaxDownloads: {
      type: Number,
      default: DEFAULT_SHARE_DOWNLOAD_LIMIT,
      min: 1
    },
    shareDownloadCount: {
      type: Number,
      default: 0,
      min: 0
    },
    shareRevoked: {
      type: Boolean,
      default: false
    },
    shareRevokedAt: {
      type: Date,
      default: null
    },
    integrityHash: {
      type: String,
      default: null
    },
    lastIntegrityStatus: {
      type: String,
      enum: Object.values(INTEGRITY_STATUS),
      default: INTEGRITY_STATUS.PENDING
    },
    lastIntegrityCheckAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("File", fileSchema);
