import type { Metadata } from "next";
import { ResetRequestForm } from "@/components/admin/auth-forms";
import { AuthFrame } from "@/components/admin/auth-frame";
export const metadata:Metadata={title:"Lupa Kata Sandi",robots:{index:false,follow:false}};
export default function Forgot(){return <AuthFrame><ResetRequestForm/></AuthFrame>}
