import { ApplicantDetail } from "@/components/admin/applicants-admin";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ApplicantDetail id={id}/>}
