import { motion } from "framer-motion";
import { useRef, useState } from "react";

import MotionButton from "./MotionButton";

function FileUploader({ onUpload, uploadProgress }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customName, setCustomName] = useState("");

  const handleFileSelection = async (file) => {
    if (!file) {
      return;
    }

    await onUpload(file, customName);
    setCustomName("");
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);

    const [file] = event.dataTransfer.files;
    await handleFileSelection(file);
  };

  return (
    <motion.section
      className="panel uploader"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        className={`dropzone ${isDragging ? "dropzone--active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        animate={
          isDragging
            ? { scale: 1.01, borderColor: "rgba(180, 83, 9, 0.7)", boxShadow: "0 18px 40px rgba(20, 83, 45, 0.14)" }
            : { scale: 1, borderColor: "rgba(20, 83, 45, 0.24)", boxShadow: "0 0 0 rgba(0,0,0,0)" }
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <p>Drag and drop a file here</p>
        <span>or click to browse images, PDFs, and documents</span>
      </motion.div>

      <div className="uploader__controls">
        <input
          type="text"
          placeholder="Optional display name"
          value={customName}
          onChange={(event) => setCustomName(event.target.value)}
        />
        <input
          ref={inputRef}
          type="file"
          hidden
          onChange={(event) => handleFileSelection(event.target.files?.[0])}
        />
        <MotionButton onClick={() => inputRef.current?.click()}>Choose File</MotionButton>
      </div>

      <div className="progress-shell" aria-live="polite">
        <motion.div className="progress-bar" animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.28, ease: "easeOut" }} />
      </div>
      <div className="uploader__status">
        {uploadProgress > 0 ? <span className="spinner spinner--small" /> : null}
        <small>{uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Maximum upload size follows your backend config."}</small>
      </div>
    </motion.section>
  );
}

export default FileUploader;
