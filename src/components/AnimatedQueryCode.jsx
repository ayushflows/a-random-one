import React, { useState, useEffect } from 'react';
import styles from '../styles/LandingPage.module.css';

const AnimatedQueryCode = () => {
  const [activeQuery, setActiveQuery] = useState(0);
  const queries = [
    {
      query: 
`SELECT 
  product_name,
  category,
  SUM(revenue) as total
FROM sales
GROUP BY 1, 2
ORDER BY total DESC
LIMIT 3;`,
      description: "Top selling products",
      tags: ["Analytics", "Sales"]
    },
    {
      query:
`SELECT 
  customer_name,
  COUNT(*) orders,
  AVG(value) avg_value
FROM orders
WHERE date >= NOW() - 30
GROUP BY 1
HAVING orders > 2;`,
      description: "Active customers",
      tags: ["Customer", "Analysis"]
    },
    {
      query:
`SELECT 
  category,
  SUM(amount) revenue,
  COUNT(DISTINCT cust_id)
FROM transactions
WHERE status = 'success'
GROUP BY 1
ORDER BY 2 DESC;`,
      description: "Category performance",
      tags: ["Revenue", "Metrics"]
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
