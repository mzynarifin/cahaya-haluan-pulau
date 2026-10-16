export default function PublicLoading() {
  return <div className="public-skeleton" role="status" aria-live="polite" aria-label="Memuat halaman">
    <span className="sr-only">Memuat halaman...</span>
    <div className="container skeleton-hero" aria-hidden="true">
      <div className="skeleton-copy">
        <span className="skeleton-block skeleton-eyebrow"/>
        <span className="skeleton-block skeleton-title"/>
        <span className="skeleton-block skeleton-title skeleton-title-short"/>
        <span className="skeleton-block skeleton-line"/>
        <span className="skeleton-block skeleton-line skeleton-line-short"/>
        <span className="skeleton-block skeleton-button"/>
      </div>
      <span className="skeleton-block skeleton-visual"/>
    </div>
    <div className="skeleton-band" aria-hidden="true"><div className="container skeleton-section"><span className="skeleton-block skeleton-heading"/><div className="skeleton-cards"><span className="skeleton-block"/><span className="skeleton-block"/><span className="skeleton-block"/></div></div></div>
  </div>;
}
