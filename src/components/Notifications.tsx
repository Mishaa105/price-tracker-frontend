
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/account'
import {
    getNotifications,
    markNotificationAsRead,
    deleteNotification
} from '../api/notifications'
import type { NotificationDto } from '../types/notifications'
import { getBrandInfo } from '../utils/brands'
import './Notifications.css'

function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol'
    }).format(amount / 100)
}

export default function Notifications() {
    const { token, signOut } = useAuth()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<NotificationDto[]>([])
    const [loading, setLoading] = useState(false)
    const [busyId, setBusyId] = useState<number | null>(null)
    const [error, setError] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    const loadNotifications = useCallback(async () => {
        if (!token) {
            setNotifications([])
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await getNotifications(token)
            setNotifications(result)
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                signOut()
            } else {
                setError('Не удалось загрузить уведомления')
            }
        } finally {
            setLoading(false)
        }
    }, [token, signOut])

    useEffect(() => {
        void loadNotifications()
    }, [loadNotifications])

    useEffect(() => {
        if (!open) return

        function handleOutsideClick(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', handleOutsideClick)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [open])

    async function markAsRead(id: number) {
        if (!token || busyId !== null) return

        setBusyId(id)
        setError('')

        try {
            await markNotificationAsRead(token, id)

            setNotifications(current =>
                current.map(item =>
                    item.id === id ? { ...item, isRead: true } : item
                )
            )
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                signOut()
            } else {
                setError('Не удалось отметить уведомление прочитанным')
            }
        } finally {
            setBusyId(null)
        }
    }

    async function removeNotification(id: number) {
        if (!token || busyId !== null) return

        setBusyId(id)
        setError('')

        try {
            await deleteNotification(token, id)
            setNotifications(current =>
                current.filter(item => item.id !== id)
            )
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                signOut()
            } else {
                setError('Не удалось удалить уведомление')
            }
        } finally {
            setBusyId(null)
        }
    }

    const unreadCount = notifications.filter(item => !item.isRead).length

    return (
        <div className="notifications" ref={containerRef}>
            <button
                type="button"
                className="notifications__bell"
                title="Уведомления"
                aria-label="Уведомления"
                aria-expanded={open}
                onClick={() => {
                    setOpen(current => !current)
                    if (!open) void loadNotifications()
                }}
            >
                <svg viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round"
                     aria-hidden="true">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
                    <path d="M10 21h4"/>
                </svg>

                {unreadCount > 0 && (
                    <span className="notifications__badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="notifications__panel">
                    <div className="notifications__header">
                        <h3>Уведомления</h3>
                        <button
                            type="button"
                            onClick={() => void loadNotifications()}
                            disabled={loading}
                        >
                            Обновить
                        </button>
                    </div>

                    {error && (
                        <p className="notifications__error">{error}</p>
                    )}

                    {loading && notifications.length === 0 && (
                        <p className="notifications__empty">Загрузка...</p>
                    )}

                    {!loading && !error && notifications.length === 0 && (
                        <p className="notifications__empty">
                            Пока нет уведомлений
                        </p>
                    )}

                    <div className="notifications__list">
                        {notifications.map(notification => {
                            const currency = notification.currency || 'USD'
                            const brand = getBrandInfo(notification.brand)
                            const isBusy = busyId === notification.id

                            return (
                                <div
                                    key={notification.id}
                                    className={`notifications__item ${
                                        notification.isRead
                                            ? ''
                                            : 'notifications__item--unread'
                                    }`}
                                >
                                    <Link
                                        className="notifications__link"
                                        to={`/games/${encodeURIComponent(notification.productId)}`}
                                        onClick={() => setOpen(false)}
                                    >
                                        {notification.preview ? (
                                            <img
                                                className="notifications__cover"
                                                src={notification.preview}
                                                alt=""
                                            />
                                        ) : (
                                            <div className="notifications__cover-placeholder">
                                                🎮
                                            </div>
                                        )}

                                        <div className="notifications__details">
                                            <strong>{notification.productName}</strong>

                                            <span className="notifications__brand"
                                                  style={{ color: brand.color }}>
                                                {brand.label}
                                            </span>

                                            <div className="notifications__prices">
                                                <s>
                                                    {formatPrice(
                                                        notification.oldPrice,
                                                        currency
                                                    )}
                                                </s>
                                                <span>→</span>
                                                <b>
                                                    {formatPrice(
                                                        notification.newPrice,
                                                        currency
                                                    )}
                                                </b>
                                            </div>

                                            <time>
                                                {new Date(
                                                    notification.createdAt
                                                ).toLocaleString('ru-RU', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </time>
                                        </div>
                                    </Link>

                                    <div className="notifications__actions">
                                        <button
                                            type="button"
                                            className="notifications__action notifications__action--read"
                                            title={
                                                notification.isRead
                                                    ? 'Уже прочитано'
                                                    : 'Отметить прочитанным'
                                            }
                                            aria-label="Отметить прочитанным"
                                            disabled={isBusy || notification.isRead}
                                            onClick={() => void markAsRead(notification.id)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2.4"
                                                 strokeLinecap="round" strokeLinejoin="round"
                                                 aria-hidden="true">
                                                <path d="M20 6 9 17l-5-5"/>
                                            </svg>
                                        </button>

                                        <button
                                            type="button"
                                            className="notifications__action notifications__action--delete"
                                            title="Удалить уведомление"
                                            aria-label="Удалить уведомление"
                                            disabled={isBusy}
                                            onClick={() => void removeNotification(notification.id)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2"
                                                 strokeLinecap="round" strokeLinejoin="round"
                                                 aria-hidden="true">
                                                <path d="M3 6h18"/>
                                                <path d="M8 6V4h8v2"/>
                                                <path d="M5 6l1 15h12l1-15"/>
                                                <path d="M10 10v7M14 10v7"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
