import type { components } from '../types/api'

export type ExchangeRate =
    components['schemas']['ExchangeRates']

export async function getCurrencyRates(): Promise<ExchangeRate[]> {
    const response = await fetch('/api/v1/currencies/rates')

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    const rates: ExchangeRate[] = await response.json()

    return rates.filter(
        rate => rate.currency != null && rate.exchangeRate != null
    )
}

