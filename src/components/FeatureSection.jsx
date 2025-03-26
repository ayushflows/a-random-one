import React from 'react';
import { Terminal, Database, Code } from 'lucide-react';
import styles from '../styles/LandingPage.module.css';

const FeatureSection = () => {
  return (
    <section className={styles.featureSection}>
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
    </section>
  );
};

export default FeatureSection;
