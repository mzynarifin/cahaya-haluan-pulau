"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/public-header";
import { createClient } from "@/lib/supabase/browser";

export function ResetRequestForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const client = createClient();
      if (!client) {
        setError("Layanan pemulihan belum dikonfigurasi. Silakan hubungi pengelola situs.");
        return;
      }

      const redirect = new URL("/admin/auth/callback", window.location.origin);
      redirect.searchParams.set("next", "/admin/reset-password");
      const { error: requestError } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirect.toString(),
      });

      if (requestError) {
        setError("Tautan pemulihan belum dapat dikirim. Periksa koneksi atau pengaturan email, lalu coba lagi.");
        return;
      }

      setSent(true);
    } catch {
      setError("Layanan pemulihan tidak merespons. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="auth-card" aria-busy={busy}>
    <Brand />
    <h1>Lupa kata sandi</h1>
    <p>Masukkan email akun admin untuk meminta tautan pemulihan.</p>
    {error && <div className="alert-error" role="alert">{error}</div>}
    {sent ? <div className="alert-success" role="status">
      Jika alamat email tersebut terdaftar, petunjuk pemulihan telah dikirim. Periksa kotak masuk dan folder spam.
    </div> : <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="reset-email">Email</label>
        <input id="reset-email" type="email" autoComplete="email" value={email}
          onChange={event => setEmail(event.target.value)} required />
      </div>
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Mengirim..." : "Kirim tautan pemulihan"}
      </button>
    </form>}
    <div className="auth-links"><Link href="/admin-chppanel">Kembali ke login</Link></div>
  </div>;
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Kata sandi dan konfirmasinya belum sama.");
      return;
    }

    setBusy(true);
    try {
      const client = createClient();
      if (!client) {
        setError("Layanan pemulihan belum dikonfigurasi. Silakan hubungi pengelola situs.");
        return;
      }

      const { data, error: sessionError } = await client.auth.getUser();
      if (sessionError || !data.user) {
        setError("Tautan pemulihan tidak berlaku atau sudah kedaluwarsa. Minta tautan baru.");
        return;
      }

      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) {
        setError("Kata sandi belum dapat diperbarui. Pastikan memenuhi aturan kata sandi, lalu coba lagi.");
        return;
      }

      window.location.assign("/admin");
    } catch {
      setError("Layanan pemulihan tidak merespons. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="auth-card" aria-busy={busy}>
    <Brand />
    <h1>Atur ulang kata sandi</h1>
    <p>Buat kata sandi baru untuk akun admin Anda.</p>
    {error && <div className="alert-error" role="alert">{error}</div>}
    <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="new-password">Kata sandi baru</label>
        <input id="new-password" type="password" autoComplete="new-password" minLength={8}
          value={password} onChange={event => setPassword(event.target.value)} required />
        <small>Gunakan sekurangnya 8 karakter.</small>
      </div>
      <div className="field">
        <label htmlFor="confirm-password">Ulangi kata sandi baru</label>
        <input id="confirm-password" type="password" autoComplete="new-password" minLength={8}
          value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required />
      </div>
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Menyimpan..." : "Simpan kata sandi"}
      </button>
    </form>
    <div className="auth-links"><Link href="/admin/lupa-password">Minta tautan baru</Link></div>
  </div>;
}
