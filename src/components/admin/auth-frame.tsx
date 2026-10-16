export function AuthFrame({ children }: { children: React.ReactNode }) {
  return <main id="main" className="auth-wrap">
    <aside className="auth-intro" aria-label="Portal pengelola">
      <div>
        <span className="auth-kicker">Cahaya Haluan Pulau</span>
        <h2>Portal Pengelola</h2>
        <p>Ruang kerja untuk mengelola informasi asrama, berita, galeri, dan tindak lanjut calon penghuni.</p>
      </div>
      <span className="auth-intro-footer">Akses khusus pengurus yang berwenang</span>
    </aside>
    <div className="auth-panel">{children}</div>
  </main>;
}
