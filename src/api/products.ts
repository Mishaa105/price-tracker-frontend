import type { components } from '../types/api'

export type ProductCardDto =
    components['schemas']['ProductCardDto']

export async function getHomePageGames(): Promise<ProductCardDto[]> {
    const response = await fetch('/api/v1/homepage')

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
}


export type ProductPage =
    components['schemas']['ProductPage']

export async function getProductPage(
    productId: string
): Promise<ProductPage> {
    const response = await fetch(
        `/api/v1/products/page?productId=${encodeURIComponent(productId)}`
    )

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
}

