import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div className="landing-page">
      <nav className="nav-bar">
        <div className="logo">SQL Query Runner</div>
        <div className="nav-controls">
          <ThemeToggle />
          <button className="launch-button" onClick={() => navigate("/query")}>
            Launch App
          </button>
        </div>
      </nav>

      <div className="hero-section">
        <h1>Run SQL Queries with Ease</h1>
        <p>
          A powerful, user-friendly SQL query runner with predefined queries,
          <br />
          favorites, and execution history.
        </p>
        <button
          className="get-started-button"
          onClick={() => navigate("/query")}
        >
          Get Started
        </button>
      </div>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Predefined Queries</h3>
            <p>Access a library of common SQL queries for quick execution</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Favorites</h3>
            <p>Save your frequently used queries for easy access</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast Execution</h3>
            <p>Run queries and get results in milliseconds</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Results Export</h3>
            <p>Export query results to CSV for further analysis</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌓</div>
            <h3>Dark Mode</h3>
            <p>Switch between light and dark themes for comfortable viewing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
