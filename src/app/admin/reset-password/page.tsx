import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/admin/auth-forms";
export const metadata:Metadata={title:"Atur Ulang Kata Sandi",robots:{index:false,follow:false}};
export default function Reset(){return <main id="main" className="auth-wrap"><ResetPasswordForm/></main>}
