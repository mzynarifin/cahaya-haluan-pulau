import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/admin/auth-forms";
import { AuthFrame } from "@/components/admin/auth-frame";
export const metadata:Metadata={title:"Atur Ulang Kata Sandi",robots:{index:false,follow:false}};
export default function Reset(){return <AuthFrame><ResetPasswordForm/></AuthFrame>}
