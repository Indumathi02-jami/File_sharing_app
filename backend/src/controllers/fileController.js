const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const fs = require("fs");

const { DEFAULT_SHARE_DOWNLOAD_LIMIT, INTEGRITY_STATUS } = require("../constants/shareSecurity");
const File = require("../models/File");
const { persistIntegrityResult, verifyFileIntegrity } = require("../services/fileIntegrityService");
const { buildOwnerFilePayload } = require("../services/filePresentationService");
const {
  buildShareDetails,
  buildShareUrl,
  resolveShareDownloadLimit,
  resolveShareExpiryDate
} = require("../services/shareSecurityService");
const { hashFile } = require("../utils/fileHash");

const categorizeFile = (mimetype) => {
  if (mimetype.startsWith("image/")) {
    return "image";
  }

  if (mimetype === "application/pdf") {
    return "pdf";
  }

  if (
    mimetype.includes("word") ||
    mimetype.includes("document") ||
    mimetype.includes("sheet") ||
    mimetype.includes("presentation") ||
    mimetype === "text/plain"
  ) {
    return "document";
  }

  return "other";
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const removeStoredFile = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await fs.promises.unlink(filePath);
      return;
    } catch (error) {
      lastError = error;

      if (!["EPERM", "EBUSY"].includes(error.code) || attempt === 2) {
        throw error;
      }

      await wait(200 * (attempt + 1));
    }
  }

  throw lastError;
};

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select a file to upload." });
    }

    const integrityHash = await hashFile(req.file.path);

    const file = await File.create({
      name: req.body.name?.trim() || req.file.originalname,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      mimeType: req.file.mimetype,
      category: categorizeFile(req.file.mimetype),
      owner: req.user._id,
      integrityHash,
      lastIntegrityStatus: INTEGRITY_STATUS.VERIFIED,
      lastIntegrityCheckAt: new Date()
    });

    res.status(201).json({
      message: "File uploaded successfully.",
      file: buildOwnerFilePayload(file)
    });
  } catch (error) {
    next(error);
  }
};

const listFiles = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 6, 1);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();

    const filter = { owner: req.user._id };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { originalName: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    const [files, total] = await Promise.all([
      File.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      File.countDocuments(filter)
    ]);

    res.json({
      files: files.map(buildOwnerFilePayload),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1)
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    await removeStoredFile(file.path);
    await file.deleteOne();

    res.json({ message: "File deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const renameFile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "A new file name is required." });
    }

    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name: name.trim() },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    res.json({
      message: "File renamed successfully.",
      file: buildOwnerFilePayload(file)
    });
  } catch (error) {
    next(error);
  }
};

const downloadPrivateFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    const integrityResult = await verifyFileIntegrity(file);

    if (!integrityResult.isValid) {
      await persistIntegrityResult(file, integrityResult);
      return res.status(409).json({ message: "File integrity verification failed. Download blocked." });
    }

    await persistIntegrityResult(file, integrityResult);

    return res.download(file.path, file.name);
  } catch (error) {
    next(error);
  }
};

const updateSharing = async (req, res, next) => {
  try {
    const { downloadLimit, expiresAt, isPublic, password } = req.body;
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    const nextIsPublic = Boolean(isPublic);

    if (!nextIsPublic) {
      file.isPublic = false;
      file.shareToken = null;
      file.sharePassword = "";
      file.shareExpiresAt = null;
      file.shareMaxDownloads = DEFAULT_SHARE_DOWNLOAD_LIMIT;
      file.shareDownloadCount = 0;
      file.shareRevoked = false;
      file.shareRevokedAt = null;

      await file.save();

      return res.json({
        message: "Sharing disabled for this file.",
        file: buildOwnerFilePayload(file),
        shareUrl: null
      });
    }

    const nextExpiryDate = resolveShareExpiryDate(expiresAt);
    const nextDownloadLimit = resolveShareDownloadLimit(downloadLimit);

    if (!nextExpiryDate) {
      return res.status(400).json({ message: "Please provide a valid share expiry date." });
    }

    if (nextExpiryDate.getTime() <= Date.now()) {
      return res.status(400).json({ message: "Share expiry must be in the future." });
    }

    if (!nextDownloadLimit) {
      return res.status(400).json({ message: "Download limit must be a whole number greater than zero." });
    }

    file.isPublic = true;
    file.shareToken = file.shareToken || randomUUID();
    file.sharePassword = password?.trim() ? await bcrypt.hash(password.trim(), 10) : "";
    file.shareExpiresAt = nextExpiryDate;
    file.shareMaxDownloads = nextDownloadLimit;
    file.shareRevoked = false;
    file.shareRevokedAt = null;

    await file.save();

    res.json({
      message: "Sharing settings updated.",
      file: buildOwnerFilePayload(file),
      shareUrl: buildShareUrl(file.shareToken)
    });
  } catch (error) {
    next(error);
  }
};

const revokeShareLink = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    if (!file.shareToken || !file.isPublic) {
      return res.status(400).json({ message: "This file does not have an active share link to revoke." });
    }

    file.shareRevoked = true;
    file.shareRevokedAt = new Date();

    await file.save();

    res.json({
      message: "Share link revoked successfully.",
      file: buildOwnerFilePayload(file)
    });
  } catch (error) {
    next(error);
  }
};

const getShareStatus = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    res.json({
      file: buildOwnerFilePayload(file),
      share: buildShareDetails(file)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  deleteFile,
  downloadPrivateFile,
  getShareStatus,
  listFiles,
  renameFile,
  revokeShareLink,
  updateSharing,
  uploadFile
};
