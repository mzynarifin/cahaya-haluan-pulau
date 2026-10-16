"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Brand } from "@/components/public-header";
import { createClient } from "@/lib/supabase/browser";
import { safeReturnTo } from "@/lib/config";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const client = createClient();
    if (!client) {
      setError("Konfigurasi layanan belum lengkap. Hubungi pengelola teknis.");
      setBusy(false);
      return;
    }
    const result = await client.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) {
      setError("Email atau kata sandi tidak sesuai. Silakan coba lagi.");
      return;
    }
    router.replace(safeReturnTo(search.get("next")));
    router.refresh();
  }

  return <div className="auth-card">
    <Brand />
    <h1>Masuk admin</h1>
    <p>Kelola informasi Cahaya Haluan Pulau.</p>
    {search.get("error") && <div className="alert-error">Tautan masuk tidak berlaku. Silakan masuk kembali.</div>}
    {error && <div className="alert-error" role="alert">{error}</div>}
    <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="password">Kata sandi</label>
        <div className="password-input">
          <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            aria-pressed={showPassword} title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
            {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? "Sedang masuk..." : "Masuk"}</button>
    </form>
    <div className="auth-links"><Link href="/">Kembali ke situs</Link><Link href="/admin/lupa-password">Lupa kata sandi?</Link></div>
  </div>;
}
export function ResetRequestForm(){const [email,setEmail]=useState("");const [busy,setBusy]=useState(false);const [sent,setSent]=useState(false);async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);const client=createClient();if(client)await client.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/admin/auth/callback?next=/admin/reset-password`});setBusy(false);setSent(true)}return <div className="auth-card"><Brand/><h1>Lupa kata sandi</h1><p>Masukkan email akun admin. Jika tercatat, petunjuk pemulihan akan dikirim.</p>{sent?<div className="alert-success" role="status">Jika email tercatat, tautan pemulihan telah dikirim. Periksa kotak masuk Anda.</div>:<form onSubmit={submit}><div className="field"><label htmlFor="reset-email">Email</label><input id="reset-email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div><button className="btn btn-primary" disabled={busy}>{busy?"Mengirim...":"Kirim tautan pemulihan"}</button></form>}<div className="auth-links"><Link href="/admin/login">Kembali ke login</Link></div></div>}
export function ResetPasswordForm(){const router=useRouter();const [password,setPassword]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");const client=createClient();if(!client){setError("Layanan belum dikonfigurasi.");setBusy(false);return}const {data}=await client.auth.getUser();if(!data.user){setError("Tautan pemulihan tidak berlaku atau telah kedaluwarsa. Minta tautan baru.");setBusy(false);return}const result=await client.auth.updateUser({password});setBusy(false);if(result.error){setError(result.error.message);return}router.replace("/admin");router.refresh()}return <div className="auth-card"><Brand/><h1>Atur ulang kata sandi</h1><p>Gunakan tautan pemulihan yang sah dari email Anda.</p>{error&&<div className="alert-error" role="alert">{error}</div>}<form onSubmit={submit}><div className="field"><label htmlFor="new-password">Kata sandi baru</label><input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/></div><button className="btn btn-primary" disabled={busy}>{busy?"Menyimpan...":"Simpan kata sandi"}</button></form><div className="auth-links"><Link href="/admin/lupa-password">Minta tautan baru</Link></div></div>}
