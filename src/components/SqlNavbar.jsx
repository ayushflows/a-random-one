import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Terminal, Home, Sun, Moon, Github } from 'lucide-react'
import styles from '../styles/SqlNavbar.module.css'

function SqlNavbar({isDarkMode, setDarkMode}) {

  const toggleTheme = () => {
    setDarkMode(!isDarkMode)
  }

  return (
    <header className={`${styles.sqlNavbar} ${isDarkMode ? styles.darkMode : styles.lightMode}`}>
      <div className={styles.logoContainer}>
        <Terminal className={styles.logoIcon} />
        <h1>SQLyzer</h1>
      </div>
      <nav className={styles.navigationEnhanced}>
        <Link to="/" className={styles.navLink}>
          <Home size={16} /> Home
        </Link>
        <button className={styles.navLink} onClick={toggleTheme}>
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.navLink}
        >
          <Github size={16} /> GitHub
        </a>
      </nav>
    </header>
  )
}

export default SqlNavbar