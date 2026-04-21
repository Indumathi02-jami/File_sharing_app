const {
  DEFAULT_SHARE_DOWNLOAD_LIMIT,
  DEFAULT_SHARE_EXPIRY_HOURS,
  INTEGRITY_STATUS,
  SHARE_STATUS
} = require("../constants/shareSecurity");

const buildDefaultExpiryDate = () => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + DEFAULT_SHARE_EXPIRY_HOURS);
  return expiresAt;
};

const resolveShareExpiryDate = (expiresAt) => {
  if (!expiresAt) {
    return buildDefaultExpiryDate();
  }

  const parsedDate = new Date(expiresAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const resolveShareDownloadLimit = (downloadLimit) => {
  if (downloadLimit === undefined || downloadLimit === null || downloadLimit === "") {
    return DEFAULT_SHARE_DOWNLOAD_LIMIT;
  }

  const parsedLimit = Number(downloadLimit);

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    return null;
  }

  return parsedLimit;
};

const getShareStatus = (fileDocument) => {
  if (!fileDocument.isPublic || !fileDocument.shareToken) {
    return SHARE_STATUS.DISABLED;
  }

  if (fileDocument.shareRevoked) {
    return SHARE_STATUS.REVOKED;
  }

  if (fileDocument.shareExpiresAt && new Date(fileDocument.shareExpiresAt).getTime() <= Date.now()) {
    return SHARE_STATUS.EXPIRED;
  }

  if ((fileDocument.shareDownloadCount || 0) >= (fileDocument.shareMaxDownloads || DEFAULT_SHARE_DOWNLOAD_LIMIT)) {
    return SHARE_STATUS.LIMIT_REACHED;
  }

  return SHARE_STATUS.ACTIVE;
};

const getShareStatusLabel = (status) => {
  const statusLabelMap = {
    [SHARE_STATUS.ACTIVE]: "Active",
    [SHARE_STATUS.DISABLED]: "Private",
    [SHARE_STATUS.EXPIRED]: "Expired",
    [SHARE_STATUS.LIMIT_REACHED]: "Limit Reached",
    [SHARE_STATUS.REVOKED]: "Revoked"
  };

  return statusLabelMap[status] || "Unknown";
};

const getIntegrityLabel = (status) => {
  const integrityLabelMap = {
    [INTEGRITY_STATUS.FAILED]: "Integrity Failed",
    [INTEGRITY_STATUS.PENDING]: "Pending Verification",
    [INTEGRITY_STATUS.VERIFIED]: "Verified"
  };

  return integrityLabelMap[status] || "Pending Verification";
};

const buildShareUrl = (shareToken) => {
  if (!shareToken) {
    return null;
  }

  return `${process.env.CLIENT_URL || "http://localhost:3000"}/share/${shareToken}`;
};

const buildShareDetails = (fileDocument) => {
  const shareStatus = getShareStatus(fileDocument);
  const integrityStatus = fileDocument.lastIntegrityStatus || INTEGRITY_STATUS.PENDING;

  return {
    token: fileDocument.shareToken,
    url: buildShareUrl(fileDocument.shareToken),
    expiresAt: fileDocument.shareExpiresAt,
    downloadLimit: fileDocument.shareMaxDownloads || DEFAULT_SHARE_DOWNLOAD_LIMIT,
    downloadCount: fileDocument.shareDownloadCount || 0,
    revoked: Boolean(fileDocument.shareRevoked),
    revokedAt: fileDocument.shareRevokedAt,
    isPasswordProtected: Boolean(fileDocument.sharePassword),
    status: shareStatus,
    statusLabel: getShareStatusLabel(shareStatus),
    integrityStatus,
    integrityLabel: getIntegrityLabel(integrityStatus),
    integrityCheckedAt: fileDocument.lastIntegrityCheckAt,
    integrityVerified: integrityStatus === INTEGRITY_STATUS.VERIFIED,
    hashPreview: fileDocument.integrityHash
      ? `${fileDocument.integrityHash.slice(0, 12)}...${fileDocument.integrityHash.slice(-12)}`
      : null
  };
};

const assertShareIsActive = (fileDocument) => {
  const shareStatus = getShareStatus(fileDocument);

  if (shareStatus === SHARE_STATUS.ACTIVE) {
    return null;
  }

  const errorMap = {
    [SHARE_STATUS.DISABLED]: { statusCode: 404, message: "This share link is not available." },
    [SHARE_STATUS.EXPIRED]: { statusCode: 410, message: "This share link has expired." },
    [SHARE_STATUS.LIMIT_REACHED]: { statusCode: 410, message: "This share link has reached its download limit." },
    [SHARE_STATUS.REVOKED]: { statusCode: 403, message: "This share link has been revoked." }
  };

  return errorMap[shareStatus];
};

module.exports = {
  assertShareIsActive,
  buildDefaultExpiryDate,
  buildShareDetails,
  buildShareUrl,
  getShareStatus,
  resolveShareDownloadLimit,
  resolveShareExpiryDate
};
