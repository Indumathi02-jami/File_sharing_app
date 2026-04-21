import { motion } from "framer-motion";
import { useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api/client";
import MotionButton from "../components/MotionButton";
import { formatBytes, formatDate, formatHashPreview } from "../utils/formatters";
import { pageTransition, shakeMotion } from "../utils/animations";
import { getErrorMessage } from "../utils/getErrorMessage";

function SharePage() {
  const { shareToken } = useParams();
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlock = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post(`/api/share/${shareToken}/access`, { password });
      setFile(response.data.file);
      setDownloadUrl(`${api.defaults.baseURL}${response.data.downloadUrl}?password=${encodeURIComponent(password)}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.main className="share-layout" {...pageTransition}>
      <motion.section className="share-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
        <p className="eyebrow">Public Share</p>
        <h1>Access shared file</h1>
        <p>Enter the share password if one was configured by the owner.</p>
        <div className="share-trust">
          <span>Protected access</span>
          <span>Secure download</span>
        </div>

        <form onSubmit={handleUnlock} className="auth-form">
          <input
            type="text"
            placeholder="Share password if required"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? (
            <motion.p className="form-error" {...shakeMotion}>
              {error}
            </motion.p>
          ) : null}
          <MotionButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Checking..." : "Open file"}
          </MotionButton>
        </form>

        {file ? (
          <motion.div className="shared-preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
            <div className="badge-row">
              <span className={`status-badge status-badge--${file.share?.status || "disabled"}`}>{file.share?.statusLabel}</span>
              {file.share?.integrityVerified ? <span className="status-badge status-badge--verified">Verified</span> : null}
            </div>
            <h2>{file.name}</h2>
            <p>Type: {file.category}</p>
            <p>Size: {formatBytes(file.size)}</p>
            <p>Shared: {formatDate(file.createdAt)}</p>
            <p>Expires: {file.share?.expiresAt ? formatDate(file.share.expiresAt) : "Not scheduled"}</p>
            <p>
              Downloads used: {file.share?.downloadCount} of {file.share?.downloadLimit}
            </p>
            <p>SHA-256 preview: {formatHashPreview(file.share?.hashPreview)}</p>
            <motion.a href={downloadUrl} className="download-link" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              Download file
            </motion.a>
          </motion.div>
        ) : null}
      </motion.section>
    </motion.main>
  );
}

export default SharePage;
