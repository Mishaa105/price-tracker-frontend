import { getDiscountPercent } from '../utils/discount'
import './DiscountBadge.css'

type Props = {
    originalPrice?: number | null
    discountPrice?: number | null
}

export default function DiscountBadge({
                                          originalPrice,
                                          discountPrice
                                      }: Props) {
    const percent = getDiscountPercent(
        originalPrice,
        discountPrice
    )

    if (percent === null || percent === 0) return null

    return (
        <div className="discount-badge">
            −{percent}%
        </div>
    )
}