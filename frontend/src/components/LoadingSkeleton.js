function LoadingSkeleton() {
  return (
    <div className="files-grid" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <article key={index} className="file-card skeleton-card">
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-meta">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
          <div className="skeleton-actions">
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
