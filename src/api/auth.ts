
import type { components } from '../types/api'

type LoginRequest = components['schemas']['LoginRequest']
type RegisterRequest = components['schemas']['RegisterRequest']
type LoginResponse = components['schemas']['LoginResponse']

export async function loginUser(
    data: LoginRequest
): Promise<string> {
    const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        throw new Error(`Ошибка входа: HTTP ${response.status}`)
    }

    const result: LoginResponse = await response.json()

    if (!result.token) {
        throw new Error('Сервер не вернул JWT')
    }

    return result.token
}

export async function registerUser(
    data: RegisterRequest
): Promise<void> {
    const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        throw new Error(`Ошибка регистрации: HTTP ${response.status}`)
    }
}
