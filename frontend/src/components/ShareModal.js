import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import MotionButton from "./MotionButton";
import { backdropMotion, modalMotion } from "../utils/animations";

function ShareModal({ file, copied, shareUrl, onClose, onCopy, onSave }) {
  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (file) {
      setIsPublic(file.isPublic);
      setPassword("");
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
            <MotionButton onClick={() => onSave({ isPublic, password })}>Save Share Settings</MotionButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ShareModal;
