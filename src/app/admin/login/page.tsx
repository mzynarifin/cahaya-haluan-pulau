import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/auth-forms";
import { AuthFrame } from "@/components/admin/auth-frame";
import { Suspense } from "react";
export const metadata:Metadata={title:"Masuk Admin",robots:{index:false,follow:false}};
export default function Login(){return <AuthFrame><Suspense fallback={<p>Memuat formulir masuk...</p>}><LoginForm/></Suspense></AuthFrame>}
