import './GamePage.css'
import { useParams } from 'react-router'
import { useEffect, useState } from 'react'
import { getProductPage } from '../api/products'
import type { ProductPage } from '../api/products'
import CurrentPrices from '../components/CurrentPrices'
import PriceHistoryChart from '../components/PriceHistoryChart'

function GamePage() {
    const { productId } = useParams()

    const [game, setGame] = useState<ProductPage | null>(null)

    useEffect(() => {
        if (!productId) return

        getProductPage(productId)
            .then(setGame)
            .catch(console.error)
    }, [productId])

    if (!game) {
        return <p>Загрузка игры...</p>
    }

    const mainPrice = game.currentPrices?.find(
        price => price.currency === 'USD' && !price.brand
    )

    const amount = mainPrice?.discountPrice ?? mainPrice?.originalPrice

    return (

        <main className="game-page">
            <div className="game-hero">
                {game.preview && (
                    <img
                        className="game-hero__cover"
                        src={game.preview}
                        alt={game.name ?? 'Игра'}
                    />
                )}

                <div className="game-hero__details">
                    <h1>{game.name}</h1>

                    <div className="game-hero__badges">
                        <span>{game.edition?.trim() || 'Standard Edition'}</span>

                        {game.platforms?.map(platform => (
                            <span key={platform}>{platform}</span>
                        ))}
                    </div>

                    <div className="game-hero__price">
                        <span>Цена в США</span>
                        <strong>
                            {amount != null
                                ? new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(amount / 100)
                                : 'Цена недоступна'}
                        </strong>
                    </div>

                    <button type="button" className="wishlist-button" disabled>
                        ♡ В список желаемого
                    </button>
                </div>
            </div>

            <p className="game-description">

            {game.description?.replace(/<br\s*\/?>/gi, '\n')}
            </p>
            <p>Жанры: {game.genres?.join(', ')}</p>
            <p>Издатель: {game.publisherName}</p>

            {game.releaseDate && (
                <p>
                    Дата выхода:{' '}
                    {new Date(game.releaseDate).toLocaleDateString('ru-RU')}
                </p>
            )}

            {game.averageRating != null && (
                <p>
                    Рейтинг: {game.averageRating}
                    {' '}({game.ratingsCount ?? 0} оценок)
                </p>
            )}

            {game.storeClassification && (
                <p>Возрастная классификация: {game.storeClassification}</p>
            )}

            <p>
                Языки интерфейса: {game.screenLanguages?.join(', ')}
            </p>

            <p>
                Языки озвучки: {game.spokenLanguages?.join(', ')}
            </p>

            <CurrentPrices prices={game.currentPrices ?? []} />

            <PriceHistoryChart prices={game.prices ?? []} />
        </main>
    )
}

export default GamePage
