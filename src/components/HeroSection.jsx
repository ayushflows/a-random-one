import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Cpu, Database } from 'lucide-react';
import AnimatedQueryCode from './AnimatedQueryCode';
import styles from '../styles/LandingPage.module.css';

const HeroSection = () => {
  return (
    <>
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
    </>
  );
};

export default HeroSection;
