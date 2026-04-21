import { AnimatePresence, motion } from "framer-motion";

import MotionButton from "./MotionButton";
import { formatBytes, formatDate, formatHashPreview } from "../utils/formatters";
import { listItemMotion, tooltipMotion } from "../utils/animations";

function FileCard({ file, onDelete, onDownload, onRename, onShare }) {
  const share = file.share || {};

  return (
    <motion.article className="file-card interactive-card" {...listItemMotion}>
      <div className="file-card__header">
        <div>
          <span className="badge">{file.category}</span>
          <h3>{file.name}</h3>
          <p className="file-card__subtle">{file.originalName}</p>
        </div>
        <div className="badge-row">
          <span className={`status-badge status-badge--${share.status || "disabled"}`}>{share.statusLabel || "Private"}</span>
          {share.integrityVerified ? <span className="status-badge status-badge--verified">Verified</span> : null}
        </div>
      </div>

      <dl className="file-meta">
        <div>
          <dt>Size</dt>
          <dd>{formatBytes(file.size)}</dd>
        </div>
        <div>
          <dt>Uploaded</dt>
          <dd>{formatDate(file.createdAt)}</dd>
        </div>
        <div>
          <dt>Downloads</dt>
          <dd>
            {share.downloadCount ?? 0}/{share.downloadLimit ?? 0}
          </dd>
        </div>
        <div>
          <dt>Hash</dt>
          <dd>{formatHashPreview(file.integrityHashPreview)}</dd>
        </div>
      </dl>

      <div className="file-card__actions">
        {[
          { label: "Download", icon: "->", action: onDownload, tooltip: "Save this file locally." },
          { label: "Rename", icon: "[]", action: onRename, tooltip: "Update the display name." },
          { label: "Share", icon: "o-", action: onShare, tooltip: "Create a public share link." },
          { label: "Delete", icon: "x", action: onDelete, tooltip: "Permanently remove this file.", danger: true }
        ].map((actionItem) => (
          <div key={actionItem.label} className="tooltip-wrap">
            <MotionButton
              className={actionItem.danger ? "button-danger icon-button" : "icon-button"}
              onClick={() => actionItem.action(file)}
            >
              <span className="button-icon">{actionItem.icon}</span>
              <span>{actionItem.label}</span>
            </MotionButton>
            <AnimatePresence>
              <motion.span className="tooltip" {...tooltipMotion}>
                {actionItem.tooltip}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

export default FileCard;
