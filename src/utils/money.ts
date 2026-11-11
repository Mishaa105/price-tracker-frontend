export function toMajorUnits(
    amount: number,
    currency: string
): number {
    return currency === 'INR' ? amount : amount / 100
}