import OpenAI from "openai"
import { prisma } from "@/lib/prisma"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function generateMovieFact(movieName: string, userId: string): Promise<string> {
    // Base Implementation: Generate new fact every time (no caching)

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant that provides interesting facts about movies." },
                { role: "user", content: `Tell me a short, interesting fact about the movie "${movieName}". Limit it to one or two sentences.` },
            ],
            model: "gpt-3.5-turbo",
        })

        const factContent = completion.choices[0].message.content || "Could not generate a fact."

        // Store in DB as per requirement
        await prisma.fact.create({
            data: {
                content: factContent,
                userId: userId,
            },
        })

        return factContent
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.warn("OpenAI Error:", errorMessage)
        return "Failed to generate a fact. Please check your OpenAI API quota."
    }
}
