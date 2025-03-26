import React, { useState, useEffect } from 'react';
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

export default AnimatedQueryCode;
