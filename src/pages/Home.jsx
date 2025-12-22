import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
    const services = [
        {
            id: 1,
            title: 'Staff Vehicle Loan',
            description: 'For confirmed employees - Cadre-based limits for 2W/4W (Circular 347)',
            icon: '🚗',
            path: '/vehicle-loan',
            status: 'active',
            badge: 'STAFF'
        },
        {
            id: 2,
            title: 'Ride Easy Loan',
            description: 'Public vehicle financing - 2W/4W with CIBIL-based ROI & EV/Hybrid benefits (Circular 55)',
            icon: '🏍️',
            path: '/ride-easy-loan',
            status: 'active',
            badge: 'NEW'
        },
        {
            id: 3,
            title: 'Housing Loan Calculator',
            description: 'Calculate housing loan eligibility and EMI for staff members',
            icon: '🏠',
            path: '/housing-loan',
            status: 'active'
        },
        {
            id: 4,
            title: 'Home Loan Plus',
            description: 'Additional loan for existing home loan customers - Personal needs or debt consolidation',
            icon: '🏡',
            path: '/home-loan-plus',
            status: 'active',
            badge: 'PLUS'
        },
        {
            id: 5,
            title: 'Mortgage Loan Checker',
            description: 'Check eligibility for mortgage loan (Term Loan/Overdraft) against property - Circular 178',
            icon: '🏦',
            path: '/mortgage-loan',
            status: 'active'
        },
        {
            id: 6,
            title: 'Personal Loan Calculator',
            description: 'Quick personal loan eligibility check with instant EMI calculation',
            icon: '💰',
            path: '/personal-loan',
            status: 'coming-soon'
        },
        {
            id: 7,
            title: 'Education Loan Calculator',
            description: 'Calculate education loan for children with subsidy details',
            icon: '🎓',
            path: '/education-loan',
            status: 'coming-soon'
        },
        {
            id: 7,
            title: 'Festival Advance Calculator',
            description: 'Check eligibility for festival advance and repayment schedule',
            icon: '🎉',
            path: '/festival-advance',
            status: 'coming-soon'
        },
        {
            id: 8,
            title: 'Salary Advance Calculator',
            description: 'Emergency salary advance eligibility and deduction calculator',
            icon: '💵',
            path: '/salary-advance',
            status: 'coming-soon'
        },
        {
            id: 9,
            title: 'Loan Against FD',
            description: 'Calculate loan amount against Fixed Deposit holdings',
            icon: '💎',
            path: '/fd-loan',
            status: 'coming-soon'
        },
        {
            id: 10,
            title: 'Medical Advance Calculator',
            description: 'Medical emergency advance eligibility and documentation',
            icon: '🏥',
            path: '/medical-advance',
            status: 'coming-soon'
        },
        {
            id: 11,
            title: 'Retirement Benefits',
            description: 'Calculate retirement benefits, gratuity, and pension details',
            icon: '👴',
            path: '/retirement-benefits',
            status: 'coming-soon'
        },
        {
            id: 12,
            title: 'Leave Encashment',
            description: 'Calculate leave encashment amount and eligibility',
            icon: '📅',
            path: '/leave-encashment',
            status: 'coming-soon'
        },
        {
            id: 13,
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
                            {service.badge === 'PLUS' && (
                                <div className="plus-badge-home">PLUS</div>
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
