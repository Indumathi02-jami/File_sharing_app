import MotionButton from "./MotionButton";
import { formatDate, formatHashPreview } from "../utils/formatters";

function ShareSecurityPanel({ copied, file, onConfigure, onCopy, onRevoke }) {
  if (!file) {
    return (
      <section className="panel share-security-panel">
        <p className="eyebrow">Share Security</p>
        <h3>No file selected yet</h3>
        <p className="share-security-panel__empty">
          Upload a file or choose one from your library to inspect expiry, download limits, revoke controls, and integrity status.
        </p>
      </section>
    );
  }

  const share = file.share || {};
  const isPublic = Boolean(file.isPublic && share.token);

  return (
    <section className="panel share-security-panel">
      <div className="share-security-panel__header">
        <div>
          <p className="eyebrow">Share Security</p>
          <h3>{file.name}</h3>
        </div>
        <div className="badge-row">
          <span className={`status-badge status-badge--${share.status || "disabled"}`}>{share.statusLabel || "Private"}</span>
          {share.integrityVerified ? <span className="status-badge status-badge--verified">Verified</span> : null}
        </div>
      </div>

      <div className="share-security-grid">
        <div>
          <span className="share-security-grid__label">Share link</span>
          <p>{isPublic ? share.url : "Private until sharing is enabled."}</p>
        </div>
        <div>
          <span className="share-security-grid__label">Expiry</span>
          <p>{share.expiresAt ? formatDate(share.expiresAt) : "Not scheduled"}</p>
        </div>
        <div>
          <span className="share-security-grid__label">Download limit</span>
          <p>{share.downloadLimit ?? "-"}</p>
        </div>
        <div>
          <span className="share-security-grid__label">Downloads used</span>
          <p>{share.downloadCount ?? 0}</p>
        </div>
        <div>
          <span className="share-security-grid__label">Integrity hash</span>
          <p>{formatHashPreview(file.integrityHashPreview || share.hashPreview)}</p>
        </div>
        <div>
          <span className="share-security-grid__label">Last integrity check</span>
          <p>{share.integrityCheckedAt ? formatDate(share.integrityCheckedAt) : "Verified at upload"}</p>
        </div>
      </div>

      <div className="share-security-actions">
        <MotionButton type="button" onClick={onConfigure}>
          {isPublic ? "Update Sharing" : "Enable Sharing"}
        </MotionButton>
        <MotionButton type="button" className={copied ? "button-success" : "button-muted"} onClick={onCopy} disabled={!isPublic}>
          {copied ? "Copied" : "Copy Link"}
        </MotionButton>
        <MotionButton type="button" className="button-danger" onClick={onRevoke} disabled={!isPublic}>
          Revoke Link
        </MotionButton>
      </div>
    </section>
  );
}

export default ShareSecurityPanel;
