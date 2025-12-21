import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import VehicleLoan from './pages/VehicleLoan'
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vehicle-loan" element={<VehicleLoan />} />
                {/* Add more routes here as we create more services */}
            </Routes>
        </Router>
    )
}

export default App
