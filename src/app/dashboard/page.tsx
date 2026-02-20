import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import InteractiveDashboard from "@/components/InteractiveDashboard"

export default async function DashboardPage() {
    const session = await getServerSession()

    if (!session?.user?.email) {
        redirect("/api/auth/signin")
    }

    const { prisma } = await import("@/lib/prisma")
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            name: true,
            email: true,
            favoriteMovie: true,
            image: true
        }
    })

    if (!user?.favoriteMovie) {
        redirect("/onboarding")
    }

    // passed the initial user so the client component has immediate data,
    // avoiding a loading flash for the user info. 
    // The fact will be fetched by SWR on the client.
    return <InteractiveDashboard user={user} />
}

