
import type { components } from '../types/api'
import { authorizedRequest } from './account'

export type AdminStats = components['schemas']['Stats']

export async function getAdminStats(
    token: string
): Promise<AdminStats> {
    const response = await authorizedRequest(
        '/api/v1/admin/stats',
        token
    )

    return response.json()
}

export async function startPricesUpdate(
    token: string
): Promise<void> {
    await authorizedRequest(
        '/api/v1/admin/jobs/update-prices',
        token,
        { method: 'POST' }
    )
}

export async function startRatesUpdate(
    token: string
): Promise<void> {
    await authorizedRequest(
        '/api/v1/admin/jobs/update-rates',
        token,
        { method: 'POST' }
    )
}


export type ProductUpdateRequest =
    components['schemas']['ProductUpdateRequest']

export async function updateAdminProduct(
    token: string,
    productId: string,
    data: ProductUpdateRequest
): Promise<void> {
    await authorizedRequest(
        `/api/v1/admin/products/${encodeURIComponent(productId)}`,
        token,
        {
            method: 'PATCH',
            body: JSON.stringify(data)
        }
    )
}

export async function deleteAdminProduct(
    token: string,
    productId: string
): Promise<void> {
    await authorizedRequest(
        `/api/v1/admin/products/${encodeURIComponent(productId)}`,
        token,
        { method: 'DELETE' }
    )
}


export type AdminUser =
    components['schemas']['UserProfileAdminResponse']

export type UserRole = 'USER' | 'ADMIN'

export async function getAdminUsers(
    token: string,
    email?: string
): Promise<AdminUser[]> {
    const params = email?.trim()
        ? `?email=${encodeURIComponent(email.trim())}`
        : ''

    const response = await authorizedRequest(
        `/api/v1/admin/users${params}`,
        token
    )

    return response.json()
}

export async function changeUserRole(
    token: string,
    email: string,
    role: UserRole
): Promise<void> {
    await authorizedRequest(
        `/api/v1/admin/users/${encodeURIComponent(email)}/role?role=${role}`,
        token,
        { method: 'PATCH' }
    )
}

export async function deleteAdminUser(
    token: string,
    email: string
): Promise<void> {
    await authorizedRequest(
        `/api/v1/admin/users?email=${encodeURIComponent(email)}`,
        token,
        { method: 'DELETE' }
    )
}

