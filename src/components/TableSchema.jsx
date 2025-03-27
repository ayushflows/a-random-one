import React from 'react';
import { ChevronLeft, ChevronRight, Table, Database, Plus } from 'lucide-react';
import styles from '../styles/TableSchema.module.css';

const TableSchema = ({ selectedTable, isSchemaVisible, setIsSchemaVisible }) => {
  const handleAddRow = () => {
    // TODO: Implement add row functionality
    console.log('Add new row');
  };

  return (
    <div className={`${styles.tableSchema} ${isSchemaVisible ? '' : styles.collapsed}`}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsSchemaVisible(!isSchemaVisible)}
        title={isSchemaVisible ? "Hide schema" : "Show schema"}
      >
        {isSchemaVisible ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      
      {isSchemaVisible && (
        <>
          <div className={styles.tableSchemaHeader}>
            <Database size={25} />
            <h3>{selectedTable.name}</h3>
          </div>

          <div className={styles.schemaContent}>
            <div className={styles.schemaSection}>
              <h3>
                <Table size={14} className={styles.sectionIcon} /> Structure
              </h3>
              <div className={styles.tableWrapper}>
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
              </div>
            </div>

            <div className={styles.schemaSection}>
              <div className={styles.sectionHeaderWithAction}>
                <h3>
                  <Database size={14} className={styles.sectionIcon} /> Sample Data
                </h3>
                <button 
                  className={styles.addRowButton}
                  onClick={handleAddRow}
                  title="Add new row"
                >
                  <Plus size={14} />
                  Add Row
                </button>
              </div>
              <div className={styles.tableWrapper}>
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TableSchema;
