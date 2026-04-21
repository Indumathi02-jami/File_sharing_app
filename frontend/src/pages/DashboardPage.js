import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/client";
import EmptyState from "../components/EmptyState";
import FileCard from "../components/FileCard";
import FileUploader from "../components/FileUploader";
import LoadingSkeleton from "../components/LoadingSkeleton";
import MotionButton from "../components/MotionButton";
import ShareSecurityPanel from "../components/ShareSecurityPanel";
import ShareModal from "../components/ShareModal";
import { useAuth } from "../context/AuthContext";
import { pageTransition, staggerContainer } from "../utils/animations";
import { getErrorMessage } from "../utils/getErrorMessage";

function DashboardPage() {
  const { logout, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "all" });
  const [appliedFilters, setAppliedFilters] = useState({ search: "", category: "all", page: 1 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shareFile, setShareFile] = useState(null);
  const [securityFile, setSecurityFile] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const sharedCount = files.filter((file) => file.isPublic).length;
  const totalStorageMb = (files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2);
  const latestUpload = files[0]?.createdAt;

  const fetchFiles = useCallback(async (nextFilters) => {
    setIsLoading(true);

    try {
      const response = await api.get("/api/files", {
        params: {
          page: nextFilters.page,
          search: nextFilters.search,
          category: nextFilters.category
        }
      });

      setFiles(response.data.files);
      setPagination(response.data.pagination);
      setSecurityFile((current) => {
        if (!current) {
          return response.data.files[0] || null;
        }

        return response.data.files.find((file) => file._id === current._id) || current;
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles(appliedFilters);
  }, [appliedFilters, fetchFiles]);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    setAppliedFilters({ ...filters, page: 1 });
  };

  const handleUpload = async (file, customName) => {
    const formData = new FormData();
    formData.append("file", file);

    if (customName.trim()) {
      formData.append("name", customName.trim());
    }

    try {
      const response = await api.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const total = event.total || file.size;
          const progress = Math.round((event.loaded * 100) / total);
          setUploadProgress(progress);
        }
      });

      toast.success(response.data.message);
      setSecurityFile(response.data.file);
      const nextFilters = { ...appliedFilters, page: 1 };
      setAppliedFilters(nextFilters);
      await fetchFiles(nextFilters);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleDelete = async (file) => {
    try {
      await api.delete(`/api/files/${file._id}`);
      toast.success("File deleted.");
      await fetchFiles(appliedFilters);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRename = async (file) => {
    const nextName = window.prompt("Enter a new name for this file:", file.name);

    if (!nextName || nextName === file.name) {
      return;
    }

    try {
      await api.patch(`/api/files/${file._id}/rename`, { name: nextName });
      toast.success("File renamed.");
      await fetchFiles(appliedFilters);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleShareSave = async (payload) => {
    try {
      const response = await api.patch(`/api/files/${shareFile._id}/share`, payload);

      setSecurityFile(response.data.file);
      setShareFile(response.data.file);
      if (response.data.shareUrl) {
        setShareUrl(response.data.shareUrl);
        setCopied(false);
        toast.success("Share link is ready.");
      } else {
        setShareUrl("");
        toast.success("Sharing disabled for this file.");
      }
      await fetchFiles(appliedFilters);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRefreshSecurityFile = async (fileId) => {
    try {
      const response = await api.get(`/api/files/${fileId}/share/status`);
      setSecurityFile(response.data.file);
      return response.data.file;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    }
  };

  const handleCopyShareUrl = async () => {
    const currentShareUrl = securityFile?.share?.url || shareUrl;

    if (!currentShareUrl) {
      return;
    }

    await navigator.clipboard.writeText(currentShareUrl);
    setCopied(true);
    toast.success("Share link copied to clipboard.");
    window.setTimeout(() => setCopied(false), 1400);
  };

  const handleRevokeShare = async () => {
    if (!securityFile?._id) {
      return;
    }

    try {
      const response = await api.patch(`/api/files/${securityFile._id}/share/revoke`);
      toast.success(response.data.message);
      setSecurityFile(response.data.file);
      setShareFile((current) => (current?._id === response.data.file._id ? response.data.file : current));
      setShareUrl("");
      await fetchFiles(appliedFilters);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/api/files/${file._id}/download`, {
        responseType: "blob"
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <motion.main className="dashboard-shell" {...pageTransition}>
      <motion.section className="dashboard-hero panel panel--hero" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <div className="dashboard-hero__copy">
          <p className="eyebrow">Workspace Dashboard</p>
          <h1>{user?.name || "Creator"}'s premium file workspace</h1>
          <p className="dashboard-hero__lead">
            A cleaner command center for uploads, protected sharing, and fast file retrieval across your collaboration flow.
          </p>
          <div className="dashboard-hero__actions">
            <MotionButton type="button" onClick={() => window.scrollTo({ top: 420, behavior: "smooth" })}>
              Browse Library
            </MotionButton>
            <MotionButton type="button" className="button-muted" onClick={logout}>
              Logout
            </MotionButton>
          </div>
        </div>
        <div className="dashboard-hero__spotlight">
          <div className="spotlight-card">
            <span className="spotlight-card__label">Latest activity</span>
            <strong>{latestUpload ? "Fresh upload in workspace" : "No uploads yet"}</strong>
            <p>{latestUpload ? new Date(latestUpload).toLocaleString("en-IN") : "Start by adding your first file."}</p>
          </div>
          <div className="spotlight-orb spotlight-orb--one" />
          <div className="spotlight-orb spotlight-orb--two" />
        </div>
      </motion.section>

      <motion.section className="dashboard-stats" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.04 }}>
        {[
          { label: "Files in library", value: pagination.total },
          { label: "Shared right now", value: sharedCount },
          { label: "Storage used", value: `${totalStorageMb} MB` }
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </motion.section>

      <section className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <FileUploader onUpload={handleUpload} uploadProgress={uploadProgress} />
          <ShareSecurityPanel
            copied={copied}
            file={securityFile}
            onConfigure={() => {
              if (!securityFile) {
                return;
              }

              setShareFile(securityFile);
              setShareUrl(securityFile.share?.url || "");
              setCopied(false);
            }}
            onCopy={handleCopyShareUrl}
            onRevoke={handleRevokeShare}
          />

          <motion.section className="panel filters-panel filters-panel--premium" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.04 }}>
            <div className="sidebar-section__intro">
              <p className="eyebrow">Refine View</p>
              <h3>Find what matters quickly</h3>
            </div>
            <form className="filters-grid" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                placeholder="Search by file name"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              />
              <select
                value={filters.category}
                onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
              >
                <option value="all">All types</option>
                <option value="image">Images</option>
                <option value="pdf">PDFs</option>
                <option value="document">Documents</option>
                <option value="other">Other</option>
              </select>
              <MotionButton type="submit">Apply Filters</MotionButton>
            </form>
          </motion.section>

          <section className="panel insight-panel">
            <p className="eyebrow">Workspace Notes</p>
            <ul className="insight-list">
              <li>Public shares stay visible directly on each file card.</li>
              <li>Upload progress is live so large documents feel responsive.</li>
              <li>Search and file-type filters update your library view fast.</li>
            </ul>
          </section>
        </aside>

        <section className="files-section files-section--premium">
          <div className="section-header section-header--premium">
            <div>
              <p className="eyebrow">Library</p>
              <h2>Curated file collection</h2>
            </div>
            <span className="section-status">
              {isLoading ? <span className="spinner" /> : null}
              {pagination.total} items
            </span>
          </div>

          {isLoading ? <LoadingSkeleton /> : null}
          {!isLoading && files.length === 0 ? (
            <EmptyState title="No files yet" message="Upload your first file to start building your shared workspace." />
          ) : null}

          {!isLoading ? (
            <motion.div className="files-grid files-grid--premium" variants={staggerContainer} initial="hidden" animate="show">
              <AnimatePresence>
                {files.map((file) => (
                  <FileCard
                    key={file._id}
                    file={file}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                    onRename={handleRename}
                    onShare={(nextFile) => {
                      setSecurityFile(nextFile);
                      setShareFile(nextFile);
                      setShareUrl(nextFile.share?.url || "");
                      setCopied(false);
                      handleRefreshSecurityFile(nextFile._id);
                    }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : null}

          <div className="pagination pagination--premium">
            <MotionButton
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setAppliedFilters((current) => ({ ...current, page: current.page - 1 }))}
            >
              Previous
            </MotionButton>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <MotionButton
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setAppliedFilters((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next
            </MotionButton>
          </div>
        </section>
      </section>

      <ShareModal
        copied={copied}
        file={shareFile}
        onClose={() => {
          setShareFile(null);
          setShareUrl("");
          setCopied(false);
        }}
        onCopy={handleCopyShareUrl}
        onSave={handleShareSave}
        shareUrl={shareUrl}
      />
    </motion.main>
  );
}

export default DashboardPage;
