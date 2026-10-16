type Variant = "dashboard" | "list" | "form" | "detail";

export function AdminPageSkeleton({ variant = "dashboard", embedded = false }: { variant?: Variant; embedded?: boolean }) {
  return <div className={`admin-skeleton${embedded ? " is-embedded" : ""}`} role="status" aria-label="Memuat halaman admin">
    <span className="sr-only">Memuat halaman admin...</span>
    <div aria-hidden="true">
      <div className="admin-skeleton-head">
        <span className="skeleton-block admin-skeleton-eyebrow" />
        <span className="skeleton-block admin-skeleton-title" />
        <span className="skeleton-block admin-skeleton-description" />
      </div>
      {variant === "dashboard" && <>
        <div className="stat-grid admin-skeleton-stats">{Array.from({ length: 4 }, (_, index) =>
          <div className="admin-skeleton-panel" key={index}><span className="skeleton-block admin-skeleton-icon" />
            <span className="skeleton-block admin-skeleton-number" /><span className="skeleton-block admin-skeleton-line" /></div>)}</div>
        <div className="admin-skeleton-cards">{Array.from({ length: 3 }, (_, index) =>
          <div className="admin-skeleton-panel" key={index}><span className="skeleton-block admin-skeleton-icon" />
            <span className="skeleton-block admin-skeleton-line" /><span className="skeleton-block admin-skeleton-line short" />
            <span className="skeleton-block admin-skeleton-link" /></div>)}</div>
      </>}
      {variant === "list" && <>
        <div className="admin-skeleton-toolbar"><span className="skeleton-block" /><span className="skeleton-block" /></div>
        <div className="admin-skeleton-panel admin-skeleton-table">{Array.from({ length: 5 }, (_, index) =>
          <div className="admin-skeleton-row" key={index}><span className="skeleton-block" /><span className="skeleton-block" /><span className="skeleton-block" /></div>)}</div>
      </>}
      {(variant === "form" || variant === "detail") && <div className="admin-skeleton-panel admin-skeleton-form">
        {Array.from({ length: variant === "detail" ? 4 : 5 }, (_, index) => <div className="admin-skeleton-field" key={index}>
          <span className="skeleton-block admin-skeleton-label" /><span className="skeleton-block admin-skeleton-input" />
        </div>)}
        <span className="skeleton-block admin-skeleton-button" />
      </div>}
    </div>
  </div>;
}
