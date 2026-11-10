
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { registerUser } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import './AuthPage.css'

type Props = {
    mode: 'login' | 'register'
}

function AuthPage({ mode }: Props) {
    const navigate = useNavigate()
    const { signIn } = useAuth()

    const isRegister = mode === 'register'

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [registered, setRegistered] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isRegister) {
                await registerUser({ username, email, password })
                setRegistered(true)
            } else {
                await signIn(email, password)
                navigate('/')
            }
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Произошла ошибка'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <h1>{isRegister ? 'Регистрация' : 'Вход'}</h1>

                {registered ? (
                    <p>
                        Аккаунт создан! <Link to="/login">Войти</Link>
                    </p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <input
                                type="text"
                                placeholder="Имя пользователя"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />

                        {error && <p role="alert">{error}</p>}

                        <button type="submit" disabled={loading}>
                            {loading
                                ? 'Подождите...'
                                : isRegister ? 'Зарегистрироваться' : 'Войти'}
                        </button>
                    </form>
                )}

                {!registered && (
                    <p>
                        {isRegister ? (
                            <>Уже есть аккаунт? <Link to="/login">Войти</Link></>
                        ) : (
                            <>Нет аккаунта? <Link to="/register">Регистрация</Link></>
                        )}
                    </p>
                )}
            </div>
        </main>
    )
}

export default AuthPage
