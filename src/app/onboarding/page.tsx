import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { saveFavoriteMovie } from "@/app/actions/onboarding"

export default async function OnboardingPage() {
    const session = await getServerSession()

    if (!session) {
        redirect("/api/auth/signin")
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 p-4">

            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            <div className="max-w-xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80 rounded-[2rem] p-8 sm:p-12 transition-all hover:border-slate-700/60">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 shadow-inner ring-1 ring-white/5">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight">
                            Welcome to Movie Memory!
                        </h2>
                        <p className="mt-4 text-base text-slate-400 leading-relaxed font-light">
                            To personalize your memory vault, tell us your absolute favorite cinematic masterpiece.
                        </p>
                    </div>

                    <form action={saveFavoriteMovie} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                            <div className="relative">
                                <label htmlFor="movie" className="sr-only">
                                    Favorite Movie
                                </label>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="movie"
                                    name="movie"
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-4 bg-slate-950/50 border border-slate-800 placeholder-slate-500 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-lg shadow-inner transition-all duration-300"
                                    placeholder="e.g. Inception, The Matrix..."
                                    minLength={2}
                                    maxLength={100}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-4 px-4 text-base font-bold rounded-xl text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 border border-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-lg shadow-indigo-600/30 overflow-hidden"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                <span className="relative z-10 flex items-center gap-2">
                                    Start My Memory
                                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
