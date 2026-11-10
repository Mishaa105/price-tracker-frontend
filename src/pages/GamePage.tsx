import './GamePage.css'
import { useParams, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { getProductPage } from '../api/products'
import type { ProductPage } from '../api/products'
import CurrentPrices from '../components/CurrentPrices'
import PriceHistoryChart from '../components/PriceHistoryChart'
import { useAuth } from '../auth/AuthContext'
import {
    ApiError,
    getWishlist,
    addToWishlist,
    removeFromWishlist
} from '../api/account'

function GamePage() {
    const { productId } = useParams()

    const navigate = useNavigate()
    const { token, signOut } = useAuth()

    const [inWishlist, setInWishlist] = useState(false)
    const [wishlistLoading, setWishlistLoading] = useState(false)
    const [wishlistBusy, setWishlistBusy] = useState(false)
    const [wishlistError, setWishlistError] = useState('')

    const [game, setGame] = useState<ProductPage | null>(null)
    const [descriptionExpanded, setDescriptionExpanded] = useState(false)

    useEffect(() => {
        if (!productId) return

        getProductPage(productId)
            .then(setGame)
            .catch(console.error)
    }, [productId])


    useEffect(() => {
        let active = true

        setInWishlist(false)
        setWishlistError('')

        if (!token || !productId) {
            setWishlistLoading(false)
            return
        }

        setWishlistLoading(true)

        getWishlist(token)
            .then(games => {
                if (active) {
                    setInWishlist(
                        games.some(game => game.productId === productId)
                    )
                }
            })
            .catch(err => {
                if (!active) return

                if (err instanceof ApiError && err.status === 401) {
                    signOut()
                } else {
                    setWishlistError('Не удалось проверить список желаемого')
                }
            })
            .finally(() => {
                if (active) setWishlistLoading(false)
            })

        return () => {
            active = false
        }
    }, [token, productId, signOut])


    async function handleWishlist() {
        if (!token) {
            navigate('/login')
            return
        }

        if (!productId || wishlistBusy || wishlistLoading) return

        setWishlistBusy(true)
        setWishlistError('')

        try {
            if (inWishlist) {
                await removeFromWishlist(token, productId)
                setInWishlist(false)
            } else {
                await addToWishlist(token, productId)
                setInWishlist(true)
            }
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                signOut()
                navigate('/login')
            } else {
                setWishlistError('Не удалось изменить список желаемого')
            }
        } finally {
            setWishlistBusy(false)
        }
    }


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


                    <button
                        type="button"
                        className={`wishlist-button ${inWishlist ? 'wishlist-button--added' : ''}`}
                        onClick={handleWishlist}
                        disabled={wishlistLoading || wishlistBusy}
                    >
                        {wishlistLoading || wishlistBusy
                            ? 'Подождите...'
                            : inWishlist
                                ? '♥ В списке желаемого'
                                : '♡ В список желаемого'}
                    </button>

                    {wishlistError && (
                        <p role="alert">{wishlistError}</p>
                    )}

                </div>
            </div>


            {game.description && (
                <section className="game-description-card">
                    <h2>Описание</h2>

                    <p className={
                           descriptionExpanded
                               ? 'game-description game-description--expanded'
                               : 'game-description'
                       }>
                        {game.description
                            .replace(/<br\s*\/?>/gi, '\n')
                            .replace(/\n{3,}/g, '\n\n')
                            .trim()}
                    </p>

                    {game.description.length > 350 && (
                        <button
                            type="button"
                            className="description-toggle"
                            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                        >
                            {descriptionExpanded
                                ? 'Свернуть'
                                : 'Показать полностью'}
                        </button>
                    )}
                </section>
            )}

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
