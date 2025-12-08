import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api';

const TenderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTenderDetails();
    fetchTenderBids();
  }, [id]);

  const fetchTenderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tenders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTender(data);
      } else {
        setError('Failed to fetch tender details');
      }
    } catch (error) {
      console.error('Error fetching tender details:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenderBids = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/bids/tender/${id}`, {
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

  const handleCloseTender = async () => {
    if (!window.confirm('Are you sure you want to close this tender?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tenders/${id}/close`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Tender closed successfully!');
        setTender({ ...tender, status: 'closed' });
      } else {
        alert('Failed to close tender');
      }
    } catch (error) {
      console.error('Error closing tender:', error);
      alert('Network error while closing tender');
    }
  };

  const handleDeleteTender = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this tender?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tenders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Tender deleted successfully!');
        navigate('/admin');
      } else {
        alert('Failed to delete tender');
      }
    } catch (error) {
      console.error('Error deleting tender:', error);
      alert('Network error while deleting tender');
    }
  };

  if (loading) return <div className="loading">Loading tender details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!tender) return <div className="error">Tender not found</div>;

  return (
    <div className="tender-detail-page">
      {/* Centered container with max-width for the entire page content */}
      <div className="tender-detail-container">
        {/* Main white card containing all tender information */}
        <div className="tender-detail-card">
          {/* Page title */}
          <h1 className="tender-detail-title">Tender Information</h1>

          {/* Two-column layout: left for actions, right for details */}
          <div className="tender-detail-layout">
            {/* Left column: Action buttons */}
            <div className="tender-actions-column">
              <div className="tender-actions-group">
                <button
                  className="btn btn-primary tender-action-btn"
                  onClick={() => navigate(`/admin/tender/${id}/edit`)}
                >
                  Edit Tender
                </button>
                {tender.status !== 'closed' && (
                  <button
                    className="btn btn-warning tender-action-btn"
                    onClick={handleCloseTender}
                  >
                    Close Tender
                  </button>
                )}
                <button
                  className="btn btn-danger tender-action-btn"
                  onClick={handleDeleteTender}
                >
                  Delete Tender
                </button>
              </div>
              <div className="tender-back-section">
                <button
                  className="btn btn-secondary tender-back-btn"
                  onClick={() => navigate('/admin')}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            {/* Right column: Tender details */}
            <div className="tender-details-column">
              {/* Tender metadata grid */}
              <div className="tender-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Department:</span>
                  <span className="meta-value">{tender.department}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Status:</span>
                  <span className={`status-badge ${tender.status.toLowerCase()}`}>
                    {tender.status.toUpperCase()}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Budget:</span>
                  <span className="meta-value">₹{tender.budget.toLocaleString()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Start Date:</span>
                  <span className="meta-value">{new Date(tender.startDate).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Deadline:</span>
                  <span className="meta-value">{new Date(tender.deadline).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Created By:</span>
                  <span className="meta-value">{tender.createdBy?.name || 'Admin'}</span>
                </div>
              </div>

              {/* Description section */}
              <div className="tender-description-section">
                <h3 className="section-title">Description</h3>
                <div className="description-content">
                  <p>{tender.description}</p>
                </div>
              </div>

              {/* Bids section */}
              <div className="tender-bids-section">
                <h3 className="section-title">Bids Received ({bids.length})</h3>
                <div className="bids-content">
                  {bids.length === 0 ? (
                    <div className="bids-empty-state">
                      <div className="empty-icon">📋</div>
                      <p className="empty-text">No bids received yet.</p>
                      <p className="empty-subtext">Bids will appear here once submitted.</p>
                    </div>
                  ) : (
                    <div className="bids-table-container">
                      <table className="gov-table">
                        <thead>
                          <tr>
                            <th>Bidder</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bids.map((bid) => (
                            <tr key={bid._id}>
                              <td>{bid.bidderId?.name || 'Anonymous'}</td>
                              <td>₹{bid.amount.toLocaleString()}</td>
                              <td>{new Date(bid.createdAt).toLocaleDateString()}</td>
                              <td>
                                <span className={`status-badge ${bid.status.toLowerCase()}`}>
                                  {bid.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderDetail;
