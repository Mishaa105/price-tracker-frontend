import {
    createContext,
    useContext,
    useState,
    useCallback
} from 'react'
import type { ReactNode } from 'react'
import { loginUser } from '../api/auth'

type AuthContextValue = {
    token: string | null
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(
        () => sessionStorage.getItem('accessToken')
    )

    async function signIn(email: string, password: string) {
        const jwt = await loginUser({ email, password })

        sessionStorage.setItem('accessToken', jwt)
        setToken(jwt)
    }

    const signOut = useCallback(() => {
        sessionStorage.removeItem('accessToken')
        setToken(null)
    }, [])

    return (
        <AuthContext.Provider value={{ token, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider')
    }

    return context
}
