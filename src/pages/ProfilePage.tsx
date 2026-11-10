import avatar from '../assets/avatar.jpeg'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router'

import { useAuth } from '../auth/AuthContext'
import {
    ApiError,
    getProfile,
    getWishlist,
    updateName,
    updateEmail,
    updatePassword,
    removeFromWishlist
} from '../api/account'
import type { UserProfile } from '../api/account'
import type { ProductCardDto } from '../api/products'
import GameCard from '../components/GameCard'

import './ProfilePage.css'

type Field = 'name' | 'email' | 'password'

function ProfilePage() {
    const { token, signOut } = useAuth()

    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [wishlist, setWishlist] = useState<ProductCardDto[]>([])

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [editing, setEditing] = useState<Field | null>(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!token) return

        let active = true
        setLoading(true)

        Promise.all([getProfile(token), getWishlist(token)])
            .then(([user, games]) => {
                if (!active) return

                setProfile(user)
                setName(user.name ?? '')
                setEmail(user.email ?? '')
                setWishlist(games)
            })
            .catch(err => {
                if (!active) return

                if (err instanceof ApiError && err.status === 401) {
                    signOut()
                } else {
                    setError('Не удалось загрузить профиль')
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [token, signOut])

    function startEditing(field: Field) {
        setEditing(field)
        setError('')
        setMessage('')

        setName(profile?.name ?? '')
        setEmail(profile?.email ?? '')
        setPassword('')
    }

    function cancelEditing() {
        setEditing(null)
        setName(profile?.name ?? '')
        setEmail(profile?.email ?? '')
        setPassword('')
    }

    async function save(
        event: FormEvent<HTMLFormElement>,
        field: Field
    ) {
        event.preventDefault()

        if (!token || busy) return

        setBusy(field)
        setError('')
        setMessage('')

        try {
            switch (field) {
                case 'name':
                    await updateName(token, name)
                    setProfile(previous =>
                        previous ? { ...previous, name } : previous
                    )
                    break

                case 'email':
                    await updateEmail(token, email)
                    setProfile(previous =>
                        previous ? { ...previous, email } : previous
                    )
                    break

                case 'password':
                    await updatePassword(token, password)
                    setPassword('')
                    break
            }

            setEditing(null)
            setMessage('Изменения сохранены')
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                signOut()
            } else {
                setError('Не удалось сохранить изменения')
            }
        } finally {
            setBusy(null)
        }
    }

    async function removeGame(productId: string) {
        if (!token || busy) return

        setBusy(productId)
        setError('')
        setMessage('')

        try {
            await removeFromWishlist(token, productId)

            setWishlist(previous =>
                previous.filter(game => game.productId !== productId)
            )
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                signOut()
            } else {
                setError('Не удалось удалить игру')
            }
        } finally {
            setBusy(null)
        }
    }

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (loading) {
        return (
            <main className="profile-page">
                <p>Загрузка профиля...</p>
            </main>
        )
    }

    return (
        <main className="profile-page">
            <h1>Личный кабинет</h1>

            {error && <p className="profile-error" role="alert">{error}</p>}
            {message && <p className="profile-success">{message}</p>}

            {profile && (
                <section className="profile-card">
                    <h2>Настройки профиля</h2>

                    <div className="profile-layout">
                        <div className="profile-avatar">
                            <img src={avatar} alt="Аватар пользователя" />
                        </div>

                        <div className="profile-details">

                            {/* Имя */}
                            <div className="profile-field">
                                <span className="profile-field__label">Имя</span>

                                {editing === 'name' ? (
                                    <form onSubmit={event => save(event, 'name')}>
                                        <input
                                            value={name}
                                            onChange={event => setName(event.target.value)}
                                            required
                                            autoFocus
                                        />
                                        <div className="profile-edit-actions">
                                            <button type="submit" disabled={busy !== null}>
                                                Сохранить
                                            </button>
                                            <button
                                                type="button"
                                                className="profile-cancel"
                                                onClick={cancelEditing}
                                                disabled={busy !== null}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="profile-field__view">
                                        <strong>{profile.name || 'Не указано'}</strong>
                                        <button
                                            type="button"
                                            className="profile-edit-button"
                                            aria-label="Изменить имя"
                                            onClick={() => startEditing('name')}
                                        >
                                            ✎
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="profile-field">
                                <span className="profile-field__label">
                                    Электронная почта
                                </span>

                                {editing === 'email' ? (
                                    <form onSubmit={event => save(event, 'email')}>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={event => setEmail(event.target.value)}
                                            required
                                            autoFocus
                                        />
                                        <div className="profile-edit-actions">
                                            <button type="submit" disabled={busy !== null}>
                                                Сохранить
                                            </button>
                                            <button
                                                type="button"
                                                className="profile-cancel"
                                                onClick={cancelEditing}
                                                disabled={busy !== null}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="profile-field__view">
                                        <strong>{profile.email || 'Не указана'}</strong>
                                        <button
                                            type="button"
                                            className="profile-edit-button"
                                            aria-label="Изменить почту"
                                            onClick={() => startEditing('email')}
                                        >
                                            ✎
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Пароль */}
                            <div className="profile-field">
                                <span className="profile-field__label">Пароль</span>

                                {editing === 'password' ? (
                                    <form onSubmit={event => save(event, 'password')}>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={event => setPassword(event.target.value)}
                                            placeholder="Новый пароль"
                                            autoComplete="new-password"
                                            required
                                            autoFocus
                                        />
                                        <div className="profile-edit-actions">
                                            <button type="submit" disabled={busy !== null}>
                                                Сохранить
                                            </button>
                                            <button
                                                type="button"
                                                className="profile-cancel"
                                                onClick={cancelEditing}
                                                disabled={busy !== null}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="profile-field__view">
                                        <strong>••••••••</strong>
                                        <button
                                            type="button"
                                            className="profile-edit-button"
                                            aria-label="Изменить пароль"
                                            onClick={() => startEditing('password')}
                                        >
                                            ✎
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </section>
            )}

            <section className="profile-wishlist">
                <h2>Список желаемого ({wishlist.length})</h2>

                {wishlist.length === 0 ? (
                    <p>
                        Здесь пока нет игр.{' '}
                        <Link to="/">Перейти в каталог</Link>
                    </p>
                ) : (
                    <div className="profile-wishlist__grid">
                        {wishlist.filter(game => game.productId).map(game => (
                            <div
                                key={game.productId}
                                className="profile-wishlist__item"
                            >
                                <Link
                                    to={`/games/${game.productId}`}
                                    className="game-link"
                                >
                                    <GameCard game={game} />
                                </Link>

                                <button
                                    type="button"
                                    className="profile-wishlist__remove"
                                    disabled={busy !== null}
                                    onClick={() => removeGame(game.productId!)}
                                >
                                    Удалить из списка
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}

export default ProfilePage
