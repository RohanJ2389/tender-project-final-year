import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';
import '../login-styles.css';
import API_BASE_URL from '../api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Login failed');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/public');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Registration failed');
        return;
      }
      alert('Registration successful! Please login now.');
      setIsLogin(true);
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration.');
    }
  };

  return (
    <>
      {/* GOVERNMENT HEADER */}
      <header className="gov-header">
        <div className="gov-top-bar">
          <div className="container">
            <div className="gov-info">
              <span>🇮🇳 Government of India</span>
              <span>•</span>
              <span>Ministry of Infrastructure</span>
              <span>•</span>
              <span>Department of Public Works</span>
            </div>
            <div className="gov-links">
              <a href="#accessibility">Accessibility</a>
              <a href="#sitemap">Sitemap</a>
              <a href="/">Home</a>
            </div>
          </div>
        </div>
        <nav className="gov-nav">
          <div className="container">
            <div className="logo-section">
              <div className="gov-logo">
                <div className="emblem">⚖️</div>
                <div className="logo-text">
                  <h1>PublicTenderChain</h1>
                  <p>Government Tender Portal</p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* LOGIN SECTION */}
      <main className="login-main">
        <div className="container">
          <div className="login-container">
            <div className="login-header">
              <div className="gov-seal">
                <div className="seal-icon">🏛️</div>
                <h2>Official Login Portal</h2>
                <p>Government e-Tender Management System</p>
              </div>
            </div>

            <div className="login-content">
              <div className="login-tabs">
                <button
                  className={`tab-btn ${isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(true)}
                >
                  Login to Portal
                </button>
                <button
                  className={`tab-btn ${!isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(false)}
                >
                  New Registration
                </button>
              </div>

              {isLogin ? (
                <div className="login-form-section">
                  <div className="form-header">
                    <h3>Secure Login</h3>
                    <p>Access your government tender account</p>
                  </div>

                  <form onSubmit={handleLogin} className="gov-login-form">
                    <div className="form-group">
                      <label htmlFor="login-email" className="gov-label">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="login-email"
                        className="gov-input"
                        placeholder="Enter your registered email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="login-password" className="gov-label">
                        Password *
                      </label>
                      <input
                        type="password"
                        id="login-password"
                        className="gov-input"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="gov-btn-primary">
                        🔐 Login to Portal
                      </button>
                    </div>

                    <div className="form-footer">
                      <p className="security-notice">
                        🔒 This is a secure government portal. All activities are monitored and logged.
                      </p>
                      <button
                        type="button"
                        className="register-link"
                        onClick={() => setIsLogin(false)}
                      >
                        New User? Register Here
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="register-form-section">
                  <div className="form-header">
                    <h3>New User Registration</h3>
                    <p>Create your government tender account</p>
                  </div>

                  <form onSubmit={handleRegister} className="gov-login-form">
                    <div className="form-group">
                      <label htmlFor="register-name" className="gov-label">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="register-name"
                        className="gov-input"
                        placeholder="Enter your full legal name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="register-email" className="gov-label">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="register-email"
                        className="gov-input"
                        placeholder="Enter your email address"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="register-password" className="gov-label">
                        Password *
                      </label>
                      <input
                        type="password"
                        id="register-password"
                        className="gov-input"
                        placeholder="Create a strong password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="gov-btn-primary">
                        📝 Create Account
                      </button>
                    </div>

                    <div className="form-footer">
                      <p className="terms-notice">
                        By registering, you agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
                      </p>
                      <button
                        type="button"
                        className="login-link"
                        onClick={() => setIsLogin(true)}
                      >
                        Already have an account? Login Here
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="login-sidebar">
              <div className="sidebar-card">
                <h4>🔐 Security Information</h4>
                <ul>
                  <li>Use strong passwords with minimum 8 characters</li>
                  <li>Never share your login credentials</li>
                  <li>Logout after completing your session</li>
                  <li>Report suspicious activities immediately</li>
                </ul>
              </div>

              <div className="sidebar-card">
                <h4>📞 Need Help?</h4>
                <p>
                  <strong>Technical Support:</strong><br />
                  📧 support@publictenderchain.gov.in<br />
                  📞 +91-11-12345678
                </p>
                <p>
                  <strong>Working Hours:</strong><br />
                  Monday - Friday: 9:00 AM - 6:00 PM IST
                </p>
              </div>

              <div className="sidebar-card">
                <h4>📋 Quick Links</h4>
                <ul>
                  <li><a href="#guidelines">Tender Guidelines</a></li>
                  <li><a href="#faq">Frequently Asked Questions</a></li>
                  <li><a href="#downloads">Download Forms</a></li>
                  <li><a href="#status">Check Application Status</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* GOVERNMENT FOOTER */}
      <footer className="gov-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>PublicTenderChain</h3>
              <p>Official Government Tender Portal powered by Blockchain Technology</p>
              <div className="social-links">
                <a href="https://facebook.com/govtenders" title="Facebook" target="_blank" rel="noopener noreferrer">📘</a>
                <a href="https://twitter.com/govtenders" title="Twitter" target="_blank" rel="noopener noreferrer">🐦</a>
                <a href="https://linkedin.com/company/govtenders" title="LinkedIn" target="_blank" rel="noopener noreferrer">💼</a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#tenders">Active Tenders</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#guidelines">Tender Guidelines</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#downloads">Downloads</a></li>
                <li><a href="#api">API Documentation</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact Information</h4>
              <p>📍 New Delhi, India</p>
              <p>📞 +91-11-12345678</p>
              <p>✉️ support@publictenderchain.gov.in</p>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="copyright">
              © 2024 Government of India. All rights reserved.
            </div>
            <div className="footer-links">
              <button onClick={() => alert('Privacy Policy - Coming Soon')}>Privacy Policy</button>
              <button onClick={() => alert('Terms of Service - Coming Soon')}>Terms of Service</button>
              <button onClick={() => alert('Accessibility - Coming Soon')}>Accessibility</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Login;
