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
import { initDatabase, executeQuery, createTableWithData } from '../services/sqlService';
import { readCsvFile } from '../services/csvService';
import EditorSection from '../components/EditorSection';
import ResultSection from '../components/ResultSection';
import orderItemsCsv from '../assets/data/order_items.csv';

const SqlEditor = ({ isDarkMode, setIsDarkMode }) => {
  const [currentQuery, setCurrentQuery] = useState(PREDEFINED_QUERIES[0].query);
  const [selectedTable, setSelectedTable] = useState(() => {
    const savedDB = localStorage.getItem('database');
    const initialDB = savedDB ? JSON.parse(savedDB) : CUSTOMER_ORDERS_DB;
    return initialDB.tables[0] || null;
  });
  const [queryResults, setQueryResults] = useState([]);
  const [isSchemaVisible, setIsSchemaVisible] = useState(true);
  const [pastQueries, setPastQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSchemaCollapsed, setIsSchemaCollapsed] = useState(false);

  // Initialize database with default data from schemas.js
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
        
        // Use the imported CSV file path
        const orderItemsData = await readCsvFile(orderItemsCsv);
        
        // Create a modified database object with CSV data for order_items
        const modifiedDB = {
          ...CUSTOMER_ORDERS_DB,
          tables: CUSTOMER_ORDERS_DB.tables.map(table => 
            table.name === 'order_items' 
              ? { ...table, initialData: orderItemsData }
              : table
          )
        };
        
        // Set the modified database state
        setDatabase(modifiedDB);
        
        // Clear localStorage
        localStorage.clear();
        
        // Initialize localStorage with data
        modifiedDB.tables.forEach(table => {
          localStorage.setItem(`table_${table.name}`, JSON.stringify(table.initialData));
        });
        
        // Initialize AlaSQL database with modified data
        const tableData = {};
        modifiedDB.tables.forEach(table => {
          tableData[table.name] = table.initialData;
        });
        
        await initDatabase(tableData);
        
        // Set the first table as selected after database initialization
        if (modifiedDB.tables.length > 0) {
          setSelectedTable(modifiedDB.tables[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize database');
        setIsLoading(false);
      }
    };

    initializeDB();
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

      // Handle CREATE TABLE results
      if (results && results.type === 'CREATE') {
        const newTable = results.tableInfo;
        
        // Update database state with new table
        setDatabase(prev => ({
          ...prev,
          tables: [...prev.tables, newTable]
        }));

        // Update localStorage
        localStorage.setItem(`table_${newTable.name}`, JSON.stringify(newTable.initialData));
        
        // Select the newly created table
        setSelectedTable(newTable);
        
        // Show success message in results
        setQueryResults([{ message: `Table ${results.tableName} created successfully` }]);
        return;
      }

      // Handle INSERT results
      if (results && results.type === 'INSERT') {
        const { tableInfo: updatedTable, rowCount, tableName } = results;
        
        // Update database state with the modified table
        setDatabase(prev => ({
          ...prev,
          tables: prev.tables.map(t => 
            t.name === tableName ? {
              ...t,
              initialData: updatedTable.initialData // Update the initialData with new rows
            } : t
          )
        }));

        // Update localStorage
        localStorage.setItem(`table_${tableName}`, JSON.stringify(updatedTable.initialData));
        
        // If the current selected table is the one being modified, update it
        if (selectedTable?.name === tableName) {
          const updatedSelectedTable = {
            ...selectedTable,
            initialData: updatedTable.initialData
          };
          setSelectedTable(updatedSelectedTable); // This will trigger the TableSchema update
        }

        // Show success message in results
        setQueryResults([{ 
          message: `Successfully inserted ${rowCount} row(s) into ${tableName}`
        }]);
        return;
      }

      // For SELECT and other queries, show results as before
      setQueryResults(Array.isArray(results) ? results : []);

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

      try {
        // Create table in AlaSQL first
        await createTableWithData(newTable.name, schema, parsedData);

        // Update database state
        const updatedDatabase = {
          ...database,
          tables: [...database.tables, newTable]
        };

        // Update localStorage
        localStorage.setItem('database', JSON.stringify(updatedDatabase));
        localStorage.setItem(`table_${newTable.name}`, JSON.stringify(parsedData));

        // Update state
        setDatabase(updatedDatabase);
        setSelectedTable(newTable);

      } catch (error) {
        console.error('Failed to create table in AlaSQL:', error);
        throw new Error('Failed to create table in database');
      }

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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleSchema = () => {
    setIsSchemaCollapsed(!isSchemaCollapsed);
  };

  // Add backdrop click handler
  const handleBackdropClick = () => {
    setIsSidebarCollapsed(true);
    setIsSchemaCollapsed(true);
  };

  // Replace the existing useEffect for resize handling with this updated version
  useEffect(() => {
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      
      // Only collapse sidebars if the width actually changes and becomes smaller
      if (currentWidth !== lastWidth && currentWidth <= 1024) {
        setIsSidebarCollapsed(true);
        setIsSchemaCollapsed(true);
      }
      
      // Update the last known width
      lastWidth = currentWidth;
    };

    // Set initial state only once on mount
    if (window.innerWidth <= 1024) {
      setIsSidebarCollapsed(true);
      setIsSchemaCollapsed(true);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }} className={`${isDarkMode ? styles.darkMode : styles.lightMode}`}>
      <SqlNavbar isDarkMode={isDarkMode} setDarkMode={setIsDarkMode} />
      <div className={`${styles.sqlEditorContainer} ${isDarkMode ? styles.darkMode : styles.lightMode}`}>
        <div className={`${styles.sidebarWrapper} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
          <EditorSidebar
            database={database}
            predefinedQueries={PREDEFINED_QUERIES}
            pastQueries={pastQueries}
            selectedTable={selectedTable}
            onTableSelect={handleTableSelect}
            onQuerySelect={handleQueryExecution}
            onAddTable={handleAddTable}
            isCollapsed={isSidebarCollapsed}
          />
          <div 
            className={styles.sidebarToggle}
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
          >
            {isSidebarCollapsed ? 
              <ChevronRight size={20} /> : 
              <ChevronLeft size={20} />
            }
          </div>
        </div>
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
          isLoading={isLoading}
          error={error}
          setPastQueries={setPastQueries}
        />
        {selectedTable && (
          <div className={`${styles.schemaWrapper} ${isSchemaCollapsed ? styles.collapsed : ''}`}>
            <TableSchema
              selectedTable={selectedTable}
              isSchemaVisible={isSchemaVisible}
              setIsSchemaVisible={setIsSchemaVisible}
              onDeleteTable={handleDeleteTable}
              isCollapsed={isSchemaCollapsed}
            />
            <div 
              className={styles.schemaToggle}
              onClick={toggleSchema}
              title={isSchemaCollapsed ? "Show Schema" : "Hide Schema"}
            >
              {isSchemaCollapsed ? 
                <ChevronLeft size={20} /> : 
                <ChevronRight size={20} />
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlEditor;