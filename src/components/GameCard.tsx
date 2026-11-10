import { getBrandInfo } from '../utils/brands'
import type { ProductCardDto } from '../api/products'
import './GameCard.css'

type GameCardProps = {
    game: ProductCardDto
}

function formatPrice(amount: number) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'USD',
    }).format(amount / 100)
}

function GameCard({ game }: GameCardProps) {

    const usdPrices = game.currentPrices?.filter(
        price => price.currency === 'USD'
    ) ?? []

    const regularPrice = usdPrices.find(price => !price.brand)

    const offers = usdPrices
        .filter(price => !!price.brand)
        .filter((price, index, all) =>
            all.findIndex(other =>
                other.brand === price.brand &&
                other.discountPrice === price.discountPrice &&
                other.originalPrice === price.originalPrice
            ) === index
        )


    const amount = regularPrice?.discountPrice
        ?? regularPrice?.originalPrice

    return (
        <article className="game-card">
            {game.preview && (
                <img
                    src={game.preview}
                    alt={game.name ?? 'Игра'}
                />
            )}

            <div className="game-card__body">
                <h3 title={game.name ?? undefined}>
                    {game.name ?? 'Без названия'}
                </h3>

                <div className="game-card__badges">
                    <span>{game.edition?.trim() || 'Standard Edition'}</span>

                    {game.platforms?.map(platform => (
                        <span key={platform}>{platform}</span>
                    ))}
                </div>


                <div className="game-card__price">
                    <span>Обычная цена</span>

                    {regularPrice?.originalPrice != null &&
                        amount != null &&
                        amount < regularPrice.originalPrice && (
                            <s>{formatPrice(regularPrice.originalPrice)}</s>
                        )}

                    {amount != null ? (
                        <strong>{formatPrice(amount)}</strong>
                    ) : (
                        <span>Цена недоступна</span>
                    )}

                    {offers.map((offer, index) => {
                        const info = getBrandInfo(offer.brand)
                        const offerAmount = offer.discountPrice ?? offer.originalPrice

                        if (offerAmount == null) return null

                        return (
                            <div className="game-card__offer" key={index}>
        <span style={{ color: info.color }}>
          {info.label}
        </span>
                                <strong>{formatPrice(offerAmount)}</strong>
                            </div>
                        )
                    })}
                </div>

            </div>
        </article>
    )
}

export default GameCard
