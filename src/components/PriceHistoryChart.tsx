import { getBrandInfo } from '../utils/brands'
import { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import type { ProductPage } from '../api/products'
import { getCurrencyRates } from '../api/currencies'
import type { ExchangeRate } from '../api/currencies'
import './PriceHistoryChart.css'
import { toMajorUnits } from '../utils/money'

type PricePoint = NonNullable<ProductPage['prices']>[number]

type Props = {
    prices: PricePoint[]
}

function formatMoney(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        UAH: '₴',
        TRY: '₺',
        INR: '₹',
        RUB: '₽',
        PLN: 'zł'
    }

    const formatted = amount.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

    return `${formatted} ${symbols[currency] ?? currency}`
}

function PriceHistoryChart({ prices }: Props) {
    const currencies = [
        ...new Set(
            prices.map(p => p.currency).filter(
                (c): c is string => c != null
            )
        )
    ]

    const [selectedCurrency, setSelectedCurrency] = useState('USD')

    const currency = currencies.includes(selectedCurrency)
        ? selectedCurrency
        : currencies[0]

    const [rates, setRates] = useState<ExchangeRate[]>([])

    useEffect(() => {
        getCurrencyRates()
            .then(setRates)
            .catch(console.error)
    }, [])

    const exchangeRate = rates.find(
        rate => rate.currency === currency
    )?.exchangeRate

    const grouped = new Map<number, Record<string, number>>()

    const sortedPrices = [...prices].sort(
        (a, b) =>
            new Date(a.date ?? 0).getTime() -
            new Date(b.date ?? 0).getTime()
    )

    for (const price of sortedPrices) {
        const amount = price.discountPrice ?? price.originalPrice

        if (price.currency !== currency ||
            !price.date || amount == null) {
            continue
        }

        const date = new Date(price.date)

        if (Number.isNaN(date.getTime())) continue

        date.setHours(0, 0, 0, 0)
        const timestamp = date.getTime()

        const point = grouped.get(timestamp) ?? { date: timestamp }

        const brandName = getBrandInfo(price.brand).label
        point[brandName] = toMajorUnits(amount, currency)
        grouped.set(timestamp, point)
    }

    const data = [...grouped.values()].sort(
        (a, b) => a.date - b.date
    )


    const brands = [
        ...new Set(
            data.flatMap(point =>
                Object.keys(point).filter(key => key !== 'date')
            )
        )
    ]

    const changePoints = new Set<string>()

    for (const brand of brands) {
        let previousValue: number | undefined

        data.forEach((point, index) => {
            const value = point[brand]

            if (value === undefined) return

            if (previousValue === undefined || value !== previousValue) {
                changePoints.add(`${brand}:${index}`)
            }

            previousValue = value
        })
    }

    return (
        <section className="price-history">
            <h2>История цен</h2>

            <label htmlFor="history-currency">Регион: </label>
            <select
                id="history-currency"
                value={currency ?? ''}
                onChange={e => setSelectedCurrency(e.target.value)}
            >
                {currencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            {data.length === 0 ? (
                <p>История цен отсутствует</p>
            ) : (
                <div style={{ width: '100%', height: 360, marginTop: 24 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid stroke="#333" />

                            <XAxis
                                dataKey="date"
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={value =>
                                    new Date(value).toLocaleDateString('ru-RU')
                                }
                            />

                            <YAxis />



                            <Tooltip
                                cursor={{
                                    stroke: '#64748b',
                                    strokeWidth: 1,
                                    strokeDasharray: '4 4'
                                }}
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length) return null

                                    return (
                                        <div className="price-tooltip">
                                            <div className="price-tooltip__date">
                                                {new Date(Number(label)).toLocaleDateString(
                                                    'ru-RU',
                                                    {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    }
                                                )}
                                            </div>

                                            <div className="price-tooltip__divider" />

                                            {payload.map((entry, index) => {
                                                if (typeof entry.value !== 'number') {
                                                    return null
                                                }

                                                const amount = entry.value

                                                const rubPrice =
                                                    currency === 'RUB'
                                                        ? amount
                                                        : exchangeRate != null && exchangeRate > 0
                                                            ? amount / exchangeRate
                                                            : null

                                                return (
                                                    <div
                                                        key={`${entry.dataKey}-${index}`}
                                                        className="price-tooltip__item"
                                                    >
                                                        <div className="price-tooltip__brand">
                                <span
                                    className="price-tooltip__dot"
                                    style={{
                                        backgroundColor: entry.color
                                    }}
                                />
                                                            {entry.name}
                                                        </div>

                                                        <div className="price-tooltip__amount">
                                                            {formatMoney(amount, currency)}
                                                        </div>

                                                        {rubPrice != null && (
                                                            <div className="price-tooltip__rub">
                                                                ≈ {formatMoney(rubPrice, 'RUB')}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}

                                            <div className="price-tooltip__note">
                                                По текущему курсу
                                            </div>
                                        </div>
                                    )
                                }}
                            />



                            <Legend />

                            {brands.map(brand => (
                                <Line
                                    key={brand}
                                    type="stepAfter"
                                    dataKey={brand}
                                    name={brand}
                                    stroke={getBrandInfo(brand).color}
                                    strokeWidth={2}

                                    dot={props => {
                                        const { index, cx, cy, stroke } = props

                                        if (
                                            typeof index !== 'number' ||
                                            typeof cx !== 'number' ||
                                            typeof cy !== 'number' ||
                                            !changePoints.has(`${brand}:${index}`)
                                        ) {
                                            return <g />
                                        }

                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={5}
                                                fill={stroke}
                                                stroke="#16161f"
                                                strokeWidth={2}
                                            />
                                        )
                                    }}
                                    activeDot={{ r: 8, strokeWidth: 2 }}

                                    connectNulls
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    )
}

export default PriceHistoryChart
