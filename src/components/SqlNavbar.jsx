import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Terminal, Home, Sun, Moon, Github, Menu, X } from 'lucide-react'
import styles from '../styles/SqlNavbar.module.css'

function SqlNavbar({isDarkMode, setDarkMode}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!isDarkMode)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
    <header className={`${styles.sqlNavbar} ${isDarkMode ? styles.darkMode : styles.lightMode}`}>
      <div className={styles.logoContainer}>
        <Terminal className={styles.logoIcon} />
        <h1>SQLyzer</h1>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className={styles.menuButton} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Navigation Links */}
      <nav className={`${styles.navigationEnhanced} ${isMenuOpen ? styles.showMenu : ''}`}>
        <Link to="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          <Home size={16} /> 
          <span>Home</span>
        </Link>
        <button 
          className={styles.navLink} 
          onClick={() => {
            toggleTheme();
            setIsMenuOpen(false);
          }}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} 
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.navLink}
          onClick={() => setIsMenuOpen(false)}
        >
          <Github size={16} /> 
          <span>GitHub</span>
        </a>
      </nav>

      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div 
          className={styles.menuBackdrop}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  )
}

export default SqlNavbar