const DEFAULT_SHARE_EXPIRY_HOURS = Math.max(Number(process.env.SHARE_DEFAULT_EXPIRY_HOURS) || 24, 1);
const DEFAULT_SHARE_DOWNLOAD_LIMIT = Math.max(Number(process.env.SHARE_DEFAULT_DOWNLOAD_LIMIT) || 1, 1);

const SHARE_STATUS = {
  ACTIVE: "active",
  DISABLED: "disabled",
  EXPIRED: "expired",
  LIMIT_REACHED: "limit_reached",
  REVOKED: "revoked"
};

const INTEGRITY_STATUS = {
  FAILED: "failed",
  PENDING: "pending",
  VERIFIED: "verified"
};

module.exports = {
  DEFAULT_SHARE_DOWNLOAD_LIMIT,
  DEFAULT_SHARE_EXPIRY_HOURS,
  INTEGRITY_STATUS,
  SHARE_STATUS
};
