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
import { initDatabase, executeQuery } from '../services/sqlService';
import { readCsvFile } from '../services/csvService';

const SqlEditor = () => {
  const [currentQuery, setCurrentQuery] = useState(PREDEFINED_QUERIES[0].query);
  const [selectedTable, setSelectedTable] = useState(null);
  const [queryResults, setQueryResults] = useState([]);
  const [isSchemaVisible, setIsSchemaVisible] = useState(true);
  const [isDarkMode, setDarkMode] = useState(false);
  const [pastQueries, setPastQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  const handleQueryExecution = (query) => {
    setCurrentQuery(query); 
  };

  useEffect(() => {
    const initializeDB = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get data for all tables
        const tableData = {};
        for (const table of CUSTOMER_ORDERS_DB.tables) {
          const data = await readCsvFile(table.name);
          tableData[table.name] = data || table.initialData;
        }
        
        await initDatabase(tableData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize database');
        setIsLoading(false);
      }
    };

    initializeDB();
  }, []);

  useEffect(() => {
    // Clear any existing data
    localStorage.clear();
    
    // Initialize with demo data
    CUSTOMER_ORDERS_DB.tables.forEach(table => {
      localStorage.setItem(`table_${table.name}`, JSON.stringify(table.initialData));
    });
  }, []); // Run once on component mount

  const runQuery = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setPastQueries(prev => [currentQuery, ...prev.slice(0, 4)]);
      
      const results = await executeQuery(currentQuery);
      setQueryResults(results);
    } catch (err) {
      setError(err.message);
      setQueryResults([]);
    } finally {
      setIsLoading(false);
    }
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
          pastQueries={pastQueries}
          selectedTable={selectedTable}
          onTableSelect={handleTableSelect}
          onQuerySelect={handleQueryExecution} // Load query without adding to past queries
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
          runQuery={runQuery} // Pass runQuery to MainEditor
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