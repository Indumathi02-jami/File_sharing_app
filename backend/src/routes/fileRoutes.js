const express = require("express");

const {
  deleteFile,
  downloadPrivateFile,
  listFiles,
  renameFile,
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
router.get("/:id/download", downloadPrivateFile);
router.delete("/:id", deleteFile);

module.exports = router;
