import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PublicDashboardExtra.css';
import './FilterStyles.css';
import '../styles.css';
import API_BASE_URL from '../api';
import BidStatusChart from './BidStatusChart';
import PublicBidStats from './PublicBidStats';
import NotificationBell from './NotificationBell';

const PublicDashboard = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState([]);
  const [bidStats, setBidStats] = useState({
    totalBids: 0,
    approvedBids: 0,
    rejectedBids: 0,
    pendingBids: 0
  });
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    phone: '',
    address: '',
    company: '',
    city: '',
    gstId: ''
  });

  // My Bids filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [clearTrigger, setClearTrigger] = useState(0);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !userData.role) {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchTenders();
    fetchBids();
    fetchBidStats();
  }, [navigate]); // Include navigate in dependencies

  // Force re-render when clearTrigger changes
  useEffect(() => {
    // This effect ensures the component re-renders when filters are cleared
  }, [clearTrigger]);

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

  const fetchBidStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/public/bids/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBidStats({
          totalBids: data.totalBids || 0,
          approvedBids: data.approvedBids || 0,
          rejectedBids: data.rejectedBids || 0,
          pendingBids: data.pendingBids || 0
        });
      }
    } catch (error) {
      console.error('Error fetching bid stats:', error);
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
      const response = await fetch(`${API_BASE_URL}/api/bids`, {
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
        fetchBidStats();
      } else {
        const errorData = await response.json();
        console.error('Failed to submit bid:', errorData);
        alert(`Failed to submit bid: ${errorData.msg || errorData.message || 'Unknown error occurred'}`);
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
    <div className="public-dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Welcome to GovTender Portal</h1>
          <p>Access government tenders, submit bids, and track your applications</p>
          <div className="banner-stats">
            <div className="banner-stat-card">
              <span className="stat-number">{tenders.length}</span>
              <span className="stat-text">Active Tenders</span>
            </div>
            <div className="banner-stat-card">
              <span className="stat-number">{bids.length}</span>
              <span className="stat-text">Your Bids</span>
            </div>
            <div className="banner-stat-card">
              <span className="stat-number">{bidStats.approvedBids}</span>
              <span className="stat-text">Approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <section className="dashboard-analytics">
        <div className="analytics-grid">
          <PublicBidStats stats={bidStats} />
          <BidStatusChart
            approved={bidStats.approvedBids}
            rejected={bidStats.rejectedBids}
            pending={bidStats.pendingBids}
          />
        </div>
      </section>

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
              <button
                className="btn btn-outline btn-small"
                onClick={() => {
                  setSelectedTender(tender);
                  setShowModal(true);
                }}
              >
                View Details
              </button>
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

  const renderMyBids = () => {
    // Filter and sort bids
    const filteredBids = bids.filter((bid) => {
      const matchesSearch = searchTerm === '' ||
        bid.tenderId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || bid.status === statusFilter.toLowerCase();
      const bidDate = new Date(bid.createdAt);
      const matchesDateFrom = !dateFrom || bidDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || bidDate <= new Date(dateTo);
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.amount - a.amount;
        case 'lowest':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return (
      <div className="public-dashboard-content">
        <div className="content-header">
          <h1>My Bids</h1>
          <p>Track the status of all your submitted bids</p>
        </div>

        {/* Filters Section */}
        <div className="dashboard-section">
          <h2>Filters & Search</h2>
          <div className="filters-grid">
            <div className="filter-item">
              <label>Search by Tender Title:</label>
              <input
                type="text"
                placeholder="Enter tender title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-item">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="filter-item">
              <label>From Date:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-item">
              <label>To Date:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-item">
              <label>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>
          </div>
          <div className="filter-results">
            Showing {filteredBids.length} of {bids.length} bids
          </div>
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
              {filteredBids.map((bid) => (
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
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => navigate(`/public/bid/${bid._id}/tracking`)}
                    >
                      Track Bid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBids.length === 0 && bids.length > 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Bids Match Your Filters</h3>
            <p>Try adjusting your search criteria or filters to see more results.</p>
            <button className="btn btn-outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setDateFrom('');
              setDateTo('');
              setSortBy('newest');
              setClearTrigger(prev => prev + 1);
            }}>
              Clear Filters
            </button>
          </div>
        )}

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
  };

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

  const handleSaveProfile = () => {
    console.log('Updated Profile Data:', {
      name: user.name,
      email: user.email,
      ...profileData
    });
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setProfileData({
      phone: '',
      address: '',
      company: '',
      city: '',
      gstId: ''
    });
    setIsEditing(false);
  };

  const renderProfile = () => (
    <div className="profile-page">
      <div className="profile-card">
        {/* Header with Avatar and Basic Info */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div className="profile-name">{user.name || 'User'}</div>
          <div className="profile-role">Public User / Contractor</div>
          <div className="profile-email">{user.email || 'user@example.com'}</div>
          {!isEditing && (
            <button className="btn btn-primary edit-profile-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {/* Contact Information Section */}
        <div className="profile-contact-section">
          <h3 className="profile-section-title">Contact Information</h3>
          <div className="profile-contact-grid">
            <div className="profile-contact-field">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              ) : (
                <p>{profileData.phone || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-contact-field">
              <label>Address</label>
              {isEditing ? (
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  placeholder="Enter your address"
                  rows="3"
                />
              ) : (
                <p>{profileData.address || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-contact-field">
              <label>Company / Organization</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.company}
                  onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                  placeholder="Enter company name"
                />
              ) : (
                <p>{profileData.company || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-contact-field">
              <label>City / State</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  placeholder="Enter city and state"
                />
              ) : (
                <p>{profileData.city || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-contact-field">
              <label>GST / Registration ID (Optional)</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.gstId}
                  onChange={(e) => setProfileData({...profileData, gstId: e.target.value})}
                  placeholder="Enter GST or registration ID"
                />
              ) : (
                <p>{profileData.gstId || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Mode Buttons */}
        {isEditing && (
          <div className="profile-edit-actions">
            <button className="btn btn-secondary" onClick={handleCancelEdit}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveProfile}>
              Save Changes
            </button>
          </div>
        )}

        {/* Account Summary Section */}
        <div className="profile-summary">
          <h3 className="profile-section-title">Account Summary</h3>
          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="profile-stat-value">{bidStats.totalBids}</div>
              <div className="profile-stat-label">Total Bids</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{bidStats.approvedBids}</div>
              <div className="profile-stat-label">Approved Bids</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{bidStats.pendingBids}</div>
              <div className="profile-stat-label">Pending Bids</div>
            </div>
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
            <NotificationBell />
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

      {/* Tender Details Modal */}
      {showModal && selectedTender && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedTender.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-description">
                <strong>Description:</strong> {selectedTender.description}
              </div>
              <div className="modal-detail">
                <strong>Department:</strong> {selectedTender.department || 'General'}
              </div>
              <div className="modal-detail">
                <strong>Budget:</strong> ₹{selectedTender.budget.toLocaleString()}
              </div>
              <div className="modal-detail">
                <strong>Deadline:</strong> {new Date(selectedTender.deadline).toLocaleDateString()}
              </div>
              <div className="modal-detail">
                <strong>Status:</strong> {selectedTender.status || 'Open'}
              </div>
              <div className="modal-detail">
                <strong>Created:</strong> {new Date(selectedTender.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Close</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowModal(false);
                  handleBid(selectedTender._id);
                }}
              >
                Place Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicDashboard;
