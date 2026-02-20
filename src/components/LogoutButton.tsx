"use client"

import { signOut } from "next-auth/react"

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-300 bg-slate-800/50 border border-slate-700/50 rounded-full hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm hover:shadow-rose-500/10 backdrop-blur-sm"
        >
            <span className="relative z-10 flex items-center gap-2">
                Sign Out
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </span>
        </button>
    )
}
