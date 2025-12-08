import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api';

const TenderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    startDate: '',
    deadline: '',
    department: '',
    status: 'draft'
  });

  const fetchTenderDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tenders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTender(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          budget: data.budget || '',
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          deadline: data.deadline ? data.deadline.split('T')[0] : '',
          department: data.department || '',
          status: data.status || 'draft'
        });
      } else {
        setError('Failed to fetch tender details');
      }
    } catch (error) {
      console.error('Error fetching tender details:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTenderDetails();
  }, [fetchTenderDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tenders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Tender updated successfully!');
        navigate(`/admin/tender/${id}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to update tender: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating tender:', error);
      alert('Network error while updating tender');
    }
  };

  if (loading) return <div className="loading">Loading tender details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!tender) return <div className="error">Tender not found</div>;

  return (
    <div className="tender-edit-page">
      <div className="gov-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="gov-emblem">⚖️</div>
            <div className="logo-text">
              <h1>GovTender Portal</h1>
              <p>Public e-Tender System</p>
            </div>
          </div>
          <div className="header-right">
            <button className="btn btn-secondary" onClick={() => navigate(`/admin/tender/${id}`)}>
              Back to Tender Details
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="edit-form-header">
          <h1>Edit Tender</h1>
          <p>Modify tender details and settings</p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="gov-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Tender Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
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
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget">Budget (₹) *</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deadline">Deadline *</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Update Tender</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/admin/tender/${id}`)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TenderEdit;
