import React, { useState, useRef } from 'react';
import EditorSection from './EditorSection';
import ResultSection from './ResultSection';
import TableSchema from './TableSchema';
import styles from '../styles/SqlEditor.module.css';

const MainEditor = ({ currentQuery, setCurrentQuery, queryResults, setQueryResults, selectedTable, isSchemaVisible, setIsSchemaVisible, isDarkMode, runQuery, isLoading, error, setPastQueries }) => {
  const [splitPosition, setSplitPosition] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const mouseY = e.clientY - containerRect.top;
    
    let newSplitPosition = (mouseY / containerHeight) * 100;
    newSplitPosition = Math.max(20, Math.min(80, newSplitPosition));
    
    setSplitPosition(newSplitPosition);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={styles.mainEditor} ref={containerRef}>
      <div 
        className={styles.editorContainer} 
        style={{ height: `${splitPosition}%` }}
      >
        <EditorSection
          currentQuery={currentQuery}
          setCurrentQuery={setCurrentQuery}
          setQueryResults={setQueryResults}
          isDarkMode={isDarkMode}
          runQuery={runQuery}
          isLoading={isLoading}
          setPastQueries={setPastQueries}
        />
      </div>
      <div 
        className={styles.resizeHandle}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.resizeBar} />
      </div>
      <div 
        className={styles.resultContainer}
        style={{ height: `${100 - splitPosition}%` }}
      >
        <ResultSection 
          queryResults={queryResults} 
          isLoading={isLoading} 
          error={error} 
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default MainEditor;
