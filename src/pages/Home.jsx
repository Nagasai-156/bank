import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
    const services = [
        {
            id: 1,
            title: 'Vehicle Loan Calculator',
            description: 'Calculate eligibility for staff vehicle loans (2W/4W) based on circular guidelines',
            icon: '🚗',
            path: '/vehicle-loan',
            status: 'active'
        },
        {
            id: 2,
            title: 'Housing Loan Calculator',
            description: 'Calculate housing loan eligibility and EMI for staff members',
            icon: '🏠',
            path: '/housing-loan',
            status: 'coming-soon'
        },
        {
            id: 3,
            title: 'Personal Loan Calculator',
            description: 'Quick personal loan eligibility check with instant EMI calculation',
            icon: '💰',
            path: '/personal-loan',
            status: 'coming-soon'
        },
        {
            id: 4,
            title: 'Education Loan Calculator',
            description: 'Calculate education loan for children with subsidy details',
            icon: '🎓',
            path: '/education-loan',
            status: 'coming-soon'
        },
        {
            id: 5,
            title: 'Festival Advance Calculator',
            description: 'Check eligibility for festival advance and repayment schedule',
            icon: '🎉',
            path: '/festival-advance',
            status: 'coming-soon'
        },
        {
            id: 6,
            title: 'Salary Advance Calculator',
            description: 'Emergency salary advance eligibility and deduction calculator',
            icon: '💵',
            path: '/salary-advance',
            status: 'coming-soon'
        },
        {
            id: 7,
            title: 'Loan Against FD',
            description: 'Calculate loan amount against Fixed Deposit holdings',
            icon: '🏦',
            path: '/fd-loan',
            status: 'coming-soon'
        },
        {
            id: 8,
            title: 'Medical Advance Calculator',
            description: 'Medical emergency advance eligibility and documentation',
            icon: '🏥',
            path: '/medical-advance',
            status: 'coming-soon'
        },
        {
            id: 9,
            title: 'Retirement Benefits',
            description: 'Calculate retirement benefits, gratuity, and pension details',
            icon: '👴',
            path: '/retirement-benefits',
            status: 'coming-soon'
        },
        {
            id: 10,
            title: 'Leave Encashment',
            description: 'Calculate leave encashment amount and eligibility',
            icon: '📅',
            path: '/leave-encashment',
            status: 'coming-soon'
        },
        {
            id: 11,
            title: 'Loan Restructuring',
            description: 'Restructure existing loans with new tenure and EMI options',
            icon: '🔄',
            path: '/loan-restructuring',
            status: 'coming-soon'
        }
    ]

    return (
        <div className="home-container">
            <div className="home-header">
                <div className="header-content">
                    <h1 className="main-title">Staff Banking Services Portal</h1>
                    <p className="main-subtitle">
                        Comprehensive loan calculators and financial services for bank staff members
                    </p>
                </div>
            </div>

            <div className="services-container">
                <div className="services-grid">
                    {services.map((service) => (
                        <div key={service.id} className="service-card">
                            {service.status === 'coming-soon' && (
                                <div className="coming-soon-badge">Coming Soon</div>
                            )}

                            <div className="service-icon">{service.icon}</div>

                            <h3 className="service-title">{service.title}</h3>

                            <p className="service-description">{service.description}</p>

                            {service.status === 'active' ? (
                                <Link to={service.path} className="service-button">
                                    Open Calculator →
                                </Link>
                            ) : (
                                <button className="service-button disabled" disabled>
                                    Coming Soon
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <footer className="home-footer">
                <p>© 2024 Staff Banking Services Portal | All calculators follow official circular guidelines</p>
            </footer>
        </div>
    )
}

export default Home
