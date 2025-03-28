import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Layers, Code, Github, Menu, X } from 'lucide-react';
import styles from '../styles/LandingPage.module.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.headerEnhanced}>
      <div className={styles.logoContainer}>
        <Terminal className={styles.logoIcon} />
        <h1>SQLyzer</h1>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className={styles.menuButton} 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav className={`${styles.navigationEnhanced} ${isMenuOpen ? styles.showMenu : ''}`}>
        <Link to="/editor" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          <Layers size={16} /> Query Editor
        </Link>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.navLink}
          onClick={() => setIsMenuOpen(false)}
        >
          <Github size={16} /> GitHub
        </a>
      </nav>

      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className={styles.menuBackdrop}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
