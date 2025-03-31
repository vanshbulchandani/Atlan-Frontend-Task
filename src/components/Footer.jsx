import React, { useState, useEffect } from "react";

const Footer = () => {
  const [showFooter, setShowFooter] = useState(false);

  const footerStyle = {
    backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
    padding: "1rem",
    textAlign: "center",
    width: "100%",
    borderTop: "1px solid var(--border-color)",
    fontSize: "0.9rem",
    opacity: showFooter ? "1" : "0",
    transition: "opacity 0.3s ease",
    position: "static", // Changed from fixed to static
    marginTop: "2rem", // Add some space above footer
  };

  const linkStyle = {
    color: "var(--primary-color)",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "color 0.3s ease",
  };

  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled to bottom
      const bottom =
        Math.ceil(window.innerHeight + window.scrollY) >=
        document.documentElement.scrollHeight;
      setShowFooter(bottom);
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check in case content doesn't require scrolling
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <footer style={footerStyle}>
      <p>
        Created by{" "}
        <a
          href="https://www.linkedin.com/in/vansh-bulchandani-11a80a1a8/"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          Vansh Bulchandani
        </a>
      </p>
    </footer>
  );
};

export default Footer;
