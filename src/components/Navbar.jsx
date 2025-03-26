import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Layers, Code, Github } from 'lucide-react';
import styles from '../styles/LandingPage.module.css';

const Navbar = () => {
  return (
    <header className={styles.headerEnhanced}>
      <div className={styles.logoContainer}>
        <Terminal className={styles.logoIcon} />
        <h1>SQLyzer</h1>
      </div>
      <nav className={styles.navigationEnhanced}>
        <Link to="/editor" className={styles.navLink}>
          <Layers size={16} /> Query Editor
        </Link>
        <Link to="/about" className={styles.navLink}>
          <Code size={16} /> About
        </Link>
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
  );
};

export default Navbar;
