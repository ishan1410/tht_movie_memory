import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
    try {
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { movie } = body

        if (!movie || typeof movie !== "string" || movie.trim().length < 2 || movie.trim().length > 100) {
            return NextResponse.json(
                { error: "Movie name must be between 2 and 100 characters." },
                { status: 400 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { favoriteMovie: movie.trim() },
            select: {
                id: true,
                name: true,
                email: true,
                favoriteMovie: true,
            },
        })

        return NextResponse.json({ user: updatedUser })
    } catch (error) {
        console.error("PUT /api/me/movie error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
