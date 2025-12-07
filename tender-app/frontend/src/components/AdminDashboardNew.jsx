import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import API_BASE_URL from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || userData.role !== 'admin') {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch tenders
      const tendersRes = await fetch(`${API_BASE_URL}/api/tenders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (tendersRes.ok) {
        const tendersData = await tendersRes.json();
        setTenders(tendersData);
      }

      // Fetch all bids
      const bidsRes = await fetch(`${API_BASE_URL}/api/bids`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bidsRes.ok) {
        const bidsData = await bidsRes.json();
        setBids(bidsData);
      }

      // Fetch users (assuming there's an endpoint for this)
      // For now, we'll use mock data
      setUsers([
        { id: 1, name: 'John Contractor', company: 'ABC Ltd', email: 'john@example.com', status: 'Active' },
        { id: 2, name: 'Jane Builder', company: 'XYZ Corp', email: 'jane@example.com', status: 'Active' },
        { id: 3, name: 'Bob Engineer', company: 'Tech Solutions', email: 'bob@example.com', status: 'Blocked' }
      ]);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleCreateTender = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const tenderData = {
      title: formData.get('title'),
      description: formData.get('description'),
      budget: parseFloat(formData.get('budget')),
      startDate: formData.get('startDate'),
      deadline: formData.get('deadline'),
      department: formData.get('department'),
      status: formData.get('status')
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tenders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tenderData)
      });

      if (response.ok) {
        await response.json();
        alert('Tender created successfully!');
        e.target.reset();
        fetchData(); // Refresh tenders state
        setActiveSection('manage-tenders');
      } else {
        const errorData = await response.json();
        console.error('Failed to create tender:', errorData);
        alert(`Failed to create tender: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating tender:', error);
      alert('An error occurred while creating the tender');
    }
  };

  const handleBidAction = async (bidId, action) => {
    try {
      const token = localStorage.getItem('token');
      const bidData = {
        status: action === 'approved' ? 'approved' : 'rejected'
      };
      const response = await fetch(`${API_BASE_URL}/api/bids/${bidId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bidData)
      });

      if (response.ok) {
        alert(`Bid ${action} successfully!`);
        fetchData(); // Refresh bids state
      } else {
        const errorData = await response.json();
        console.error('Failed to update bid status:', errorData);
        alert(`Failed to update bid status: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating bid:', error);
      alert('An error occurred while updating the bid');
    }
  };

  const handleUserAction = (userId, action) => {
    // Mock user blocking/unblocking
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: action === 'block' ? 'Blocked' : 'Active' } : user
    ));
    alert(`User ${action}ed successfully!`);
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { id: 'create-tender', label: 'Create Tender', icon: '➕' },
    { id: 'manage-tenders', label: 'Manage Tenders', icon: '📋' },
    { id: 'view-bids', label: 'View Bids', icon: '💰' },
    { id: 'approved-rejected', label: 'Approved / Rejected Bids', icon: '✅' },
    { id: 'users', label: 'Registered Users', icon: '👥' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📈' }
  ];

  const renderOverview = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h1>Admin Overview</h1>
        <p>Monitor and manage government tender operations</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">📋</div>
          <div className="kpi-content">
            <div className="kpi-value">{tenders.length}</div>
            <div className="kpi-label">Total Tenders</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <div className="kpi-value">{tenders.filter(t => new Date(t.deadline) > new Date()).length}</div>
            <div className="kpi-label">Active Tenders</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <div className="kpi-value">{bids.filter(b => b.status === 'pending').length}</div>
            <div className="kpi-label">Pending Approvals</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <div className="kpi-value">{bids.length}</div>
            <div className="kpi-label">Total Bids</div>
          </div>
        </div>
      </div>

      <div className="recent-activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📝</div>
            <div className="activity-content">
              <p>New tender created: "{tenders[tenders.length - 1]?.title || 'Sample Tender'}"</p>
              <small>2 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <p>Bid approved for Road Construction Project</p>
              <small>1 day ago</small>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <p>New contractor registered: ABC Construction Ltd</p>
              <small>3 days ago</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreateTender = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h1>Create New Tender</h1>
        <p>Publish a new government tender for bidding</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleCreateTender} className="gov-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Tender Title *</label>
              <input type="text" id="title" name="title" required />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select id="department" name="department" required>
                <option value="">Select Department</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Transportation">Transportation</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" name="description" rows="4" required></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">Budget (₹) *</label>
              <input type="number" id="budget" name="budget" min="0" step="0.01" required />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input type="date" id="startDate" name="startDate" required />
            </div>
            <div className="form-group">
              <label htmlFor="deadline">Deadline *</label>
              <input type="date" id="deadline" name="deadline" required />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Publish Tender</button>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveSection('overview')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderManageTenders = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h1>Manage Tenders</h1>
        <p>View and manage all published tenders</p>
      </div>

      <div className="table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Department</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenders.map((tender, index) => (
              <tr key={tender._id}>
                <td>{index + 1}</td>
                <td>{tender.title}</td>
                <td>{tender.department || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${tender.status || 'open'}`}>
                    {tender.status || 'Open'}
                  </span>
                </td>
                <td>{tender.startDate ? new Date(tender.startDate).toLocaleDateString() : 'N/A'}</td>
                <td>{new Date(tender.deadline).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-small btn-outline">View</button>
                    <button className="btn btn-small btn-outline">Edit</button>
                    <button className="btn btn-small btn-warning">Close</button>
                    <button className="btn btn-small btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderViewBids = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h1>View Bids</h1>
        <p>Review and manage all submitted bids</p>
      </div>

      <div className="table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Tender</th>
              <th>Bidder</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid._id}>
                <td>{bid.tenderId?.title || 'N/A'}</td>
                <td>{bid.userId?.name || 'Anonymous'}</td>
                <td>₹{bid.amount}</td>
                <td>{new Date(bid.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${bid.status || 'pending'}`}>
                    {bid.status || 'Pending'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {(!bid.status || bid.status === 'pending') && (
                      <>
                        <button
                          className="btn btn-small btn-success"
                          onClick={() => handleBidAction(bid._id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleBidAction(bid._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h1>Registered Users</h1>
        <p>Manage registered contractors and users</p>
      </div>

      <div className="table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.company}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {user.status === 'Active' ? (
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleUserAction(user.id, 'block')}
                      >
                        Block
                      </button>
                    ) : (
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => handleUserAction(user.id, 'unblock')}
                      >
                        Unblock
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h1>Reports & Analytics</h1>
        <p>View comprehensive statistics and trends</p>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>Tender Statistics</h3>
          <div className="report-stats">
            <div className="report-stat">
              <span className="stat-value">{tenders.length}</span>
              <span className="stat-label">Total Tenders</span>
            </div>
            <div className="report-stat">
              <span className="stat-value">{tenders.filter(t => t.status === 'published').length}</span>
              <span className="stat-label">Published</span>
            </div>
            <div className="report-stat">
              <span className="stat-value">{tenders.filter(t => t.status === 'draft').length}</span>
              <span className="stat-label">Drafts</span>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>Bid Statistics</h3>
          <div className="report-stats">
            <div className="report-stat">
              <span className="stat-value">{bids.length}</span>
              <span className="stat-label">Total Bids</span>
            </div>
            <div className="report-stat">
              <span className="stat-value">{bids.filter(b => b.status === 'approved').length}</span>
              <span className="stat-label">Approved</span>
            </div>
            <div className="report-stat">
              <span className="stat-value">{bids.filter(b => b.status === 'pending').length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>Monthly Trends</h3>
          <div className="chart-placeholder">
            <div className="chart-bar" style={{ height: '60%' }}></div>
            <div className="chart-bar" style={{ height: '80%' }}></div>
            <div className="chart-bar" style={{ height: '40%' }}></div>
            <div className="chart-bar" style={{ height: '90%' }}></div>
            <div className="chart-bar" style={{ height: '70%' }}></div>
            <div className="chart-bar" style={{ height: '50%' }}></div>
          </div>
          <div className="chart-labels">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'create-tender': return renderCreateTender();
      case 'manage-tenders': return renderManageTenders();
      case 'view-bids': return renderViewBids();
      case 'approved-rejected': return renderViewBids(); // Same as view-bids for now
      case 'users': return renderUsers();
      case 'reports': return renderReports();
      default: return renderOverview();
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Government Header */}
      <header className="gov-admin-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="gov-emblem">⚖️</div>
            <div className="logo-text">
              <h1>GovTender Portal</h1>
              <p>Public e-Tender System</p>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-role">Administrator</span>
              <span className="user-name">{user.name || 'Admin User'}</span>
            </div>
            <button className="btn btn-outline logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? '☰' : '✕'}
            </button>
            {!sidebarCollapsed && <h3>Navigation</h3>}
          </div>

          <nav className="sidebar-nav">
            <ul>
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={activeSection === item.id ? 'active' : ''}
                    onClick={() => setActiveSection(item.id)}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <div className="gov-badge">
              <span className="badge-icon">🏛️</span>
              {!sidebarCollapsed && <span>Government Use Only</span>}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
