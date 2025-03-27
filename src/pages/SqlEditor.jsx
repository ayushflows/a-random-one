import React, { useState, useRef, useEffect } from 'react';
import { Database, Table, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { CUSTOMER_ORDERS_DB, PREDEFINED_QUERIES } from '../assets/schemas';
import styles from '../styles/SqlEditor.module.css';
import editorSidebarStyles from '../styles/EditorSidebar.module.css';
import editorSectionStyles from '../styles/EditorSection.module.css';
import resultSectionStyles from '../styles/ResultSection.module.css';
import tableSchemaStyles from '../styles/TableSchema.module.css';
import EditorSidebar from '../components/EditorSidebar';
import MainEditor from '../components/MainEditor';
import TableSchema from '../components/TableSchema';
import SqlNavbar from '../components/SqlNavbar';

const SqlEditor = () => {
  const [currentQuery, setCurrentQuery] = useState(PREDEFINED_QUERIES[0].query);
  const [selectedTable, setSelectedTable] = useState(null);
  const [queryResults, setQueryResults] = useState([]);
  const [isSchemaVisible, setIsSchemaVisible] = useState(true);
  const [isDarkMode, setDarkMode] = useState(false);

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setQueryResults(table.demoEntries.slice(0, 7));
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }} className={`${isDarkMode ? styles.darkMode : styles.lightMode}`} >
      <SqlNavbar isDarkMode={isDarkMode} setDarkMode={setDarkMode} />
      <div className={`
        ${styles.sqlEditorContainer} 
        ${isDarkMode ? styles.darkMode : styles.lightMode}
      `}>
        <EditorSidebar
          database={CUSTOMER_ORDERS_DB}
          predefinedQueries={PREDEFINED_QUERIES}
          selectedTable={selectedTable}
          onTableSelect={handleTableSelect}
          onQuerySelect={setCurrentQuery}
        />
        <MainEditor
          currentQuery={currentQuery}
          setCurrentQuery={setCurrentQuery}
          queryResults={queryResults}
          setQueryResults={setQueryResults}
          selectedTable={selectedTable}
          isSchemaVisible={isSchemaVisible}
          setIsSchemaVisible={setIsSchemaVisible}
          isDarkMode={isDarkMode}
        />
        {selectedTable && (
          <TableSchema
            selectedTable={selectedTable}
            isSchemaVisible={isSchemaVisible}
            setIsSchemaVisible={setIsSchemaVisible}
          />
        )}
      </div>
    </div>
  );
};

export default SqlEditor;