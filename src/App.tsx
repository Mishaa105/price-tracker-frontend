
import { BrowserRouter, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games/:productId" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
