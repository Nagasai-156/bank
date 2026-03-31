import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import MortgagePage from './pages/MortgagePage.jsx'
import VehiclePage from './pages/VehiclePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mortgage" element={<MortgagePage />} />
      <Route path="/vehicle-loan" element={<VehiclePage />} />
    </Routes>
  )
}
