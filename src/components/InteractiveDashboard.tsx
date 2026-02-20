"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import useSWR from "swr"
import { api } from "@/lib/api"
import LogoutButton from "@/components/LogoutButton"

export default function InteractiveDashboard({ user: initialUser }: { user: any }) {
    const { data: userData, mutate: mutateUser } = useSWR(
        "/api/me",
        api.getCurrentUser,
        { fallbackData: { user: initialUser } }
    )

    const user = userData?.user || initialUser
    const favoriteMovie = user?.favoriteMovie

    const { data: factData, mutate: mutateFact, isValidating: isFactLoading } = useSWR(
        favoriteMovie ? `/api/fact?movie=${encodeURIComponent(favoriteMovie)}` : null,
        () => api.getFactForMovie(favoriteMovie!),
        {
            dedupingInterval: 30000, // 30 seconds client-side cache
            revalidateOnFocus: false, // Don't re-fetch just because tab focused
        }
    )

    const fact = factData?.fact

    // Inline edit state
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(favoriteMovie || "")
    const [isSaving, setIsSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            // optionally place cursor at the end
            inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length)
        }
    }, [isEditing])

    const handleEditSave = async () => {
        const trimmed = editValue.trim()
        if (!trimmed || trimmed === favoriteMovie) {
            setIsEditing(false)
            setEditValue(favoriteMovie || "")
            return
        }
        if (trimmed.length < 2 || trimmed.length > 100) {
            alert("Movie name must be between 2 and 100 characters.")
            return
        }

        setIsSaving(true)


        const optimisticData = { user: { ...user, favoriteMovie: trimmed } }

        try {
            // mutate user data immediately without revalidation yet
            await mutateUser(optimisticData, false)

            // actual API call
            await api.updateFavoriteMovie(trimmed)

            // clear the fact cache so it fetches a new one for the new movie
            mutateFact(undefined, true)

            setIsEditing(false)
        } catch (error) {
            console.error(error)
            alert("Failed to save favorite movie. Reverting.")
            // trigger revalidation to revert state
            mutateUser()
        } finally {
            setIsSaving(false)
        }
    }

    const handleEditCancel = () => {
        setIsEditing(false)
        setEditValue(favoriteMovie || "")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleEditSave()
        if (e.key === "Escape") handleEditCancel()
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            <div className="w-full max-w-4xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 shadow-2xl shadow-black/50 rounded-[2rem] p-8 mb-8 flex flex-col md:flex-row items-center gap-6 transition-all hover:border-slate-700/60">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                        {user?.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || "User"}
                                width={112}
                                height={112}
                                className="relative ring-4 ring-slate-900 h-28 w-28 rounded-full object-cover shadow-xl"
                            />
                        ) : (
                            <div className="relative h-28 w-28 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-400 ring-4 ring-slate-900 shadow-xl">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                        )}
                    </div>

                    <div className="text-center md:text-left flex-1 space-y-1">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 tracking-tight">
                            Welcome back, {user?.name?.split(' ')[0]}
                        </h1>
                        <p className="text-slate-400 text-lg font-medium">{user?.email}</p>
                    </div>

                    <div className="mt-6 md:mt-0">
                        <LogoutButton />
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 shadow-2xl shadow-black/40 rounded-[2rem] p-8 md:p-10 relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-indigo-500/10 hover:border-slate-700/60 min-h-[400px]">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 opacity-90"></div>

                        <div className="relative z-10 w-full flex flex-col h-full">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-sm text-indigo-400 uppercase font-bold tracking-widest flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                                    Your Favorite Movie
                                </p>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded-full flex items-center gap-1 border border-slate-700"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="mb-8 h-[72px] flex items-center">
                                {isEditing ? (
                                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            disabled={isSaving}
                                            className="flex-1 bg-slate-950/80 border border-indigo-500/50 rounded-xl px-4 py-3 text-2xl md:text-4xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        />
                                        <div className="flex gap-2 self-start sm:self-center">
                                            <button
                                                onClick={handleEditSave}
                                                disabled={isSaving}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isSaving ? "Saving..." : "Save"}
                                            </button>
                                            <button
                                                onClick={handleEditCancel}
                                                disabled={isSaving}
                                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight truncate">
                                        {favoriteMovie}
                                    </h2>
                                )}
                            </div>

                            <div className="bg-slate-950/60 rounded-3xl p-6 md:p-8 border border-white/5 mt-auto relative shadow-inner">
                                <div className="absolute -left-2 -top-4 text-6xl font-serif text-yellow-500/20 select-none">"</div>
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs text-yellow-500 uppercase font-bold tracking-widest flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                        Movie Fact
                                    </p>
                                    <button
                                        onClick={() => mutateFact(undefined, true)}
                                        disabled={isFactLoading || isSaving}
                                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                        title="Generate short new fact (bypasses 30s cache)"
                                    >
                                        <svg className={`w-3.5 h-3.5 ${isFactLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                        Refresh Fact
                                    </button>
                                </div>

                                <div className="min-h-[80px] flex items-center border border-transparent">
                                    {isFactLoading && !fact ? (
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span className="animate-pulse">Consulting the archives...</span>
                                        </div>
                                    ) : (
                                        <p className={`text-xl md:text-2xl text-slate-300 italic leading-relaxed font-light transition-opacity duration-300 ${isFactLoading ? "opacity-50" : "opacity-100"}`}>
                                            {fact || "No fact available."}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>


                        <svg className="absolute -bottom-8 -right-8 w-64 h-64 text-indigo-500/5 rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110 pointer-events-none" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>
                    </div>
                </div>
            </div>
        </div>
    )
}
