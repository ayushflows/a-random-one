import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../styles/TableSchema.module.css';

const TableSchema = ({ selectedTable, isSchemaVisible, setIsSchemaVisible }) => {
  return (
    <>
      <div className={`${styles.tableSchema} ${isSchemaVisible ? '' : styles.collapsed}`}>
        <button
          className={`${styles.toggleButton} ${isSchemaVisible ? styles.closeButton : styles.openButton}`}
          onClick={() => setIsSchemaVisible(!isSchemaVisible)}
        >
          {isSchemaVisible ? <ChevronRight /> : <ChevronLeft />}
        </button>
        {isSchemaVisible && (
          <>
            <div className={styles.tableSchemaHeader}>
              <h3>Table Schema: {selectedTable.name}</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {selectedTable.columns.map((column) => (
                  <tr key={column.name}>
                    <td>{column.name}</td>
                    <td>{column.type}</td>
                    <td>{column.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.sampleData}>
              <h3>Sample Data</h3>
              <table>
                <thead>
                  <tr>
                    {selectedTable.columns.map((column) => (
                      <th key={column.name}>{column.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedTable.demoEntries.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {selectedTable.columns.map((column) => (
                        <td key={column.name}>{row[column.name]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TableSchema;
