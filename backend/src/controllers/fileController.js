const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const fs = require("fs");
const path = require("path");

const File = require("../models/File");

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

const buildFilePayload = (fileDocument) => ({
  _id: fileDocument._id,
  name: fileDocument.name,
  originalName: fileDocument.originalName,
  size: fileDocument.size,
  mimeType: fileDocument.mimeType,
  category: fileDocument.category,
  owner: fileDocument.owner,
  createdAt: fileDocument.createdAt,
  updatedAt: fileDocument.updatedAt,
  isPublic: fileDocument.isPublic,
  shareToken: fileDocument.shareToken,
  isPasswordProtected: Boolean(fileDocument.sharePassword),
  localUrl: `/storage/${path.basename(fileDocument.path)}`
});

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

    const file = await File.create({
      name: req.body.name?.trim() || req.file.originalname,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      mimeType: req.file.mimetype,
      category: categorizeFile(req.file.mimetype),
      owner: req.user._id
    });

    res.status(201).json({
      message: "File uploaded successfully.",
      file: buildFilePayload(file)
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
      files: files.map(buildFilePayload),
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
      file: buildFilePayload(file)
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

    return res.download(file.path, file.name);
  } catch (error) {
    next(error);
  }
};

const updateSharing = async (req, res, next) => {
  try {
    const { isPublic, password } = req.body;
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    file.isPublic = Boolean(isPublic);
    file.shareToken = file.isPublic ? file.shareToken || randomUUID() : null;
    file.sharePassword = password?.trim() ? await bcrypt.hash(password.trim(), 10) : "";

    await file.save();

    res.json({
      message: "Sharing settings updated.",
      file: buildFilePayload(file),
      shareUrl: file.isPublic
        ? `${process.env.CLIENT_URL || "http://localhost:3000"}/share/${file.shareToken}`
        : null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  deleteFile,
  downloadPrivateFile,
  listFiles,
  renameFile,
  updateSharing,
  uploadFile
};
