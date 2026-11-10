
import { useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import type { ProductPage } from '../api/products'

type PricePoint = NonNullable<ProductPage['prices']>[number]

type Props = {
    prices: PricePoint[]
}

const colors: Record<string, string> = {
    'Обычная цена': '#3b82f6',
    'PlayStation Plus': '#facc15',
    'EA Play': '#22c55e',
    'GTA+': '#a855f7'
}

const fallbackColors = [
    '#f97316', '#ec4899', '#06b6d4', '#84cc16'
]

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

        point[price.brand ?? 'Обычная цена'] = amount / 100
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
                                labelFormatter={value =>
                                    new Date(Number(value)).toLocaleString('ru-RU')
                                }
                                formatter={value =>
                                    `${Number(value).toFixed(2)} ${currency}`
                                }
                            />

                            <Legend />

                            {brands.map((brand, index) => (
                                <Line
                                    key={brand}
                                    type="stepAfter"
                                    dataKey={brand}
                                    name={brand}
                                    stroke={
                                        colors[brand] ??
                                        fallbackColors[index % fallbackColors.length]
                                    }
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
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
