"use client";
import { AdminPageSkeleton } from "@/components/admin/admin-skeleton";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { promoteMedia } from "@/components/admin/media-upload";
import { GalleryUpload } from "@/components/admin/gallery-upload";
type Album={id:string;title:string;slug:string;description:string|null;event_date:string|null;cover_url:string|null;status:string;version:number};
type Photo={id:string;album_id:string;image_url:string|null;storage_path:string|null;alt:string;caption:string|null;display_order:number;preview?:string};
export function GalleryEditor({id}:{id?:string}){const router=useRouter();const [album,setAlbum]=useState<Album|null>(null);const [photos,setPhotos]=useState<Photo[]>([]);const [title,setTitle]=useState("");const [slug,setSlug]=useState("");const [description,setDescription]=useState("");const [date,setDate]=useState("");const [coverId,setCoverId]=useState("");const [loading,setLoading]=useState(Boolean(id));const [busy,setBusy]=useState(false);const [uploading,setUploading]=useState(false);const [error,setError]=useState("");const [success,setSuccess]=useState("");const [uploadErrors,setUploadErrors]=useState<string[]>([]);useEffect(()=>{if(!id)return;const c=createClient();async function load(){const {data,error}=await c!.from("albums").select("*").eq("id",id).single();if(error||!data){setError("Album tidak ditemukan.");setLoading(false);return}setAlbum(data);setTitle(data.title);setSlug(data.slug);setDescription(data.description||"");setDate(data.event_date||"");const {data:records}=await c!.from("album_photos").select("*").eq("album_id",id).order("display_order");const withPreview=await Promise.all((records||[]).map(async(photo:Photo)=>{if(photo.image_url)return {...photo,preview:photo.image_url};if(photo.storage_path){const {data}=await c!.storage.from("draft-media").createSignedUrl(photo.storage_path,3600);return {...photo,preview:data?.signedUrl}}return photo}));setPhotos(withPreview);setCoverId(withPreview.find(p=>p.image_url===data.cover_url)?.id||withPreview[0]?.id||"");setLoading(false)}load()},[id]);async function saveDraft(){setError("");setSuccess("");if(title.trim().length<3||title.length>150){setError("Judul album harus 3–150 karakter.");return}if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)){setError("Slug harus memakai huruf kecil, angka, dan tanda hubung.");return}setBusy(true);const c=createClient();if(!c){setError("Layanan tidak tersedia.");setBusy(false);return}const payload={title:title.trim(),slug,description:description.trim()||null,event_date:date||null};if(album){const {data,error:dbError}=await c.from("albums").update(payload).eq("id",album.id).eq("version",album.version).select("*").maybeSingle();if(dbError)setError(dbError.code==="23505"?"Slug sudah digunakan.":"Album gagal disimpan.");else if(!data)setError("Album telah diubah oleh admin lain. Muat ulang halaman.");else{setAlbum(data);setSuccess("Album berhasil disimpan.");router.refresh()}}else{const {data,error:dbError}=await c.from("albums").insert({...payload,status:"draft"}).select("*").single();if(dbError)setError(dbError.code==="23505"?"Slug sudah digunakan.":"Album gagal dibuat.");else{setAlbum(data);setSuccess("Draft album dibuat. Anda dapat menambahkan foto.");router.replace(`/admin/galeri/${data.id}/edit`)}}setBusy(false)}async function uploadFiles(files: File[]) {
  if (!files || !album) return;
  const chosen = Array.from(files);
  if (photos.length + chosen.length > 20) {
    setError("Maksimal 20 foto dalam satu album.");
    return;
  }
  const client = createClient();
  if (!client) {
    setUploadErrors(["Layanan unggah tidak tersedia."]);
    return;
  }
  setUploading(true);
  setUploadErrors([]);
  let uploaded = 0;
  try {
    for (const file of chosen) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
        setUploadErrors(previous => [...previous, `${file.name}: gunakan JPG/PNG/WebP maksimal 5 MB.`]);
        continue;
      }
      const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
      const path = `gallery/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await client.storage.from("draft-media").upload(path, file, { contentType: file.type });
      if (uploadError) {
        setUploadErrors(previous => [...previous, `${file.name}: unggahan gagal, pilih ulang untuk mencoba.`]);
        continue;
      }
      const { data: inserted, error: dbError } = await client.from("album_photos").insert({
        album_id: album.id,
        storage_path: path,
        alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        display_order: photos.length + uploaded,
      }).select("*").single();
      if (dbError || !inserted) {
        setUploadErrors(previous => [...previous, `${file.name}: metadata gagal disimpan.`]);
        continue;
      }
      const { data: signed } = await client.storage.from("draft-media").createSignedUrl(path, 3600);
      setPhotos(previous => [...previous, { ...inserted, preview: signed?.signedUrl }]);
      setCoverId(current => current || inserted.id);
      uploaded += 1;
    }
  } catch {
    setUploadErrors(previous => [...previous, "Koneksi terputus saat mengunggah. Pilih ulang foto yang belum muncul."]);
  } finally {
    setUploading(false);
  }
}
function editPhoto(photoId:string,key:"alt"|"caption",value:string){setPhotos(prev=>prev.map(p=>p.id===photoId?{...p,[key]:value}:p))}function move(index:number,step:number){const target=index+step;if(target<0||target>=photos.length)return;setPhotos(prev=>{const next=[...prev];[next[index],next[target]]=[next[target],next[index]];return next})}async function savePhotos(){setError("");setSuccess("");if(!album)return;setBusy(true);const c=createClient()!;for(let i=0;i<photos.length;i++){const p=photos[i];if(!p.alt.trim()||p.alt.length>200){setError(`Alt text foto ${i+1} wajib diisi, maksimal 200 karakter.`);setBusy(false);return}const {error:dbError}=await c.from("album_photos").update({alt:p.alt.trim(),caption:p.caption?.trim()||null,display_order:i}).eq("id",p.id);if(dbError){setError("Perubahan foto gagal disimpan.");setBusy(false);return}}setSuccess("Keterangan dan urutan foto disimpan.");setBusy(false);router.refresh()}async function changeStatus(next:"published"|"draft"|"archived"){if(!album)return;setError("");setSuccess("");if(next==="published"&&(!photos.length||!coverId)){setError("Tambahkan minimal satu foto dan pilih sampul.");return}if(next==="published"&&photos.some(p=>!p.alt.trim())){setError("Alt text setiap foto wajib diisi.");return}if(!window.confirm(next==="published"?"Terbitkan album dan seluruh foto ini?":next==="archived"?"Arsipkan album ini dari website publik?":"Kembalikan album ke draft?"))return;setBusy(true);try{const c=createClient()!;let updatedPhotos=[...photos];if(next==="published"){for(let i=0;i<updatedPhotos.length;i++){const photo=updatedPhotos[i];if(!photo.image_url){if(!photo.storage_path)throw new Error("Foto belum siap diterbitkan.");photo.image_url=await promoteMedia(photo.storage_path)}const {error:photoError}=await c.from("album_photos").update({image_url:photo.image_url,alt:photo.alt.trim(),caption:photo.caption?.trim()||null,display_order:i}).eq("id",photo.id);if(photoError)throw new Error("Foto gagal disimpan. Album tetap sebagai draft.")}setPhotos(updatedPhotos)}const cover=updatedPhotos.find(p=>p.id===coverId)?.image_url||null;const {data,error:dbError}=await c.from("albums").update({status:next,cover_url:next==="published"?cover:album.cover_url}).eq("id",album.id).eq("version",album.version).select("*").maybeSingle();if(dbError)throw new Error("Status album gagal disimpan.");if(!data)throw new Error("Album berubah di sesi lain. Muat ulang halaman.");setAlbum(data);setSuccess("Status album berhasil diperbarui.");router.refresh()}catch(e){setError(e instanceof Error?e.message:"Gagal mengubah status.")}finally{setBusy(false)}}if(loading)return <AdminPageSkeleton variant="form" />;return <><div className="admin-page-head"><div><span className="eyebrow">Galeri {album?`· ${album.status}`:"· baru"}</span><h1>{album?"Ubah Album":"Buat Album"}</h1><p>Simpan album terlebih dahulu, kemudian tambahkan foto.</p></div><Link href="/admin/galeri" className="btn btn-quiet">Kembali ke daftar</Link></div><div className="admin-form">{error&&<div className="alert-error" role="alert">{error}</div>}{success&&<div className="alert-success" role="status">{success}</div>}<div className="field"><label htmlFor="album-title">Judul album *</label><input id="album-title" value={title} maxLength={150} onChange={e=>{setTitle(e.target.value);if(!album)setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-"))}}/></div><div className="field"><label htmlFor="album-slug">Slug *</label><input id="album-slug" value={slug} disabled={album?.status==="published"} onChange={e=>setSlug(e.target.value)}/></div><div className="field"><label htmlFor="album-date">Tanggal kegiatan</label><input id="album-date" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div><div className="field"><label htmlFor="album-desc">Deskripsi</label><textarea id="album-desc" value={description} onChange={e=>setDescription(e.target.value)}/></div><button className="btn btn-primary" onClick={saveDraft} disabled={busy}>{busy?"Menyimpan...":album?"Simpan perubahan":"Simpan draft album"}</button>{album&&<section style={{marginTop:35,borderTop:"1px solid var(--border)",paddingTop:30}}><h2>Foto album</h2><GalleryUpload existingCount={photos.length} disabled={uploading||busy} onReady={uploadFiles}/>{uploading&&<p className="tiny muted" role="status">Mengunggah foto...</p>}{uploadErrors.map((message,i)=><div className="alert-error" key={i}>{message}</div>)}{photos.map((p,i)=><div className="content-card" key={p.id} style={{marginBottom:14}}>{p.preview&&<img src={p.preview} alt={p.alt} style={{display:"block",maxWidth:180,maxHeight:225,width:"auto",height:"auto",borderRadius:4}}/>}<div className="field"><label htmlFor={`alt-${p.id}`}>Alt text foto {i+1} *</label><input id={`alt-${p.id}`} value={p.alt} maxLength={200} onChange={e=>editPhoto(p.id,"alt",e.target.value)}/></div><div className="field"><label htmlFor={`caption-${p.id}`}>Keterangan</label><input id={`caption-${p.id}`} value={p.caption||""} onChange={e=>editPhoto(p.id,"caption",e.target.value)}/></div><label className="field"><span><input type="radio" name="cover" checked={coverId===p.id} onChange={()=>setCoverId(p.id)}/> Jadikan sampul</span></label><div className="form-actions"><button type="button" className="btn btn-quiet" disabled={i===0} onClick={()=>move(i,-1)}>Naik</button><button type="button" className="btn btn-quiet" disabled={i===photos.length-1} onClick={()=>move(i,1)}>Turun</button></div></div>)}<div className="form-actions"><button className="btn btn-outline" disabled={busy} onClick={savePhotos}>Simpan foto & urutan</button><button className="btn btn-primary" disabled={busy||uploading} onClick={()=>changeStatus("published")}>{album.status==="published"?"Terbitkan perubahan":"Terbitkan album"}</button>{album.status==="published"&&<button className="btn btn-quiet" disabled={busy} onClick={()=>changeStatus("draft")}>Kembalikan ke draft</button>}{album.status!=="archived"&&<button className="btn btn-quiet" disabled={busy} onClick={()=>changeStatus("archived")}>Arsipkan</button>}{album.status==="archived"&&<button className="btn btn-quiet" disabled={busy} onClick={()=>changeStatus("draft")}>Pulihkan ke draft</button>}</div></section>}</div></>}
