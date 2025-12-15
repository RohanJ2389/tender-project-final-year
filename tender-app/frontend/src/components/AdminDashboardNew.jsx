import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import API_BASE_URL from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Filtered bid arrays
  const pendingBids = bids.filter(bid => bid.status === 'pending');
  const processedBids = bids.filter(bid => bid.status === 'accepted' || bid.status === 'rejected');

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
    fetchUsers();
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

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError(`Failed to fetch users: ${response.status} ${response.statusText}`);
        console.error('Error fetching users:', response.status, response.statusText);
      }
    } catch (error) {
      setError('Network error while fetching users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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
        status: action === 'approved' ? 'accepted' : 'rejected'
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
        const msg =
          errorData.msg ||
          errorData.message ||
          'Failed to update bid status';
        alert(msg);
      }
    } catch (error) {
      console.error('Error updating bid:', error);
      const msg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        'Failed to update bid status';
      alert(msg);
    }
  };

  const handleUserAction = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Attempting to block/unblock user:', userId);
      console.log('API URL:', `${API_BASE_URL}/api/auth/block-user/${userId}`);

      const response = await fetch(`${API_BASE_URL}/api/auth/block-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Success data:', data);
        // Update the users state with the updated user data
        setUsers(users.map(user =>
          user._id === userId ? data.user : user
        ));
        alert(data.message);
      } else {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        alert(`Failed to update user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating the user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user permanently?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/delete-user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (res.ok) {
        alert("User deleted successfully!");
        setUsers(users.filter(u => u._id !== id)); // update UI
      } else {
        alert("Failed to delete user!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        const data = await response.json();
        // Update the users state with the updated user data
        setUsers(users.map(user =>
          user._id === userId ? data.user : user
        ));
        alert(data.message);
      } else {
        const errorData = await response.json();
        alert(`Failed to update user role: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('An error occurred while updating the user role');
    }
  };

  const handleViewTender = (tenderId) => {
    navigate(`/admin/tender/${tenderId}`);
  };

  const handleEditTender = (tenderId) => {
    navigate(`/admin/tender/${tenderId}/edit`);
  };

  const handlePublish = async (tenderId) => {
    if (!window.confirm('Are you sure you want to publish this tender?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tenders/${tenderId}/publish`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updated = await response.json();
        setTenders(prev =>
          prev.map(t => t._id === updated._id ? updated : t)
        );
        alert('Tender published successfully!');
      } else {
        const err = await response.json();
        alert(err.msg || err.message || 'Failed to publish tender');
      }
    } catch (error) {
      console.error('Error publishing tender:', error);
      alert('Network error while publishing tender');
    }
  };

  const handleCloseTender = async (tenderId) => {
    if (!window.confirm('Are you sure you want to close this tender?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tenders/${tenderId}/close`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Tender closed successfully!');
        fetchData(); // Refresh tenders list
      } else {
        alert('Failed to close tender');
      }
    } catch (error) {
      console.error('Error closing tender:', error);
      alert('Network error while closing tender');
    }
  };

  const handleDeleteTender = async (tenderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this tender?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tenders/${tenderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Tender deleted successfully!');
        fetchData(); // Refresh tenders list
      } else {
        alert('Failed to delete tender');
      }
    } catch (error) {
      console.error('Error deleting tender:', error);
      alert('Network error while deleting tender');
    }
  };

  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId);
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
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
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => handleViewTender(tender._id)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => handleEditTender(tender._id)}
                    >
                      Edit
                    </button>
                    {tender.status === 'draft' && (
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => handlePublish(tender._id)}
                      >
                        Publish
                      </button>
                    )}
                    {tender.status === 'published' && (
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleCloseTender(tender._id)}
                      >
                        Close
                      </button>
                    )}
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteTender(tender._id)}
                    >
                      Delete
                    </button>
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
            {pendingBids.map((bid) => (
              <tr key={bid._id}>
                <td>{bid.tenderId?.title || 'N/A'}</td>
                <td>{bid.bidderId?.name || 'Anonymous'}</td>
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

  const renderApprovedRejectedBids = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h1>Approved / Rejected Bids</h1>
        <p>View approved and rejected bids</p>
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
            </tr>
          </thead>
          <tbody>
            {processedBids.map((bid) => (
              <tr key={bid._id}>
                <td>{bid.tenderId?.title || 'N/A'}</td>
                <td>{bid.bidderId?.name || 'Anonymous'}</td>
                <td>₹{bid.amount}</td>
                <td>{new Date(bid.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${bid.status || 'pending'}`}>
                    {bid.status || 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => {
    // Filter out super admin users for normal admins
    const visibleUsers = users.filter(u => !u.isSuperAdmin);

    return (
      <div className="dashboard-content">
        {/* Page header with improved typography */}
        <div className="content-header">
          <h1>Registered Users</h1>
          <p>Manage registered contractors and users</p>
        </div>

        {/* Centered white card container with max-width 1200px, rounded corners, shadow, and padding */}
        <div className="users-table-card">
          {/* Table with improved spacing, sticky header, and animations */}
          <table className="users-table">
            <thead className="users-table-header">
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading-cell">Loading users...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="error-cell">{error}</td>
                </tr>
              ) : visibleUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">No registered users found.</td>
                </tr>
              ) : (
                visibleUsers.map((user) => (
                  <tr key={user._id} className="users-table-row">
                    <td>{user.name}</td>
                    <td>{user.company || "-"}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.isSuperAdmin ? 'Super Administrator' : user.role === 'admin' ? 'Administrator' : 'User'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString("en-GB")}</td>
                    <td>
                      <span className={`status-badge ${!user.isBlocked ? 'active' : 'blocked'}`}>
                        {!user.isBlocked ? 'ACTIVE' : 'BLOCKED'}
                      </span>
                    </td>
                    <td>
                      {/* Action buttons with icons, consistent min-height 44px, and hover animations */}
                      <div className="users-action-buttons">
                        {user.role !== 'admin' ? (
                          <button
                            className="btn-make-admin"
                            onClick={() => handleRoleChange(user._id, 'admin')}
                            title="Make Admin"
                          >
                            <span className="btn-icon">👑</span>
                            Make Admin
                          </button>
                        ) : (
                          <button
                            className="btn-remove-admin"
                            onClick={() => handleRoleChange(user._id, 'user')}
                            title="Remove Admin"
                          >
                            <span className="btn-icon">👤</span>
                            Remove Admin
                          </button>
                        )}
                        <button
                          className={`btn-block ${user.isBlocked ? 'btn-unblock' : ''}`}
                          onClick={() => handleUserAction(user._id)}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          <span className="btn-icon">{user.isBlocked ? '🔓' : '🔒'}</span>
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user._id)}
                          title="Delete User"
                        >
                          <span className="btn-icon">🗑️</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
      case 'approved-rejected': return renderApprovedRejectedBids();
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
            <button
              className="mobile-hamburger"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
            <div className="user-info">
              <span className="user-role">Administrator</span>
              <span className="user-name">{user.name || 'Admin User'}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
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
                    onClick={() => handleMenuClick(item.id)}
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

        {/* Mobile Overlay */}
        <div
          className={`sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        ></div>

        {/* Main Content */}
        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
