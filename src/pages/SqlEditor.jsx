import React, { useState, useRef, useEffect } from 'react';
import { Database, Table, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { CUSTOMER_ORDERS_DB, PREDEFINED_QUERIES } from '../assets/schemas';
import styles from '../styles/SqlEditor.module.css';
import EditorSidebar from '../components/EditorSidebar';
import MainEditor from '../components/MainEditor';
import TableSchema from '../components/TableSchema';
import SqlNavbar from '../components/SqlNavbar';
import { initDatabase, executeQuery, createTableWithData } from '../services/sqlService';
import { readCsvFile } from '../services/csvService';
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
        
        const orderItemsData = await readCsvFile(orderItemsCsv);
        
        const modifiedDB = {
          ...CUSTOMER_ORDERS_DB,
          tables: CUSTOMER_ORDERS_DB.tables.map(table => 
            table.name === 'order_items' 
              ? { ...table, initialData: orderItemsData }
              : table
          )
        };
        
        setDatabase(modifiedDB);
        
        localStorage.clear();
        
        modifiedDB.tables.forEach(table => {
          localStorage.setItem(`table_${table.name}`, JSON.stringify(table.initialData));
        });
        
        const tableData = {};
        modifiedDB.tables.forEach(table => {
          tableData[table.name] = table.initialData;
        });
        
        await initDatabase(tableData);
        
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
  }, []);

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

      if (results && results.type === 'CREATE') {
        const newTable = results.tableInfo;
        
        setDatabase(prev => ({
          ...prev,
          tables: [...prev.tables, newTable]
        }));

        localStorage.setItem(`table_${newTable.name}`, JSON.stringify(newTable.initialData));
        
        setSelectedTable(newTable);
        
        setQueryResults([{ message: `Table ${results.tableName} created successfully` }]);
        return;
      }

      if (results && results.type === 'INSERT') {
        const { tableInfo: updatedTable, rowCount, tableName } = results;
        
        setDatabase(prev => ({
          ...prev,
          tables: prev.tables.map(t => 
            t.name === tableName ? {
              ...t,
              initialData: updatedTable.initialData
            } : t
          )
        }));

        localStorage.setItem(`table_${tableName}`, JSON.stringify(updatedTable.initialData));
        
        if (selectedTable?.name === tableName) {
          const updatedSelectedTable = {
            ...selectedTable,
            initialData: updatedTable.initialData
          };
          setSelectedTable(updatedSelectedTable);
        }

        setQueryResults([{ 
          message: `Successfully inserted ${rowCount} row(s) into ${tableName}`
        }]);
        return;
      }

      setQueryResults(Array.isArray(results) ? results : []);

    } catch (err) {
      setError(err.message);
      setQueryResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTable = async (tableData) => {
    try {
      const lines = tableData.data.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const parsedData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || null;
            return obj;
          }, {});
        });

      const schema = headers.map(header => ({
        name: header,
        type: inferColumnType(parsedData, header),
        isPrimary: header.toLowerCase().includes('id')
      }));

      const newTable = {
        name: tableData.name,
        schema: schema,
        initialData: parsedData
      };

      try {
        await createTableWithData(newTable.name, schema, parsedData);

        const updatedDatabase = {
          ...database,
          tables: [...database.tables, newTable]
        };

        localStorage.setItem('database', JSON.stringify(updatedDatabase));
        localStorage.setItem(`table_${newTable.name}`, JSON.stringify(parsedData));

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

  const inferColumnType = (data, column) => {
    if (data.length === 0) return 'TEXT';
    const sampleValue = data[0][column];
    if (!sampleValue) return 'TEXT';
    
    if (!isNaN(sampleValue) && sampleValue.toString().includes('.')) return 'DECIMAL';
    if (!isNaN(sampleValue)) return 'INTEGER';
    if (sampleValue.match(/^\d{4}-\d{2}-\d{2}/)) return 'DATE';
    return 'TEXT';
  };

  const handleDeleteTable = (tableName) => {
    setDatabase(prev => ({
      ...prev,
      tables: prev.tables.filter(table => table.name !== tableName)
    }));
    setSelectedTable(null);
    
    localStorage.removeItem(`table_${tableName}`);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleSchema = () => {
    setIsSchemaCollapsed(!isSchemaCollapsed);
  };

  const handleBackdropClick = () => {
    setIsSidebarCollapsed(true);
    setIsSchemaCollapsed(true);
  };

  useEffect(() => {
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      
      if (currentWidth !== lastWidth && currentWidth <= 1024) {
        setIsSidebarCollapsed(true);
        setIsSchemaCollapsed(true);
      }
      
      lastWidth = currentWidth;
    };

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