import React from 'react';
import EditorSection from './EditorSection';
import ResultSection from './ResultSection';
import TableSchema from './TableSchema';
import styles from '../styles/SqlEditor.module.css';

const MainEditor = ({ currentQuery, setCurrentQuery, queryResults, setQueryResults, selectedTable, isSchemaVisible, setIsSchemaVisible, isDarkMode, runQuery }) => {
  return (
    <div className={styles.mainEditor}>
      <EditorSection
        currentQuery={currentQuery}
        setCurrentQuery={setCurrentQuery}
        setQueryResults={setQueryResults}
        isDarkMode={isDarkMode}
        runQuery={runQuery}
      />
      <ResultSection queryResults={queryResults} />
    </div>
  );
};

export default MainEditor;
