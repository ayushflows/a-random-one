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
import EditorSection from '../components/EditorSection';
import ResultSection from '../components/ResultSection';

const SqlEditor = () => {
  const [currentQuery, setCurrentQuery] = useState(PREDEFINED_QUERIES[0].query);
  const [selectedTable, setSelectedTable] = useState(null);
  const [queryResults, setQueryResults] = useState([]);
  const [isSchemaVisible, setIsSchemaVisible] = useState(true);
  const [isDarkMode, setDarkMode] = useState(false);
  const [pastQueries, setPastQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize database from localStorage or use default
  const [database, setDatabase] = useState(() => {
    const savedDB = localStorage.getItem('database');
    return savedDB ? JSON.parse(savedDB) : CUSTOMER_ORDERS_DB;
  });

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

  // Save database to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('database', JSON.stringify(database));
  }, [database]);

  const runQuery = async (queryToRun) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setPastQueries(prev => [queryToRun, ...prev.slice(0, 4)]);
      
      const results = await executeQuery(queryToRun);
      setQueryResults(results);
    } catch (err) {
      setError(err.message);
      setQueryResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this new function to handle table addition
  const handleAddTable = async (tableData) => {
    try {
      // Parse CSV data
      const lines = tableData.data.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Parse data rows
      const parsedData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || null;
            return obj;
          }, {});
        });

      // Create schema from headers
      const schema = headers.map(header => ({
        name: header,
        type: inferColumnType(parsedData, header),
        isPrimary: header.toLowerCase().includes('id')
      }));

      // Create new table object
      const newTable = {
        name: tableData.name,
        schema: schema,
        initialData: parsedData
      };

      // Update database state with new table
      setDatabase(prev => ({
        ...prev,
        tables: [...prev.tables, newTable]
      }));

      // Select the newly added table
      setSelectedTable(newTable);
    } catch (error) {
      console.error('Error adding table:', error);
      throw new Error('Failed to process CSV data');
    }
  };

  // Helper function to infer column type
  const inferColumnType = (data, column) => {
    if (data.length === 0) return 'TEXT';
    const sampleValue = data[0][column];
    if (!sampleValue) return 'TEXT';
    
    if (!isNaN(sampleValue) && sampleValue.toString().includes('.')) return 'DECIMAL';
    if (!isNaN(sampleValue)) return 'INTEGER';
    if (sampleValue.match(/^\d{4}-\d{2}-\d{2}/)) return 'DATE';
    return 'TEXT';
  };

  // Add this function to SqlEditor component
  const handleDeleteTable = (tableName) => {
    setDatabase(prev => ({
      ...prev,
      tables: prev.tables.filter(table => table.name !== tableName)
    }));
    setSelectedTable(null);
    
    // Also remove from localStorage if you're storing individual tables
    localStorage.removeItem(`table_${tableName}`);
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }} className={`${isDarkMode ? styles.darkMode : styles.lightMode}`} >
      <SqlNavbar isDarkMode={isDarkMode} setDarkMode={setDarkMode} />
      <div className={`
        ${styles.sqlEditorContainer} 
        ${isDarkMode ? styles.darkMode : styles.lightMode}
      `}>
        <EditorSidebar
          database={database}
          predefinedQueries={PREDEFINED_QUERIES}
          pastQueries={pastQueries}
          selectedTable={selectedTable}
          onTableSelect={handleTableSelect}
          onQuerySelect={handleQueryExecution}
          onAddTable={handleAddTable}
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
          runQuery={runQuery}
        />
        {selectedTable && (
          <TableSchema
            selectedTable={selectedTable}
            isSchemaVisible={isSchemaVisible}
            setIsSchemaVisible={setIsSchemaVisible}
            onDeleteTable={handleDeleteTable}
          />
        )}
      </div>
    </div>
  );
};

export default SqlEditor;