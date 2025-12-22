import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import VehicleLoan from './pages/VehicleLoan'
import HousingLoan from './pages/HousingLoan'
import HomeLoanPlus from './pages/HomeLoanPlus'
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vehicle-loan" element={<VehicleLoan />} />
                <Route path="/housing-loan" element={<HousingLoan />} />
                <Route path="/home-loan-plus" element={<HomeLoanPlus />} />
                {/* Add more routes here as we create more services */}
            </Routes>
        </Router>
    )
}

export default App
