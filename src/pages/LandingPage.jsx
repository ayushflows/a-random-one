import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Database, Code } from 'lucide-react';
import styles from '../styles/LandingPage.module.css';

const LandingPage = () => {
  return (
    <div className={styles.landingPage}>
      <header className={`${styles.container} ${styles.header}`}>
        <div className={styles.logo}>
          <Terminal size={32} />
          <span>SQL Query Editor</span>
        </div>
        <nav className={styles.navigation}>
          <Link to="/editor" className={styles.navLink}>
            Launch Editor
          </Link>
          <Link to="/about" className={styles.navLink}>
            About
          </Link>
        </nav>
      </header>

      <main className={`${styles.container} ${styles.heroSection}`}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>
            Explore, Query, Discover
          </h2>
          <p className={styles.heroDescription}>
            A powerful, intuitive SQL query interface designed for data analysts, 
            developers, and curious minds to experiment and learn.
          </p>
          <div className={styles.ctaButtons}>
            <Link 
              to="/editor" 
              className={`${styles.primaryButton} ${styles.ctaButton}`}
            >
              <Database size={20} />
              Start Querying
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${styles.secondaryButton} ${styles.ctaButton}`}
            >
              <Code size={20} />
              View Source
            </a>
          </div>
        </div>

        <div className={styles.queryPreview}>
          <div className={styles.queryCode}>
            SELECT name, age 
            <br />
            FROM employees
            <br />
            WHERE department = 'Engineering'
          </div>
        </div>
      </main>

      <section className={`${styles.container} ${styles.featuresSection}`}>
        <h3 className={styles.featuresTitle}>
          Why Use Our SQL Editor?
        </h3>
        <div className={styles.featuresGrid}>
          {[
            {
              icon: <Terminal size={48} />,
              title: 'Easy to Use',
              description: 'Intuitive interface for running SQL queries without complex setup.'
            },
            {
              icon: <Database size={48} />,
              title: 'Mock Data Ready',
              description: 'Predefined datasets to help you start querying immediately.'
            },
            {
              icon: <Code size={48} />,
              title: 'Developer Friendly',
              description: 'Clean, modern design with responsive layout for all devices.'
            }
          ].map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div>{feature.icon}</div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© 2024 SQL Query Editor. Built for Atlan Frontend Internship Challenge.</p>
      </footer>
    </div>
  );
};

export default LandingPage;