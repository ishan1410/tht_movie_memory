import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-slate-950">

      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700/50 text-slate-300 text-sm font-medium backdrop-blur-sm shadow-xl">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Your interactive movie journal
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 tracking-tight mb-6 drop-shadow-sm">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Movie Memory</span>
        </h1>

        <p className="mt-3 text-xl sm:text-2xl text-slate-400 mb-10 max-w-2xl font-light">
          Save your absolute favorite movie and unlock fascinating AI-generated facts about the cinema that shaped you.
        </p>

        <div className="flex flex-col items-center space-y-4">
          <Link
            href="/api/auth/signin"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-indigo-600 border border-indigo-500/50 rounded-full hover:bg-indigo-500 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-xl shadow-indigo-600/20 backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10 flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
              Sign in with Google
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
