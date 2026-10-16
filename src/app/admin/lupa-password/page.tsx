import type { Metadata } from "next";
import { ResetRequestForm } from "@/components/admin/auth-forms";
export const metadata:Metadata={title:"Lupa Kata Sandi",robots:{index:false,follow:false}};
export default function Forgot(){return <main id="main" className="auth-wrap"><ResetRequestForm/></main>}
