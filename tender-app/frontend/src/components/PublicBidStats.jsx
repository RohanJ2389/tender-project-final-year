import React from 'react';
import './PublicBidStats.css';

const PublicBidStats = ({ stats }) => {
  return (
    <div className="bid-stats-container">
      <h3>Bid Statistics</h3>
      <div className="bid-stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{stats.totalBids || 0}</div>
          <div className="stat-label">Total Bids</div>
        </div>

        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{stats.approvedBids || 0}</div>
          <div className="stat-label">Approved</div>
        </div>

        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-number">{stats.rejectedBids || 0}</div>
          <div className="stat-label">Rejected</div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-number">{stats.pendingBids || 0}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>
    </div>
  );
};

export default PublicBidStats;
