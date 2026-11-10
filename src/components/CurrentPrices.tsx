import type { components } from '../types/api'
import { useEffect, useState } from 'react'
import { getCurrencyRates } from '../api/currencies'
import type { ExchangeRate } from '../api/currencies'

type CurrentPricePoint = components['schemas']['CurrentPricePoint']

type CurrentPricesProps = {
    prices: CurrentPricePoint[]
}

const regions = [
    { name: 'США', currency: 'USD' },
    { name: 'Европа', currency: 'EUR' },
    { name: 'Украина', currency: 'UAH' },
    { name: 'Турция', currency: 'TRY' },
    { name: 'Индия', currency: 'INR' },
]

function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
    }).format(amount / 100)
}

function CurrentPrices({ prices }: CurrentPricesProps) {

    const [rates, setRates] = useState<ExchangeRate[]>([])

    useEffect(() => {
        getCurrencyRates()
            .then(setRates)
            .catch(console.error)
    }, [])

    return (
        <section className="current-prices">
            <h2>Цены по регионам</h2>

    {regions.map(region => {
        const regionPrices = prices.filter(
            price => price.currency === region.currency
        )

        return (
            <div key={region.currency}>
                <h3>{region.name}</h3>

        {regionPrices.length === 0 && <p>Нет данных</p>}

            {regionPrices.map((price, index) => {
                const amount = price.discountPrice ?? price.originalPrice

                const rate = rates.find(
                    item => item.currency === region.currency
                )?.exchangeRate

                const priceRub = amount != null && rate != null && rate > 0
                    ? (amount / 100) / rate
                    : null


                return (
                    <div key={index}>
                        <span>{price.brand || 'Обычная цена'}: </span>

                {amount != null ? (
                    <>
                        {price.originalPrice != null &&
                                amount < price.originalPrice && (
                                    <s>{formatPrice(price.originalPrice, region.currency)} </s>
                )}

                    <strong>{formatPrice(amount, region.currency)}</strong>

                        {priceRub != null && (
                            <small>
                                {' ≈ '}
                                {new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                }).format(priceRub)}
                            </small>
                        )}
                </>
                ) : (
                    <span>Нет цены</span>
                )}
                </div>
            )
            })}
            </div>
        )
        })}
    </section>
    )
    }

    export default CurrentPrices
