export class ApiError extends Error {
    public status: number
    public data: any

    constructor(message: string, status: number, data?: any) {
        super(message)
        this.status = status
        this.data = data
        this.name = "ApiError"
    }
}

async function fetchWithHandling<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    })

    if (!response.ok) {
        let errorData
        try {
            errorData = await response.json()
        } catch {
            // Ignore JSON parse error for error responses without bodies
        }

        const message = errorData?.error || `API request failed with status ${response.status}`
        throw new ApiError(message, response.status, errorData)
    }

    // handle 204 No Content
    if (response.status === 204) {
        return {} as T
    }

    return response.json()
}

// Data Types
export interface User {
    id: string
    name: string | null
    email: string
    favoriteMovie: string | null
    image?: string | null
}

export interface GetMeResponse {
    user: User
}

export interface GetFactResponse {
    fact: string
}

// API Methods
export const api = {
    async getCurrentUser(): Promise<GetMeResponse> {
        return fetchWithHandling<GetMeResponse>("/api/me")
    },

    async updateFavoriteMovie(movie: string): Promise<GetMeResponse> {
        return fetchWithHandling<GetMeResponse>("/api/me/movie", {
            method: "PUT",
            body: JSON.stringify({ movie }),
        })
    },

    async getFactForMovie(movie: string): Promise<GetFactResponse> {
        const params = new URLSearchParams({ movie })
        return fetchWithHandling<GetFactResponse>(`/api/fact?${params.toString()}`)
    }
}
