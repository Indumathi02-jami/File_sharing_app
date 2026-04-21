const fs = require("fs");

const { INTEGRITY_STATUS } = require("../constants/shareSecurity");
const { hashFile } = require("../utils/fileHash");

const verifyFileIntegrity = async (fileDocument) => {
  if (!fileDocument.integrityHash) {
    return {
      computedHash: null,
      isValid: false,
      reason: "missing_hash",
      status: INTEGRITY_STATUS.FAILED
    };
  }

  if (!fs.existsSync(fileDocument.path)) {
    return {
      computedHash: null,
      isValid: false,
      reason: "missing_file",
      status: INTEGRITY_STATUS.FAILED
    };
  }

  const computedHash = await hashFile(fileDocument.path);
  const isValid = computedHash === fileDocument.integrityHash;

  return {
    computedHash,
    isValid,
    reason: isValid ? null : "hash_mismatch",
    status: isValid ? INTEGRITY_STATUS.VERIFIED : INTEGRITY_STATUS.FAILED
  };
};

const persistIntegrityResult = async (fileDocument, integrityResult) => {
  fileDocument.lastIntegrityStatus = integrityResult.status;
  fileDocument.lastIntegrityCheckAt = new Date();
  await fileDocument.save();
};

module.exports = {
  persistIntegrityResult,
  verifyFileIntegrity
};
