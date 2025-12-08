import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import "./BidStatusChart.css";

const BidTracking = () => {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/bids/${bidId}/tracking`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracking data');
      }

      const data = await response.json();
      setTrackingData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();

    // Set up polling every 25 seconds
    const interval = setInterval(fetchTrackingData, 25000);

    return () => clearInterval(interval);
  }, [bidId]);

  const getStepStatus = (step, index) => {
    if (!trackingData) return 'upcoming';

    const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'TECHNICAL_EVAL', 'FINANCIAL_EVAL', 'FINAL_DECISION'];
    const currentIndex = statusOrder.indexOf(trackingData.currentStatus.toUpperCase().replace(' ', '_'));

    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  if (loading && !trackingData) {
    return (
      <div className="bid-tracking-page">
        <div className="bid-tracking-card">
          <div className="bid-tracking-loading">
            <p>Loading bid tracking data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bid-tracking-page">
        <div className="bid-tracking-card">
          <div className="bid-tracking-error">
            <p>Error loading tracking data: {error}</p>
            <button className="btn btn-primary" onClick={fetchTrackingData}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bid-tracking-page">
      <div className="bid-tracking-card">
        <div className="bid-tracking-header">
          <h1>Bid Tracking</h1>
          <button className="btn btn-outline" onClick={() => navigate('/public')}>
            Back to My Bids
          </button>
        </div>

        {trackingData && (
          <>
            <div className="bid-tracking-info">
              <div className="bid-tracking-info-item">
                <div className="bid-tracking-info-label">Tender Title</div>
                <div className="bid-tracking-info-value">{trackingData.tenderTitle}</div>
              </div>
              <div className="bid-tracking-info-item">
                <div className="bid-tracking-info-label">Bid Amount</div>
                <div className="bid-tracking-info-value">₹{trackingData.bidAmount.toLocaleString()}</div>
              </div>
              <div className="bid-tracking-info-item">
                <div className="bid-tracking-info-label">Submission Date</div>
                <div className="bid-tracking-info-value">
                  {new Date(trackingData.submissionDate).toLocaleDateString()}
                </div>
              </div>
              <div className="bid-tracking-info-item">
                <div className="bid-tracking-info-label">Current Status</div>
                <div className="bid-tracking-info-value status-badge">
                  {trackingData.currentStatus}
                </div>
              </div>
            </div>

            <div className="bid-tracking-timeline">
              {trackingData.timeline.map((step, index) => (
                <div key={step.step} className={`bid-tracking-step bid-tracking-step--${getStepStatus(step.step, index)}`}>
                  <div className="bid-tracking-step-content">
                    <div className="bid-tracking-step-title">{step.label}</div>
                    {step.time && (
                      <div className="bid-tracking-step-time">
                        {new Date(step.time).toLocaleString()}
                      </div>
                    )}
                    <div className="bid-tracking-step-note">{step.note}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bid-tracking-last-updated">
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BidTracking;
