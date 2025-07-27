'use client'

import stylesl from "@/styles/header.module.css"
import { useRouter } from "next/navigation"

export default function Header() {
    const router = useRouter()
    return (
        <div className={stylesl.header}>
            <div className="logo">
                <img className="logo_img" src="/logo.png"></img>
                <h1 className="logo_text">BudgetBook</h1>
            </div>
            <div className={stylesl.buttons}>
                <button className="buttonPrimary" onClick={() => router.push('/login')}>Login</button>
                <button className="buttonPrimary" onClick={() => router.push('/signup')}>Signup</button> 
            </div>    
        </div>
        
    )
}