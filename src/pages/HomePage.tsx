
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { getHomePageGames, searchGames } from '../api/products'
import type { ProductCardDto } from '../api/products'
import GameCard from '../components/GameCard'
import './HomePage.css'

function HomePage() {
    const [searchParams] = useSearchParams()
    const query = (searchParams.get('query') ?? '').trim()

    const [games, setGames] = useState<ProductCardDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        setLoading(true)
        setError('')

        const request = query
            ? searchGames(query)
            : getHomePageGames()

        request
            .then(result => {
                if (active) setGames(result)
            })
            .catch(() => {
                if (active) setError('Не удалось загрузить игры')
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [query])

    return (
        <main className="home-page">
            <h2>
                {query ? `Результаты поиска: ${query}` : 'Каталог игр'}
            </h2>

            {error ? (
                <p role="alert">{error}</p>
            ) : loading ? (
                <p>Загрузка...</p>
            ) : games.length === 0 ? (
                <p>Игры не найдены</p>
            ) : (
                <div className="games-grid">
                    {games.filter(game => game.productId).map(game => (
                        <Link
                            key={game.productId}
                            to={`/games/${game.productId}`}
                            className="game-link"
                        >
                            <GameCard game={game} />
                        </Link>
                    ))}
                </div>
            )}
        </main>
    )
}

export default HomePage
