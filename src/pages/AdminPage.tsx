import AdminProducts from '../components/AdminProducts'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import AdminUsers from '../components/AdminUsers'
import { useAuth } from '../auth/AuthContext'
import { isAdmin } from '../auth/roles'
import { ApiError } from '../api/account'
import {
    getAdminStats,
    startPricesUpdate,
    startRatesUpdate
} from '../api/admin'
import type { AdminStats } from '../api/admin'

import './AdminPage.css'

function AdminPage() {
    const { token, signOut } = useAuth()

    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [forbidden, setForbidden] = useState(false)

    useEffect(() => {
        if (!token || !isAdmin(token)) return

        let active = true

        setLoading(true)
        setError('')

        getAdminStats(token)
            .then(result => {
                if (active) setStats(result)
            })
            .catch(err => {
                if (!active) return

                if (err instanceof ApiError) {
                    if (err.status === 401) {
                        signOut()
                        return
                    }

                    if (err.status === 403) {
                        setForbidden(true)
                        return
                    }
                }

                setError('Не удалось загрузить статистику')
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [token, signOut])

    async function runJob(type: 'prices' | 'rates') {
        if (!token || busy) return

        const confirmed = window.confirm(
            type === 'prices'
                ? 'Запустить обновление цен PlayStation Store?'
                : 'Запустить обновление курсов валют?'
        )

        if (!confirmed) return

        setBusy(type)
        setError('')
        setMessage('')

        try {
            if (type === 'prices') {
                await startPricesUpdate(token)
            } else {
                await startRatesUpdate(token)
            }

            setMessage('Сервер вернул успешный ответ на операцию.')
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                signOut()
            } else if (err instanceof ApiError && err.status === 403) {
                setForbidden(true)
            } else {
                setError(
                    'Не удалось получить подтверждение операции. Проверь логи backend перед повторным запуском.'
                )
            }
        } finally {
            setBusy(null)
        }
    }

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (!isAdmin(token) || forbidden) {
        return (
            <main className="admin-page">
                <h1>Доступ запрещён</h1>
        <p>Эта страница доступна только администратору.</p>
        </main>
    )
    }

    if (loading) {
        return (
            <main className="admin-page">
                <p>Загрузка панели администратора...</p>
        </main>
    )
    }

    return (
        <main className="admin-page">
            <h1>Панель администратора</h1>

    {error && <p className="admin-error" role="alert">{error}</p>}
        {message && <p className="admin-success">{message}</p>}

            <section className="admin-section">
            <h2>Общая статистика</h2>

            {stats && (
                <>
                    <div className="admin-stats">
                <div className="admin-stat-card">
                    <span>Всего товаров</span>
            <strong>
            {stats.numberOfProducts?.toLocaleString('ru-RU') ?? '—'}
            </strong>
            </div>

            <div className="admin-stat-card">
                <span>Пользователей</span>
                <strong>
                {stats.numberOfUsers?.toLocaleString('ru-RU') ?? '—'}
                </strong>
                </div>
                </div>

                <div className="admin-details-grid">
                <div>
                    <h3>Товары по регионам</h3>

                {stats.numberOfProductsByRegion?.map(
                    (item, index) => (
                        <div className="admin-detail-row" key={index}>
                    <span>{item.region ?? 'Неизвестно'}</span>
                    <strong>
                    {item.productCount?.toLocaleString('ru-RU') ?? '—'}
                    </strong>
                    </div>
                )
                )}
                </div>

                <div>
                <h3>Товары по платформам</h3>

                {stats.numberOfProductsByPlatforms?.map(
                    (item, index) => (
                        <div className="admin-detail-row" key={index}>
                    <span>{item.platform ?? 'Неизвестно'}</span>
                    <strong>
                    {item.productCount?.toLocaleString('ru-RU') ?? '—'}
                    </strong>
                    </div>
                )
                )}
                </div>
                </div>
                </>
            )}
            </section>

            <AdminProducts token={token} />
            <AdminUsers token={token} />
            <section className="admin-section">
            <h2>Обновление данных</h2>

        <p className="admin-description">
            Запуск служебных операций обновления каталога
            и курсов валют.
        </p>

        <div className="admin-job-actions">
        <button
            type="button"
            onClick={() => runJob('prices')}
            disabled={busy !== null}
        >
            {busy === 'prices'
                ? 'Выполняется запрос...'
                : 'Обновить цены'}
            </button>

            <button
            type="button"
            onClick={() => runJob('rates')}
            disabled={busy !== null}
        >
            {busy === 'rates'
                ? 'Выполняется запрос...'
                : 'Обновить курсы валют'}
            </button>
            </div>
            </section>
            </main>
        )
        }

        export default AdminPage
