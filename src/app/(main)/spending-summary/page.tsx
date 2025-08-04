'use client'

import { AuthContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useContext } from "react"

export default function SpendingSummary() {
    const router = useRouter()
    const {logout} = useContext(AuthContext)
    return (
        <div className="background">
            <div className="book">
                <div className="page-left">
                </div>
                <div className="page-right">
                    
                </div>
            </div>
            <button className="toc" onClick={() => router.push('/table-of-contents')}>Table of Contents</button>
            <button className="logout" onClick={logout}>Logout</button>
        </div>
    )
}