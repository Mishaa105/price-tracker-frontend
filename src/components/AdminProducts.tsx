
import { useState } from 'react'
import type { FormEvent } from 'react'

import {
    getProductPage,
    searchGames
} from '../api/products'
import type {
    ProductCardDto,
    ProductPage
} from '../api/products'
import {
    updateAdminProduct,
    deleteAdminProduct
} from '../api/admin'
import type { ProductUpdateRequest } from '../api/admin'

type Props = {
    token: string
}

type ProductForm = {
    name: string
    description: string
    preview: string
    edition: string
    averageRating: string
    ratingsCount: string
    storeClassification: string
    releaseDate: string
    publisherName: string
    platforms: string
    genres: string
    screenLanguages: string
    spokenLanguages: string
}

const fields: {
    key: keyof ProductForm
    label: string
    multiline?: boolean
    number?: boolean
}[] = [
    { key: 'name', label: 'Название' },
    { key: 'edition', label: 'Издание' },
    { key: 'preview', label: 'Ссылка на обложку' },
    { key: 'publisherName', label: 'Издатель' },
    { key: 'releaseDate', label: 'Дата выхода (ISO 8601)' },
    { key: 'storeClassification', label: 'Классификация' },
    { key: 'averageRating', label: 'Рейтинг', number: true },
    { key: 'ratingsCount', label: 'Количество оценок', number: true },
    { key: 'platforms', label: 'Платформы (через запятую)' },
    { key: 'genres', label: 'Жанры (через запятую)' },
    { key: 'screenLanguages', label: 'Языки интерфейса (через запятую)' },
    { key: 'spokenLanguages', label: 'Языки озвучки (через запятую)' },
    { key: 'description', label: 'Описание', multiline: true }
]

function toForm(game: ProductPage): ProductForm {
    return {
        name: game.name ?? '',
        description: game.description ?? '',
        preview: game.preview ?? '',
        edition: game.edition ?? '',
        averageRating: game.averageRating?.toString() ?? '',
        ratingsCount: game.ratingsCount?.toString() ?? '',
        storeClassification: game.storeClassification ?? '',
        releaseDate: game.releaseDate ?? '',
        publisherName: game.publisherName ?? '',
        platforms: game.platforms?.join(', ') ?? '',
        genres: game.genres?.join(', ') ?? '',
        screenLanguages: game.screenLanguages?.join(', ') ?? '',
        spokenLanguages: game.spokenLanguages?.join(', ') ?? ''
    }
}

function buildChanges(
    original: ProductForm,
    draft: ProductForm
): ProductUpdateRequest {
    const changes: ProductUpdateRequest = {}

    const textKeys = [
        'name', 'description', 'preview', 'edition',
        'storeClassification', 'releaseDate', 'publisherName'
    ] as const

    for (const key of textKeys) {
        if (original[key] !== draft[key]) {
            changes[key] = draft[key].trim() || null
        }
    }

    const arrayKeys = [
        'platforms', 'genres',
        'screenLanguages', 'spokenLanguages'
    ] as const

    for (const key of arrayKeys) {
        if (original[key] !== draft[key]) {
            changes[key] = draft[key]
                .split(',')
                .map(item => item.trim())
                .filter(Boolean)
        }
    }

    if (original.averageRating !== draft.averageRating) {
        const value = draft.averageRating.trim()
        const parsed = Number(value)

        if (value && !Number.isFinite(parsed)) {
            throw new Error('Некорректный рейтинг')
        }

        changes.averageRating = value ? parsed : null
    }

    if (original.ratingsCount !== draft.ratingsCount) {
        const value = draft.ratingsCount.trim()
        const parsed = Number(value)

        if (value && (!Number.isInteger(parsed) || parsed < 0)) {
            throw new Error('Некорректное количество оценок')
        }

        changes.ratingsCount = value ? parsed : null
    }

    return changes
}

function AdminProducts({ token }: Props) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<ProductCardDto[]>([])
    const [searched, setSearched] = useState(false)

    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [original, setOriginal] = useState<ProductForm | null>(null)
    const [draft, setDraft] = useState<ProductForm | null>(null)

    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    async function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const text = query.trim()
        if (!text || busy) return

        setBusy(true)
        setError('')
        setMessage('')
        setSearched(false)

        try {
            const games = await searchGames(text)
            setResults(games)
            setSearched(true)
        } catch {
            setError('Не удалось найти товары')
        } finally {
            setBusy(false)
        }
    }

    async function selectProduct(productId: string) {
        if (busy) return

        setBusy(true)
        setError('')
        setMessage('')

        try {
            const product = await getProductPage(productId)
            const form = toForm(product)

            setSelectedId(productId)
            setOriginal(form)
            setDraft(form)
        } catch {
            setError('Не удалось загрузить товар')
        } finally {
            setBusy(false)
        }
    }

    function changeField(key: keyof ProductForm, value: string) {
        setDraft(previous =>
            previous ? { ...previous, [key]: value } : previous
        )
    }

    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!selectedId || !original || !draft || busy) return

        setError('')
        setMessage('')

        let changes: ProductUpdateRequest

        try {
            changes = buildChanges(original, draft)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка данных')
            return
        }

        if (Object.keys(changes).length === 0) {
            setMessage('Нет изменений')
            return
        }

        setBusy(true)

        try {
            await updateAdminProduct(token, selectedId, changes)
            setOriginal({ ...draft })
            setMessage('Товар успешно обновлён')
        } catch {
            setError('Не удалось сохранить товар')
        } finally {
            setBusy(false)
        }
    }

    async function handleDelete() {
        if (!selectedId || busy) return

        const confirmation = window.prompt(
            `Для удаления товара введите его ID:\n${selectedId}`
        )

        if (confirmation !== selectedId) return

        setBusy(true)
        setError('')
        setMessage('')

        try {
            await deleteAdminProduct(token, selectedId)

            setResults(previous =>
                previous.filter(game => game.productId !== selectedId)
            )

            setSelectedId(null)
            setOriginal(null)
            setDraft(null)
            setMessage('Товар удалён')
        } catch {
            setError('Не удалось удалить товар')
        } finally {
            setBusy(false)
        }
    }

    return (
        <section className="admin-section admin-products">
            <h2>Управление товарами</h2>

            <form className="admin-product-search" onSubmit={handleSearch}>
                <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Название игры..."
                    aria-label="Поиск товара"
                />
                <button type="submit" disabled={busy}>
                    Найти
                </button>
            </form>

            {error && <p className="admin-error" role="alert">{error}</p>}
            {message && <p className="admin-success">{message}</p>}

            {searched && results.length === 0 && (
                <p>Товары не найдены</p>
            )}

            <div className="admin-product-results">
                {results.map(game => {
                    if (!game.productId) return null

                    return (
                        <button
                            key={game.productId}
                            type="button"
                            disabled={busy}
                            onClick={() => selectProduct(game.productId!)}
                        >
                            {game.preview && (
                                <img src={game.preview} alt="" />
                            )}
                            <span>{game.name ?? game.productId}</span>
                        </button>
                    )
                })}
            </div>

            {selectedId && draft && (
                <form className="admin-product-editor" onSubmit={handleSave}>
                    <h3>Редактирование товара</h3>
                    <p className="admin-product-id">ID: {selectedId}</p>

                    <fieldset disabled={busy}>
                        <div className="admin-product-fields">
                            {fields.map(field => (
                                <label
                                    key={field.key}
                                    className={field.multiline
                                        ? 'admin-product-field--wide'
                                        : ''}
                                >
                                    <span>{field.label}</span>

                                    {field.multiline ? (
                                        <textarea
                                            rows={6}
                                            value={draft[field.key]}
                                            onChange={event =>
                                                changeField(field.key, event.target.value)
                                            }
                                        />
                                    ) : (
                                        <input
                                            type={field.number ? 'number' : 'text'}
                                            step={field.key === 'averageRating'
                                                ? '0.01' : field.number ? '1' : undefined}
                                            value={draft[field.key]}
                                            onChange={event =>
                                                changeField(field.key, event.target.value)
                                            }
                                        />
                                    )}
                                </label>
                            ))}
                        </div>

                        <div className="admin-product-actions">
                            <button type="submit">
                                Сохранить изменения
                            </button>

                            <button
                                type="button"
                                className="admin-product-delete"
                                onClick={handleDelete}
                            >
                                Удалить товар
                            </button>
                        </div>
                    </fieldset>
                </form>
            )}
        </section>
    )
}

export default AdminProducts
