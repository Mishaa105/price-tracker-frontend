
export function isAdmin(token: string | null): boolean {
    if (!token) return false

    try {
        const payload = token.split('.')[1]

        if (!payload) return false

        const base64 = payload
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const claims = JSON.parse(atob(base64))

        return claims.role === 'ADMIN' &&
            (typeof claims.exp !== 'number' ||
                claims.exp * 1000 > Date.now())
    } catch {
        return false
    }
}
