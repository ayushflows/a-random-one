

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  Database, 
  Code, 
  Play, 
  Cpu, 
  Layers, 
  Github 
} from 'lucide-react';
import styles from '../styles/LandingPage.module.css';

const AnimatedQueryCode = () => {
  const [activeQuery, setActiveQuery] = useState(0);
  const queries = [
    {
      query: "SELECT name, age FROM employees WHERE dept = 'Engineering'",
      description: "Retrieve employee details from Engineering department",
      tags: ["Filtering", "Selection"]
    },
    {
      query: "SELECT AVG(salary) FROM departments GROUP BY name",
      description: "Calculate average salary per department",
      tags: ["Aggregation", "Grouping"]
    },
    {
      query: "SELECT TOP 5 * FROM sales ORDER BY revenue DESC",
      description: "Top 5 sales performers",
      tags: ["Sorting", "Limiting"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuery((prev) => (prev + 1) % queries.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentQuery = queries[activeQuery];

  return (
    <div className={styles.queryCodeContainer}>
      <div className={styles.queryCodeCard}>
        <div className={styles.queryCodeHeader}>
          <div className={styles.queryCodeTabs}>
            {queries.map((_, index) => (
              <span 
                key={index} 
                className={`${styles.queryCodeTab} ${
                  index === activeQuery ? styles.activeTab : ''
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className={styles.queryCodeContent}>
          <div className={styles.queryCodeText}>
            <pre>{currentQuery.query}</pre>
            <div className={styles.queryCodeCursor}></div>
          </div>
          
          <div className={styles.queryCodeDetails}>
            <p className={styles.queryCodeDescription}>
              {currentQuery.description}
            </p>
            <div className={styles.queryCodeTags}>
              {currentQuery.tags.map((tag, index) => (
                <span key={index} className={styles.queryCodeTag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className={styles.landingPageEnhanced}>
      <div className={styles.backgroundGradient}></div>
      
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

      <main className={styles.heroSectionTwoColumn}>
        <div className={styles.heroContentLeft}>
          <div className={styles.heroTitleContainer}>
            <h2 className={styles.heroTitle}>
              Unleash the Power of 
              <span className={styles.heroTitleHighlight}> SQL Queries</span>
            </h2>
            <p className={styles.heroSubtitle}>
              Transform data into insights with our intuitive, powerful SQL editor
            </p>
          </div>

          <div className={styles.ctaSection}>
            <Link to="/editor" className={styles.ctaButton}>
              <Play size={20} />
              Start Querying
            </Link>
            <div className={styles.featuresQuick}>
              <div className={styles.featurePill}>
                <Cpu size={16} /> Fast Execution
              </div>
              <div className={styles.featurePill}>
                <Database size={16} /> Mock Datasets
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heroContentRight}>
          <AnimatedQueryCode />
        </div>
      </main>
    
      <div className={styles.featureGridEnhanced}>
          {[
            {
              icon: <Terminal size={48} />,
              title: 'Instant Querying',
              description: 'Zero setup. Run complex queries in seconds.',
              color: 'purple'
            },
            {
              icon: <Database size={48} />,
              title: 'Rich Datasets',
              description: 'Comprehensive mock data for realistic scenarios.',
              color: 'blue'
            },
            {
              icon: <Code size={48} />,
              title: 'Developer Friendly',
              description: 'Sleek interface designed for efficiency.',
              color: 'green'
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className={`${styles.featureCard} ${styles[`featureCard${feature.color}`]}`}
            >
              {feature.icon}
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

      <footer className={styles.footerEnhanced}>
        <p>© 2024 SQLyzer | Crafted for Data Explorers</p>
      </footer>
    </div>
  );
};

export default LandingPage;