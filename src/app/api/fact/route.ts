import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { generateMovieFact } from "@/lib/openai"

export async function GET(request: Request) {
    try {
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const movie = searchParams.get("movie")

        if (!movie || typeof movie !== "string") {
            return NextResponse.json(
                { error: "Movie parameter is required" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        const fact = await generateMovieFact(movie, user.id)

        return NextResponse.json({ fact })

    } catch (error) {
        console.error("GET /api/fact error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
