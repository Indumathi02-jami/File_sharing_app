const bcrypt = require("bcryptjs");

const File = require("../models/File");
const { persistIntegrityResult, verifyFileIntegrity } = require("../services/fileIntegrityService");
const { buildSharedFilePayload } = require("../services/filePresentationService");
const { assertShareIsActive } = require("../services/shareSecurityService");

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

    const shareStateError = assertShareIsActive(file);

    if (shareStateError) {
      return res.status(shareStateError.statusCode).json({ message: shareStateError.message });
    }

    const isPasswordValid = file.sharePassword ? await bcrypt.compare(password || "", file.sharePassword) : true;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect share password." });
    }

    res.json({
      file: buildSharedFilePayload(file),
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

    const shareStateError = assertShareIsActive(file);

    if (shareStateError) {
      return res.status(shareStateError.statusCode).json({ message: shareStateError.message });
    }

    const isPasswordValid = file.sharePassword ? await bcrypt.compare(password, file.sharePassword) : true;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect share password." });
    }

    const integrityResult = await verifyFileIntegrity(file);

    if (!integrityResult.isValid) {
      await persistIntegrityResult(file, integrityResult);
      return res.status(409).json({ message: "File integrity verification failed. Download blocked." });
    }

    await persistIntegrityResult(file, integrityResult);

    return res.download(file.path, file.name, async (downloadError) => {
      if (downloadError) {
        if (!res.headersSent) {
          next(downloadError);
        }

        return;
      }

      try {
        await File.updateOne({ _id: file._id }, { $inc: { shareDownloadCount: 1 } });
      } catch (updateError) {
        console.error("Failed to update share download count:", updateError.message);
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  accessSharedFile,
  downloadSharedFile
};
