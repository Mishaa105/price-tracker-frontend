const brands: Record<string, { label: string; color: string }> = {
    PS_PLUS: {
        label: 'PlayStation Plus',
        color: '#facc15'
    },
    EA_ACCESS: {
        label: 'EA Play',
        color: '#ef4444'
    },
    EA_PLAY: {
        label: 'EA Play',
        color: '#ef4444'
    },
    UBISOFT_PLUS: {
        label: 'Ubisoft+',
        color: '#22d3ee'
    },
    GTA_PLUS: {
        label: 'GTA+',
        color: '#a855f7'
    }
}

export function getBrandInfo(brand: string | null | undefined) {
    if (!brand) {
        return { label: 'Обычная цена', color: '#3b82f6' }
    }

    const key = brand.trim().toUpperCase().replace(/[\s-]+/g, '_')

    return brands[key] ?? {
        label: brand.replace(/_/g, ' '),
        color: '#aeb2bf'
    }
}
