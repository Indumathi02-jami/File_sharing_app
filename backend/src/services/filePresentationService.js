const path = require("path");

const { buildShareDetails } = require("./shareSecurityService");

const buildOwnerFilePayload = (fileDocument) => ({
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
  localUrl: `/storage/${path.basename(fileDocument.path)}`,
  integrityHashPreview: fileDocument.integrityHash
    ? `${fileDocument.integrityHash.slice(0, 12)}...${fileDocument.integrityHash.slice(-12)}`
    : null,
  share: buildShareDetails(fileDocument)
});

const buildSharedFilePayload = (fileDocument) => ({
  _id: fileDocument._id,
  name: fileDocument.name,
  size: fileDocument.size,
  mimeType: fileDocument.mimeType,
  category: fileDocument.category,
  createdAt: fileDocument.createdAt,
  ownerName: fileDocument.owner?.name || "Unknown",
  share: buildShareDetails(fileDocument)
});

module.exports = {
  buildOwnerFilePayload,
  buildSharedFilePayload
};
