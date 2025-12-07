import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

// imports ke baad:
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"; 
// yaha pe tum apna backend URL dal sakte ho


const LandingPage = () => {
  const [stats, setStats] = useState({ tenders: 0, bids: 0, users: 0 });

  useEffect(() => {
    const backBtn = document.getElementById("backToTop");
    if (backBtn) {
      const handleScroll = () => {
        const pos = window.scrollY || document.documentElement.scrollTop;
        backBtn.style.display = pos > 200 ? "block" : "none";
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }

    // Fetch basic stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [tendersRes, bidsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tenders`),
        fetch(`${API_BASE_URL}/api/bids/my-bids`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => ({ ok: false }))
      ]);

      if (tendersRes.ok) {
        const tenders = await tendersRes.json();
        setStats(prev => ({ ...prev, tenders: tenders.length }));
      }

      if (bidsRes.ok) {
        const bids = await bidsRes.json();
        setStats(prev => ({ ...prev, bids: bids.length }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
              <Link to="/login">Login</Link>
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
            <ul className="nav-menu">
              <li><a href="#home" className="active">Home</a></li>
              <li><a href="#tenders">Active Tenders</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#help">Help</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section id="home" className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1>Official Government Tender Portal</h1>
              <p className="hero-subtitle">
                Transparent, Secure, and Efficient Tender Management System
                Powered by Blockchain Technology
              </p>
              <div className="hero-actions">
                <Link to="/login" className="btn btn-primary btn-large">
                  Access Portal
                </Link>
                <a href="#tenders" className="btn btn-secondary btn-large">
                  View Active Tenders
                </a>
              </div>
            </div>
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-number">{stats.tenders}</div>
                <div className="stat-label">Active Tenders</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.bids}</div>
                <div className="stat-label">Total Bids</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">Transparent</div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK LINKS */}
        <section className="quick-links-section">
          <div className="container">
            <h2>Quick Links</h2>
            <div className="quick-links-grid">
              <div className="quick-link-card">
                <div className="icon">📋</div>
                <h3>Tender Notices</h3>
                <p>View latest tender announcements and requirements</p>
                <Link to="/login" className="link-btn">View Tenders</Link>
              </div>
              <div className="quick-link-card">
                <div className="icon">📝</div>
                <h3>Submit Bid</h3>
                <p>Participate in government tenders securely</p>
                <Link to="/login" className="link-btn">Submit Bid</Link>
              </div>
              <div className="quick-link-card">
                <div className="icon">📊</div>
                <h3>Track Status</h3>
                <p>Monitor your bid status and tender progress</p>
                <Link to="/login" className="link-btn">Track Status</Link>
              </div>
              <div className="quick-link-card">
                <div className="icon">📚</div>
                <h3>Guidelines</h3>
                <p>Read tender guidelines and procedures</p>
                <a href="#guidelines" className="link-btn">View Guidelines</a>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE TENDERS PREVIEW */}
        <section id="tenders" className="tenders-preview">
          <div className="container">
            <h2>Latest Tender Opportunities</h2>
            <p className="section-desc">
              Discover current government tender opportunities across various sectors
            </p>
            <div className="tenders-grid">
              <div className="tender-card">
                <div className="tender-header">
                  <span className="tender-type">Infrastructure</span>
                  <span className="tender-status open">Open</span>
                </div>
                <h3>Road Construction Project - Phase II</h3>
                <p>Construction of 25km highway with modern infrastructure</p>
                <div className="tender-meta">
                  <span>Budget: ₹2.5 Cr</span>
                  <span>Deadline: 15 Dec 2024</span>
                </div>
                <Link to="/login" className="btn btn-outline">View Details</Link>
              </div>
              <div className="tender-card">
                <div className="tender-header">
                  <span className="tender-type">Technology</span>
                  <span className="tender-status open">Open</span>
                </div>
                <h3>Digital Transformation Initiative</h3>
                <p>Implementation of e-governance solutions</p>
                <div className="tender-meta">
                  <span>Budget: ₹1.8 Cr</span>
                  <span>Deadline: 20 Dec 2024</span>
                </div>
                <Link to="/login" className="btn btn-outline">View Details</Link>
              </div>
              <div className="tender-card">
                <div className="tender-header">
                  <span className="tender-type">Healthcare</span>
                  <span className="tender-status open">Open</span>
                </div>
                <h3>Medical Equipment Procurement</h3>
                <p>Supply of advanced medical equipment to government hospitals</p>
                <div className="tender-meta">
                  <span>Budget: ₹3.2 Cr</span>
                  <span>Deadline: 10 Jan 2025</span>
                </div>
                <Link to="/login" className="btn btn-outline">View Details</Link>
              </div>
            </div>
            <div className="text-center" style={{ marginTop: '2rem' }}>
              <Link to="/login" className="btn btn-primary btn-large">
                View All Tenders
              </Link>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="about-section">
          <div className="container">
            <div className="about-grid">
              <div className="about-content">
                <h2>About PublicTenderChain</h2>
                <p>
                  PublicTenderChain is India's first blockchain-powered government tender portal,
                  designed to bring unprecedented transparency, security, and efficiency to public procurement.
                </p>
                <div className="features-list">
                  <div className="feature-item">
                    <div className="feature-icon">🔒</div>
                    <div>
                      <h4>Secure & Transparent</h4>
                      <p>Blockchain ensures immutable records and prevents tampering</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">⚡</div>
                    <div>
                      <h4>Efficient Processing</h4>
                      <p>Automated workflows reduce processing time by 70%</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🎯</div>
                    <div>
                      <h4>Fair Competition</h4>
                      <p>Equal opportunity for all qualified bidders</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="about-image">
                <div className="gov-building">
                  🏛️
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="why-choose-section">
          <div className="container">
            <h2>Why Choose PublicTenderChain?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>Blockchain Security</h3>
                <p>Immutable ledger technology ensures data integrity and prevents fraud</p>
              </div>
              <div className="benefit-card">
                <h3>Real-time Tracking</h3>
                <p>Monitor tender status and bid progress in real-time</p>
              </div>
              <div className="benefit-card">
                <h3>Cost Effective</h3>
                <p>Reduces administrative costs and eliminates paperwork</p>
              </div>
              <div className="benefit-card">
                <h3>24/7 Access</h3>
                <p>Access the portal anytime, anywhere with internet connectivity</p>
              </div>
              <div className="benefit-card">
                <h3>AI-Powered Verification</h3>
                <p>Automated quality checks and milestone verification</p>
              </div>
              <div className="benefit-card">
                <h3>Multi-language Support</h3>
                <p>Available in multiple Indian languages for better accessibility</p>
              </div>
            </div>
          </div>
        </section>

        {/* NEWS & UPDATES */}
        <section className="news-section">
          <div className="container">
            <h2>Latest News & Updates</h2>
            <div className="news-grid">
              <div className="news-card">
                <div className="news-date">December 1, 2024</div>
                <h3>New Tender Categories Added</h3>
                <p>We have expanded our tender categories to include renewable energy and smart city projects.</p>
                <button onClick={() => alert('Full article coming soon!')} className="read-more">Read More</button>
              </div>
              <div className="news-card">
                <div className="news-date">November 28, 2024</div>
                <h3>System Maintenance Notice</h3>
                <p>Scheduled maintenance on December 5th from 2 AM to 4 AM IST. Service may be temporarily unavailable.</p>
                <button onClick={() => alert('Full article coming soon!')} className="read-more">Read More</button>
              </div>
              <div className="news-card">
                <div className="news-date">November 25, 2024</div>
                <h3>Training Workshop Announced</h3>
                <p>Free training sessions for contractors on using the new portal features.</p>
                <button onClick={() => alert('Full article coming soon!')} className="read-more">Read More</button>
              </div>
            </div>
          </div>
        </section>
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

      {/* BACK TO TOP BUTTON */}
      <button id="backToTop" title="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
    </>
  );
};

export default LandingPage;
