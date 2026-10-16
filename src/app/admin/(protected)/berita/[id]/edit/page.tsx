import { NewsEditor } from "@/components/admin/news-admin";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <NewsEditor id={id}/>}
