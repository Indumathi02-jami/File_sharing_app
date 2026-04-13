const bcrypt = require("bcryptjs");

const File = require("../models/File");

const buildSharedPayload = (fileDocument) => ({
  _id: fileDocument._id,
  name: fileDocument.name,
  size: fileDocument.size,
  mimeType: fileDocument.mimeType,
  category: fileDocument.category,
  createdAt: fileDocument.createdAt,
  ownerName: fileDocument.owner?.name || "Unknown",
  isPasswordProtected: Boolean(fileDocument.sharePassword)
});

const accessSharedFile = async (req, res, next) => {
  try {
    const { password } = req.body;
    const file = await File.findOne({
      shareToken: req.params.shareToken,
      isPublic: true
    }).populate("owner", "name");

    if (!file) {
      return res.status(404).json({ message: "This share link is not available." });
    }

    const isPasswordValid = file.sharePassword ? await bcrypt.compare(password || "", file.sharePassword) : true;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect share password." });
    }

    res.json({
      file: buildSharedPayload(file),
      downloadUrl: `/api/share/${file.shareToken}/download`
    });
  } catch (error) {
    next(error);
  }
};

const downloadSharedFile = async (req, res, next) => {
  try {
    const password = req.query.password || "";
    const file = await File.findOne({
      shareToken: req.params.shareToken,
      isPublic: true
    });

    if (!file) {
      return res.status(404).json({ message: "This share link is not available." });
    }

    const isPasswordValid = file.sharePassword ? await bcrypt.compare(password, file.sharePassword) : true;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect share password." });
    }

    return res.download(file.path, file.name);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  accessSharedFile,
  downloadSharedFile
};
