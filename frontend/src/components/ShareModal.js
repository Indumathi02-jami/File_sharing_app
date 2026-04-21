import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import MotionButton from "./MotionButton";
import { backdropMotion, modalMotion } from "../utils/animations";
import { formatDateTimeLocalValue } from "../utils/formatters";

function ShareModal({ file, copied, shareUrl, onClose, onCopy, onSave }) {
  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState("");
  const [downloadLimit, setDownloadLimit] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (file) {
      setIsPublic(file.isPublic);
      setPassword("");
      setDownloadLimit(String(file.share?.downloadLimit || 1));
      setExpiresAt(formatDateTimeLocalValue(file.share?.expiresAt));
    }
  }, [file]);

  if (!file) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div className="modal-backdrop" onClick={onClose} {...backdropMotion}>
        <motion.div className="modal-card" onClick={(event) => event.stopPropagation()} {...modalMotion}>
          <div className="modal-card__header">
            <h3>Share {file.name}</h3>
            <MotionButton onClick={onClose}>Close</MotionButton>
          </div>

          <label className="toggle">
            <input type="checkbox" checked={isPublic} onChange={() => setIsPublic((current) => !current)} />
            <span>Enable public share link</span>
          </label>

          <input
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Optional password protection"
          />

          <div className="share-security-form">
            <input
              type="number"
              min="1"
              step="1"
              value={downloadLimit}
              onChange={(event) => setDownloadLimit(event.target.value)}
              placeholder="Download limit"
              disabled={!isPublic}
            />
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              disabled={!isPublic}
            />
          </div>

          {file.share ? (
            <div className="share-status-summary">
              <span className={`status-badge status-badge--${file.share.status || "disabled"}`}>{file.share.statusLabel}</span>
              {file.share.integrityVerified ? <span className="status-badge status-badge--verified">Verified</span> : null}
              <small>
                {file.share.downloadCount} of {file.share.downloadLimit} downloads used
              </small>
            </div>
          ) : null}

          {shareUrl ? (
            <div className="share-link-panel">
              <span className="share-link-label">Share link</span>
              <div className="share-link-row">
                <input value={shareUrl} readOnly />
                <MotionButton className={copied ? "button-success" : ""} onClick={onCopy}>
                  <span className="button-icon">{copied ? "ok" : "cp"}</span>
                  <span>{copied ? "Copied" : "Copy"}</span>
                </MotionButton>
              </div>
            </div>
          ) : null}

          <div className="modal-actions">
            <MotionButton onClick={onClose}>Cancel</MotionButton>
            <MotionButton onClick={() => onSave({ isPublic, password, downloadLimit, expiresAt })}>Save Share Settings</MotionButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ShareModal;
