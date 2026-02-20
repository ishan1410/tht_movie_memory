import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InteractiveDashboard from '@/components/InteractiveDashboard'
import { api } from '@/lib/api'

// We need to mock Next.js Navigation and Image
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() })
}))

// Mock Next Image to avoid errors in JSDOM
vi.mock('next/image', () => ({
    default: (props: any) => {
        return <img {...props} alt={props.alt} />
    }
}))

// Mock the API lib
vi.mock('@/lib/api', () => ({
    api: {
        getCurrentUser: vi.fn(),
        getFactForMovie: vi.fn(),
        updateFavoriteMovie: vi.fn(),
    }
}))

// Mock LogoutButton as it likely uses NextAuth Context we don't need here
vi.mock('@/components/LogoutButton', () => ({
    default: () => <button>Logout</button>
}))

const mockInitialUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    favoriteMovie: 'Interstellar',
}

describe('InteractiveDashboard Edit Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks()
            ; (api.getCurrentUser as any).mockResolvedValue({ user: mockInitialUser })
            ; (api.getFactForMovie as any).mockResolvedValue({ fact: 'Mocked fact about Interstellar' })
    })

    it('allows inline editing of the favorite movie and saves optimistically', async () => {
        const user = userEvent.setup()

            ; (api.updateFavoriteMovie as any).mockResolvedValue({
                user: { ...mockInitialUser, favoriteMovie: 'The Dark Knight' }
            })

        render(<InteractiveDashboard user={mockInitialUser} />)

        // Verify initial movie is displayed
        expect(screen.getByText('Interstellar')).toBeInTheDocument()

        // Click Edit
        const editButton = screen.getByRole('button', { name: /Edit/i })
        await user.click(editButton)

        // Verify input appears with correct value
        const input = screen.getByRole('textbox')
        expect(input).toHaveValue('Interstellar')

        // Change value
        await user.clear(input)
        await user.type(input, 'The Dark Knight')

        // Save
        const saveButton = screen.getByRole('button', { name: /Save/i })
        await user.click(saveButton)

        // Assert API was called correctly
        expect(api.updateFavoriteMovie).toHaveBeenCalledWith('The Dark Knight')

        // Assert UI went back to reading mode with new text implicitly/optimistically
        // We expect the input to disappear
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

        // Check that The Dark Knight is now rendered in the heading
        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('The Dark Knight')
        })
    })
})
