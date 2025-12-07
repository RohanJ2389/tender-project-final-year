import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PublicDashboardExtra.css';
import API_BASE_URL from '../api';

const PublicDashboard = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || userData.role !== 'public') {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchTenders();
    fetchBids();
  }, [navigate]);

  const fetchTenders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tenders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTenders(data);
      }
    } catch (error) {
      console.error('Error fetching tenders:', error);
    }
  };

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/bids/my-bids`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBids(data);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleBid = async (tenderId) => {
    const bidAmount = prompt('Enter your bid amount (₹):');
    if (!bidAmount || isNaN(bidAmount)) return;

    const bidData = {
      tenderId: tenderId,
      amount: parseFloat(bidAmount)
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bidData)
      });

      if (response.ok) {
        alert('Bid submitted successfully!');
        fetchBids();
      } else {
        const errorData = await response.json();
        console.error('Failed to submit bid:', errorData);
        alert(`Failed to submit bid: ${errorData.message || 'You may have already bid on this tender.'}`);
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('An error occurred while submitting the bid');
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { id: 'tenders', label: 'Active Tenders', icon: '📋' },
    { id: 'my-bids', label: 'My Bids', icon: '💰' },
    { id: 'schemes', label: 'Government Schemes', icon: '🎯' },
    { id: 'profile', label: 'My Profile', icon: '👤' }
  ];

  const renderOverview = () => (
    <div className="public-dashboard-content">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Welcome to GovTender Portal</h1>
          <p>Access government tenders, submit bids, and track your applications</p>
          <div className="banner-stats">
            <div className="stat-item">
              <span className="stat-number">{tenders.length}</span>
              <span className="stat-text">Active Tenders</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{bids.length}</span>
              <span className="stat-text">Your Bids</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{bids.filter(b => b.status === 'approved').length}</span>
              <span className="stat-text">Approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <p className="section-desc">Common tasks and shortcuts for efficient tender management</p>

        <div className="quick-actions-grid">
          <div className="action-card" onClick={() => setActiveSection('tenders')}>
            <div className="action-icon">📋</div>
            <h3>Browse Tenders</h3>
            <p>View all active government tenders</p>
          </div>
          <div className="action-card" onClick={() => setActiveSection('my-bids')}>
            <div className="action-icon">💰</div>
            <h3>Track My Bids</h3>
            <p>Monitor your submitted bid status</p>
          </div>
          <div className="action-card" onClick={() => setActiveSection('schemes')}>
            <div className="action-icon">🎯</div>
            <h3>Government Schemes</h3>
            <p>Explore special programs and incentives</p>
          </div>
          <div className="action-card" onClick={() => setActiveSection('profile')}>
            <div className="action-icon">👤</div>
            <h3>My Profile</h3>
            <p>View and update your information</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        <p className="section-desc">Your latest interactions with the tender system</p>

        <div className="activity-list">
          {bids.slice(0, 3).map((bid, index) => (
            <div key={bid._id} className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-content">
                <p>Bid submitted for "{bid.tenderId?.title || 'Tender'}" - ₹{bid.amount}</p>
                <small>{new Date(bid.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
          {bids.length === 0 && (
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-content">
                <p>Welcome! Start by browsing active tenders</p>
                <small>Getting started</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderActiveTenders = () => (
    <div className="public-dashboard-content">
      <div className="content-header">
        <h1>Active Tenders</h1>
        <p>Browse and apply for current government tender opportunities</p>
      </div>

      <div className="tenders-grid">
        {tenders.map((tender) => (
          <div key={tender._id} className="tender-card-public">
            <div className="tender-header">
              <span className="tender-dept">{tender.department || 'General'}</span>
              <span className="tender-status open">Open</span>
            </div>
            <h3>{tender.title}</h3>
            <p className="tender-description">{tender.description}</p>
            <div className="tender-details">
              <div className="detail-item">
                <span className="detail-label">Budget:</span>
                <span className="detail-value">₹{tender.budget.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Deadline:</span>
                <span className="detail-value">{new Date(tender.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="tender-actions">
              <button className="btn btn-outline btn-small">View Details</button>
              <button
                className="btn btn-primary btn-small"
                onClick={() => handleBid(tender._id)}
              >
                Place Bid
              </button>
            </div>
          </div>
        ))}
      </div>

      {tenders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Active Tenders</h3>
          <p>Check back later for new tender opportunities</p>
        </div>
      )}
    </div>
  );

  const renderMyBids = () => (
    <div className="public-dashboard-content">
      <div className="content-header">
        <h1>My Bids</h1>
        <p>Track the status of all your submitted bids</p>
      </div>

      <div className="bids-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Tender Title</th>
              <th>Bid Amount</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid._id}>
                <td>{bid.tenderId?.title || 'N/A'}</td>
                <td>₹{bid.amount.toLocaleString()}</td>
                <td>{new Date(bid.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${bid.status || 'pending'}`}>
                    {bid.status || 'Pending'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-small btn-outline">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bids.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h3>No Bids Submitted</h3>
          <p>You haven't submitted any bids yet. Browse active tenders to get started.</p>
          <button className="btn btn-primary" onClick={() => setActiveSection('tenders')}>
            Browse Tenders
          </button>
        </div>
      )}
    </div>
  );

  const renderGovernmentSchemes = () => (
    <div className="public-dashboard-content">
      <div className="content-header">
        <h1>Government Schemes & Offers</h1>
        <p>Explore government initiatives and special programs for businesses</p>
      </div>

      <div className="schemes-grid">
        <div className="scheme-card">
          <div className="scheme-icon">🏭</div>
          <h3>MSME Support Scheme</h3>
          <p>Special incentives and relaxed tender conditions for Micro, Small and Medium Enterprises</p>
          <ul className="scheme-benefits">
            <li>Reduced eligibility criteria</li>
            <li>Priority evaluation</li>
            <li>Financial assistance up to 20%</li>
          </ul>
          <button className="btn btn-outline">Learn More</button>
        </div>

        <div className="scheme-card">
          <div className="scheme-icon">🚀</div>
          <h3>Startup Tender Relaxation</h3>
          <p>Streamlined tender process for innovative startups and technology companies</p>
          <ul className="scheme-benefits">
            <li>Fast-track approval</li>
            <li>Mentorship support</li>
            <li>Technology grants available</li>
          </ul>
          <button className="btn btn-outline">Learn More</button>
        </div>

        <div className="scheme-card">
          <div className="scheme-icon">🌱</div>
          <h3>Green Procurement Initiative</h3>
          <p>Preferential treatment for environmentally sustainable and green technology solutions</p>
          <ul className="scheme-benefits">
            <li>Bonus points for green solutions</li>
            <li>Carbon credit incentives</li>
            <li>Sustainability certification support</li>
          </ul>
          <button className="btn btn-outline">Learn More</button>
        </div>

        <div className="scheme-card">
          <div className="scheme-icon">👥</div>
          <h3>Women Entrepreneur Program</h3>
          <p>Special provisions and support for women-led businesses and entrepreneurs</p>
          <ul className="scheme-benefits">
            <li>Reserved tender categories</li>
            <li>Capacity building programs</li>
            <li>Networking opportunities</li>
          </ul>
          <button className="btn btn-outline">Learn More</button>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="public-dashboard-content">
      <div className="content-header">
        <h1>My Profile</h1>
        <p>View and manage your account information</p>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div className="profile-info">
            <h3>{user.name || 'User'}</h3>
            <p className="profile-role">Public User / Contractor</p>
            <p className="profile-email">{user.email || 'user@example.com'}</p>
          </div>
        </div>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-number">{bids.length}</span>
            <span className="stat-label">Total Bids</span>
          </div>
          <div className="profile-stat">
            <span className="stat-number">{bids.filter(b => b.status === 'approved').length}</span>
            <span className="stat-label">Approved Bids</span>
          </div>
          <div className="profile-stat">
            <span className="stat-number">{bids.filter(b => b.status === 'pending').length}</span>
            <span className="stat-label">Pending Bids</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'tenders': return renderActiveTenders();
      case 'my-bids': return renderMyBids();
      case 'schemes': return renderGovernmentSchemes();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <div className="public-dashboard">
      {/* Government Header */}
      <header className="gov-public-header">
        <div className="public-header-content">
          <div className="public-logo-section">
            <div className="public-gov-emblem">⚖️</div>
            <div className="public-logo-text">
              <h1>GovTender Portal</h1>
              <p>Public e-Tender System</p>
            </div>
          </div>
          <div className="public-header-right">
            <div className="public-user-info">
              <span className="public-user-role">Public User</span>
              <span className="public-user-name">{user.name || 'Citizen'}</span>
            </div>
            <button className="btn btn-outline logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="public-dashboard-layout">
        {/* Sidebar */}
        <aside className={`public-dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="public-sidebar-header">
            <button
              className="public-sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? '☰' : '✕'}
            </button>
            {!sidebarCollapsed && <h3>Navigation</h3>}
          </div>

          <nav className="public-sidebar-nav">
            <ul>
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={activeSection === item.id ? 'active' : ''}
                    onClick={() => setActiveSection(item.id)}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <span className="public-nav-icon">{item.icon}</span>
                    {!sidebarCollapsed && <span className="public-nav-label">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="public-sidebar-footer">
            <div className="public-gov-badge">
              <span className="public-badge-icon">🏛️</span>
              {!sidebarCollapsed && <span>Citizen Portal</span>}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="public-dashboard-main">
          {renderContent()}
        </main>
      </div>

      {/* Help Section */}
      <section className="help-section">
        <div className="help-content">
          <h3>Need Help?</h3>
          <div className="help-links">
            <a href="#guidelines" className="help-link">
              📖 Tender Guidelines
            </a>
            <a href="#faq" className="help-link">
              ❓ FAQ
            </a>
            <a href="#support" className="help-link">
              📞 Contact Support
            </a>
            <a href="#training" className="help-link">
              🎓 Training Resources
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicDashboard;
