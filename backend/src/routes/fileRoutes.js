const express = require("express");

const {
  deleteFile,
  downloadPrivateFile,
  getShareStatus,
  listFiles,
  renameFile,
  revokeShareLink,
  updateSharing,
  uploadFile
} = require("../controllers/fileController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", listFiles);
router.post("/upload", upload.single("file"), uploadFile);
router.patch("/:id/rename", renameFile);
router.patch("/:id/share", updateSharing);
router.get("/:id/share/status", getShareStatus);
router.patch("/:id/share/revoke", revokeShareLink);
router.get("/:id/download", downloadPrivateFile);
router.delete("/:id", deleteFile);

module.exports = router;
