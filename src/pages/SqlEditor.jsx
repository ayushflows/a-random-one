import React, { useState, useRef, useMemo } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-okaidia.css';
import { 
  flexRender, 
  getCoreRowModel, 
  useReactTable 
} from '@tanstack/react-table';
import { 
  Database, 
  Table, 
  BookOpen, 
  Play, 
  Save, 
  Copy 
} from 'lucide-react';

import { 
  CUSTOMER_ORDERS_DB, 
  PREDEFINED_QUERIES, 
} from '../assets/schemas';
import styles from '../styles/SqlEditor.module.css';

const SqlEditor = () => {
  const [currentQuery, setCurrentQuery] = useState(PREDEFINED_QUERIES[0].query);
  const [selectedTable, setSelectedTable] = useState(null);
  const [queryResults, setQueryResults] = useState([]);
  const editorRef = useRef(null);

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  const handleRunQuery = () => {
    // Simulated query execution
    // In a real app, this would interact with a backend
    const mockResults = [
      { id: 1, name: 'Sample Result', value: 100 },
      { id: 2, name: 'Another Result', value: 200 }
    ];
    setQueryResults(mockResults);
  };

  const ResultsTable = ({ data }) => {
    // Dynamically generate columns based on data
    const columns = useMemo(() => 
      data.length > 0
        ? Object.keys(data[0]).map(key => ({
            accessorKey: key,
            header: () => key,
            cell: info => info.getValue()
          }))
        : [],
      [data]
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <table className={styles.resultsTable}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell, 
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className={styles.sqlEditorContainer}>
      <div className={styles.sidebar}>
        <div className={styles.databaseInfo}>
          <h2><Database /> {CUSTOMER_ORDERS_DB.name}</h2>
          <p>{CUSTOMER_ORDERS_DB.description}</p>
        </div>

        <div className={styles.tableList}>
          <h3><Table /> Tables</h3>
          {CUSTOMER_ORDERS_DB.tables.map(table => (
            <div 
              key={table.name} 
              className={`${styles.tableItem} ${selectedTable?.name === table.name ? styles.activeTable : ''}`}
              onClick={() => handleTableSelect(table)}
            >
              {table.name}
              <span>{table.sampleRowCount} rows</span>
            </div>
          ))}
        </div>

        <div className={styles.savedQueries}>
          <h3><BookOpen /> Saved Queries</h3>
          {PREDEFINED_QUERIES.map(query => (
            <div 
              key={query.id} 
              className={styles.savedQueryItem}
              onClick={() => setCurrentQuery(query.query)}
            >
              {query.name}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.mainEditor}>
        <div className={styles.editorToolbar}>
          <button onClick={handleRunQuery} title="Run Query">
            <Play />
          </button>
          <button title="Save Query">
            <Save />
          </button>
          <button title="Copy Query">
            <Copy />
          </button>
        </div>

        <div className={styles.editorSection}>
          <Editor
            value={currentQuery}
            onValueChange={code => setCurrentQuery(code)}
            highlight={code => highlight(code, languages.sql)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 14,
              backgroundColor: '#2d2d2d',
              color: '#f8f8f2'
            }}
          />
        </div>

        {selectedTable && (
          <div className={styles.tableSchema}>
            <h3>Table Schema: {selectedTable.name}</h3>
            <table>
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {selectedTable.columns.map(column => (
                  <tr key={column.name}>
                    <td>{column.name}</td>
                    <td>{column.type}</td>
                    <td>{column.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.resultsSection}>
          <h3>Query Results</h3>
          {queryResults.length > 0 && <ResultsTable data={queryResults} />}
        </div>
      </div>
    </div>
  );
};

export default SqlEditor;