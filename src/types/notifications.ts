export type NotificationDto = {
    id: number
    productId: string
    productName: string
    preview: string | null
    oldPrice: number
    newPrice: number
    currency: string
    brand: string | null
    createdAt: string
    isRead: boolean
}
