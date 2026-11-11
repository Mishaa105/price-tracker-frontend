export function getDiscountPercent(
    originalPrice: number | null | undefined,
    discountPrice: number | null | undefined
): number | null {
    if (
        originalPrice == null ||
        discountPrice == null ||
        !Number.isFinite(originalPrice) ||
        !Number.isFinite(discountPrice) ||
        originalPrice <= 0 ||
        discountPrice < 0 ||
        discountPrice >= originalPrice
    ) {
        return null
    }

    return Math.round(
        (1 - discountPrice / originalPrice) * 100
    )
}