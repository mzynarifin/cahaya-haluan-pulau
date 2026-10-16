import { GalleryEditor } from "@/components/admin/gallery-admin";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <GalleryEditor id={id}/>}
