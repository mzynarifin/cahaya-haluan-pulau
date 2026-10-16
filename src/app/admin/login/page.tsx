import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/auth-forms";
import { Suspense } from "react";
export const metadata:Metadata={title:"Masuk Admin",robots:{index:false,follow:false}};
export default function Login(){return <main id="main" className="auth-wrap"><Suspense fallback={<p>Memuat formulir masuk...</p>}><LoginForm/></Suspense></main>}
