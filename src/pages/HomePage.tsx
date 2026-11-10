import { useEffect, useState } from 'react'
import { getHomePageGames } from '../api/products'
import type { ProductCardDto } from '../api/products'
import GameCard from '../components/GameCard'
import './HomePage.css'
import { Link } from 'react-router'

function HomePage() {
    const [games, setGames] = useState<ProductCardDto[]>([])

    useEffect(() => {
        getHomePageGames()
            .then(setGames)
            .catch(console.error)
    }, [])

    return (
        <main className="home-page">
            <h1>Price Tracker</h1>
            <h2>Каталог игр</h2>

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
        </main>
    )
}

export default HomePage
