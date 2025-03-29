import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Layers, Code, Github } from 'lucide-react';
import styles from '../styles/LandingPage.module.css';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeatureSection from '../components/FeatureSection';

const LandingPage = ({ isDarkMode, setIsDarkMode }) => {
  // const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`${styles.landingPageEnhanced} ${isDarkMode ? styles.darkMode : styles.lightMode}`}>
      <div className={styles.backgroundGradient}></div>
      
      <Navbar isDarkMode={isDarkMode} setDarkMode={setIsDarkMode} />

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