
import type { components } from '../types/api'
import type { ProductCardDto } from './products'

export type UserProfile =
    components['schemas']['UserProfileResponse']

export class ApiError extends Error {
    public status: number

    constructor(status: number) {
        super(`HTTP ${status}`)
        this.status = status
    }
}

async function authorizedRequest(
    url: string,
    token: string,
    options: RequestInit = {}
): Promise<Response> {
    const headers = new Headers(options.headers)

    headers.set('Authorization', `Bearer ${token}`)

    if (options.body) {
        headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(url, {
        ...options,
        headers
    })

    if (!response.ok) {
        throw new ApiError(response.status)
    }

    return response
}

export async function getProfile(
    token: string
): Promise<UserProfile> {
    const response = await authorizedRequest(
        '/api/v1/users/me',
        token
    )

    return response.json()
}

export async function updateName(
    token: string,
    name: string
): Promise<void> {
    await authorizedRequest('/api/v1/users/me/name', token, {
        method: 'PATCH',
        body: JSON.stringify({ name })
    })
}

export async function updateEmail(
    token: string,
    email: string
): Promise<void> {
    await authorizedRequest('/api/v1/users/me/email', token, {
        method: 'PATCH',
        body: JSON.stringify({ email })
    })
}

export async function updatePassword(
    token: string,
    password: string
): Promise<void> {
    await authorizedRequest('/api/v1/users/me/password', token, {
        method: 'PATCH',
        body: JSON.stringify({ password })
    })
}

export async function getWishlist(
    token: string
): Promise<ProductCardDto[]> {
    const response = await authorizedRequest(
        '/api/v1/wishlist',
        token
    )

    return response.json()
}

export async function addToWishlist(
    token: string,
    productId: string
): Promise<void> {
    await authorizedRequest(
        `/api/v1/wishlist?productId=${encodeURIComponent(productId)}`,
        token,
        { method: 'POST' }
    )
}

export async function removeFromWishlist(
    token: string,
    productId: string
): Promise<void> {
    await authorizedRequest(
        `/api/v1/wishlist?productId=${encodeURIComponent(productId)}`,
        token,
        { method: 'DELETE' }
    )
}
