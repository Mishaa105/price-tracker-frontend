import DOMPurify from 'dompurify'
import './GamePage.css'
import DiscountBadge from '../components/DiscountBadge'
import {useParams, useNavigate} from 'react-router'
import {useEffect, useState} from 'react'
import {getProductPage} from '../api/products'
import type {ProductPage} from '../api/products'
import CurrentPrices from '../components/CurrentPrices'
import PriceHistoryChart from '../components/PriceHistoryChart'
import {useAuth} from '../auth/AuthContext'
import {
    ApiError,
    getWishlist,
    addToWishlist,
    removeFromWishlist
} from '../api/account'
import {
    formatGenres,
    formatProductType,
    formatLanguages
} from '../utils/gameLabels'

function GamePage() {
    const {productId} = useParams()

    const navigate = useNavigate()
    const {token, signOut} = useAuth()

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

                        <DiscountBadge
                            originalPrice={mainPrice?.originalPrice}
                            discountPrice={mainPrice?.discountPrice}
                        />

                        {mainPrice?.originalPrice != null &&
                            mainPrice.discountPrice != null &&
                            mainPrice.discountPrice < mainPrice.originalPrice && (
                                <s>
                                    {new Intl.NumberFormat('ru-RU', {
                                        style: 'currency',
                                        currency: 'USD'
                                    }).format(mainPrice.originalPrice / 100)}
                                </s>
                            )}
                    </div>



                    <button
                        type="button"
                        className={`wishlist-button ${
                            wishlistError
                                ? 'wishlist-button--unavailable'
                                : inWishlist
                                    ? 'wishlist-button--added'
                                    : ''
                        }`}
                        onClick={handleWishlist}
                        disabled={!!wishlistError || wishlistLoading || wishlistBusy}
                        title={wishlistError || undefined}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={inWishlist && !wishlistError ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            {wishlistError ? (
                                <>
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                </>
                            ) : (
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            )}
                        </svg>

                        <span>
        {wishlistLoading || wishlistBusy
            ? 'Подождите...'
            : wishlistError
                ? 'Список желаемого недоступен'
                : inWishlist
                    ? 'В списке желаемого'
                    : 'В список желаемого'}
    </span>
                    </button>
                </div>
            </div>


            {game.description && (
                <section className="game-description-card">
                    <h2>Описание</h2>

                    <div
                        className={
                            descriptionExpanded
                                ? 'game-description game-description--expanded'
                                : 'game-description'
                        }
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(game.description)
                        }}
                    />


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


            <section className="game-info-card">
                <h2>Характеристики</h2>

                <div className="game-info-grid">
                    <div className="game-info-item">
                        <span>Жанры</span>
                        <strong>{formatGenres(game.genres)}</strong>
                    </div>

                    <div className="game-info-item">
                        <span>Издатель</span>
                        <strong>{game.publisherName || 'Не указан'}</strong>
                    </div>

                    <div className="game-info-item">
                        <span>Дата выхода</span>
                        <strong>
                            {game.releaseDate
                                ? new Date(game.releaseDate).toLocaleDateString('ru-RU')
                                : 'Не указана'}
                        </strong>
                    </div>

                    <div className="game-info-item">
                        <span>Рейтинг</span>
                        <strong>
                            {game.averageRating != null
                                ? `${game.averageRating} ★ (${game.ratingsCount ?? 0} оценок)`
                                : 'Нет оценок'}
                        </strong>
                    </div>

                    <div className="game-info-item">
                        <span>Тип товара</span>
                        <strong>{formatProductType(game.storeClassification)}</strong>
                    </div>

                    <div className="game-info-item">
                        <span>Языки интерфейса</span>
                        <strong>
                            <strong>{formatLanguages(game.screenLanguages)}</strong>
                        </strong>
                    </div>

                    <div className="game-info-item">
                        <span>Языки озвучки</span>
                        <strong>
                            <strong>{formatLanguages(game.spokenLanguages)}</strong>
                        </strong>
                    </div>
                </div>
            </section>


            <CurrentPrices prices={game.currentPrices ?? []}/>

            <PriceHistoryChart prices={game.prices ?? []}/>
        </main>
    )
}

export default GamePage
