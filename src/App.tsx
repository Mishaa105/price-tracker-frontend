import ProfilePage from './pages/ProfilePage'
import { BrowserRouter, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import AuthPage from './pages/AuthPage'
import Header from './components/Header'
import { AuthProvider } from './auth/AuthContext'
import AdminPage from './pages/AdminPage'

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Header />

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/games/:productId" element={<GamePage />} />
                    <Route path="/login" element={<AuthPage mode="login" />} />
                    <Route path="/register" element={<AuthPage mode="register" />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
