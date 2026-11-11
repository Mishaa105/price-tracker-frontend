
const genreNames: Record<string, string> = {
    ACTION: 'Экшен',
    ADVENTURE: 'Приключения',
    SIMULATION: 'Симуляторы',
    RPG: 'Ролевые игры',
    SHOOTER: 'Шутеры',
    CASUAL: 'Казуальные',
    STRATEGY: 'Стратегии',
    ARCADE: 'Аркады',
    PUZZLE: 'Головоломки',
    SPORT: 'Спорт',
    SPORTS: 'Спорт',
    UNIQUE: 'Уникальные',
    FAMILY: 'Семейные',
    RACING: 'Гонки',
    FIGHTING: 'Файтинги',
    HORROR: 'Ужасы',
    SIMULATOR: 'Симуляторы',
    PARTY: 'Для вечеринок',
    MUSIC: 'Музыкальные и ритмические',
    ADULT: 'Для взрослых',
    BRAIN_TRAINING: 'Тренировка мозга',
    EDUCATIONAL: 'Обучающие',
    QUIZ: 'Викторины',
    FITNESS: 'Фитнес',
    BOARD_GAME: 'Настольные игры',

    ROLE_PLAYING_GAMES: 'Ролевые игры',
    MUSIC_RHYTHM: 'Музыкальные и ритмические',
    BOARD_GAMES: 'Настольные игры'
}

export function formatGenres(
    genres: string[] | null | undefined
): string {
    if (!genres?.length) return 'Не указаны'

    return genres.map(genre => {
        const key = genre
            .trim()
            .replace(/^productGenres:/i, '')
            .replace(/[\s/-]+/g, '_')
            .toUpperCase()

        return genreNames[key] ?? genre
    }).join(', ')
}

// Классификации товаров из PS Store
const productTypes: Record<string, string> = {
    FULL_GAME: 'Полная игра',
    GAME_BUNDLE: 'Набор игр'
}

export function formatProductType(
    type: string | null | undefined
): string {
    if (!type) return 'Не указан'

    return productTypes[type.toUpperCase()] ?? type
}

// Стандартные названия языков на русском
const languageNames = new Intl.DisplayNames(['ru'], {
    type: 'language'
})

export function formatLanguages(
    languages: string[] | null | undefined
): string {
    if (!languages?.length) return 'Не указаны'

    const seen = new Set<string>()
    const result: string[] = []

    for (const language of languages) {
        const code = language.trim().replace(/_/g, '-')
        if (!code) continue

        let canonical: string

        try {
            canonical = Intl.getCanonicalLocales(code)[0]
        } catch {
            canonical = code
        }

        const key = canonical.toLowerCase()
        if (seen.has(key)) continue

        seen.add(key)

        let name: string

        try {
            name = languageNames.of(canonical) ?? language
        } catch {
            name = language
        }

        result.push(
            name.charAt(0).toUpperCase() + name.slice(1)
        )
    }

    return result.join(', ') || 'Не указаны'
}
