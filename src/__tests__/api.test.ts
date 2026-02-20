import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, ApiError } from '@/lib/api'

// Mock global fetch
const globalFetch = global.fetch

describe('API Client', () => {
    beforeEach(() => {
        global.fetch = vi.fn()
    })

    afterEach(() => {
        global.fetch = globalFetch
    })

    it('should throw an ApiError when server returns 401', async () => {
        // Arrange
        const mockResponse = {
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Unauthorized' })
        }
            ; (global.fetch as any).mockResolvedValue(mockResponse)

        // Act & Assert
        await expect(api.getCurrentUser()).rejects.toThrowError(ApiError)
        await expect(api.getCurrentUser()).rejects.toThrow('Unauthorized')

        try {
            await api.getCurrentUser()
        } catch (error: any) {
            expect(error.status).toBe(401)
            expect(error.data).toEqual({ error: 'Unauthorized' })
        }
    })

    it('should throw an ApiError with default message when server returns 500 without JSON', async () => {
        // Arrange
        const mockResponse = {
            ok: false,
            status: 500,
            json: () => Promise.reject(new Error('Invalid JSON'))
        }
            ; (global.fetch as any).mockResolvedValue(mockResponse)

        // Act & Assert
        try {
            await api.getFactForMovie('Inception')
        } catch (error: any) {
            expect(error).toBeInstanceOf(ApiError)
            expect(error.message).toBe('API request failed with status 500')
            expect(error.status).toBe(500)
        }
    })
})
