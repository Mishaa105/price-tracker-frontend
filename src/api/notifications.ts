
import { authorizedRequest } from './account'
import type { NotificationDto } from '../types/notifications'

export async function getNotifications(
    token: string
): Promise<NotificationDto[]> {
    const response = await authorizedRequest(
        '/api/v1/notifications',
        token
    )

    return response.json()
}

export async function markNotificationAsRead(
    token: string,
    id: number
): Promise<void> {
    await authorizedRequest(
        `/api/v1/notifications/read?notificationId=${encodeURIComponent(id)}`,
        token,
        { method: 'PATCH' }
    )
}

export async function deleteNotification(
    token: string,
    id: number
): Promise<void> {
    await authorizedRequest(
        `/api/v1/notifications/delete?notificationId=${encodeURIComponent(id)}`,
        token,
        { method: 'DELETE' }
    )
}
