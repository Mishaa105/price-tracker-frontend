
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/account'
import {
    getAdminUsers,
    changeUserRole,
    deleteAdminUser
} from '../api/admin'
import type { AdminUser, UserRole } from '../api/admin'

type Props = {
    token: string
}

function AdminUsers({ token }: Props) {
    const { signOut } = useAuth()

    const [users, setUsers] = useState<AdminUser[]>([])
    const [search, setSearch] = useState('')
    const [roles, setRoles] = useState<Record<string, UserRole>>({})

    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const loadUsers = useCallback(async (email: string) => {
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const result = await getAdminUsers(token, email)

            setUsers(result)
            setRoles(
                Object.fromEntries(
                    result
                        .filter(user => user.email)
                        .map(user => [
                            user.email!,
                            user.role === 'ADMIN' ? 'ADMIN' : 'USER'
                        ])
                )
            )
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                signOut()
            } else {
                setError('Не удалось загрузить пользователей')
            }
        } finally {
            setLoading(false)
        }
    }, [token, signOut])

    useEffect(() => {
        void loadUsers('')
    }, [loadUsers])

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        void loadUsers(search)
    }

    async function handleRoleChange(user: AdminUser) {
        if (!user.email || busy) return

        const role = roles[user.email]
        if (!role || role === user.role) return

        const confirmed = window.confirm(
            `Изменить роль пользователя ${user.email} на ${role}?`
        )

        if (!confirmed) return

        setBusy(true)
        setError('')
        setMessage('')

        try {
            await changeUserRole(token, user.email, role)

            setUsers(previous =>
                previous.map(item =>
                    item.email === user.email
                        ? { ...item, role }
                        : item
                )
            )

            setMessage(`Роль пользователя ${user.email} изменена`)
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                signOut()
            } else {
                setError('Не удалось изменить роль пользователя')
            }
        } finally {
            setBusy(false)
        }
    }

    async function handleDelete(user: AdminUser) {
        if (!user.email || busy) return

        const confirmation = window.prompt(
            `Для удаления пользователя введите его email:\n${user.email}`
        )

        if (confirmation !== user.email) return

        setBusy(true)
        setError('')
        setMessage('')

        try {
            await deleteAdminUser(token, user.email)

            setUsers(previous =>
                previous.filter(item => item.email !== user.email)
            )

            setMessage(`Пользователь ${user.email} удалён`)
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                signOut()
            } else {
                setError('Не удалось удалить пользователя')
            }
        } finally {
            setBusy(false)
        }
    }

    return (
        <section className="admin-section admin-users">
            <h2>Управление пользователями</h2>

            <form
                className="admin-users__search"
                onSubmit={handleSearch}
            >
                <input
                    type="email"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Поиск по email (необязательно)"
                />

                <button type="submit" disabled={loading || busy}>
                    Найти
                </button>

                <button
                    type="button"
                    disabled={loading || busy}
                    onClick={() => {
                        setSearch('')
                        void loadUsers('')
                    }}
                >
                    Все пользователи
                </button>
            </form>

            {error && <p className="admin-error" role="alert">{error}</p>}
            {message && <p className="admin-success">{message}</p>}

            {loading ? (
                <p>Загрузка пользователей...</p>
            ) : users.length === 0 ? (
                <p>Пользователи не найдены</p>
            ) : (
                <div className="admin-users__table-wrapper">
                    <table className="admin-users__table">
                        <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Роль</th>
                            <th>Действия</th>
                        </tr>
                        </thead>

                        <tbody>
                        {users.map((user, index) => {
                            const email = user.email
                            const currentRole = user.role === 'ADMIN'
                                ? 'ADMIN'
                                : 'USER'

                            return (
                                <tr key={user.id ?? email ?? index}>
                                    <td>{user.name || '—'}</td>
                                    <td>{email || '—'}</td>

                                    <td>
                                        <select
                                            value={
                                                email
                                                    ? roles[email] ?? currentRole
                                                    : currentRole
                                            }
                                            disabled={!email || busy}
                                            onChange={event => {
                                                if (!email) return

                                                setRoles(previous => ({
                                                    ...previous,
                                                    [email]: event.target.value as UserRole
                                                }))
                                            }}
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>

                                    <td>
                                        <div className="admin-users__actions">
                                            <button
                                                type="button"
                                                disabled={
                                                    !email ||
                                                    busy ||
                                                    (roles[email] ?? currentRole) === currentRole
                                                }
                                                onClick={() => handleRoleChange(user)}
                                            >
                                                Сохранить
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-users__delete"
                                                disabled={!email || busy}
                                                onClick={() => handleDelete(user)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}

export default AdminUsers
