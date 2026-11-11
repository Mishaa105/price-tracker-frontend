import { useAuth } from '../auth/AuthContext'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import './Header.css'
import { isAdmin } from '../auth/roles'
import logo from '../assets/logo.svg'
import Notifications from './Notifications'

function Header() {
    const navigate = useNavigate()
    const location = useLocation()

    const [query, setQuery] = useState('')
    const { token, signOut } = useAuth()

    useEffect(() => {
        const currentQuery = location.pathname === '/'
            ? new URLSearchParams(location.search).get('query') ?? ''
            : ''

        setQuery(currentQuery)
    }, [location.pathname, location.search])

    function handleSearch(event: React.SubmitEvent) {
        event.preventDefault()

        const text = query.trim()

        navigate(
            text ? `/?query=${encodeURIComponent(text)}` : '/'
        )
    }

    return (
        <header className="site-header">
            <div className="site-header__inner">
                <Link to="/" className="site-header__logo">
                    <img src={logo} alt="" className="site-header__logo-icon" />
                    <span>Price Tracker</span>
                </Link>

                <form
                    className="site-header__search"
                    onSubmit={handleSearch}
                >
                    <input
                        type="search"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        placeholder="Найти игру..."
                    />
                    <button type="submit">Найти</button>
                </form>


                <div className="site-header__actions">

                    {token ? (
                        <>
                            <Notifications />

                            <Link to="/profile">Профиль</Link>

                            {isAdmin(token) && (
                                <Link to="/admin">Админ-панель</Link>
                            )}

                            <button type="button" onClick={signOut}>
                                Выйти
                            </button>
                        </>
                    ) : (
                        <Link to="/login">Войти</Link>
                    )}

                </div>

            </div>
        </header>
    )
}

export default Header
