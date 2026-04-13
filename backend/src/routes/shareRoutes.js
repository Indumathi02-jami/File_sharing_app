const express = require("express");

const { accessSharedFile, downloadSharedFile } = require("../controllers/shareController");

const router = express.Router();

router.post("/:shareToken/access", accessSharedFile);
router.get("/:shareToken/download", downloadSharedFile);

module.exports = router;
