import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Layers, Code, Github } from 'lucide-react';
import styles from '../styles/LandingPage.module.css';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeatureSection from '../components/FeatureSection';

const LandingPage = () => {
  return (
    <div className={styles.landingPageEnhanced}>
      <div className={styles.backgroundGradient}></div>
      
      <Navbar />

      <main className={styles.heroSectionTwoColumn}>
        <HeroSection />
      </main>

      <FeatureSection />

      <footer className={styles.footerEnhanced}>
        <p>© 2024 SQLyzer | Crafted for Data Explorers</p>
      </footer>
    </div>
  );
};

export default LandingPage;