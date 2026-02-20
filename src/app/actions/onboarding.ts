"use server"

import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function saveFavoriteMovie(formData: FormData) {
    const session = await getServerSession()
    if (!session?.user?.email) {
        throw new Error("Not authenticated")
    }

    const movie = formData.get("movie") as string

    if (!movie || movie.length < 2 || movie.length > 100) {
        throw new Error("Movie name must be between 2 and 100 characters.")
    }

    await prisma.user.update({
        where: { email: session.user.email },
        data: { favoriteMovie: movie },
    })

    redirect("/dashboard")
}
