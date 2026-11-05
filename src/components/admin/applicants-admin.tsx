"use client";
import { AdminPageSkeleton } from "@/components/admin/admin-skeleton";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowUpRight, Plus, Search, Trash2, UserRound } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/browser";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { formatDate, formatDateTime } from "@/lib/config";
const statuses=["Baru","Dihubungi","Diproses","Diterima","Ditolak","Mengundurkan diri"] as const;
type Status=typeof statuses[number];
type Applicant={id:string;full_name:string;whatsapp:string;origin:string;target_campus:string|null;entry_year:number;status:Status;internal_notes:string|null;consent_recorded_at:string;created_at:string;updated_at:string;version:number};
type History={id:string;from_status:string;to_status:string;reason:string|null;changed_at:string;changed_by:string};
const schema=z.object({full_name:z.string().trim().min(2).max(120),whatsapp:z.string().regex(/^62[1-9]\d{7,12}$/,"Gunakan nomor internasional berawalan 62."),origin:z.string().trim().min(1).max(120),target_campus:z.string().max(150),entry_year:z.coerce.number().int().min(new Date().getFullYear()-1).max(new Date().getFullYear()+10),internal_notes:z.string().max(2000)});
type Form=z.infer<typeof schema>;
export function ApplicantsList() {
  const [items, setItems] = useState<Applicant[]>([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim());
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Applicant | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = deleteDialogRef.current;
    if (!dialog) return;
    if (deleteTarget && !dialog.open) dialog.showModal();
    if (!deleteTarget && dialog.open) dialog.close();
  }, [deleteTarget]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const client = createClient();
    if (!client) {
      setError("Layanan belum dikonfigurasi.");
      setLoading(false);
      return () => { active = false; };
    }

    let request = client.from("applicants")
      .select("id,full_name,whatsapp,origin,entry_year,status,created_at", { count: "exact" })
      .order("created_at", { ascending: false });
    if (debouncedQuery) {
      const safeQuery = debouncedQuery.replace(/[%,().]/g, "");
      request = request.or(`full_name.ilike.%${safeQuery}%,whatsapp.ilike.%${safeQuery}%`);
    }
    if (status) request = request.eq("status", status);

    Promise.resolve(request.range((page - 1) * 20, page * 20 - 1))
      .then(({ data, count, error: queryError }) => {
        if (!active) return;
        if (queryError) setError("Data calon penghuni gagal dimuat.");
        setItems((data || []) as Applicant[]);
        setTotal(count || 0);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("Data calon penghuni gagal dimuat.");
        setLoading(false);
      });

    return () => { active = false; };
  }, [debouncedQuery, status, page]);

  function openDeleteDialog(applicant: Applicant) {
    setDeleteName("");
    setDeleteError("");
    setSuccess("");
    setDeleteTarget(applicant);
  }

  function closeDeleteDialog() {
    if (deleteBusy) return;
    setDeleteTarget(null);
    setDeleteName("");
    setDeleteError("");
  }

  async function deleteApplicant() {
    const applicant = deleteTarget;
    if (!applicant || deleteName !== applicant.full_name || deleteBusy) return;

    setDeleteBusy(true);
    setDeleteError("");
    try {
      const client = createClient();
      if (!client) {
        setDeleteError("Layanan belum dikonfigurasi. Data belum dihapus.");
        return;
      }

      const { error: deleteRequestError } = await client.rpc("delete_applicant", {
        p_id: applicant.id,
        p_expected_name: deleteName,
      });
      if (deleteRequestError) {
        setDeleteError("Catatan belum dapat dihapus. Muat ulang halaman lalu coba lagi.");
        return;
      }

      setItems(current => current.filter(item => item.id !== applicant.id));
      setTotal(current => Math.max(0, current - 1));
      if (items.length === 1 && page > 1) setPage(current => Math.max(1, current - 1));
      setSuccess(`Catatan ${applicant.full_name} berhasil dihapus.`);
      setDeleteTarget(null);
      setDeleteName("");
    } catch {
      setDeleteError("Terjadi gangguan saat menghapus. Coba lagi.");
    } finally {
      setDeleteBusy(false);
    }
  }

  return <div className="applicants-list">
    <div className="admin-page-head"><div><span className="eyebrow">Penerimaan</span><h1>Calon Penghuni</h1><p>Data ini hanya tersedia bagi admin. Catat setelah mendapat persetujuan.</p></div>
      <Link className="btn btn-primary" href="/admin/pendaftar/baru"><Plus size={18} aria-hidden="true" />Catat Calon Penghuni</Link>
    </div>
    <div className="searchbar applicants-toolbar">
      <label className="applicants-search"><Search size={18} aria-hidden="true" /><input aria-label="Cari nama atau nomor" placeholder="Cari nama atau nomor WhatsApp" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label>
      <select aria-label="Filter status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
        <option value="">Semua status</option>{statuses.map(value => <option key={value}>{value}</option>)}
      </select>
    </div>
    {error && <div className="alert-error" role="alert">{error}</div>}
    {success && <div className="alert-success" role="status">{success}</div>}
    {loading ? <AdminPageSkeleton variant="list" embedded /> : items.length ?
      <div className="table-wrap applicants-table-wrap"><table className="data-table applicants-table"><thead><tr><th>Nama</th><th>Asal</th><th>Tahun masuk</th><th>Status</th><th>Tindakan</th></tr></thead>
        <tbody>{items.map(applicant => <tr key={applicant.id}><td className="applicant-cell applicant-name-cell"><span className="applicant-cell-label">Calon penghuni</span><div className="applicant-person"><span className="applicant-avatar"><UserRound size={18} aria-hidden="true" /></span><span className="applicant-person-copy"><strong>{applicant.full_name}</strong><span className="applicant-secondary">{applicant.whatsapp}</span><span className="applicant-created">Dicatat {formatDate(applicant.created_at)}</span></span></div></td>
          <td className="applicant-cell applicant-origin-cell"><span className="applicant-cell-label">Daerah asal</span>{applicant.origin}</td><td className="applicant-cell applicant-year-cell"><span className="applicant-cell-label">Tahun masuk</span>{applicant.entry_year}</td><td className="applicant-cell applicant-status-cell"><span className="applicant-cell-label">Status</span><span className={`status ${applicant.status}`}>{applicant.status}</span></td>
          <td className="applicant-cell applicant-action-cell"><span className="applicant-cell-label">Tindakan</span><div className="applicant-actions"><Link className="btn btn-quiet applicants-detail-link" href={`/admin/pendaftar/${applicant.id}`}>Detail<ArrowUpRight size={16} aria-hidden="true" /></Link><button type="button" className="btn btn-danger applicants-delete-button" aria-label={`Hapus catatan ${applicant.full_name}`} onClick={() => openDeleteDialog(applicant)}><Trash2 size={16} aria-hidden="true" />Hapus</button></div></td></tr>)}</tbody>
      </table></div> : <div className="empty"><h3>{debouncedQuery || status ? "Tidak ada hasil" : "Belum ada calon penghuni"}</h3>
        <p>{debouncedQuery || status ? "Ubah kata kunci atau filter status untuk menemukan catatan lain." : "Catat calon penghuni dari percakapan WhatsApp setelah persetujuan."}</p></div>}
    {total > 20 && <div className="pagination applicants-pagination"><button className="btn btn-quiet" disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</button>
      <span>Halaman {page}</span><button className="btn btn-quiet" disabled={page * 20 >= total} onClick={() => setPage(page + 1)}>Berikutnya</button></div>}
    <dialog ref={deleteDialogRef} className="applicant-delete-dialog" aria-labelledby="applicant-delete-title" aria-describedby="applicant-delete-description"
      onCancel={event => { event.preventDefault(); closeDeleteDialog(); }}>
      {deleteTarget && <div className="applicant-delete-dialog-content">
        <span className="applicant-delete-icon"><Trash2 size={21} aria-hidden="true" /></span>
        <span className="eyebrow">Hapus data</span>
        <h2 id="applicant-delete-title">Hapus calon penghuni?</h2>
        <p id="applicant-delete-description">Catatan <strong>{deleteTarget.full_name}</strong> dan seluruh riwayat statusnya akan dihapus permanen.</p>
        <div className="field">
          <label htmlFor="applicant-delete-name">Ketik nama lengkap untuk melanjutkan</label>
          <input id="applicant-delete-name" autoFocus autoComplete="off" value={deleteName} onChange={event => setDeleteName(event.target.value)} />
        </div>
        {deleteError && <div className="alert-error" role="alert">{deleteError}</div>}
        <div className="applicant-delete-actions">
          <button type="button" className="btn btn-quiet" disabled={deleteBusy} onClick={closeDeleteDialog}>Batal</button>
          <button type="button" className="btn btn-danger" disabled={deleteBusy || deleteName !== deleteTarget.full_name} onClick={deleteApplicant}>
            <Trash2 size={16} aria-hidden="true" />{deleteBusy ? "Menghapus..." : "Hapus permanen"}
          </button>
        </div>
      </div>}
    </dialog>
  </div>;
}
export function ApplicantCreate(){const router=useRouter();const {register,handleSubmit,watch,formState:{errors}}=useForm<Form>({defaultValues:{entry_year:new Date().getFullYear(),target_campus:"",internal_notes:""}});const [consent,setConsent]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [duplicate,setDuplicate]=useState(false);const whatsapp=watch("whatsapp");async function checkDuplicate(){if(!/^62[1-9]\d{7,12}$/.test(whatsapp||""))return;const {count}=await createClient()!.from("applicants").select("id",{count:"exact",head:true}).eq("whatsapp",whatsapp);setDuplicate(Boolean(count))}async function submit(raw:Form){setError("");const result=schema.safeParse(raw);if(!result.success){setError(result.error.issues[0]?.message||"Periksa isian.");return}if(!consent){setError("Persetujuan pencatatan wajib diberikan sebelum menyimpan.");return}setBusy(true);const {data,error:dbError}=await createClient()!.from("applicants").insert({...result.data,whatsapp:result.data.whatsapp,status:"Baru"}).select("id").single();setBusy(false);if(dbError){setError("Data gagal disimpan. Periksa kembali isian dan coba lagi.");return}router.replace(`/admin/pendaftar/${data.id}`);router.refresh()}return <><div className="admin-page-head"><div><span className="eyebrow">Penerimaan</span><h1>Catat Calon Penghuni</h1><p>Catat data minimum dari percakapan WhatsApp setelah persetujuan.</p></div><Link href="/admin/pendaftar" className="btn btn-quiet">Kembali</Link></div><div className="admin-form">{error&&<div className="alert-error" role="alert">{error}</div>}{duplicate&&<div className="notice">Nomor ini sudah digunakan pada catatan lain. Periksa kemungkinan duplikat; Anda tetap dapat melanjutkan.</div>}<form onSubmit={handleSubmit(submit)}><div className="field"><label htmlFor="full_name">Nama lengkap *</label><input id="full_name" {...register("full_name",{required:true})} maxLength={120}/>{errors.full_name&&<span className="field-error">Nama minimal 2 karakter.</span>}</div><div className="field"><label htmlFor="app-wa">WhatsApp *</label><input id="app-wa" {...register("whatsapp",{required:true})} onBlur={checkDuplicate} placeholder="62..."/><small>Nomor internasional berawalan 62.</small>{errors.whatsapp&&<span className="field-error">Nomor wajib diisi.</span>}</div><div className="field"><label htmlFor="origin">Daerah asal *</label><input id="origin" {...register("origin",{required:true})} maxLength={120}/></div><div className="field"><label htmlFor="campus">Kampus tujuan</label><input id="campus" {...register("target_campus")} maxLength={150}/><small>Kosongkan jika belum ditentukan.</small></div><div className="field"><label htmlFor="entry_year">Tahun rencana masuk *</label><input id="entry_year" type="number" {...register("entry_year",{valueAsNumber:true})}/></div><div className="field"><label htmlFor="notes">Catatan internal</label><textarea id="notes" {...register("internal_notes")} maxLength={2000}/></div><label className="field"><span><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Saya telah mendapat persetujuan untuk mencatat data calon penghuni ini. *</span></label><button className="btn btn-primary" disabled={busy}>{busy?"Menyimpan...":"Simpan Catatan"}</button></form></div></>}
export function ApplicantDetail({id}:{id:string}){const router=useRouter();const [row,setRow]=useState<Applicant|null>(null);const [history,setHistory]=useState<History[]>([]);const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [success,setSuccess]=useState("");const [next,setNext]=useState("");const [reason,setReason]=useState("");const [editing,setEditing]=useState(false);const [fields,setFields]=useState<Partial<Applicant>>({});async function load(){const c=createClient()!;const [{data,error},{data:entries}]=await Promise.all([c.from("applicants").select("*").eq("id",id).single(),c.from("applicant_status_history").select("*").eq("applicant_id",id).order("changed_at",{ascending:false})]);if(error)setError("Data tidak ditemukan atau tidak dapat dibaca.");else{setRow(data);setFields(data)}setHistory(entries||[]);setLoading(false)}useEffect(()=>{load()},[id]);async function changeStatus(){if(!row||!next)return;setError("");setSuccess("");if((next==="Ditolak"||(["Diterima","Ditolak","Mengundurkan diri"].includes(row.status)&&["Baru","Dihubungi","Diproses"].includes(next)))&&!reason.trim()){setError("Alasan perubahan status wajib diisi.");return}if(!window.confirm(`Ubah status ${row.full_name} menjadi ${next}?`))return;setBusy(true);const {data,error:dbError}=await createClient()!.rpc("change_applicant_status",{p_id:id,p_expected_version:row.version,p_to:next,p_reason:reason||null});setBusy(false);if(dbError){setError(dbError.message.includes("version_conflict")?"Status berubah di sesi admin lain. Muat ulang detail.":"Perubahan status gagal. Periksa alur dan alasan.");return}setRow(data);setNext("");setReason("");setSuccess("Status berhasil diperbarui dan riwayat tercatat.");await load();router.refresh()}async function saveData(){if(!row)return;setError("");setSuccess("");const parsed=schema.safeParse({full_name:fields.full_name,whatsapp:fields.whatsapp,origin:fields.origin,target_campus:fields.target_campus||"",entry_year:fields.entry_year,internal_notes:fields.internal_notes||""});if(!parsed.success){setError(parsed.error.issues[0]?.message||"Periksa isian.");return}setBusy(true);const {data,error:dbError}=await createClient()!.from("applicants").update(parsed.data).eq("id",row.id).eq("version",row.version).select("*").maybeSingle();setBusy(false);if(dbError){setError("Perubahan gagal disimpan.");return}if(!data){setError("Data sudah diubah oleh admin lain. Muat ulang sebelum menyimpan.");return}setRow(data);setFields(data);setEditing(false);setSuccess("Data calon penghuni berhasil diperbarui.")}async function removeApplicant(){if(!row)return;const name=window.prompt(`Ketik nama lengkap "${row.full_name}" untuk menghapus catatan ini secara permanen:`);if(name===null)return;if(name!==row.full_name){setError("Nama tidak cocok. Catatan tidak dihapus.");return}setBusy(true);const {error:deleteError}=await createClient()!.rpc("delete_applicant",{p_id:row.id,p_expected_name:name});setBusy(false);if(deleteError){setError("Penghapusan gagal. Coba lagi atau hubungi pengelola teknis.");return}router.replace("/admin/pendaftar");router.refresh()}if(loading)return <AdminPageSkeleton variant="detail" />;if(!row)return <div className="alert-error">{error||"Data tidak ditemukan."}</div>;return <><div className="admin-page-head"><div><span className="eyebrow">Calon penghuni · privat</span><h1>{row.full_name}</h1><p>Dicatat {formatDate(row.created_at)} · <span className={`status ${row.status}`}>{row.status}</span></p></div><Link href="/admin/pendaftar" className="btn btn-quiet">Kembali ke daftar</Link></div>{error&&<div className="alert-error" role="alert">{error}</div>}{success&&<div className="alert-success" role="status">{success}</div>}<div className="split applicant-detail-layout"><div className="admin-form applicant-data-card"><h2>Data calon penghuni</h2>{editing?<><div className="field"><label>Nama lengkap<input value={fields.full_name||""} onChange={e=>setFields({...fields,full_name:e.target.value})}/></label></div><div className="field"><label>WhatsApp<input value={fields.whatsapp||""} onChange={e=>setFields({...fields,whatsapp:e.target.value})}/></label></div><div className="field"><label>Daerah asal<input value={fields.origin||""} onChange={e=>setFields({...fields,origin:e.target.value})}/></label></div><div className="field"><label>Kampus tujuan<input value={fields.target_campus||""} onChange={e=>setFields({...fields,target_campus:e.target.value})}/></label></div><div className="field"><label>Tahun rencana masuk<input type="number" value={fields.entry_year||""} onChange={e=>setFields({...fields,entry_year:Number(e.target.value)})}/></label></div><div className="field"><label>Catatan internal<textarea value={fields.internal_notes||""} onChange={e=>setFields({...fields,internal_notes:e.target.value})}/></label></div><div className="form-actions"><button className="btn btn-primary" disabled={busy} onClick={saveData}>Simpan perubahan</button><button className="btn btn-quiet" onClick={()=>{setEditing(false);setFields(row)}}>Batal</button></div></>:<><table className="applicant-data-table" aria-label="Data calon penghuni">
  <tbody>
    <tr><th scope="row">WhatsApp</th><td>{row.whatsapp}</td></tr>
    <tr><th scope="row">Daerah asal</th><td>{row.origin}</td></tr>
    <tr><th scope="row">Kampus tujuan</th><td>{row.target_campus || "Belum ditentukan"}</td></tr>
    <tr><th scope="row">Tahun rencana masuk</th><td>{row.entry_year}</td></tr>
    <tr><th scope="row">Persetujuan dicatat</th><td>{formatDate(row.consent_recorded_at)}</td></tr>
    <tr><th scope="row">Catatan internal</th><td className="applicant-data-notes">{row.internal_notes || "Belum ada catatan"}</td></tr>
  </tbody>
</table><div className="form-actions"><button className="btn btn-outline" onClick={()=>setEditing(true)}>Ubah data</button><a className="btn btn-quiet" href={`https://wa.me/${row.whatsapp}`} target="_blank" rel="noopener noreferrer">Hubungi via WhatsApp ↗</a></div></>}</div><div><div className="admin-form"><h2>Ubah status</h2><p>Status saat ini: <strong>{row.status}</strong></p><div className="field"><label htmlFor="next-status">Status berikutnya</label><select id="next-status" value={next} onChange={e=>setNext(e.target.value)}><option value="">Pilih status</option>{statuses.map(status=><option key={status} value={status} disabled={status===row.status}>{status}{status===row.status?" (saat ini)":""}</option>)}</select></div><div className="field"><label htmlFor="reason">Alasan / catatan keputusan</label><textarea id="reason" value={reason} onChange={e=>setReason(e.target.value)}/><small>Wajib untuk penolakan dan pembukaan ulang.</small></div><button className="btn btn-primary" disabled={!next||busy} onClick={changeStatus}>{busy?"Menyimpan...":"Perbarui Status"}</button></div><div className="admin-form" style={{marginTop:20}}><h2>Riwayat status</h2>{history.length?<ul className="inline-list">{history.map(h=><li key={h.id} style={{display:"block"}}><strong>{h.from_status} → {h.to_status}</strong><div className="tiny muted">{formatDateTime(h.changed_at)} · Admin {h.changed_by.slice(0,8)}</div>{h.reason&&<p>{h.reason}</p>}</li>)}</ul>:<p>Belum ada perubahan status.</p>}</div></div></div></>}
